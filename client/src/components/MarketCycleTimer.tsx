import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, Clock3 } from 'lucide-react';

interface MarketCycleTimerProps {
  currentTurn: number;
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
  centralBankRate: number;
}

const CYCLE_SECONDS = 45;

export const MarketCycleTimer: React.FC<MarketCycleTimerProps> = ({
  currentTurn,
  onAdvanceTurn,
  isAdvancing,
  centralBankRate
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(CYCLE_SECONDS);
  const advanceRef = useRef(onAdvanceTurn);
  const advancingRef = useRef(isAdvancing);

  useEffect(() => { advanceRef.current = onAdvanceTurn; }, [onAdvanceTurn]);
  useEffect(() => { advancingRef.current = isAdvancing; }, [isAdvancing]);

  useEffect(() => {
    setSecondsRemaining(CYCLE_SECONDS);
  }, [currentTurn]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining(seconds => {
        if (seconds <= 1) {
          if (!advancingRef.current) {
            advancingRef.current = true;
            advanceRef.current();
          }
          return CYCLE_SECONDS;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const progress = ((CYCLE_SECONDS - secondsRemaining) / CYCLE_SECONDS) * 100;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur-md">
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-[minmax(190px,.8fr)_minmax(220px,1.4fr)_auto] sm:items-center sm:px-6">
        {/* City Economy Indicator */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">City Economy</p>
            <h2 className="mt-0.5 text-sm font-bold text-slate-100">
              Market Cycle <span className="font-mono text-emerald-400 font-extrabold">{String(currentTurn + 1).padStart(2, '0')}</span>
            </h2>
          </div>
        </div>

        {/* Progress Bar & Countdown */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock3 size={13} className="text-cyan-400" /> Next Market Update
            </span>
            <span className="font-bold tabular-nums text-slate-200">
              {isAdvancing ? 'Updating…' : `${secondsRemaining}s`}
            </span>
          </div>
          <div 
            className="h-2.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800 p-0.5" 
            role="progressbar" 
            aria-label="Time until the next market cycle" 
            aria-valuemin={0} 
            aria-valuemax={100} 
            aria-valuenow={Math.round(progress)}
          >
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-[width] duration-1000 ease-linear" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Cycle In Progress</span>
            <span>Auto-Advances Market</span>
          </div>
        </div>

        {/* Base Rate & Advance Trigger */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Central Bank Rate</p>
            <p className="mt-0.5 text-sm font-bold font-mono tabular-nums text-slate-100">
              {(centralBankRate * 100).toFixed(1)}% <span className="text-xs font-normal text-amber-400">APR</span>
            </p>
          </div>
          <button 
            type="button" 
            onClick={onAdvanceTurn} 
            disabled={isAdvancing} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:cursor-wait disabled:opacity-50 cursor-pointer"
          >
            {isAdvancing ? 'Advancing…' : 'Advance Now'} 
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
