using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetroHunt.Server.Models
{
    public class MarketEvent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(60)]
        public string? AffectedDistrict { get; set; } // null means city-wide

        [Column(TypeName = "decimal(5,4)")]
        public decimal Multiplier { get; set; } = 1.0000m;

        public int DurationTurns { get; set; }
        public int RemainingTurns { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
