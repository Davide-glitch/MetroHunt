import React, { useState, useEffect } from 'react';
import { Clock, Play, TrendingUp, Zap } from 'lucide-react';

interface MarketCycleTimerProps {
  currentTurn: number;
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
  centralBankRate: number;
}

export const MarketCycleTimer: React.FC<MarketCycleTimerProps> = ({
  currentTurn,
  onAdvanceTurn,
  isAdvancing,
  centralBankRate
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const totalCycleSeconds = 45;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return totalCycleSeconds; // Loop cycle bar
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progressPct = ((totalCycleSeconds - secondsRemaining) / totalCycleSeconds) * 100;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left Info */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Clock size={20} className="animate-spin text-cyan-400 duration-1000" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">
              Macro Cycle #{currentTurn}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <Zap size={10} /> Active Economic Ticker
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
            <span>Next Market Tick in <strong className="text-cyan-300">{secondsRemaining}s</strong></span>
            <span>•</span>
            <span className="text-amber-400">APR: {(centralBankRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Middle Animated Progress Bar */}
      <div className="w-full sm:max-w-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp size={11} className="text-emerald-400" /> Market Yield Cycle
          </span>
          <span className="text-cyan-400 font-bold">{progressPct.toFixed(0)}%</span>
        </div>
        
        {/* Animated striped bar */}
        <div className="relative h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-1000 ease-linear rounded-full relative"
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right Action */}
      <div className="w-full sm:w-auto flex justify-end">
        <button
          onClick={onAdvanceTurn}
          disabled={isAdvancing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Play size={14} className={isAdvancing ? 'animate-spin' : ''} />
          <span>{isAdvancing ? 'Advancing Cycle...' : 'Advance Cycle Now'}</span>
        </button>
      </div>
    </div>
  );
};
