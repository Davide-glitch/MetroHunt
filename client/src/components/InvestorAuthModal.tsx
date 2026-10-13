import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export interface SavedInvestorProfile {
  userName: string;
  liquidBalance: number;
  propertiesCount: number;
  turnsSurvived: number;
}

interface InvestorAuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'register';
  initialName?: string;
  onClose: () => void;
  onSuccess: (data: {
    token: string;
    userId: string;
    userName: string;
    email: string;
    liquidBalance: number;
    message: string;
  }) => void;
}

export const InvestorAuthModal: React.FC<InvestorAuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  initialName = '',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [userName, setUserName] = useState<string>(initialName);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Name availability state for "Start New Career"
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const [nameAvailability, setNameAvailability] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  } | null>(null);

  // Saved accounts list (Google-style account chooser)
  const [savedProfiles, setSavedProfiles] = useState<SavedInvestorProfile[]>([]);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Sync mode when modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUserName(initialName);
      setPassword('');
      setErrorMessage(null);
      setNameAvailability(null);
      fetchSavedProfiles();
      setTimeout(() => {
        if (!initialName) {
          nameInputRef.current?.focus();
        } else {
          passwordInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, initialMode, initialName]);

  // Fetch saved profiles for Google-style account selection
  const fetchSavedProfiles = async () => {
    try {
      const res = await fetch('/api/auth/saved-investors');
      if (res.ok) {
        const data: SavedInvestorProfile[] = await res.json();
        setSavedProfiles(data);
      }
    } catch {
      // Non-critical background feature
    }
  };

  // Debounced check name availability in registration mode
  useEffect(() => {
    if (mode !== 'register') {
      setNameAvailability(null);
      return;
    }

    const trimmed = userName.trim();
    if (trimmed.length < 2) {
      setNameAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingName(true);
      try {
        const res = await fetch(`/api/auth/check-name?name=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setNameAvailability({
            checked: true,
            available: data.available,
            message: data.message
          });
        }
      } catch {
        // Keep previous state
      } finally {
        setIsCheckingName(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [userName, mode]);

  if (!isOpen) return null;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = userName.trim();
    if (!cleanName) {
      setErrorMessage('Please enter your investor name.');
      nameInputRef.current?.focus();
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage('Investor name must be at least 2 characters.');
      nameInputRef.current?.focus();
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters to protect your career.');
      passwordInputRef.current?.focus();
      return;
    }

    if (mode === 'register' && nameAvailability && !nameAvailability.available) {
      setErrorMessage(nameAvailability.message || 'This name is already in use. Please choose another investor name.');
      nameInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const endpoint = mode === 'register' ? '/api/auth/register-investor' : '/api/auth/login-investor';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: cleanName,
          password: password,
          isNewCareer: mode === 'register'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.message || (mode === 'register' 
          ? 'This name is already in use. Please choose another investor name.' 
          : 'Incorrect investor name or password.');
        
        setErrorMessage(errorMsg);
        
        // If registering and already taken, update availability UI explicitly
        if (mode === 'register' && res.status === 409) {
          setNameAvailability({
            checked: true,
            available: false,
            message: errorMsg
          });
        }
        return;
      }

      // Save to recent accounts in localStorage
      try {
        const stored = localStorage.getItem('metrohunt_recent_investors');
        const list: string[] = stored ? JSON.parse(stored) : [];
        const updated = Array.from(new Set([cleanName, ...list])).slice(0, 5);
        localStorage.setItem('metrohunt_recent_investors', JSON.stringify(updated));
      } catch {
        // Ignore localStorage error
      }

      onSuccess({
        token: data.token,
        userId: data.userId,
        userName: data.userName,
        email: data.email,
        liquidBalance: data.liquidBalance,
        message: data.message
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(`Connection error: ${err.message || 'Server is not reachable'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectSavedProfile = (profileName: string) => {
    setUserName(profileName);
    setMode('signin');
    setErrorMessage(null);
    setNameAvailability(null);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 50);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/40 overflow-hidden relative flex flex-col text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500" />
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <img 
              src="/metrohunt-mark.svg"
              alt="Metro Hunt Logo" 
              className="h-10 w-10 rounded-xl object-cover shadow-md shadow-cyan-500/20 border border-cyan-500/30 shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  METRO HUNT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'signin' ? 'Sign In to Your Saved Career' : 'Create New Investor Career Profile'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Google-style Mode Selector Tabs */}
        <div className="px-6 pt-4 relative z-10">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'bg-slate-850 text-cyan-400 shadow-md border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-emerald-500/15 text-emerald-300 shadow-md border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus size={14} />
              <span>New Career</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-4 flex-1 overflow-y-auto max-h-[75vh] relative z-10 space-y-4">
          
          {/* Quick Account Chooser in Sign In Mode */}
          {mode === 'signin' && savedProfiles.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Choose Saved Investor Account
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {savedProfiles.map((p) => {
                  const isSelected = userName.trim().toLowerCase() === p.userName.toLowerCase();
                  return (
                    <button
                      key={p.userName}
                      type="button"
                      onClick={() => handleSelectSavedProfile(p.userName)}
                      className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0 shadow-sm">
                          {p.userName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate text-slate-100">{p.userName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ${p.liquidBalance.toLocaleString()} liquid • {p.propertiesCount} properties
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-500 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Investor Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Investor Name (Profile ID)
                </label>
                {mode === 'register' && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Must be unique
                  </span>
                )}
              </div>

              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  ref={nameInputRef}
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder={mode === 'signin' ? 'Enter your saved investor name' : 'Choose your unique investor name'}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-10 py-3 bg-slate-950 border rounded-2xl text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                    mode === 'register' && nameAvailability
                      ? nameAvailability.available
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : 'border-red-500/70 focus:border-red-400'
                      : 'border-slate-800 focus:border-cyan-500/80'
                  }`}
                />
                
                {/* Checking spinner or status icon */}
                <div className="absolute right-3.5 top-3.5">
                  {isCheckingName ? (
                    <Loader2 size={16} className="text-cyan-400 animate-spin" />
                  ) : mode === 'register' && nameAvailability ? (
                    nameAvailability.available ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )
                  ) : null}
                </div>
              </div>

              {/* Name collision / availability message */}
              {mode === 'register' && nameAvailability && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {nameAvailability.available ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {nameAvailability.message}
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle size={13} />
                      {nameAvailability.message}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Career Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Min. 4 characters
                </span>
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter career password"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Registration Perks Banner */}
            {mode === 'register' && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="leading-tight">
                  <p className="font-bold text-slate-200">
                    Starts with $100,000 Liquid Reserves
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Your properties, balance, and credit are stored permanently in the database.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || (mode === 'register' && nameAvailability !== null && !nameAvailability.available)}
                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/25'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{mode === 'register' ? 'Creating Career Profile...' : 'Authenticating...'}</span>
                  </>
                ) : mode === 'register' ? (
                  <>
                    <UserPlus size={16} />
                    <span>Create Profile & Start Career</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In & Resume Career</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                New investor?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Start a new career here
                </button>
              </p>
            ) : (
              <p>
                Already have a career?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in to your portfolio
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
