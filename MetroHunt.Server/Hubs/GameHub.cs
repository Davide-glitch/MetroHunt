using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace MetroHunt.Server.Hubs
{
    public class LobbyPlayer
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string PlayerId { get; set; } = string.Empty;
        public string PlayerName { get; set; } = string.Empty;
        public bool IsReady { get; set; }
        public bool IsHost { get; set; }
    }

    public class GameHub : Hub
    {
        private readonly ILogger<GameHub> _logger;
        private static readonly ConcurrentDictionary<string, LobbyPlayer> _players = new();
        private static decimal _targetGoal = 10_000_000m;
        private static bool _matchActive = false;

        public GameHub(ILogger<GameHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinLobby(string playerId, string playerName)
        {
            bool isFirst = _players.IsEmpty || !_players.Values.Any(p => p.IsHost);
            
            var lobbyPlayer = new LobbyPlayer
            {
                ConnectionId = Context.ConnectionId,
                PlayerId = playerId,
                PlayerName = string.IsNullOrWhiteSpace(playerName) ? "Investor" : playerName,
                IsReady = false,
                IsHost = isFirst
            };

            _players[Context.ConnectionId] = lobbyPlayer;
            _logger.LogInformation("Player {PlayerName} ({PlayerId}) joined lobby. IsHost: {IsHost}", playerName, playerId, isFirst);

            await BroadcastLobbyState();
        }

        public async Task SetReady(bool isReady)
        {
            if (_players.TryGetValue(Context.ConnectionId, out var player))
            {
                player.IsReady = isReady;
                _logger.LogInformation("Player {PlayerName} ready state: {IsReady}", player.PlayerName, isReady);
                await BroadcastLobbyState();
            }
        }

        public async Task SetTargetGoal(decimal targetGoal)
        {
            if (_players.TryGetValue(Context.ConnectionId, out var player) && player.IsHost)
            {
                _targetGoal = targetGoal;
                _logger.LogInformation("Host {PlayerName} set target goal to ${TargetGoal:N0}", player.PlayerName, targetGoal);
                await BroadcastLobbyState();
            }
        }

        public async Task StartMatch()
        {
            if (_players.TryGetValue(Context.ConnectionId, out var player) && player.IsHost)
            {
                bool allReady = _players.Values.All(p => p.IsReady);
                if (allReady && _players.Count > 0)
                {
                    _matchActive = true;
                    _logger.LogInformation("Host {PlayerName} started the match! Target: ${TargetGoal:N0}", player.PlayerName, _targetGoal);
                    await Clients.All.SendAsync("MatchStarted", new
                    {
                        targetGoal = _targetGoal,
                        playerCount = _players.Count,
                        players = _players.Values.ToList()
                    });
                }
            }
        }

        public async Task ReturnToLobby()
        {
            _matchActive = false;
            foreach (var p in _players.Values)
            {
                p.IsReady = false;
            }
            await Clients.All.SendAsync("ReturnedToLobby");
            await BroadcastLobbyState();
        }

        public async Task RequestLobbyState()
        {
            await BroadcastLobbyState();
        }

        private async Task BroadcastLobbyState()
        {
            var playerList = _players.Values.ToList();
            bool allReady = playerList.Count > 0 && playerList.All(p => p.IsReady);

            await Clients.All.SendAsync("LobbyStateUpdated", new
            {
                players = playerList,
                targetGoal = _targetGoal,
                matchActive = _matchActive,
                canStart = allReady,
                hostConnectionId = playerList.FirstOrDefault(p => p.IsHost)?.ConnectionId
            });
        }

        public async Task JoinSession(string sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{sessionId}");
            _logger.LogInformation("Connection {ConnectionId} joined session {SessionId}", Context.ConnectionId, sessionId);
        }

        public async Task LeaveSession(string sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session_{sessionId}");
            _logger.LogInformation("Connection {ConnectionId} left session {SessionId}", Context.ConnectionId, sessionId);
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
            if (_players.TryRemove(Context.ConnectionId, out var removed))
            {
                // If the host disconnected, assign the first remaining player as host
                if (removed.IsHost && _players.Count > 0)
                {
                    var newHost = _players.Values.FirstOrDefault();
                    if (newHost != null)
                    {
                        newHost.IsHost = true;
                    }
                }
                await BroadcastLobbyState();
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
