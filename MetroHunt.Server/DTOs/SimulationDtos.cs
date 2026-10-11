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
}
