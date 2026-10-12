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

            // 3. Add to SignalR group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{sanitizedRoomId}");
            _connectionRooms[Context.ConnectionId] = sanitizedRoomId;

            // 4. Register player
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
                    _logger.LogInformation("Host {PlayerName} started match in room {RoomId}! Players: {Count}", player.PlayerName, roomId, playerList.Count);

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

        public async Task ReturnToLobby()
        {
            if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId) &&
                _rooms.TryGetValue(roomId, out var room))
            {
                room.MatchActive = false;
                foreach (var p in room.Players.Values)
                {
                    p.IsReady = false;
                }

                await Clients.Group($"room_{roomId}").SendAsync("ReturnedToLobby");
                await BroadcastRoomState(room);
                await BroadcastRoomsList();
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
                hostConnectionId = playerList.FirstOrDefault(p => p.IsHost)?.ConnectionId
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
                    if (removed.IsHost && room.Players.Count > 0)
                    {
                        var newHost = room.Players.Values.FirstOrDefault();
                        if (newHost != null) newHost.IsHost = true;
                    }

                    await BroadcastRoomState(room);
                    await BroadcastRoomsList();
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
