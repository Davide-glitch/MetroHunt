using Microsoft.AspNetCore.Identity;

namespace MetroHunt.Server.Models
{
    public class PlayerUser : IdentityUser
    {
        public decimal LiquidBalance { get; set; } = 100_000.00m;
        public int TurnsSurvived { get; set; } = 0;

        // Navigation collections
        public virtual ICollection<Property> OwnedProperties { get; set; } = new List<Property>();
        public virtual ICollection<Loan> ActiveLoans { get; set; } = new List<Loan>();
    }
}
