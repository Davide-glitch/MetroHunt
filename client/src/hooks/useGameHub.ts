import { useEffect, useState, useRef } from 'react';
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
  players: LobbyPlayer[];
  targetGoal: number;
  matchActive: boolean;
  canStart: boolean;
  hostConnectionId?: string;
}

interface UseGameHubProps {
  hubUrl?: string;
  token?: string | null;
  onVictory?: (victory: VictoryData) => void;
  onPropertyPurchased?: (data: any) => void;
  onTurnAdvanced?: (data: any) => void;
  onMarketEvent?: (data: any) => void;
  onPropertyRenovated?: (data: any) => void;
  onRegulatoryAuditTriggered?: (data: any) => void;
  onGameReset?: () => void;
  onLobbyStateUpdated?: (lobby: LobbyState) => void;
  onMatchStarted?: (data: { targetGoal: number; playerCount: number; players: LobbyPlayer[] }) => void;
  onReturnedToLobby?: () => void;
}

export const useGameHub = ({
  hubUrl = '/hubs/game',
  token,
  onVictory,
  onPropertyPurchased,
  onTurnAdvanced,
  onMarketEvent,
  onPropertyRenovated,
  onRegulatoryAuditTriggered,
  onGameReset,
  onLobbyStateUpdated,
  onMatchStarted,
  onReturnedToLobby
}: UseGameHubProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
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
      if (onLobbyStateUpdated) onLobbyStateUpdated(data);
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
        // Request latest lobby state
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

  // Invocation Helpers
  const joinLobby = (playerId: string, playerName: string) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('JoinLobby', playerId, playerName).catch(console.error);
    }
  };

  const setReady = (isReady: boolean) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('SetReady', isReady).catch(console.error);
    }
  };

  const setTargetGoal = (targetGoal: number) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('SetTargetGoal', targetGoal).catch(console.error);
    }
  };

  const startMatch = () => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('StartMatch').catch(console.error);
    }
  };

  const returnToLobby = () => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.invoke('ReturnToLobby').catch(console.error);
    }
  };

  return {
    isConnected,
    leaderboard,
    lobbyState,
    joinLobby,
    setReady,
    setTargetGoal,
    startMatch,
    returnToLobby,
    connection: connectionRef.current
  };
};
