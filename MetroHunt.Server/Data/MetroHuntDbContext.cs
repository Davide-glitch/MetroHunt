using MetroHunt.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MetroHunt.Server.Data
{
    public class MetroHuntDbContext : IdentityDbContext<PlayerUser>
    {
        public MetroHuntDbContext(DbContextOptions<MetroHuntDbContext> options)
            : base(options)
        {
        }

        public DbSet<Property> Properties => Set<Property>();
        public DbSet<Loan> Loans => Set<Loan>();
        public DbSet<MarketEvent> MarketEvents => Set<MarketEvent>();
        public DbSet<GameSession> GameSessions => Set<GameSession>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Precision specifications for SQL Server (avoids truncation warnings)
            builder.Entity<PlayerUser>(entity =>
            {
                entity.Property(u => u.LiquidBalance)
                    .HasPrecision(18, 2);
            });

            builder.Entity<Property>(entity =>
            {
                entity.Property(p => p.Price)
                    .HasPrecision(18, 2);

                entity.Property(p => p.MonthlyRent)
                    .HasPrecision(18, 2);

                // RowVersion optimistic concurrency token for SQL Server ROWVERSION column
                entity.Property(p => p.RowVersion)
                    .IsRowVersion();

                entity.HasOne(p => p.Owner)
                    .WithMany(u => u.OwnedProperties)
                    .HasForeignKey(p => p.OwnerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<Loan>(entity =>
            {
                entity.Property(l => l.Principal)
                    .HasPrecision(18, 2);

                entity.Property(l => l.RemainingBalance)
                    .HasPrecision(18, 2);

                entity.Property(l => l.MonthlyPayment)
                    .HasPrecision(18, 2);

                entity.Property(l => l.InterestRate)
                    .HasPrecision(5, 4);

                entity.HasOne(l => l.PlayerUser)
                    .WithMany(u => u.ActiveLoans)
                    .HasForeignKey(l => l.PlayerUserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<MarketEvent>(entity =>
            {
                entity.Property(e => e.Multiplier)
                    .HasPrecision(5, 4);
            });

            builder.Entity<GameSession>(entity =>
            {
                entity.Property(s => s.TargetNetWorth)
                    .HasPrecision(18, 2);

                entity.Property(s => s.WinningNetWorth)
                    .HasPrecision(18, 2);
            });
        }
    }
}
