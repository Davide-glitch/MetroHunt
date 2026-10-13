using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MetroHunt.Server.DTOs;
using MetroHunt.Server.Models;
using MetroHunt.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace MetroHunt.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<PlayerUser> _userManager;
        private readonly SignInManager<PlayerUser> _signInManager;
        private readonly IEmailSenderService _emailSender;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<PlayerUser> userManager,
            SignInManager<PlayerUser> signInManager,
            IEmailSenderService emailSender,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Email address and password are required." });
            }

            var cleanEmail = dto.Email.Trim().ToLowerInvariant();
            var existingUser = await _userManager.FindByEmailAsync(cleanEmail);
            if (existingUser != null)
            {
                return Conflict(new AuthResponseDto { Success = false, Message = "An investor account with this email already exists. Please sign in instead." });
            }

            var rawDisplayName = !string.IsNullOrWhiteSpace(dto.UserName) ? dto.UserName.Trim() : cleanEmail.Split('@')[0];
            var sanitizedUserName = rawDisplayName.Replace(" ", "_");

            var user = new PlayerUser
            {
                UserName = sanitizedUserName,
                Email = cleanEmail,
                LiquidBalance = 100_000.00m,
                TurnsSurvived = 0,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user, dto.Password);
            if (!createResult.Succeeded)
            {
                // In case username collision with existing user
                user.UserName = $"{sanitizedUserName}_{Random.Shared.Next(100, 999)}";
                createResult = await _userManager.CreateAsync(user, dto.Password);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    return BadRequest(new AuthResponseDto { Success = false, Message = errors });
                }
            }

            var token = GenerateJwtToken(user, rawDisplayName);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Investor profile successfully created! Welcome to Metro Hunt.",
                Token = token,
                UserId = user.Id,
                UserName = rawDisplayName,
                Email = user.Email ?? cleanEmail,
                LiquidBalance = user.LiquidBalance
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return Unauthorized(new AuthResponseDto { Success = false, Message = "Invalid email or password." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new AuthResponseDto { Success = false, Message = "Invalid email or password." });
            }

            var token = GenerateJwtToken(user);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                UserId = user.Id,
                UserName = user.UserName ?? "Player",
                Email = user.Email ?? "",
                LiquidBalance = user.LiquidBalance
            });
        }

        [HttpPost("google")]
        public async Task<ActionResult<AuthResponseDto>> GoogleDirectLogin([FromBody] GoogleAuthDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Email required from Google payload." });
            }

            var cleanEmail = dto.Email.Trim().ToLowerInvariant();
            var user = await _userManager.FindByEmailAsync(cleanEmail);
            string displayName = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name.Trim() : cleanEmail.Split('@')[0];
            string sanitizedUserName = displayName.Replace(" ", "_");

            if (user == null)
            {
                user = new PlayerUser
                {
                    UserName = sanitizedUserName,
                    Email = cleanEmail,
                    LiquidBalance = 100_000.00m,
                    TurnsSurvived = 0,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    user.UserName = $"{sanitizedUserName}_{Random.Shared.Next(100, 999)}";
                    createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                        return BadRequest(new AuthResponseDto { Success = false, Message = errors });
                    }
                }
            }

            var token = GenerateJwtToken(user, displayName);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Google authentication successful.",
                Token = token,
                UserId = user.Id,
                UserName = displayName,
                Email = user.Email ?? cleanEmail,
                LiquidBalance = user.LiquidBalance
            });
        }

        [HttpGet("google/status")]
        public IActionResult GoogleStatus()
        {
            var clientId = _config["Authentication:Google:ClientId"];
            var clientSecret = _config["Authentication:Google:ClientSecret"];
            bool clientIdValid = IsGoogleClientIdValid(clientId);
            bool secretConfigured = !string.IsNullOrWhiteSpace(clientSecret)
                && !clientSecret.Trim().StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase);
            return Ok(new
            {
                configured = clientIdValid && secretConfigured,
                clientIdValid,
                message = !clientIdValid
                    ? "The Google client ID is invalid. Use the Web application client ID from Google Cloud Console."
                    : !secretConfigured
                        ? "Google sign-in needs its OAuth client secret. Add it to local server secrets."
                        : null
            });
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin()
        {
            var clientId = _config["Authentication:Google:ClientId"];
            var clientSecret = _config["Authentication:Google:ClientSecret"];
            if (!IsGoogleClientIdValid(clientId)
                || string.IsNullOrWhiteSpace(clientSecret) || clientSecret.Trim().StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase))
            {
                return Redirect(BuildGoogleRedirect(error: "Google sign-in could not start. Check the Web application client ID and secret in local server secrets."));
            }

            var callbackUrl = Url.Action(nameof(GoogleCallback), "Auth");
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(
                GoogleDefaults.AuthenticationScheme, callbackUrl!);
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            var email = info?.Principal.FindFirstValue(ClaimTypes.Email)
                ?? info?.Principal.FindFirstValue("email");
            if (info == null || string.IsNullOrWhiteSpace(email))
            {
                return Redirect(BuildGoogleRedirect(error: "Google did not return an email address."));
            }

            var cleanEmail = email.Trim().ToLowerInvariant();
            var user = await _userManager.FindByEmailAsync(cleanEmail);
            if (user == null)
            {
                var displayName = info.Principal.FindFirstValue(ClaimTypes.Name) ?? cleanEmail.Split('@')[0];
                var userName = displayName.Replace(' ', '_');
                user = new PlayerUser
                {
                    UserName = userName,
                    Email = cleanEmail,
                    EmailConfirmed = true,
                    LiquidBalance = 100_000m,
                    TurnsSurvived = 0
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    user.UserName = $"{userName}_{Random.Shared.Next(100, 999)}";
                    createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        var message = string.Join("; ", createResult.Errors.Select(e => e.Description));
                        return Redirect(BuildGoogleRedirect(error: message));
                    }
                }
            }

            var linkedLogins = await _userManager.GetLoginsAsync(user);
            if (!linkedLogins.Any(login => login.LoginProvider == info.LoginProvider && login.ProviderKey == info.ProviderKey))
            {
                var linkResult = await _userManager.AddLoginAsync(user, info);
                if (!linkResult.Succeeded)
                {
                    var message = string.Join("; ", linkResult.Errors.Select(e => e.Description));
                    return Redirect(BuildGoogleRedirect(error: message));
                }
            }

            var token = GenerateJwtToken(user);
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            return Redirect(BuildGoogleRedirect(token));
        }

        private string BuildGoogleRedirect(string? token = null, string? error = null)
        {
            var clientUrl = (_config["Client:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            if (!string.IsNullOrWhiteSpace(error))
            {
                return $"{clientUrl}/?auth_error={Uri.EscapeDataString(error)}";
            }

            return $"{clientUrl}/#metrohunt_token={Uri.EscapeDataString(token ?? string.Empty)}";
        }

        private static bool IsGoogleClientIdValid(string? clientId) =>
            !string.IsNullOrWhiteSpace(clientId)
            && !clientId.Trim().StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase)
            && clientId.Trim().EndsWith(".apps.googleusercontent.com", StringComparison.OrdinalIgnoreCase);

        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (string Code, DateTime Expiry, string Purpose)> _verificationCodes = new();

        [HttpPost("send-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new { Success = false, Message = "Email address required." });
            }

            string cleanEmail = dto.Email.Trim().ToLowerInvariant();
            string purpose = dto.Purpose.Trim().ToLowerInvariant();
            if (purpose is not ("login" or "register"))
            {
                return BadRequest(new { Success = false, Message = "Choose sign-in or account creation, then try again." });
            }

            var existingUser = await _userManager.FindByEmailAsync(cleanEmail);
            if (purpose == "register" && existingUser != null)
            {
                return Conflict(new { Success = false, Message = "This email already has a Metro Hunt account. Sign in instead." });
            }
            if (purpose == "login" && existingUser == null)
            {
                return NotFound(new { Success = false, Message = "No account was found for this email. Create an account first." });
            }

            string code = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1_000_000).ToString();
            _verificationCodes[cleanEmail] = (code, DateTime.UtcNow.AddMinutes(15), purpose);

            var smtpHost = _config["Smtp:Host"];
            var smtpUser = _config["Smtp:UserName"];
            var smtpPassword = _config["Smtp:Password"];
            bool smtpConfigured = !string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(smtpUser)
                && !string.IsNullOrWhiteSpace(smtpPassword) && !smtpPassword.StartsWith("YOUR_");

            bool delivered = false;
            if (smtpConfigured)
            {
                try
                {
                    delivered = await _emailSender.SendVerificationCodeAsync(cleanEmail, code);
                }
                catch
                {
                    delivered = false;
                }
            }

            if (delivered)
            {
                return Ok(new
                {
                    Success = true,
                    EmailDelivered = true,
                    Message = $"Verification code dispatched to {cleanEmail}. Check your inbox."
                });
            }

            // Demo/Dev mode fallback when SMTP is not configured
            return Ok(new
            {
                Success = true,
                EmailDelivered = false,
                DevCode = code,
                Message = $"Verification code: {code} (Demo/Dev mode)"
            });
        }

        [HttpPost("verify-code")]
        public async Task<ActionResult<AuthResponseDto>> VerifyCode([FromBody] VerifyCodeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Code))
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Email and 6-digit verification code required." });
            }

            string emailKey = dto.Email.Trim().ToLowerInvariant();
            string purpose = dto.Purpose.Trim().ToLowerInvariant();
            if (purpose is not ("login" or "register"))
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Choose sign-in or account creation, then try again." });
            }

            if (!_verificationCodes.TryGetValue(emailKey, out var stored) || stored.Expiry < DateTime.UtcNow || stored.Purpose != purpose)
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "That code expired or does not match this request. Send a new code and try again." });
            }

            if (stored.Code != dto.Code.Trim())
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Invalid verification code. Please check your code and try again." });
            }

            // Find or create user
            var user = await _userManager.FindByEmailAsync(emailKey);
            string rawDisplayName = !string.IsNullOrWhiteSpace(dto.UserName) ? dto.UserName.Trim() : emailKey.Split('@')[0];
            string sanitizedUserName = rawDisplayName.Replace(" ", "_");

            if (purpose == "register" && user != null)
            {
                return Conflict(new AuthResponseDto { Success = false, Message = "This email already has a Metro Hunt account. Sign in instead." });
            }

            if (purpose == "login" && user == null)
            {
                return NotFound(new AuthResponseDto { Success = false, Message = "No account was found for this email. Create an account first." });
            }

            if (purpose == "register")
            {
                var regPassword = !string.IsNullOrWhiteSpace(dto.Password) ? dto.Password : "Password123!";

                user = new PlayerUser
                {
                    UserName = sanitizedUserName,
                    Email = emailKey,
                    LiquidBalance = 100_000.00m,
                    TurnsSurvived = 0,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(user, regPassword);
                if (!createResult.Succeeded)
                {
                    user.UserName = $"{sanitizedUserName}_{Random.Shared.Next(100, 999)}";
                    createResult = await _userManager.CreateAsync(user, regPassword);
                    if (!createResult.Succeeded)
                    {
                        var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                        return BadRequest(new AuthResponseDto { Success = false, Message = errors });
                    }
                }
            }
            else if (user != null)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            var verifiedUser = user ?? throw new InvalidOperationException("Verified account was not found after code validation.");

            // Consume the code only after the corresponding operation has succeeded.
            _verificationCodes.TryRemove(emailKey, out _);

            var token = GenerateJwtToken(verifiedUser, rawDisplayName);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Email verified! Successfully authenticated.",
                Token = token,
                UserId = verifiedUser.Id,
                UserName = rawDisplayName,
                Email = verifiedUser.Email ?? emailKey,
                LiquidBalance = verifiedUser.LiquidBalance
            });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "No active authentication session. Please sign in." });
            }

            var player = await _userManager.Users
                .Include(u => u.OwnedProperties)
                .Include(u => u.ActiveLoans)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (player == null) return NotFound();

            decimal portfolioVal = player.OwnedProperties.Sum(p => p.Price);
            decimal debtVal = player.ActiveLoans.Sum(l => l.RemainingBalance);
            decimal netWorth = player.LiquidBalance + portfolioVal - debtVal;

            return Ok(new
            {
                player.Id,
                player.UserName,
                player.Email,
                player.LiquidBalance,
                player.TurnsSurvived,
                PortfolioValue = portfolioVal,
                TotalDebt = debtVal,
                NetWorth = netWorth,
                OwnedProperties = player.OwnedProperties.Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.District,
                    p.Type,
                    p.Price,
                    p.MonthlyRent,
                    p.Condition,
                    p.IsOccupied
                }),
                ActiveLoans = player.ActiveLoans.Select(l => new
                {
                    l.Id,
                    l.Principal,
                    l.InterestRate,
                    l.RemainingBalance,
                    l.MonthlyPayment
                })
            });
        }

        private string GenerateJwtToken(PlayerUser user, string? displayName = null)
        {
            var keyString = _config["Jwt:Key"] ?? "MetroHuntSuperSecretKeyForDevelopmentJwtTokensOnly32CharsLong";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, displayName ?? user.UserName ?? user.Email ?? "Player"),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "MetroHuntServer",
                audience: _config["Jwt:Audience"] ?? "MetroHuntClient",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
