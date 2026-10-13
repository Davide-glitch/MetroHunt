namespace MetroHunt.Server.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class InvestorAuthDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool IsNewCareer { get; set; } = false;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleAuthDto
    {
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
    }

    public class SendVerificationCodeDto
    {
        public string Email { get; set; } = string.Empty;
        public string Purpose { get; set; } = "login";
    }

    public class VerifyCodeDto
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string Purpose { get; set; } = "login";
    }

    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal LiquidBalance { get; set; }
    }

    public class BuyPropertyRequestDto
    {
        public string? RowVersionBase64 { get; set; }
    }

    public class LoanRequestDto
    {
        public decimal Principal { get; set; }
    }
}
