using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetroHunt.Server.Models
{
    public enum AuditActionType
    {
        Acquisition,
        RentalIncome,
        MaintenanceFee,
        DebtService,
        Renovation,
        RegulatoryAudit,
        MacroEventImpact
    }

    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(450)]
        public string PlayerUserId { get; set; } = string.Empty;

        [ForeignKey(nameof(PlayerUserId))]
        public virtual PlayerUser? PlayerUser { get; set; }

        public int? PropertyId { get; set; }

        [ForeignKey(nameof(PropertyId))]
        public virtual Property? Property { get; set; }

        public AuditActionType ActionType { get; set; }

        [Required]
        [MaxLength(250)]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PostBalance { get; set; }

        public int TurnNumber { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
