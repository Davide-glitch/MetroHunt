using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MetroHunt.Server.DTOs;
using MetroHunt.Server.Models;
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
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<PlayerUser> userManager,
            SignInManager<PlayerUser> signInManager,
            IConfiguration config,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Email is already registered." });
            }

            var user = new PlayerUser
            {
                UserName = string.IsNullOrWhiteSpace(dto.UserName) ? dto.Email.Split('@')[0] : dto.UserName,
                Email = dto.Email,
                LiquidBalance = 100_000.00m,
                TurnsSurvived = 0
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return BadRequest(new AuthResponseDto { Success = false, Message = errors });
            }

            var token = GenerateJwtToken(user);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful.",
                Token = token,
                UserId = user.Id,
                UserName = user.UserName ?? "Player",
                Email = user.Email ?? "",
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

        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (string Code, DateTime Expiry)> _verificationCodes = new();

        [HttpPost("send-code")]
        public IActionResult SendVerificationCode([FromBody] SendVerificationCodeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new { Success = false, Message = "Email address required." });
            }

            var rand = new Random();
            string code = rand.Next(100000, 999999).ToString();
            _verificationCodes[dto.Email.ToLowerInvariant()] = (code, DateTime.UtcNow.AddMinutes(10));

            _logger.LogInformation("=================================================");
            _logger.LogInformation("EMAIL VERIFICATION CODE FOR {Email}: [ {Code} ]", dto.Email, code);
            _logger.LogInformation("=================================================");

            return Ok(new
            {
                Success = true,
                Message = $"6-digit verification code dispatched to {dto.Email}.",
                Code = code // Returned for dev testing & automatic display
            });
        }

        [HttpPost("verify-code")]
        public async Task<ActionResult<AuthResponseDto>> VerifyCode([FromBody] VerifyCodeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Code))
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Email and 6-digit verification code required." });
            }

            string emailKey = dto.Email.ToLowerInvariant();
            if (!_verificationCodes.TryGetValue(emailKey, out var stored) || stored.Expiry < DateTime.UtcNow)
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Verification code expired or not found. Please request a new code." });
            }

            if (stored.Code != dto.Code.Trim())
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Invalid verification code. Please check your code and try again." });
            }

            // Code valid: remove used code
            _verificationCodes.TryRemove(emailKey, out _);

            // Find or create user
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                string assignedName = !string.IsNullOrWhiteSpace(dto.UserName) ? dto.UserName : dto.Email.Split('@')[0];
                user = new PlayerUser
                {
                    UserName = assignedName,
                    Email = dto.Email,
                    LiquidBalance = 100_000.00m,
                    TurnsSurvived = 0,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(user, string.IsNullOrWhiteSpace(dto.Password) ? "MetroHunt@2026!" : dto.Password);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    return BadRequest(new AuthResponseDto { Success = false, Message = errors });
                }
            }
            else
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            var token = GenerateJwtToken(user);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Email verified! Successfully authenticated.",
                Token = token,
                UserId = user.Id,
                UserName = user.UserName ?? "Player",
                Email = user.Email ?? "",
                LiquidBalance = user.LiquidBalance
            });
        }

        [HttpPost("google")]
        public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] GoogleAuthDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new AuthResponseDto { Success = false, Message = "Email required from Google payload." });
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                string chosenName = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name : dto.Email.Split('@')[0];
                user = new PlayerUser
                {
                    UserName = chosenName,
                    Email = dto.Email,
                    LiquidBalance = 100_000.00m,
                    TurnsSurvived = 0,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    user.UserName = $"{chosenName}_{Random.Shared.Next(100, 999)}";
                    createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        return BadRequest(new AuthResponseDto { Success = false, Message = "Could not create user account for Google profile." });
                    }
                }
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(dto.Name) && (user.UserName == "investor" || user.UserName == user.Email))
                {
                    user.UserName = dto.Name;
                    await _userManager.UpdateAsync(user);
                }
            }

            var token = GenerateJwtToken(user);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Google authentication successful.",
                Token = token,
                UserId = user.Id,
                UserName = user.UserName ?? dto.Name ?? "Player",
                Email = user.Email ?? "",
                LiquidBalance = user.LiquidBalance
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

        private string GenerateJwtToken(PlayerUser user)
        {
            var keyString = _config["Jwt:Key"] ?? "MetroHuntSuperSecretKeyForDevelopmentJwtTokensOnly32CharsLong";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? "Player"),
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
