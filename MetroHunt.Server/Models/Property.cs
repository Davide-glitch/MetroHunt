using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetroHunt.Server.Models
{
    public class Property
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(60)]
        public string District { get; set; } = string.Empty; // Downtown, Financial, Industrial, Suburbs

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Apartment, House, Commercial, HighRise

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyRent { get; set; }

        public int Condition { get; set; } = 100; // 0 - 100 rating
        public bool IsOccupied { get; set; } = false;

        // Foreign key to PlayerUser (null if unowned / available on market)
        public string? OwnerId { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public virtual PlayerUser? Owner { get; set; }

        // Optimistic concurrency token to prevent duplicate simultaneous purchases in multiplayer
        [Timestamp]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}
