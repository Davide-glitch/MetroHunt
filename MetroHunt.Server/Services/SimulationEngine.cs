using MetroHunt.Server.Data;
using MetroHunt.Server.DTOs;
using MetroHunt.Server.Hubs;
using MetroHunt.Server.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace MetroHunt.Server.Services
{
    public class SimulationEngine : ISimulationEngine
    {
        private readonly MetroHuntDbContext _context;
        private readonly IHubContext<GameHub> _hubContext;
        private readonly ILogger<SimulationEngine> _logger;
        private static readonly Random _rand = new();

        private static readonly string[] Districts = { "Downtown", "Financial", "Industrial", "Suburbs" };
        private static readonly string[] PropertyTypes = { "Apartment", "House", "Commercial", "HighRise" };

        private static readonly string[] StreetNames = {
            "Wall Street", "Lexington Ave", "Broad Canal", "Beacon Boulevard",
            "Venture Way", "Skyline Parkway", "Harbor View", "Crown Plaza"
        };

        public SimulationEngine(
            MetroHuntDbContext context,
            IHubContext<GameHub> hubContext,
            ILogger<SimulationEngine> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<GameSession> GetOrCreateActiveSessionAsync()
        {
            var session = await _context.GameSessions.FirstOrDefaultAsync(s => !s.IsCompleted);
            if (session == null)
            {
                session = new GameSession
                {
                    TargetNetWorth = 100_000_000.00m, // Target $100M
                    CurrentRound = 1,
                    IsCompleted = false
                };
                _context.GameSessions.Add(session);
                await _context.SaveChangesAsync();
            }
            return session;
        }

        public async Task<PropertyBuyResult> BuyPropertyAsync(int propertyId, string playerId, byte[]? clientRowVersion = null)
        {
            // Explicit database transaction with optimistic concurrency handling
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await GetOrCreateActiveSessionAsync();
                if (session.IsCompleted)
                {
                    return new PropertyBuyResult
                    {
                        Success = false,
                        Message = $"The game is already over! Winner: {session.WinnerName}"
                    };
                }

                var property = await _context.Properties
                    .FirstOrDefaultAsync(p => p.Id == propertyId);

                if (property == null)
                {
                    return new PropertyBuyResult { Success = false, Message = "Property not found." };
                }

                if (!string.IsNullOrEmpty(property.OwnerId))
                {
                    return new PropertyBuyResult
                    {
                        Success = false,
                        Message = "This property has already been acquired by another investor!"
                    };
                }

                var player = await _context.Users
                    .Include(u => u.OwnedProperties)
                    .Include(u => u.ActiveLoans)
                    .FirstOrDefaultAsync(u => u.Id == playerId);

                if (player == null)
                {
                    return new PropertyBuyResult { Success = false, Message = "Player not found." };
                }

                if (player.LiquidBalance < property.Price)
                {
                    return new PropertyBuyResult
                    {
                        Success = false,
                        Message = $"Insufficient liquid funds. Required: ${property.Price:N0}, Available: ${player.LiquidBalance:N0}"
                    };
                }

                // If client provided a RowVersion token, apply it to detect mid-flight concurrent updates
                if (clientRowVersion != null && clientRowVersion.Length > 0)
                {
                    _context.Entry(property).Property(p => p.RowVersion).OriginalValue = clientRowVersion;
                }

                // Execute transfer
                player.LiquidBalance -= property.Price;
                property.OwnerId = player.Id;
                property.IsOccupied = true;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Compute updated metrics
                decimal portfolioVal = player.OwnedProperties.Sum(p => p.Price) + property.Price;
                decimal debt = player.ActiveLoans.Sum(l => l.RemainingBalance);
                decimal netWorth = player.LiquidBalance + portfolioVal - debt;

                // Evaluate victory condition atomically
                await EvaluateWinConditionAsync(playerId);

                // Broadcast property purchase to all connected clients over SignalR
                await _hubContext.Clients.All.SendAsync("PropertyPurchased", new
                {
                    PropertyId = property.Id,
                    Title = property.Title,
                    District = property.District,
                    Price = property.Price,
                    BuyerId = player.Id,
                    BuyerName = player.UserName,
                    RemainingBalance = player.LiquidBalance
                });

                // Broadcast updated race leaderboard
                var leaderboard = await GetLeaderboardAsync();
                await _hubContext.Clients.All.SendAsync("RaceProgressUpdated", leaderboard);

                return new PropertyBuyResult
                {
                    Success = true,
                    Message = $"Successfully acquired {property.Title} for ${property.Price:N0}!",
                    PropertyId = property.Id,
                    NewBalance = player.LiquidBalance,
                    NewNetWorth = netWorth
                };
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogWarning(ex, "Concurrency conflict during acquisition of property {PropertyId}", propertyId);
                return new PropertyBuyResult
                {
                    Success = false,
                    Message = "Acquisition conflict: Another investor purchased this property simultaneously! Transaction aborted."
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error processing purchase of property {PropertyId}", propertyId);
                throw;
            }
        }

        public async Task<AdvanceTurnResult> AdvanceTurnAsync(string playerId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var session = await GetOrCreateActiveSessionAsync();
                var player = await _context.Users
                    .Include(u => u.OwnedProperties)
                    .Include(u => u.ActiveLoans)
                    .FirstOrDefaultAsync(u => u.Id == playerId);

                if (player == null)
                {
                    throw new InvalidOperationException("Player not found.");
                }

                session.CurrentRound++;
                player.TurnsSurvived++;

                // 1. Collect Rent from occupied owned properties
                decimal totalRentCollected = 0m;
                foreach (var prop in player.OwnedProperties.Where(p => p.IsOccupied))
                {
                    totalRentCollected += prop.MonthlyRent;
                }

                // 2. Maintenance costs (0.5% - 1.0% per property)
                decimal totalMaintenancePaid = 0m;
                foreach (var prop in player.OwnedProperties)
                {
                    decimal maintenanceCost = Math.Round(prop.Price * 0.006m, 2);
                    if (player.LiquidBalance + totalRentCollected >= maintenanceCost)
                    {
                        totalMaintenancePaid += maintenanceCost;
                    }
                    else
                    {
                        // Condition decays if maintenance cannot be covered
                        prop.Condition = Math.Max(10, prop.Condition - 10);
                        prop.MonthlyRent = Math.Round(prop.MonthlyRent * 0.90m, 2);
                    }
                }

                // 3. Loan Amortization deductions
                decimal totalLoanPaymentsPaid = 0m;
                var loansToRemove = new List<Loan>();
                foreach (var loan in player.ActiveLoans)
                {
                    if (player.LiquidBalance + totalRentCollected - totalMaintenancePaid >= loan.MonthlyPayment)
                    {
                        totalLoanPaymentsPaid += loan.MonthlyPayment;
                        loan.RemainingBalance = Math.Max(0m, loan.RemainingBalance - loan.MonthlyPayment);
                        if (loan.RemainingBalance <= 0)
                        {
                            loansToRemove.Add(loan);
                        }
                    }
                    else
                    {
                        // 5% default penalty added to principal
                        loan.Principal = Math.Round(loan.Principal * 1.05m, 2);
                        loan.RemainingBalance = Math.Round(loan.RemainingBalance * 1.05m, 2);
                    }
                }

                foreach (var paidOff in loansToRemove)
                {
                    _context.Loans.Remove(paidOff);
                }

                // Apply cashflow net delta
                decimal netCashflow = totalRentCollected - totalMaintenancePaid - totalLoanPaymentsPaid;
                player.LiquidBalance += netCashflow;

                // 4. Property Appreciation based on district & condition
                foreach (var prop in player.OwnedProperties)
                {
                    decimal appreciationRate = prop.District switch
                    {
                        "Financial" => 0.005m,
                        "Downtown" => 0.004m,
                        "Suburbs" => 0.003m,
                        "Industrial" => 0.002m,
                        _ => 0.003m
                    };

                    // Condition scale (100 = 1.0x, 50 = 0.5x)
                    appreciationRate *= (prop.Condition / 100.0m);
                    prop.Price = Math.Round(prop.Price * (1 + appreciationRate), 2);
                    prop.MonthlyRent = Math.Round(prop.Price * 0.008m, 2);
                }

                // 5. Market Events (15% chance per turn)
                string? triggeredEventTitle = null;
                var activeEvents = await _context.MarketEvents.Where(e => e.IsActive).ToListAsync();
                foreach (var evt in activeEvents)
                {
                    evt.RemainingTurns--;
                    if (evt.RemainingTurns <= 0)
                    {
                        evt.IsActive = false;
                    }
                }

                if (_rand.NextDouble() < 0.20)
                {
                    var newEvent = GenerateRandomMarketEvent();
                    _context.MarketEvents.Add(newEvent);
                    triggeredEventTitle = newEvent.Title;

                    // Broadcast market event alert
                    await _hubContext.Clients.All.SendAsync("MarketEventTriggered", new
                    {
                        Title = newEvent.Title,
                        Description = newEvent.Description,
                        Multiplier = newEvent.Multiplier,
                        District = newEvent.AffectedDistrict,
                        Duration = newEvent.DurationTurns
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 6. Check Victory Condition
                bool won = await EvaluateWinConditionAsync(playerId);

                decimal portfolioVal = player.OwnedProperties.Sum(p => p.Price);
                decimal debt = player.ActiveLoans.Sum(l => l.RemainingBalance);
                decimal netWorth = player.LiquidBalance + portfolioVal - debt;

                // Broadcast turn advance event to all clients
                await _hubContext.Clients.All.SendAsync("TurnAdvanced", new
                {
                    Round = session.CurrentRound,
                    PlayerName = player.UserName,
                    NetCashflow = netCashflow,
                    ActiveEvent = triggeredEventTitle
                });

                // Broadcast leaderboard update
                var leaderboard = await GetLeaderboardAsync();
                await _hubContext.Clients.All.SendAsync("RaceProgressUpdated", leaderboard);

                return new AdvanceTurnResult
                {
                    TurnNumber = session.CurrentRound,
                    RentCollected = totalRentCollected,
                    MaintenancePaid = totalMaintenancePaid,
                    LoanPaymentsPaid = totalLoanPaymentsPaid,
                    NetCashflow = netCashflow,
                    NewBalance = player.LiquidBalance,
                    NewNetWorth = netWorth,
                    ActiveEventTitle = triggeredEventTitle,
                    CentralBankRate = 0.05m,
                    GameOver = session.IsCompleted,
                    WinnerName = session.WinnerName
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error advancing turn for player {PlayerId}", playerId);
                throw;
            }
        }

        public async Task<bool> EvaluateWinConditionAsync(string playerId)
        {
            var session = await GetOrCreateActiveSessionAsync();
            if (session.IsCompleted)
            {
                return true;
            }

            var player = await _context.Users
                .Include(u => u.OwnedProperties)
                .Include(u => u.ActiveLoans)
                .FirstOrDefaultAsync(u => u.Id == playerId);

            if (player == null) return false;

            decimal totalPropertyVal = player.OwnedProperties.Sum(p => p.Price);
            decimal totalDebt = player.ActiveLoans.Sum(l => l.RemainingBalance);
            decimal netWorth = player.LiquidBalance + totalPropertyVal - totalDebt;

            if (netWorth >= session.TargetNetWorth)
            {
                session.IsCompleted = true;
                session.WinnerId = player.Id;
                session.WinnerName = player.UserName;
                session.WinningNetWorth = netWorth;
                session.CompletedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("VICTORY! Player {PlayerName} reached ${NetWorth:N0} (Target: ${Target:N0})",
                    player.UserName, netWorth, session.TargetNetWorth);

                // Broadcast victory to all connected clients over SignalR WebSockets
                await _hubContext.Clients.All.SendAsync("VictoryAchieved", new
                {
                    WinnerId = player.Id,
                    WinnerName = player.UserName,
                    FinalNetWorth = netWorth,
                    Target = session.TargetNetWorth,
                    TotalTurns = session.CurrentRound
                });

                return true;
            }

            return false;
        }

        public async Task<List<Property>> GenerateProceduralPropertiesAsync(int count = 6)
        {
            var generated = new List<Property>();

            for (int i = 0; i < count; i++)
            {
                var district = Districts[_rand.Next(Districts.Length)];
                var type = PropertyTypes[_rand.Next(PropertyTypes.Length)];
                var street = StreetNames[_rand.Next(StreetNames.Length)];
                int streetNum = _rand.Next(100, 9999);

                // Base Pricing from legacy formulas
                decimal basePrice = type switch
                {
                    "Apartment" => 50_000m,
                    "House" => 150_000m,
                    "Commercial" => 400_000m,
                    "HighRise" => 1_200_000m,
                    _ => 100_000m
                };

                // District multipliers
                decimal districtMultiplier = district switch
                {
                    "Financial" => 1.6m,
                    "Downtown" => 1.4m,
                    "Suburbs" => 1.0m,
                    "Industrial" => 0.8m,
                    _ => 1.0m
                };

                decimal variance = (decimal)(0.90 + _rand.NextDouble() * 0.35);
                decimal finalPrice = Math.Round(basePrice * districtMultiplier * variance, 0);
                decimal monthlyRent = Math.Round(finalPrice * 0.0085m, 0);

                var prop = new Property
                {
                    Title = $"{streetNum} {street}",
                    District = district,
                    Type = type,
                    Price = finalPrice,
                    MonthlyRent = monthlyRent,
                    Condition = _rand.Next(75, 100),
                    IsOccupied = false,
                    OwnerId = null
                };

                generated.Add(prop);
            }

            _context.Properties.AddRange(generated);
            await _context.SaveChangesAsync();

            return generated;
        }

        public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync()
        {
            var session = await GetOrCreateActiveSessionAsync();
            var players = await _context.Users
                .Include(u => u.OwnedProperties)
                .Include(u => u.ActiveLoans)
                .ToListAsync();

            return players.Select(p =>
            {
                decimal portfolio = p.OwnedProperties.Sum(prop => prop.Price);
                decimal debt = p.ActiveLoans.Sum(l => l.RemainingBalance);
                decimal netWorth = p.LiquidBalance + portfolio - debt;
                double progress = (double)Math.Min(100m, Math.Max(0m, (netWorth / session.TargetNetWorth) * 100m));

                return new LeaderboardEntryDto
                {
                    PlayerId = p.Id,
                    PlayerName = p.UserName ?? "Unknown Investor",
                    LiquidBalance = p.LiquidBalance,
                    PortfolioValue = portfolio,
                    TotalDebt = debt,
                    NetWorth = netWorth,
                    PropertiesOwned = p.OwnedProperties.Count,
                    TargetProgress = progress
                };
            })
            .OrderByDescending(e => e.NetWorth)
            .ToList();
        }

        public async Task<TakeLoanResult> TakeLoanAsync(string playerId, decimal principal)
        {
            if (principal <= 0 || principal > 5_000_000m)
            {
                return new TakeLoanResult { Success = false, Message = "Loan principal must be between $1 and $5,000,000." };
            }

            var player = await _context.Users
                .Include(u => u.ActiveLoans)
                .FirstOrDefaultAsync(u => u.Id == playerId);

            if (player == null)
            {
                return new TakeLoanResult { Success = false, Message = "Player not found." };
            }

            // Cap at 3 concurrent loans
            if (player.ActiveLoans.Count >= 3)
            {
                return new TakeLoanResult { Success = false, Message = "Maximum credit limit reached (Max 3 concurrent bank loans)." };
            }

            decimal interestRate = 0.0650m; // 6.5% interest
            decimal monthlyPayment = Math.Round((principal * (1 + interestRate)) / 24, 2); // 24-turn loan

            var loan = new Loan
            {
                Principal = principal,
                InterestRate = interestRate,
                RemainingBalance = principal * (1 + interestRate),
                MonthlyPayment = monthlyPayment,
                PlayerUserId = player.Id
            };

            player.LiquidBalance += principal;
            _context.Loans.Add(loan);

            await _context.SaveChangesAsync();

            decimal totalDebt = player.ActiveLoans.Sum(l => l.RemainingBalance) + loan.RemainingBalance;

            return new TakeLoanResult
            {
                Success = true,
                Message = $"Approved ${principal:N0} bank loan at {(interestRate * 100):N1}% interest.",
                NewBalance = player.LiquidBalance,
                NewDebt = totalDebt
            };
        }

        public async Task ResetGameAsync()
        {
            var session = await _context.GameSessions.FirstOrDefaultAsync();
            if (session != null)
            {
                session.CurrentRound = 1;
                session.IsCompleted = false;
                session.WinnerId = null;
                session.WinnerName = null;
                session.WinningNetWorth = 0m;
                session.CompletedAt = null;
            }

            // Reset players balances and owned properties
            var properties = await _context.Properties.ToListAsync();
            foreach (var p in properties)
            {
                p.OwnerId = null;
                p.IsOccupied = false;
            }

            var loans = await _context.Loans.ToListAsync();
            _context.Loans.RemoveRange(loans);

            var players = await _context.Users.ToListAsync();
            foreach (var pl in players)
            {
                pl.LiquidBalance = 100_000.00m;
                pl.TurnsSurvived = 0;
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("GameReset", new { Message = "Game has been reset to starting state." });
        }

        private static MarketEvent GenerateRandomMarketEvent()
        {
            int type = _rand.Next(4);
            var district = Districts[_rand.Next(Districts.Length)];

            return type switch
            {
                0 => new MarketEvent
                {
                    Title = "Tech Sector Boom",
                    Description = $"Venture capital expansion in {district} surges property equity and tenant rent!",
                    AffectedDistrict = district,
                    Multiplier = 1.2500m,
                    DurationTurns = 4,
                    RemainingTurns = 4,
                    IsActive = true
                },
                1 => new MarketEvent
                {
                    Title = "Credit Crunch & Recession",
                    Description = "Central bank rate hikes cause city-wide real estate compression.",
                    AffectedDistrict = null,
                    Multiplier = 0.8200m,
                    DurationTurns = 3,
                    RemainingTurns = 3,
                    IsActive = true
                },
                2 => new MarketEvent
                {
                    Title = "Infrastructure Development Grant",
                    Description = $"Public transit line extension approved in {district}! High residential demand expected.",
                    AffectedDistrict = district,
                    Multiplier = 1.1800m,
                    DurationTurns = 5,
                    RemainingTurns = 5,
                    IsActive = true
                },
                _ => new MarketEvent
                {
                    Title = "Industrial Zone Re-Zoning",
                    Description = "Zoning updates increase manufacturing & warehouse valuations.",
                    AffectedDistrict = "Industrial",
                    Multiplier = 1.1500m,
                    DurationTurns = 4,
                    RemainingTurns = 4,
                    IsActive = true
                }
            };
        }
    }
}
