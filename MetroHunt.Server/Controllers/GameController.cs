using System.Security.Claims;
using MetroHunt.Server.Data;
using MetroHunt.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MetroHunt.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly ISimulationEngine _engine;
        private readonly MetroHuntDbContext _context;

        public GameController(ISimulationEngine engine, MetroHuntDbContext context)
        {
            _engine = engine;
            _context = context;
        }

        [HttpPost("advance-turn")]
        public async Task<IActionResult> AdvanceTurn()
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            var result = await _engine.AdvanceTurnAsync(playerId);
            return Ok(result);
        }

        [HttpPost("work")]
        public async Task<IActionResult> WorkDeal([FromQuery] string tier = "quick")
        {
            string? playerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(playerId))
            {
                var defaultPlayer = await _context.Users.FirstOrDefaultAsync();
                if (defaultPlayer == null) return Unauthorized("No registered player.");
                playerId = defaultPlayer.Id;
            }

            var result = await _engine.WorkDealAsync(playerId, tier);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("session")]
        public async Task<IActionResult> GetSession()
        {
            var session = await _engine.GetOrCreateActiveSessionAsync();
            return Ok(session);
        }

        [HttpPost("target")]
        public async Task<IActionResult> SetTarget([FromQuery] decimal target)
        {
            if (target <= 100_000m) return BadRequest("Target must be greater than $100,000.");

            var session = await _engine.GetOrCreateActiveSessionAsync();
            session.TargetNetWorth = target;
            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Winning Net Worth target updated to ${target:N0}.", TargetNetWorth = session.TargetNetWorth });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetGame()
        {
            await _engine.ResetGameAsync();
            return Ok(new { Message = "Game reset to initial state successfully." });
        }
    }
}
