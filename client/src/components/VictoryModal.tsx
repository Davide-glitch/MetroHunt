import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

export interface VictoryData {
  winnerId: string;
  winnerName: string;
  finalNetWorth: number;
  totalTurns: number;
  target: number;
}

interface VictoryModalProps {
  victory: VictoryData | null;
  currentUserId?: string;
  onResetGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  victory,
  currentUserId,
  onResetGame
}) => {
  if (!victory) return null;

  const isWinner = victory.winnerId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl overflow-hidden text-center">
        {/* Glow Accent */}
        <div
          className={`absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30 ${
            isWinner ? 'bg-amber-500' : 'bg-cyan-500'
          }`}
        />

        <div className="relative flex flex-col items-center">
          {/* Trophy badge */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${
              isWinner
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 ring-4 ring-amber-400/30'
                : 'bg-slate-800 text-slate-300 ring-2 ring-slate-700'
            }`}
          >
            <Trophy size={42} className="animate-bounce" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
            Game Over • Victory Announced
          </span>

          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight mb-2">
            {isWinner ? 'Investment goal reached' : `${victory.winnerName} reached the goal`}
          </h2>

          <p className="text-sm text-slate-400 mb-6 max-w-md">
            {isWinner
              ? `Your simulated net worth reached $${(victory.target / 1_000_000).toFixed(0)}M. Review the decisions that helped you get there and the risks you took along the way.`
              : `${victory.winnerName} reached the selected net-worth goal.`}
          </p>

          {/* Stats Breakdown Card */}
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-5 mb-8 space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center text-slate-400">
              <span>Winning Investor:</span>
              <span className="text-slate-100 font-bold">{victory.winnerName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Final Net Worth:</span>
              <span className="text-emerald-400 font-bold">
                ${victory.finalNetWorth.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Turns Taken:</span>
              <span className="text-slate-200">Round {victory.totalTurns}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onResetGame}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <RotateCcw size={18} />
            Reset & Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
