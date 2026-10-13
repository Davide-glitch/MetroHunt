import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Landmark, 
  Wrench, 
  CheckCircle2, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import { InvestorAuthModal } from './InvestorAuthModal';

interface LobbyPageProps {
  initialPlayerName: string;
  initialTarget: number;
  onStartCareer: (playerName: string, password: string, targetNetWorth: number) => Promise<boolean> | void;
  onResumeSavedCareer: (playerName: string, password: string) => Promise<boolean> | void;
  onAuthSuccess?: (data: {
    token: string;
    userId: string;
    userName: string;
    email: string;
    liquidBalance: number;
    message: string;
  }, target: number) => void;
  onNotify: (message: string) => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  initialPlayerName,
  initialTarget,
  onStartCareer,
  onResumeSavedCareer,
  onAuthSuccess,
  onNotify
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number>(initialTarget || 10_000_000);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');

  const targetOptions = [
    {
      value: 2_000_000,
      label: '$2M Sprint',
      desc: 'Quick run'
    },
    {
      value: 10_000_000,
      label: '$10M Standard',
      desc: 'Balanced portfolio'
    },
    {
      value: 100_000_000,
      label: '$100M Marathon',
      desc: 'Growth run'
    },
    {
      value: 1_000_000_000,
      label: '$1B Empire',
      desc: 'High stakes'
    }
  ];

  const handleOpenAuth = (mode: 'signin' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (data: {
    token: string;
    userId: string;
    userName: string;
    email: string;
    liquidBalance: number;
    message: string;
  }) => {
    if (onAuthSuccess) {
      onAuthSuccess(data, selectedTarget);
    } else if (authModalMode === 'register') {
      onStartCareer(data.userName, '', selectedTarget);
    } else {
      onResumeSavedCareer(data.userName, '');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header - Ultra Clean */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Mark Only */}
          <div className="flex items-center gap-3">
            <img 
              src="/metrohunt-mark.svg"
              alt="Metro Hunt Logo" 
              className="h-9 w-9 rounded-xl object-cover shadow-md shadow-cyan-500/20 border border-cyan-500/30 shrink-0" 
            />
            <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              METRO HUNT
            </span>
          </div>

          {/* Clean Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        
        {/* Main Clean Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="relative z-10 max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Build your property empire <span className="inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">step by step</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Acquire prime real estate, manage leverage, and compete to reach your portfolio target.
            </p>
          </div>

          {/* Starting Capital Metric */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between relative z-10 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Starting Liquid Capital
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
                  $100,000
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Allocated automatically for new careers
            </span>
          </div>

          {/* Target Net-Worth Selector */}
          <div className="relative z-10 mb-8">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3 font-semibold">
              Net-Worth Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {targetOptions.map((opt) => {
                const isSelected = selectedTarget === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedTarget(opt.value)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30`
                        : `bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200`
                    }`}
                  >
                    <div className="flex justify-between items-center gap-1 mb-1">
                      <span className={`text-sm font-bold font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            {/* Sign In */}
            <button
              type="button"
              onClick={() => handleOpenAuth('signin')}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn size={15} className="text-cyan-400" />
              <span>Sign In & Resume</span>
            </button>

            {/* Start New Career */}
            <button
              type="button"
              onClick={() => handleOpenAuth('register')}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus size={15} />
              <span>Start New Career</span>
            </button>

            {/* Multiplayer Tag */}
            <button
              type="button"
              onClick={() => onNotify("Multiplayer mode is planned for a future update.")}
              className="py-3.5 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800/80 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold shrink-0"
            >
              <Users size={14} className="text-slate-500" />
              <span>Multiplayer</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                Soon
              </span>
            </button>
          </div>
        </div>

        {/* Minimal Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Independent Portfolios</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Each profile owns their unique balance and saved properties.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Wrench size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Maintenance & Cashflow</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Balance rent revenues with repairs and unexpected expenses.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              <Landmark size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Credit & Leverage</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Utilize loans strategically while managing monthly debt service.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Google-Style Investor Auth Modal ("Small Page Inside the Page") */}
      <InvestorAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        initialName={initialPlayerName}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
