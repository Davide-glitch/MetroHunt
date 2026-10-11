using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetroHunt.Server.Models
{
    public class Loan
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Principal { get; set; }

        [Column(TypeName = "decimal(5,4)")]
        public decimal InterestRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RemainingBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyPayment { get; set; }

        [Required]
        public string PlayerUserId { get; set; } = string.Empty;

        [ForeignKey(nameof(PlayerUserId))]
        public virtual PlayerUser? PlayerUser { get; set; }
    }
}
