import React from 'react';
import { Trophy } from 'lucide-react';
import type { PlayerScore } from '../hooks/useGameHub';

interface RaceTrackerProps {
  targetNetWorth: number;
  players: PlayerScore[];
  currentPlayerId?: string;
  gameMode?: 'solo' | 'multiplayer';
  currentNetWorth?: number;
  currentPropertiesCount?: number;
  onSetTarget?: (target: number) => void;
}

export const RaceTracker: React.FC<RaceTrackerProps> = ({
  targetNetWorth,
  players,
  currentPlayerId,
  gameMode = 'solo',
  currentNetWorth,
  currentPropertiesCount = 0,
  onSetTarget
}) => {
  const displayPlayers = gameMode === 'solo'
    ? players.filter(p => p.playerId === currentPlayerId)
    : players;

  // Fallback row for solo if signalr hasn't sent player score yet
  const rows = displayPlayers.length > 0
    ? displayPlayers
    : currentPlayerId
      ? [{
          playerId: currentPlayerId,
          playerName: 'You',
          netWorth: currentNetWorth ?? 100_000,
          propertiesOwned: currentPropertiesCount ?? 0,
          isEliminated: false
        }]
      : [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                {gameMode === 'solo' ? 'Solo Tycoon Milestone' : 'Multiplayer First-to-Target Race'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 rounded font-bold">
                Goal: ${(targetNetWorth / 1_000_000).toFixed(0)}M
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {gameMode === 'solo'
                ? `Build equity and reach $${(targetNetWorth / 1_000_000).toFixed(0)}M net worth to secure financial victory`
                : `First syndicate investor to cross $${(targetNetWorth / 1_000_000).toFixed(0)}M net worth secures victory`}
            </p>
          </div>
        </div>

        {/* Quick Target Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Target Mode:</span>
          <button
            onClick={() => onSetTarget && onSetTarget(2_000_000)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
              targetNetWorth === 2_000_000
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            $2M (Sprint)
          </button>
          <button
            onClick={() => onSetTarget && onSetTarget(10_000_000)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
              targetNetWorth === 10_000_000
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            $10M (Fast)
          </button>
          <button
            onClick={() => onSetTarget && onSetTarget(100_000_000)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
              targetNetWorth === 100_000_000
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            $100M (Standard)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-2">
            Connecting real-time investors to market state...
          </div>
        ) : (
          rows.map((player) => {
            const isYou = player.playerId === currentPlayerId;
            const progress = Math.min(100, Math.max(0, (player.netWorth / targetNetWorth) * 100));

            return (
              <div key={player.playerId} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isYou ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                      {player.playerName} {isYou && '(You)'}
                    </span>
                    <span className="text-slate-500">
                      • {player.propertiesOwned} Properties
                    </span>
                  </div>
                  <span className="text-slate-300">
                    ${(player.netWorth / 1_000_000).toFixed(2)}M / ${(targetNetWorth / 1_000_000).toFixed(0)}M{' '}
                    <span className={isYou ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                      ({progress.toFixed(1)}%)
                    </span>
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isYou
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    }`}
                    style={{ width: `${Math.max(2, progress)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
