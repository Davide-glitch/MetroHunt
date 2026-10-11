namespace MetroHunt.Server.DTOs
{
    public class PropertyBuyResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int PropertyId { get; set; }
        public decimal NewBalance { get; set; }
        public decimal NewNetWorth { get; set; }
    }

    public class AdvanceTurnResult
    {
        public int TurnNumber { get; set; }
        public decimal RentCollected { get; set; }
        public decimal MaintenancePaid { get; set; }
        public decimal LoanPaymentsPaid { get; set; }
        public decimal NetCashflow { get; set; }
        public decimal NewBalance { get; set; }
        public decimal NewNetWorth { get; set; }
        public string? ActiveEventTitle { get; set; }
        public decimal CentralBankRate { get; set; }
        public bool GameOver { get; set; }
        public string? WinnerName { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public string PlayerId { get; set; } = string.Empty;
        public string PlayerName { get; set; } = string.Empty;
        public decimal LiquidBalance { get; set; }
        public decimal PortfolioValue { get; set; }
        public decimal TotalDebt { get; set; }
        public decimal NetWorth { get; set; }
        public int PropertiesOwned { get; set; }
        public double TargetProgress { get; set; }
    }

    public class TakeLoanResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal NewBalance { get; set; }
        public decimal NewDebt { get; set; }
    }

    public class RenovationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int PropertyId { get; set; }
        public int NewCondition { get; set; }
        public decimal NewMonthlyRent { get; set; }
        public decimal NewPrice { get; set; }
        public decimal NewBalance { get; set; }
    }

    public class WorkDealResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal EarnedAmount { get; set; }
        public decimal NewBalance { get; set; }
        public decimal NewNetWorth { get; set; }
        public string DealTitle { get; set; } = string.Empty;
    }

    public class HostileAuditResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string TargetPlayerName { get; set; } = string.Empty;
        public string PropertyTitle { get; set; } = string.Empty;
        public decimal PenaltyAssessed { get; set; }
        public int NewCondition { get; set; }
    }

    public class AuditLogDto
    {
        public int Id { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal PostBalance { get; set; }
        public int TurnNumber { get; set; }
        public DateTime Timestamp { get; set; }
        public string? PropertyTitle { get; set; }
    }
}
