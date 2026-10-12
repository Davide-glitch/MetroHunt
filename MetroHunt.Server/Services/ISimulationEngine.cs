using MetroHunt.Server.DTOs;
using MetroHunt.Server.Models;

namespace MetroHunt.Server.Services
{
    public interface ISimulationEngine
    {
        Task<PropertyBuyResult> BuyPropertyAsync(int propertyId, string playerId, byte[]? clientRowVersion = null);
        Task<AdvanceTurnResult> AdvanceTurnAsync(string playerId);
        Task<List<Property>> GenerateProceduralPropertiesAsync(int count = 6);
        Task<bool> EvaluateWinConditionAsync(string playerId);
        Task<List<LeaderboardEntryDto>> GetLeaderboardAsync();
        Task<TakeLoanResult> TakeLoanAsync(string playerId, decimal principal);
        Task<RenovationResult> RenovatePropertyAsync(int propertyId, string playerId);
        Task<WorkDealResult> WorkDealAsync(string playerId, string tier = "quick");
        Task<HostileAuditResult> LaunchRegulatoryAuditAsync(int propertyId, string initiatingPlayerId);
        Task<List<AuditLogDto>> GetAuditLogsAsync(string playerId);
        Task<GameSession> GetOrCreateActiveSessionAsync();
        Task ResetGameAsync();
        Task AbandonMatchAsync(string playerId);
    }
}
