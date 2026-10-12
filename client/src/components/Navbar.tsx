import { Building2, User, Landmark, RotateCcw, Play, Radio, LogOut, Briefcase, Users, Flag, UserCheck, Globe } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  gameMode?: 'solo' | 'multiplayer';
  isSignalRConnected: boolean;
  onOpenAuth: () => void;
  onOpenLoan: () => void;
  onWorkDeal: () => void;
  isWorking: boolean;
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
  onResetGame: () => void;
  onLogout: () => void;
  onReturnToLobby?: () => void;
  onAbandonMatch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  gameMode = 'solo',
  isSignalRConnected,
  onOpenAuth,
  onOpenLoan,
  onWorkDeal,
  isWorking,
  onAdvanceTurn,
  isAdvancing,
  onResetGame,
  onLogout,
  onReturnToLobby,
  onAbandonMatch
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Building2 size={20} />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-100">
              METRO HUNT
            </span>
            {gameMode === 'solo' ? (
              <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <UserCheck size={10} />
                Solo Career
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <Globe size={10} />
                Multiplayer Race
              </span>
            )}
          </div>
        </div>

        {/* Live Network & Actions */}
        <div className="flex items-center gap-3">
          {/* SignalR indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <Radio
              size={12}
              className={isSignalRConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}
            />
            <span className={isSignalRConnected ? 'text-slate-300' : 'text-slate-500'}>
              {isSignalRConnected ? 'SignalR Live' : 'Reconnecting...'}
            </span>
          </div>

          {/* Lobby / Match Room Navigation */}
          {onReturnToLobby && (
            <button
              onClick={onReturnToLobby}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              title="Return to Multiplayer Lobby / Match Settings"
            >
              <Users size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Lobby Lounge</span>
            </button>
          )}

          {/* Abandon Match Button */}
          {onAbandonMatch && (
            <button
              onClick={() => {
                if (window.confirm("Abandon Match? All your properties will be forfeited back to the market, accumulated debt cleared, and your reserves reset to $100,000.")) {
                  onAbandonMatch();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
              title="Forfeit current session and return to lobby"
            >
              <Flag size={13} className="text-rose-400" />
              <span className="hidden sm:inline">Abandon Match</span>
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

          {/* User profile / Auth trigger */}
          {userName ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <User size={13} className="text-emerald-400" />
                <span className="max-w-[100px] truncate">{userName}</span>
              </button>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Sign In
            </button>
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
