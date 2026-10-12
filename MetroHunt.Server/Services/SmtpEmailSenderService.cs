using System.Net;
using System.Net.Mail;

namespace MetroHunt.Server.Services
{
    public class SmtpEmailSenderService : IEmailSenderService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmtpEmailSenderService> _logger;

        public SmtpEmailSenderService(IConfiguration config, ILogger<SmtpEmailSenderService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task<bool> SendVerificationCodeAsync(string toEmail, string code, string? recipientName = null)
        {
            string host = _config["Smtp:Host"] ?? "";
            int port = int.TryParse(_config["Smtp:Port"], out var p) ? p : 587;
            string userName = _config["Smtp:UserName"] ?? "";
            string password = _config["Smtp:Password"] ?? "";
            string fromEmail = _config["Smtp:FromEmail"] ?? (string.IsNullOrWhiteSpace(userName) ? "security@metrohunt.com" : userName);
            string fromName = _config["Smtp:FromName"] ?? "Metro Hunt Real Estate Tycoon";

            // If SMTP credentials configured, attempt real network delivery
            if (!string.IsNullOrWhiteSpace(host) && !string.IsNullOrWhiteSpace(userName) && !string.IsNullOrWhiteSpace(password))
            {
                try
                {
                    using var client = new SmtpClient(host, port)
                    {
                        EnableSsl = true,
                        Credentials = new NetworkCredential(userName, password),
                        Timeout = 12000
                    };

                    using var message = new MailMessage
                    {
                        From = new MailAddress(fromEmail, fromName),
                        Subject = $"Your Metro Hunt Verification Code: {code}",
                        IsBodyHtml = true,
                        Body = $@"
                        <div style='background-color:#020617; color:#f8fafc; font-family:sans-serif; padding:32px; border-radius:16px; max-width:520px; margin:auto; border:1px solid #1e293b;'>
                            <div style='text-align:center; margin-bottom:24px;'>
                                <h1 style='color:#10b981; margin:0; font-size:26px; font-weight:900; letter-spacing:1px;'>METRO HUNT</h1>
                                <p style='color:#94a3b8; font-size:12px; margin-top:4px; text-transform:uppercase; letter-spacing:2px;'>Real Estate Simulation & Syndicate</p>
                            </div>
                            <hr style='border:none; border-top:1px solid #1e293b; margin:20px 0;'/>
                            <p style='font-size:15px; color:#f1f5f9; line-height:1.5;'>Hello <strong>{recipientName ?? "Investor"}</strong>,</p>
                            <p style='font-size:14px; color:#cbd5e1; line-height:1.5;'>Use the one-time 6-digit verification code below to authenticate your investor portfolio:</p>
                            
                            <div style='background-color:#0f172a; border:2px solid #10b981; border-radius:14px; padding:20px; text-align:center; margin:24px 0;'>
                                <div style='font-size:36px; letter-spacing:10px; font-weight:900; color:#34d399; font-family:monospace; padding-left:10px;'>{code}</div>
                                <div style='font-size:11px; color:#64748b; margin-top:8px; text-transform:uppercase; font-family:monospace;'>Valid for 10 minutes</div>
                            </div>
                            
                            <p style='font-size:12px; color:#64748b; line-height:1.5;'>If you did not request this verification code, please ignore this email. Never share your verification code with anyone.</p>
                            <hr style='border:none; border-top:1px solid #1e293b; margin:24px 0 16px;'/>
                            <p style='font-size:11px; color:#475569; text-align:center;'>© 2026 Metro Hunt Real Estate Simulation Platform</p>
                        </div>"
                    };
                    message.To.Add(new MailAddress(toEmail));

                    await client.SendMailAsync(message);
                    _logger.LogInformation("Successfully dispatched real verification email via SMTP to {Email}", toEmail);
                    return true;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send real email via SMTP to {Email}. Check Smtp settings in appsettings.json.", toEmail);
                }
            }
            else
            {
                _logger.LogInformation("SMTP credentials not filled in appsettings.json. Dispatched simulated code for {Email}: [ {Code} ]", toEmail, code);
            }

            return false;
        }
    }
}
