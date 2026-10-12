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

    public class LobbyRoom
    {
        public string RoomId { get; set; } = "main";
        public string RoomName { get; set; } = "Main Syndicate Lounge";
        public decimal TargetGoal { get; set; } = 10_000_000m;
        public bool MatchActive { get; set; } = false;
        public ConcurrentDictionary<string, LobbyPlayer> Players { get; set; } = new();
        // Track players who were in the match when it started
        public ConcurrentDictionary<string, LobbyPlayer> MatchPlayers { get; set; } = new();
    }

    public class RoomSummaryDto
    {
        public string RoomId { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public decimal TargetGoal { get; set; }
        public bool MatchActive { get; set; }
        public int PlayerCount { get; set; }
        public List<string> PlayerNames { get; set; } = new();
    }

    public class GameHub : Hub
    {
        private readonly ILogger<GameHub> _logger;

        // Thread-safe multi-room registry
        private static readonly ConcurrentDictionary<string, LobbyRoom> _rooms = new();
        private static readonly ConcurrentDictionary<string, string> _connectionRooms = new();

        static GameHub()
        {
            // Seed default persistent public rooms
            _rooms.TryAdd("main", new LobbyRoom
            {
                RoomId = "main",
                RoomName = "Main Syndicate Lounge",
                TargetGoal = 10_000_000m
            });
            _rooms.TryAdd("high-rollers", new LobbyRoom
            {
                RoomId = "high-rollers",
                RoomName = "High Rollers Suite ($100M)",
                TargetGoal = 100_000_000m
            });
            _rooms.TryAdd("sprint", new LobbyRoom
            {
                RoomId = "sprint",
                RoomName = "Fast 5-Min Sprint ($2M)",
                TargetGoal = 2_000_000m
            });
        }

        public GameHub(ILogger<GameHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinRoom(string roomId, string playerId, string playerName)
        {
            string sanitizedRoomId = string.IsNullOrWhiteSpace(roomId) ? "main" : roomId.Trim().ToLowerInvariant();

            // 1. Remove from previous room if any
            if (_connectionRooms.TryRemove(Context.ConnectionId, out var oldRoomId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room_{oldRoomId}");
                if (_rooms.TryGetValue(oldRoomId, out var oldRoom))
                {
                    oldRoom.Players.TryRemove(Context.ConnectionId, out _);
                    oldRoom.MatchPlayers.TryRemove(Context.ConnectionId, out _);

                    // If this was an active match and only 1 player remains, they win
                    await CheckForAutoVictory(oldRoom);
                    await BroadcastRoomState(oldRoom);
                }
            }

            // 2. Ensure target room exists
            var room = _rooms.GetOrAdd(sanitizedRoomId, id => new LobbyRoom
            {
                RoomId = id,
                RoomName = id == "main" ? "Main Syndicate Lounge" : $"Lobby #{id}",
                TargetGoal = 10_000_000m
            });

            // 3. Don't allow joining a room that has an active match (unless you're already in it)
            if (room.MatchActive && !room.MatchPlayers.ContainsKey(Context.ConnectionId))
            {
                // Send them to the lobby state of this room but don't add them to the match
                // They'll see the room is in a match and can wait or go elsewhere
            }

            // 4. Add to SignalR group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{sanitizedRoomId}");
            _connectionRooms[Context.ConnectionId] = sanitizedRoomId;

            // 5. Register player
            bool isFirst = room.Players.IsEmpty || !room.Players.Values.Any(p => p.IsHost);
            var lobbyPlayer = new LobbyPlayer
            {
                ConnectionId = Context.ConnectionId,
                PlayerId = playerId,
                PlayerName = string.IsNullOrWhiteSpace(playerName) ? "Investor" : playerName,
                IsReady = false,
                IsHost = isFirst
            };

            room.Players[Context.ConnectionId] = lobbyPlayer;
            _logger.LogInformation("Player {PlayerName} joined room {RoomId}. Host: {IsHost}", lobbyPlayer.PlayerName, sanitizedRoomId, isFirst);

            await BroadcastRoomState(room);
            await BroadcastRoomsList();
        }

        public async Task JoinLobby(string playerId, string playerName)
        {
            // Backwards compatibility - defaults to main lounge
            await JoinRoom("main", playerId, playerName);
        }

        public async Task CreateRoom(string roomName, decimal targetGoal, string playerId, string playerName)
        {
            string newRoomId = $"syndicate_{Random.Shared.Next(100, 999)}";
            var newRoom = new LobbyRoom
            {
                RoomId = newRoomId,
                RoomName = string.IsNullOrWhiteSpace(roomName) ? $"Syndicate Lounge {newRoomId}" : roomName.Trim(),
                TargetGoal = targetGoal > 0 ? targetGoal : 10_000_000m
            };

            _rooms[newRoomId] = newRoom;
            _logger.LogInformation("New custom room created: {RoomName} ({RoomId}) by {PlayerName}", newRoom.RoomName, newRoomId, playerName);

            await JoinRoom(newRoomId, playerId, playerName);
        }

        public async Task SetReady(bool isReady)
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room) &&
                room.Players.TryGetValue(Context.ConnectionId, out var player))
            {
                player.IsReady = isReady;
                _logger.LogInformation("Player {PlayerName} in room {RoomId} ready state: {IsReady}", player.PlayerName, roomId, isReady);
                await BroadcastRoomState(room);
            }
        }

        public async Task SetTargetGoal(decimal targetGoal)
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room) &&
                room.Players.TryGetValue(Context.ConnectionId, out var player) &&
                player.IsHost)
            {
                room.TargetGoal = targetGoal;
                _logger.LogInformation("Host {PlayerName} set target goal for room {RoomId} to ${TargetGoal:N0}", player.PlayerName, roomId, targetGoal);
                await BroadcastRoomState(room);
                await BroadcastRoomsList();
            }
        }

        public async Task StartMatch()
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room) &&
                room.Players.TryGetValue(Context.ConnectionId, out var player) &&
                player.IsHost)
            {
                var playerList = room.Players.Values.ToList();
                bool allReady = playerList.Count > 0 && playerList.All(p => p.IsReady);

                if (allReady)
                {
                    room.MatchActive = true;

                    // Snapshot who is in the match (only real players who readied up)
                    room.MatchPlayers.Clear();
                    foreach (var p in playerList)
                    {
                        room.MatchPlayers[p.ConnectionId] = p;
                    }

                    _logger.LogInformation(
                        "Host {PlayerName} started match in room {RoomId}! Players: {Count}",
                        player.PlayerName, roomId, playerList.Count);

                    // Only send MatchStarted to the ACTUAL match players (no ghosts)
                    await Clients.Group($"room_{roomId}").SendAsync("MatchStarted", new
                    {
                        roomId = room.RoomId,
                        targetGoal = room.TargetGoal,
                        playerCount = playerList.Count,
                        players = playerList
                    });

                    await BroadcastRoomsList();
                }
            }
        }

        /// <summary>
        /// Called when a player voluntarily surrenders/abandons the active match.
        /// Removes them from the match but doesn't force others back to lobby.
        /// If only 1 player remains, that player wins automatically.
        /// </summary>
        public async Task SurrenderMatch()
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room))
            {
                if (room.MatchActive)
                {
                    string surrenderName = "Unknown";
                    if (room.MatchPlayers.TryRemove(Context.ConnectionId, out var surrendered))
                    {
                        surrenderName = surrendered.PlayerName;
                    }

                    // Notify remaining match players about the surrender
                    await Clients.Group($"room_{roomId}").SendAsync("PlayerSurrendered", new
                    {
                        playerName = surrenderName,
                        remainingPlayers = room.MatchPlayers.Count
                    });

                    _logger.LogInformation(
                        "Player {PlayerName} surrendered match in room {RoomId}. Remaining: {Count}",
                        surrenderName, roomId, room.MatchPlayers.Count);

                    // Check if only 1 player remains → auto-win
                    await CheckForAutoVictory(room);
                }

                // Reset the surrendering player's ready state
                if (room.Players.TryGetValue(Context.ConnectionId, out var lobbyPlayer))
                {
                    lobbyPlayer.IsReady = false;
                }

                // Only the surrendering player returns to lobby view
                await Clients.Caller.SendAsync("ReturnedToLobby");
                await BroadcastRoomState(room);
                await BroadcastRoomsList();
            }
        }

        /// <summary>
        /// Host-only: ends the entire match and returns ALL players to lobby.
        /// </summary>
        public async Task ReturnToLobby()
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room))
            {
                // Only reset match if caller is host or match is not active
                bool isHost = room.Players.TryGetValue(Context.ConnectionId, out var caller) && caller.IsHost;

                if (isHost || !room.MatchActive)
                {
                    room.MatchActive = false;
                    room.MatchPlayers.Clear();
                    foreach (var p in room.Players.Values)
                    {
                        p.IsReady = false;
                    }

                    await Clients.Group($"room_{roomId}").SendAsync("ReturnedToLobby");
                    await BroadcastRoomState(room);
                    await BroadcastRoomsList();
                }
                else
                {
                    // Non-host players calling ReturnToLobby just surrender
                    await SurrenderMatch();
                }
            }
        }

        /// <summary>
        /// Checks if an active match has only 1 player left. If so, declare them the winner.
        /// </summary>
        private async Task CheckForAutoVictory(LobbyRoom room)
        {
            if (!room.MatchActive) return;

            var remaining = room.MatchPlayers.Values.ToList();

            if (remaining.Count == 1)
            {
                var winner = remaining[0];
                _logger.LogInformation(
                    "Auto-victory! {PlayerName} is the last investor standing in room {RoomId}",
                    winner.PlayerName, room.RoomId);

                await Clients.Group($"room_{room.RoomId}").SendAsync("MatchAutoVictory", new
                {
                    winnerName = winner.PlayerName,
                    winnerId = winner.PlayerId,
                    reason = "Last investor standing — all opponents surrendered!"
                });

                room.MatchActive = false;
                room.MatchPlayers.Clear();
                foreach (var p in room.Players.Values)
                {
                    p.IsReady = false;
                }
            }
            else if (remaining.Count == 0)
            {
                // Everyone left, just reset the room
                room.MatchActive = false;
                room.MatchPlayers.Clear();
            }
        }

        public async Task RequestLobbyState()
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room))
            {
                await Clients.Caller.SendAsync("LobbyStateUpdated", FormatRoomState(room));
            }
            else
            {
                // Default to main room
                if (_rooms.TryGetValue("main", out var mainRoom))
                {
                    await Clients.Caller.SendAsync("LobbyStateUpdated", FormatRoomState(mainRoom));
                }
            }
            await Clients.Caller.SendAsync("RoomsListUpdated", GetRoomsSummary());
        }

        public async Task RequestRoomsList()
        {
            await Clients.Caller.SendAsync("RoomsListUpdated", GetRoomsSummary());
        }

        private async Task BroadcastRoomState(LobbyRoom room)
        {
            var state = FormatRoomState(room);
            await Clients.Group($"room_{room.RoomId}").SendAsync("LobbyStateUpdated", state);
        }

        private static object FormatRoomState(LobbyRoom room)
        {
            var playerList = room.Players.Values.ToList();
            bool allReady = playerList.Count > 0 && playerList.All(p => p.IsReady);

            return new
            {
                roomId = room.RoomId,
                roomName = room.RoomName,
                players = playerList,
                targetGoal = room.TargetGoal,
                matchActive = room.MatchActive,
                canStart = allReady,
                hostConnectionId = playerList.FirstOrDefault(p => p.IsHost)?.ConnectionId,
                matchPlayerCount = room.MatchPlayers.Count
            };
        }

        private async Task BroadcastRoomsList()
        {
            var summaries = GetRoomsSummary();
            await Clients.All.SendAsync("RoomsListUpdated", summaries);
        }

        private static List<RoomSummaryDto> GetRoomsSummary()
        {
            return _rooms.Values.Select(r => new RoomSummaryDto
            {
                RoomId = r.RoomId,
                RoomName = r.RoomName,
                TargetGoal = r.TargetGoal,
                MatchActive = r.MatchActive,
                PlayerCount = r.Players.Count,
                PlayerNames = r.Players.Values.Select(p => p.PlayerName).ToList()
            }).OrderByDescending(r => r.PlayerCount).ToList();
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

            if (_connectionRooms.TryRemove(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room))
            {
                if (room.Players.TryRemove(Context.ConnectionId, out var removed))
                {
                    // Also remove from active match if applicable
                    room.MatchPlayers.TryRemove(Context.ConnectionId, out _);

                    // Notify remaining players about the disconnect
                    if (room.MatchActive)
                    {
                        await Clients.Group($"room_{roomId}").SendAsync("PlayerSurrendered", new
                        {
                            playerName = removed.PlayerName,
                            remainingPlayers = room.MatchPlayers.Count
                        });
                    }

                    // If disconnecting player was host, promote the next player
                    if (removed.IsHost && room.Players.Count > 0)
                    {
                        var newHost = room.Players.Values.FirstOrDefault();
                        if (newHost != null) newHost.IsHost = true;
                    }

                    // Check for auto-victory (last player standing wins)
                    await CheckForAutoVictory(room);

                    await BroadcastRoomState(room);
                    await BroadcastRoomsList();
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
