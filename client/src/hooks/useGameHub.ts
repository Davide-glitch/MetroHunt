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
  onGameReset
}: UseGameHubProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
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

    connection.start()
      .then(() => {
        setIsConnected(true);
        console.log('Connected to Metro Hunt GameHub via SignalR.');
      })
      .catch((err) => {
        console.warn('SignalR Connection Notice: ', err.message);
        setIsConnected(false);
      });

    return () => {
      connection.stop();
    };
  }, [hubUrl, token]);

  return { isConnected, leaderboard, connection: connectionRef.current };
};
