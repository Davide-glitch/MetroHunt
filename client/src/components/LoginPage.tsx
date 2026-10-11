import React, { useState } from 'react';
import { Building2, ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

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

  // Google Account Selector State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Sample detected Google accounts on the browser device
  const defaultGoogleAccounts = [
    { name: 'Davide G. (Primary)', email: 'davide.glitch@gmail.com' },
    { name: 'Student Academic Profile', email: 'student.wad@university.edu' }
  ];

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
        setVerificationSuccess(`Account successfully verified for ${email}! Entering Metro Hunt...`);
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (chosenEmail: string, chosenName: string) => {
    setLoading(true);
    setError(null);
    try {
      await onGoogleLogin(chosenEmail, chosenName);
    } catch (err: any) {
      setError(err.message || 'Google account sign-in failed.');
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
          {/* Google Sign-In Trigger */}
          {!showGoogleChooser ? (
            <button
              type="button"
              onClick={() => setShowGoogleChooser(true)}
              className="w-full mb-5 py-3 px-4 rounded-2xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 hover:border-slate-600 text-slate-100 text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>
          ) : (
            <div className="mb-5 p-4 bg-slate-950 border border-slate-700/80 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Choose a Google Account
                </span>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              {/* List of selectable Google Accounts */}
              <div className="space-y-2 mb-3">
                {defaultGoogleAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc.email, acc.name)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                        {acc.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {acc.email}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              {/* Or enter another Google Account */}
              <div className="pt-2 border-t border-slate-850">
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Use another Google account:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="your.account@gmail.com"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail}
                    onClick={() => handleSelectGoogleAccount(customGoogleEmail, customGoogleEmail.split('@')[0])}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Or Use Email & Password
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {verificationSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{verificationSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                    placeholder="TycoonExecutive"
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
                  placeholder="investor@metrohunt.com"
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
              className="w-full mt-2 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck size={15} />
              <span>
                {loading
                  ? 'Verifying...'
                  : isRegister
                  ? 'Register & Verify Account'
                  : 'Sign In to Simulation'}
              </span>
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center text-xs font-mono pt-4 border-t border-slate-800/80">
            {isRegister ? (
              <p className="text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-slate-400">
                Don't have an investor account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  Sign Up & Verify
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
