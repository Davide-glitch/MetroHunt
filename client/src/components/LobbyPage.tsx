import React, { useState } from 'react';
import { 
  Building2, 
  Play, 
  Users, 
  Sparkles, 
  Landmark, 
  Wrench, 
  User, 
  CheckCircle2,
  Lock,
  LogIn
} from 'lucide-react';

interface LobbyPageProps {
  initialPlayerName: string;
  initialTarget: number;
  onStartCareer: (playerName: string, password: string, targetNetWorth: number) => Promise<boolean> | void;
  onResumeSavedCareer: (playerName: string, password: string) => Promise<boolean> | void;
  onBackToGame?: () => void;
  hasActiveCareer?: boolean;
  onNotify: (message: string) => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  initialPlayerName,
  initialTarget,
  onStartCareer,
  onResumeSavedCareer,
  onBackToGame,
  hasActiveCareer = false,
  onNotify
}) => {
  const [playerName, setPlayerName] = useState<string>(initialPlayerName || '');
  const [password, setPassword] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<number>(initialTarget || 10_000_000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const targetOptions = [
    {
      value: 2_000_000,
      label: '$2M Sprint',
      desc: 'Quick Demonstration Run',
      badge: 'Fast Demo',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300'
    },
    {
      value: 10_000_000,
      label: '$10M Standard',
      desc: 'Build a balanced rental portfolio',
      badge: 'Recommended',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300'
    },
    {
      value: 100_000_000,
      label: '$100M Marathon',
      desc: 'Plan for long-term portfolio growth',
      badge: 'Challenging',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300'
    },
    {
      value: 1_000_000_000,
      label: '$1 Billion Empire',
      desc: 'A long-term portfolio challenge',
      badge: 'Elite',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300'
    }
  ];

  const validateInputs = () => {
    const trimmed = playerName.trim();
    if (!trimmed) {
      onNotify('Please enter your investor name (your profile ID).');
      return null;
    }
    if (trimmed.length < 2) {
      onNotify('Investor name must be at least 2 characters.');
      return null;
    }
    if (!password || password.length < 4) {
      onNotify('Please enter a password of at least 4 characters to protect your career.');
      return null;
    }
    return trimmed;
  };

  const handleStart = async () => {
    const validName = validateInputs();
    if (!validName) return;
    setIsSubmitting(true);
    try {
      await onStartCareer(validName, password, selectedTarget);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResume = async () => {
    const validName = validateInputs();
    if (!validName) return;
    setIsSubmitting(true);
    try {
      await onResumeSavedCareer(validName, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Exact Brand Lounge Mark */}
          <div className="flex items-center gap-3">
            <img 
              src="/metrohunt-mark.svg"
              alt="Metro Hunt Logo" 
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-500/25 border border-cyan-500/30 shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  METRO HUNT
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Tycoon Career Lobby
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Real Estate Tycoon • Career Simulation
              </p>
            </div>
          </div>

          {/* Market Status Pill */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider text-[11px] uppercase">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
        
        {/* Hero Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400 text-xs font-mono mb-4">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Personal Career Simulation</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Build a property portfolio <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">one decision at a time</span>
            </h1>
            
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Practice the decisions behind rental investing: compare purchase price with rent, account for upkeep and debt, and keep reserves for unexpected costs. Each investor has their own independent career and portfolio.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Investor Name Input */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Investor Name (Your Profile ID)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter unique investor name (e.g. Alex)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                Identifies your personal career and saves your properties.
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Career Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min. 4 characters)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                Protects your career so other investors cannot overwrite your holdings.
              </p>
            </div>
          </div>

          {/* Starting Balance Overview */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Starting Cash For New Careers
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-mono font-bold text-emerald-400">$100,000</span>
                <span className="text-xs font-mono text-slate-500">Available to invest</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              New careers start with $100,000 liquid reserves. Existing investors resume with their exact saved balance, properties, and loans.
            </p>
          </div>

          {/* Victory Milestone Target Options */}
          <div className="mt-8 relative z-10">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3 font-semibold">
              Choose a net-worth goal (For New Careers)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {targetOptions.map((opt) => {
                const isSelected = selectedTarget === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedTarget(opt.value)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30`
                        : `bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200`
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`text-sm font-bold font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {opt.label}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Career actions */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
            {/* Return to Active Floor if previously loaded */}
            {hasActiveCareer && onBackToGame && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onBackToGame}
                className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play size={16} className="text-slate-300" />
                <span>Return to Floor</span>
              </button>
            )}

            {/* Resume Saved Career */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleResume}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5"
              title="Sign in with your name and password to resume your saved portfolio"
            >
              <LogIn size={16} className="text-cyan-400" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In & Resume Career'}</span>
            </button>

            {/* Start New Career */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleStart}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2.5"
              title="Start a new career with $100,000 cash under this name and password"
            >
              <Play size={16} className="fill-slate-950" />
              <span>{isSubmitting ? 'Starting...' : 'Start New Career'}</span>
            </button>

            {/* Future feature */}
            <button
              type="button"
              onClick={() => onNotify("Multiplayer mode is planned for a future update.")}
              className="py-4 px-5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800/80 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold shrink-0"
              title="Planned for a future update"
            >
              <Users size={15} className="text-slate-500" />
              <span>Multiplayer</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                Soon
              </span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
              <Building2 size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Unique Investor Careers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each investor profile has its own balance, properties, and credit facilities. Sign in anytime with your password to resume your journey.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-1">
              <Wrench size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Budget for Upkeep</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Repairs and improvements cost cash. Consider whether the expected rent or condition benefit justifies the expense.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-1">
              <Landmark size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Understand Borrowing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Borrowing can increase buying power, but payments and remaining debt reduce the value of your portfolio.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
