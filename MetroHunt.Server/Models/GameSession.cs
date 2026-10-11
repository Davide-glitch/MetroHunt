using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetroHunt.Server.Models
{
    public class GameSession
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TargetNetWorth { get; set; } = 100_000_000.00m; // Target $100M

        public int CurrentRound { get; set; } = 1;

        public bool IsCompleted { get; set; } = false;

        public string? WinnerId { get; set; }

        public string? WinnerName { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal WinningNetWorth { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
