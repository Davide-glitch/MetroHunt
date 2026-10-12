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
                    TargetNetWorth = 100_000_000.00m,
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

                if (clientRowVersion != null && clientRowVersion.Length > 0)
                {
                    _context.Entry(property).Property(p => p.RowVersion).OriginalValue = clientRowVersion;
                }

                player.LiquidBalance -= property.Price;
                property.OwnerId = player.Id;
                property.IsOccupied = true;

                // Log audit action
                _context.AuditLogs.Add(new AuditLog
                {
                    PlayerUserId = player.Id,
                    PropertyId = property.Id,
                    ActionType = AuditActionType.Acquisition,
                    Description = $"Acquired {property.Title} ({property.District}) for ${property.Price:N0}",
                    Amount = -property.Price,
                    PostBalance = player.LiquidBalance,
                    TurnNumber = session.CurrentRound
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                decimal portfolioVal = player.OwnedProperties.Sum(p => p.Price) + property.Price;
                decimal debt = player.ActiveLoans.Sum(l => l.RemainingBalance);
                decimal netWorth = player.LiquidBalance + portfolioVal - debt;

                await EvaluateWinConditionAsync(playerId);

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

                // 1. Collect Rent
                decimal totalRentCollected = 0m;
                foreach (var prop in player.OwnedProperties.Where(p => p.IsOccupied))
                {
                    totalRentCollected += prop.MonthlyRent;
                }

                // 2. Maintenance costs
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
                        loan.Principal = Math.Round(loan.Principal * 1.05m, 2);
                        loan.RemainingBalance = Math.Round(loan.RemainingBalance * 1.05m, 2);
                    }
                }

                foreach (var paidOff in loansToRemove)
                {
                    _context.Loans.Remove(paidOff);
                }

                decimal netCashflow = totalRentCollected - totalMaintenancePaid - totalLoanPaymentsPaid;
                player.LiquidBalance += netCashflow;

                // Log audit summary for the turn
                if (totalRentCollected > 0)
                {
                    _context.AuditLogs.Add(new AuditLog
                    {
                        PlayerUserId = player.Id,
                        ActionType = AuditActionType.RentalIncome,
                        Description = $"Collected rent from {player.OwnedProperties.Count} properties",
                        Amount = totalRentCollected,
                        PostBalance = player.LiquidBalance,
                        TurnNumber = session.CurrentRound
                    });
                }

                if (totalMaintenancePaid > 0)
                {
                    _context.AuditLogs.Add(new AuditLog
                    {
                        PlayerUserId = player.Id,
                        ActionType = AuditActionType.MaintenanceFee,
                        Description = $"Paid facility maintenance on {player.OwnedProperties.Count} properties",
                        Amount = -totalMaintenancePaid,
                        PostBalance = player.LiquidBalance,
                        TurnNumber = session.CurrentRound
                    });
                }

                // 4. Property Appreciation
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

                    appreciationRate *= (prop.Condition / 100.0m);
                    prop.Price = Math.Round(prop.Price * (1 + appreciationRate), 2);
                    prop.MonthlyRent = Math.Round(prop.Price * 0.008m, 2);
                }

                // 5. Market Events
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

                await EvaluateWinConditionAsync(playerId);

                decimal portfolioVal = player.OwnedProperties.Sum(p => p.Price);
                decimal debt = player.ActiveLoans.Sum(l => l.RemainingBalance);
                decimal netWorth = player.LiquidBalance + portfolioVal - debt;

                await _hubContext.Clients.All.SendAsync("TurnAdvanced", new
                {
                    Round = session.CurrentRound,
                    PlayerName = player.UserName,
                    NetCashflow = netCashflow,
                    ActiveEvent = triggeredEventTitle
                });

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

        public async Task<RenovationResult> RenovatePropertyAsync(int propertyId, string playerId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var property = await _context.Properties.FirstOrDefaultAsync(p => p.Id == propertyId);
                if (property == null) return new RenovationResult { Success = false, Message = "Property not found." };
                if (property.OwnerId != playerId) return new RenovationResult { Success = false, Message = "You do not own this property." };
                if (property.Condition >= 100) return new RenovationResult { Success = false, Message = "This property is already in pristine (100%) condition!" };

                var player = await _context.Users.FirstOrDefaultAsync(u => u.Id == playerId);
                if (player == null) return new RenovationResult { Success = false, Message = "Player not found." };

                decimal renovationCost = Math.Round(property.Price * 0.05m, 0); // 5% of property value
                if (player.LiquidBalance < renovationCost)
                {
                    return new RenovationResult
                    {
                        Success = false,
                        Message = $"Insufficient funds for capital renovation. Required: ${renovationCost:N0}, Available: ${player.LiquidBalance:N0}"
                    };
                }

                player.LiquidBalance -= renovationCost;
                property.Condition = 100;
                property.Price = Math.Round(property.Price * 1.12m, 0); // 12% equity surge
                property.MonthlyRent = Math.Round(property.Price * 0.009m, 0); // Boosted rental yield

                var session = await GetOrCreateActiveSessionAsync();
                _context.AuditLogs.Add(new AuditLog
                {
                    PlayerUserId = player.Id,
                    PropertyId = property.Id,
                    ActionType = AuditActionType.Renovation,
                    Description = $"Completed capital renovation on {property.Title}. Upgraded to 100% condition & surged valuation.",
                    Amount = -renovationCost,
                    PostBalance = player.LiquidBalance,
                    TurnNumber = session.CurrentRound
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("PropertyRenovated", new
                {
                    PropertyId = property.Id,
                    Title = property.Title,
                    NewPrice = property.Price,
                    NewRent = property.MonthlyRent,
                    OwnerName = player.UserName
                });

                return new RenovationResult
                {
                    Success = true,
                    Message = $"Renovation complete! {property.Title} condition restored to 100%. Valuation surged by 12%!",
                    PropertyId = property.Id,
                    NewCondition = 100,
                    NewMonthlyRent = property.MonthlyRent,
                    NewPrice = property.Price,
                    NewBalance = player.LiquidBalance
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error renovating property {PropertyId}", propertyId);
                throw;
            }
        }

        public async Task<HostileAuditResult> LaunchRegulatoryAuditAsync(int propertyId, string initiatingPlayerId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var property = await _context.Properties
                    .Include(p => p.Owner)
                    .FirstOrDefaultAsync(p => p.Id == propertyId);

                if (property == null) return new HostileAuditResult { Success = false, Message = "Property not found." };
                if (string.IsNullOrEmpty(property.OwnerId) || property.OwnerId == initiatingPlayerId)
                {
                    return new HostileAuditResult { Success = false, Message = "You cannot launch a regulatory inspection on your own or unowned asset." };
                }

                var initiator = await _context.Users.FirstOrDefaultAsync(u => u.Id == initiatingPlayerId);
                if (initiator == null) return new HostileAuditResult { Success = false, Message = "Initiating player not found." };

                decimal auditFee = 25_000m; // Cost to initiate regulatory inquiry
                if (initiator.LiquidBalance < auditFee)
                {
                    return new HostileAuditResult { Success = false, Message = $"Need ${auditFee:N0} to file regulatory inquiry." };
                }

                var targetOwner = property.Owner!;
                initiator.LiquidBalance -= auditFee;

                // Penalty on opponent's property
                int conditionDrop = _rand.Next(15, 30);
                property.Condition = Math.Max(20, property.Condition - conditionDrop);
                decimal penaltyFine = Math.Round(property.Price * 0.02m, 0); // 2% compliance fine on opponent
                targetOwner.LiquidBalance = Math.Max(0m, targetOwner.LiquidBalance - penaltyFine);
                property.MonthlyRent = Math.Round(property.Price * 0.007m, 0); // Temporary yield reduction

                var session = await GetOrCreateActiveSessionAsync();

                _context.AuditLogs.Add(new AuditLog
                {
                    PlayerUserId = initiator.Id,
                    PropertyId = property.Id,
                    ActionType = AuditActionType.RegulatoryAudit,
                    Description = $"Initiated municipal inspection on {property.Title} (Owner: {targetOwner.UserName})",
                    Amount = -auditFee,
                    PostBalance = initiator.LiquidBalance,
                    TurnNumber = session.CurrentRound
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    PlayerUserId = targetOwner.Id,
                    PropertyId = property.Id,
                    ActionType = AuditActionType.RegulatoryAudit,
                    Description = $"Assessed code violation penalty on {property.Title} from competitor inquiry",
                    Amount = -penaltyFine,
                    PostBalance = targetOwner.LiquidBalance,
                    TurnNumber = session.CurrentRound
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("RegulatoryAuditTriggered", new
                {
                    InitiatorName = initiator.UserName,
                    TargetName = targetOwner.UserName,
                    PropertyTitle = property.Title,
                    Penalty = penaltyFine,
                    NewCondition = property.Condition
                });

                return new HostileAuditResult
                {
                    Success = true,
                    Message = $"City inspectors cited code violations on {property.Title}! {targetOwner.UserName} fined ${penaltyFine:N0}.",
                    TargetPlayerName = targetOwner.UserName ?? "Competitor",
                    PropertyTitle = property.Title,
                    PenaltyAssessed = penaltyFine,
                    NewCondition = property.Condition
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error launching regulatory audit on property {PropertyId}", propertyId);
                throw;
            }
        }

        public async Task<List<AuditLogDto>> GetAuditLogsAsync(string playerId)
        {
            var logs = await _context.AuditLogs
                .Include(a => a.Property)
                .Where(a => a.PlayerUserId == playerId)
                .OrderByDescending(a => a.Id)
                .Take(25)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    ActionType = a.ActionType.ToString(),
                    Description = a.Description,
                    Amount = a.Amount,
                    PostBalance = a.PostBalance,
                    TurnNumber = a.TurnNumber,
                    Timestamp = a.Timestamp,
                    PropertyTitle = a.Property != null ? a.Property.Title : null
                })
                .ToListAsync();

            return logs;
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

        public async Task<WorkDealResult> WorkDealAsync(string playerId, string tier = "quick")
        {
            var player = await _context.Users
                .Include(u => u.OwnedProperties)
                .Include(u => u.ActiveLoans)
                .FirstOrDefaultAsync(u => u.Id == playerId);

            if (player == null)
            {
                return new WorkDealResult { Success = false, Message = "Player not found." };
            }

            var session = await GetOrCreateActiveSessionAsync();
            if (session.IsCompleted)
            {
                return new WorkDealResult { Success = false, Message = "Simulation session has completed. Reset game to start anew." };
            }

            string[] quickDeals = new[]
            {
                "Wholesale Contract Assignment Fee",
                "Off-Market Architectural Consulting",
                "Luxury Staging Commission"
            };

            string[] syndicateDeals = new[]
            {
                "Commercial Retail Syndicate Brokerage Fee",
                "High-Yield Mezzanine Financing Fee",
                "Municipal Zoning Re-Classification Contract"
            };

            string[] institutionalDeals = new[]
            {
                "Institutional REIT Portfolio M&A Advisory",
                "Downtown Skyline Land Assembly Commission",
                "Multi-Family Capital Restructuring Advisory"
            };

            string dealTitle;
            decimal baseReward;
            
            switch (tier?.ToLowerInvariant())
            {
                case "syndicate":
                    dealTitle = syndicateDeals[_rand.Next(syndicateDeals.Length)];
                    baseReward = _rand.Next(18000, 38000);
                    break;
                case "institutional":
                    dealTitle = institutionalDeals[_rand.Next(institutionalDeals.Length)];
                    baseReward = _rand.Next(55000, 125000);
                    break;
                case "quick":
                default:
                    dealTitle = quickDeals[_rand.Next(quickDeals.Length)];
                    baseReward = _rand.Next(5000, 12000);
                    break;
            }

            decimal bonusFromExperience = Math.Min(35000m, player.TurnsSurvived * 800m);
            decimal totalEarned = baseReward + bonusFromExperience;

            player.LiquidBalance += totalEarned;

            _context.AuditLogs.Add(new AuditLog
            {
                PlayerUserId = player.Id,
                ActionType = AuditActionType.WorkIncome,
                Description = $"{dealTitle} (Earned +${totalEarned:N0})",
                Amount = totalEarned,
                PostBalance = player.LiquidBalance,
                TurnNumber = session.CurrentRound
            });

            await _context.SaveChangesAsync();

            decimal totalPropertyVal = player.OwnedProperties.Sum(p => p.Price);
            decimal totalDebt = player.ActiveLoans.Sum(l => l.RemainingBalance);
            decimal netWorth = player.LiquidBalance + totalPropertyVal - totalDebt;

            // Broadcast real-time leaderboard update
            var leaderboard = await GetLeaderboardAsync();
            await _hubContext.Clients.All.SendAsync("RaceProgressUpdated", leaderboard);

            return new WorkDealResult
            {
                Success = true,
                Message = $"Deal Closed! {dealTitle} paid out +${totalEarned:N0}.",
                EarnedAmount = totalEarned,
                NewBalance = player.LiquidBalance,
                NewNetWorth = netWorth,
                DealTitle = dealTitle
            };
        }

        public async Task<List<Property>> GenerateProceduralPropertiesAsync(int count = 6)
        {
            var generated = new List<Property>();

            for (int i = 0; i < count; i++)
            {
                var district = Districts[_rand.Next(Districts.Length)];
                // Guarantee at least 2 starter micro-studios/apartments under $80,000 so beginners can buy immediately
                string type;
                if (i < 2)
                {
                    type = "Apartment";
                }
                else
                {
                    type = PropertyTypes[_rand.Next(PropertyTypes.Length)];
                }

                var street = StreetNames[_rand.Next(StreetNames.Length)];
                int streetNum = _rand.Next(100, 9999);

                decimal basePrice = type switch
                {
                    "Apartment" => 35_000m,   // Generates $30k - $75k accessible properties!
                    "House" => 120_000m,
                    "Commercial" => 350_000m,
                    "HighRise" => 950_000m,
                    _ => 75_000m
                };

                decimal districtMultiplier = district switch
                {
                    "Financial" => 1.4m,
                    "Downtown" => 1.25m,
                    "Suburbs" => 0.95m,
                    "Industrial" => 0.75m,
                    _ => 1.0m
                };

                decimal variance = (decimal)(0.85 + _rand.NextDouble() * 0.30);
                decimal finalPrice = Math.Round(basePrice * districtMultiplier * variance, 0);
                decimal monthlyRent = Math.Round(finalPrice * 0.0090m, 0);

                var prop = new Property
                {
                    Title = $"{streetNum} {street}",
                    District = district,
                    Type = type,
                    Price = finalPrice,
                    MonthlyRent = monthlyRent,
                    Condition = _rand.Next(70, 98),
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

            if (player.ActiveLoans.Count >= 3)
            {
                return new TakeLoanResult { Success = false, Message = "Maximum credit limit reached (Max 3 concurrent bank loans)." };
            }

            decimal interestRate = 0.0650m;
            decimal monthlyPayment = Math.Round((principal * (1 + interestRate)) / 24, 2);

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

            var session = await GetOrCreateActiveSessionAsync();
            _context.AuditLogs.Add(new AuditLog
            {
                PlayerUserId = player.Id,
                ActionType = AuditActionType.DebtService,
                Description = $"Drew commercial credit facility of ${principal:N0} at {(interestRate * 100):N1}% APR",
                Amount = principal,
                PostBalance = player.LiquidBalance,
                TurnNumber = session.CurrentRound
            });

            await _context.SaveChangesAsync();

            decimal totalDebt = player.ActiveLoans.Sum(l => l.RemainingBalance);

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

            var properties = await _context.Properties.ToListAsync();
            foreach (var p in properties)
            {
                p.OwnerId = null;
                p.IsOccupied = false;
                p.Condition = _rand.Next(70, 95);
            }

            var loans = await _context.Loans.ToListAsync();
            _context.Loans.RemoveRange(loans);

            var logs = await _context.AuditLogs.ToListAsync();
            _context.AuditLogs.RemoveRange(logs);

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
