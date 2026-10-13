import React from 'react';
import { User, Landmark, RotateCcw, Play, Briefcase, UserCheck, LogOut, Flag } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  onOpenLobby?: () => void;
  onAbandon?: () => void;
  onOpenLoan: () => void;
  onWorkDeal: () => void;
  isWorking: boolean;
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
  onResetGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  onOpenLobby,
  onAbandon,
  onOpenLoan,
  onWorkDeal,
  isWorking,
  onAdvanceTurn,
  isAdvancing,
  onResetGame
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with identical lounge icon & styling */}
        <div className="flex items-center gap-3">
          <img 
            src="/metrohunt-mark.svg"
            alt="Metro Hunt Logo" 
            className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-500/25 border border-cyan-500/30 shrink-0" 
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              METRO HUNT
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              <UserCheck size={10} />
              Tycoon Career
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Leave to Lobby Button */}
          {onOpenLobby && (
            <button
              onClick={onOpenLobby}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm"
              title="Return to Career Lobby without forfeiting your properties"
            >
              <LogOut size={13} className="text-slate-400" />
              <span>Leave</span>
            </button>
          )}

          {/* Abandon Career Button */}
          {onAbandon && (
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to abandon this career session?\n\nAll your owned properties will be forfeited back to the marketplace, any outstanding bank debt will be cleared, and your cash will reset to $100,000."
                );
                if (confirmed) {
                  onAbandon();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-500/40 transition-all cursor-pointer shadow-sm"
              title="Abandon career session, forfeit holdings, and reset to $100,000"
            >
              <Flag size={13} className="text-rose-400" />
              <span>Abandon</span>
            </button>
          )}

          {/* Bank Loan Button */}
          <button
            onClick={onOpenLoan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <Landmark size={14} className="text-blue-400" />
            <span className="hidden sm:inline">Credit Facility</span>
          </button>

          {/* Work / Close Brokerage Deal Button */}
          <button
            disabled={isWorking}
            onClick={onWorkDeal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            title="Work as a real estate broker to earn immediate cash"
          >
            <Briefcase size={14} className={isWorking ? 'animate-bounce' : ''} />
            <span>{isWorking ? 'Closing Deal...' : 'Work Deal'}</span>
          </button>

          {/* Advance Turn Button */}
          <button
            disabled={isAdvancing}
            onClick={onAdvanceTurn}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Play size={14} className={isAdvancing ? 'animate-spin' : ''} />
            <span>{isAdvancing ? 'Processing...' : 'Advance Turn'}</span>
          </button>

          {/* User Profile */}
          {userName && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800"
              >
                <User size={13} className="text-emerald-400" />
                <span className="max-w-[100px] truncate">{userName}</span>
              </div>
            </div>
          )}

          {/* Reset simulation */}
          <button
            title="Reset Game State"
            onClick={onResetGame}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
