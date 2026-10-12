import { useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

export interface VictoryData {
  winnerId: string;
  winnerName: string;
  finalNetWorth: number;
  target: number;
  totalTurns: number;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  liquidBalance: number;
  portfolioValue: number;
  totalDebt: number;
  netWorth: number;
  propertiesOwned: number;
  targetProgress: number;
}

export interface LobbyPlayer {
  connectionId: string;
  playerId: string;
  playerName: string;
  isReady: boolean;
  isHost: boolean;
}

export interface LobbyState {
  roomId?: string;
  roomName?: string;
  players: LobbyPlayer[];
  targetGoal: number;
  matchActive: boolean;
  canStart: boolean;
  hostConnectionId?: string;
}

export interface RoomSummary {
  roomId: string;
  roomName: string;
  targetGoal: number;
  matchActive: boolean;
  playerCount: number;
  playerNames: string[];
}

interface UseGameHubProps {
  hubUrl?: string;
  token?: string | null;
  currentUser?: { id: string; userName: string } | null;
  initialRoomId?: string;
  onVictory?: (victory: VictoryData) => void;
  onPropertyPurchased?: (data: any) => void;
  onTurnAdvanced?: (data: any) => void;
  onMarketEvent?: (data: any) => void;
  onPropertyRenovated?: (data: any) => void;
  onRegulatoryAuditTriggered?: (data: any) => void;
  onGameReset?: () => void;
  onLobbyStateUpdated?: (lobby: LobbyState) => void;
  onRoomsListUpdated?: (rooms: RoomSummary[]) => void;
  onMatchStarted?: (data: { roomId?: string; targetGoal: number; playerCount: number; players: LobbyPlayer[] }) => void;
  onReturnedToLobby?: () => void;
}

export const useGameHub = ({
  hubUrl = '/hubs/game',
  token,
  currentUser,
  initialRoomId = 'main',
  onVictory,
  onPropertyPurchased,
  onTurnAdvanced,
  onMarketEvent,
  onPropertyRenovated,
  onRegulatoryAuditTriggered,
  onGameReset,
  onLobbyStateUpdated,
  onRoomsListUpdated,
  onMatchStarted,
  onReturnedToLobby
}: UseGameHubProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>(initialRoomId);
  const [roomsList, setRoomsList] = useState<RoomSummary[]>([]);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    roomId: 'main',
    roomName: 'Main Syndicate Lounge',
    players: [],
    targetGoal: 10_000_000,
    matchActive: false,
    canStart: false
  });
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('VictoryAchieved', (data: VictoryData) => {
      console.log('🏆 VICTORY BROADCAST RECEIVED:', data);
      if (onVictory) onVictory(data);
    });

    connection.on('RaceProgressUpdated', (data: PlayerScore[]) => {
      setLeaderboard(data);
    });

    connection.on('PropertyPurchased', (data) => {
      if (onPropertyPurchased) onPropertyPurchased(data);
    });

    connection.on('TurnAdvanced', (data) => {
      if (onTurnAdvanced) onTurnAdvanced(data);
    });

    connection.on('MarketEventTriggered', (data) => {
      if (onMarketEvent) onMarketEvent(data);
    });

    connection.on('PropertyRenovated', (data) => {
      if (onPropertyRenovated) onPropertyRenovated(data);
    });

    connection.on('RegulatoryAuditTriggered', (data) => {
      if (onRegulatoryAuditTriggered) onRegulatoryAuditTriggered(data);
    });

    connection.on('GameReset', () => {
      if (onGameReset) onGameReset();
    });

    // Lobby & Match Synchronization
    connection.on('LobbyStateUpdated', (data: LobbyState) => {
      setLobbyState(data);
      if (data.roomId) setCurrentRoomId(data.roomId);
      if (onLobbyStateUpdated) onLobbyStateUpdated(data);
    });

    connection.on('RoomsListUpdated', (data: RoomSummary[]) => {
      setRoomsList(data);
      if (onRoomsListUpdated) onRoomsListUpdated(data);
    });

    connection.on('MatchStarted', (data) => {
      if (onMatchStarted) onMatchStarted(data);
    });

    connection.on('ReturnedToLobby', () => {
      if (onReturnedToLobby) onReturnedToLobby();
    });

    connection.start()
      .then(() => {
        setIsConnected(true);
        console.log('Connected to Metro Hunt GameHub via SignalR.');
        // Request rooms overview
        connection.invoke('RequestRoomsList').catch(() => {});
        connection.invoke('RequestLobbyState').catch(() => {});
      })
      .catch((err) => {
        console.warn('SignalR Connection Notice: ', err.message);
        setIsConnected(false);
      });

    return () => {
      connection.stop();
    };
  }, [hubUrl, token]);

  // Reactive auto-join whenever SignalR is connected AND user state is known
  useEffect(() => {
    if (isConnected && currentUser && currentUser.id && connectionRef.current) {
      connectionRef.current.invoke('JoinRoom', currentRoomId, currentUser.id, currentUser.userName)
        .catch((err) => console.warn('Could not auto-join room: ', err));
    }
  }, [isConnected, currentUser?.id, currentUser?.userName, currentRoomId]);

  // Invocation Helpers
  const joinRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
    if (connectionRef.current && isConnected && currentUser) {
      connectionRef.current.invoke('JoinRoom', roomId, currentUser.id, currentUser.userName).catch(console.error);
    }
  }, [isConnected, currentUser]);

  const joinLobby = useCallback((_playerId?: string, _playerName?: string) => {
    joinRoom('main');
  }, [joinRoom]);

  const createRoom = useCallback((roomName: string, targetGoal: number) => {
    if (connectionRef.current && isConnected && currentUser) {
      connectionRef.current.invoke('CreateRoom', roomName, targetGoal, currentUser.id, currentUser.userName).catch(console.error);
    }
  }, [isConnected, currentUser]);

  const setReady = useCallback((isReady: boolean) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('SetReady', isReady).catch(console.error);
    }
  }, [isConnected]);

  const setTargetGoal = useCallback((targetGoal: number) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('SetTargetGoal', targetGoal).catch(console.error);
    }
  }, [isConnected]);

  const startMatch = useCallback(() => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('StartMatch').catch(console.error);
    }
  }, [isConnected]);

  const returnToLobby = useCallback(() => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('ReturnToLobby').catch(console.error);
    }
  }, [isConnected]);

  return {
    isConnected,
    leaderboard,
    lobbyState,
    roomsList,
    currentRoomId,
    joinRoom,
    joinLobby,
    createRoom,
    setReady,
    setTargetGoal,
    startMatch,
    returnToLobby,
    connection: connectionRef.current
  };
};
