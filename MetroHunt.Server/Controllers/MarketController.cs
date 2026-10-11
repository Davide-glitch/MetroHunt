using System.Security.Claims;
using MetroHunt.Server.Data;
using MetroHunt.Server.DTOs;
using MetroHunt.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MetroHunt.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketController : ControllerBase
    {
        private readonly ISimulationEngine _engine;
        private readonly MetroHuntDbContext _context;
        private readonly ILogger<MarketController> _logger;

        public MarketController(
            ISimulationEngine engine,
            MetroHuntDbContext context,
            ILogger<MarketController> logger)
        {
            _engine = engine;
            _context = context;
            _logger = logger;
        }

        [HttpGet("properties")]
        public async Task<IActionResult> GetProperties()
        {
            var properties = await _context.Properties
                .Include(p => p.Owner)
                .OrderBy(p => p.OwnerId != null)
                .ThenBy(p => p.Price)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.District,
                    p.Type,
                    p.Price,
                    p.MonthlyRent,
                    p.Condition,
                    p.IsOccupied,
                    p.OwnerId,
                    OwnerName = p.Owner != null ? p.Owner.UserName : null,
                    RowVersion = Convert.ToBase64String(p.RowVersion)
                })
                .ToListAsync();

            return Ok(properties);
        }

        [HttpPost("buy/{propertyId}")]
        public async Task<IActionResult> BuyProperty(int propertyId, [FromBody] BuyPropertyRequestDto? request)
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            byte[]? rowVersion = null;
            if (!string.IsNullOrEmpty(request?.RowVersionBase64))
            {
                try
                {
                    rowVersion = Convert.FromBase64String(request.RowVersionBase64);
                }
                catch
                {
                    // Ignore decoding error
                }
            }

            var result = await _engine.BuyPropertyAsync(propertyId, playerId, rowVersion);
            if (!result.Success)
            {
                return Conflict(result);
            }

            return Ok(result);
        }

        [HttpPost("renovate/{propertyId}")]
        public async Task<IActionResult> RenovateProperty(int propertyId)
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            var result = await _engine.RenovatePropertyAsync(propertyId, playerId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("audit/{propertyId}")]
        public async Task<IActionResult> LaunchRegulatoryAudit(int propertyId)
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            var result = await _engine.LaunchRegulatoryAuditAsync(propertyId, playerId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs()
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            var logs = await _engine.GetAuditLogsAsync(playerId);
            return Ok(logs);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateProperties([FromQuery] int count = 6)
        {
            var properties = await _engine.GenerateProceduralPropertiesAsync(count);
            return Ok(properties.Select(p => new
            {
                p.Id,
                p.Title,
                p.District,
                p.Type,
                p.Price,
                p.MonthlyRent,
                p.Condition,
                RowVersion = Convert.ToBase64String(p.RowVersion)
            }));
        }

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var leaderboard = await _engine.GetLeaderboardAsync();
            return Ok(leaderboard);
        }

        [HttpPost("loan")]
        public async Task<IActionResult> TakeLoan([FromBody] LoanRequestDto request)
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            var result = await _engine.TakeLoanAsync(playerId, request.Principal);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetActiveEvents()
        {
            var events = await _context.MarketEvents
                .Where(e => e.IsActive)
                .OrderByDescending(e => e.Id)
                .ToListAsync();

            return Ok(events);
        }
    }
}
