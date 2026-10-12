namespace MetroHunt.Server.Services
{
    public interface IEmailSenderService
    {
        Task<bool> SendVerificationCodeAsync(string toEmail, string code, string? recipientName = null);
    }
}
