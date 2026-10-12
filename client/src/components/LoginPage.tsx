import React, { useState } from 'react';
import { Building2, Mail, Lock, User, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onRegister: (email: string, userName: string, password?: string) => Promise<void>;
  onGoogleLogin: (email: string, name: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onRegister,
  onGoogleLogin
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationSuccess(null);

    try {
      if (isRegister) {
        await onRegister(email, userName || email.split('@')[0], password);
        setVerificationSuccess(`Account successfully created for ${email}! Entering Metro Hunt...`);
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your Google email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onGoogleLogin(email, userName || email.split('@')[0]);
    } catch (err: any) {
      setError(err.message || 'Google account sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center text-slate-950 font-black shadow-xl shadow-emerald-500/20 mb-3">
            <Building2 size={30} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
            METRO HUNT
          </h1>
          <p className="text-xs font-mono text-emerald-400 mt-1 uppercase tracking-widest">
            Real Estate Tycoon Multiplayer
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            Sign in to access your portfolio, broker deals, and compete in the real-time net worth race
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl backdrop-blur-md">
          {/* Tabs: Sign In vs Register */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
                setVerificationSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-slate-800 text-slate-100 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
                setVerificationSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister
                  ? 'bg-slate-800 text-slate-100 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {verificationSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{verificationSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Investor Username</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your investor name"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold tracking-wide uppercase shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : isRegister ? (
                <span>Register & Enter Lounge</span>
              ) : (
                <span>Sign In to Portfolio</span>
              )}
            </button>
          </form>

          {/* Quick Google Single Sign-On Button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              disabled={loading || !email}
              onClick={handleQuickGoogleSubmit}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 hover:border-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              title="Enter your email above first to quickly sign in via Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Instant Google One-Click Login</span>
            </button>
          </div>
        </div>

        {/* Network & Mobile Play Guidance Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex items-center justify-center gap-2.5 text-xs text-slate-400 font-mono">
          <Smartphone size={15} className="text-cyan-400 shrink-0" />
          <span>
            Playing on iPhone? Use IP <strong className="text-cyan-300">192.168.0.74:5173</strong> (Not localhost!)
          </span>
        </div>
      </div>
    </div>
  );
};
