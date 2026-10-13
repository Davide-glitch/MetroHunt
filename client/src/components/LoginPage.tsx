import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  Loader2, 
  Sparkles 
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onRegister: (email: string, userName: string, password?: string) => Promise<void>;
  onGoogleLogin: (email: string, name: string) => Promise<void>;
  onVerifiedLogin?: (token: string, user: { id: string; userName: string; email: string; liquidBalance: number }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onRegister,
  onGoogleLogin,
  onVerifiedLogin
}) => {
  // Mode: 'otp' (6-digit email code) | 'password' (standard login) | 'register'
  const [authMode, setAuthMode] = useState<'otp' | 'password' | 'register'>('otp');

  // Input fields
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 6-digit OTP fields
  const [otpCode, setOtpCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [emailDelivered, setEmailDelivered] = useState<boolean>(false);

  // Google Account Chooser Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleLoadingAccount, setGoogleLoadingAccount] = useState<{ email: string; name: string } | null>(null);
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Send 6-digit email code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address to receive the verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch verification code.');
      }

      setCodeSent(true);
      if (data.code) {
        setGeneratedCode(data.code);
        setOtpCode(data.code);
      }
      setEmailDelivered(!!data.emailDelivered);

      if (data.emailDelivered) {
        setSuccessMsg(`Verification code sent to ${email}! Check your inbox (also auto-filled below).`);
      } else {
        setSuccessMsg(`One-Time Passcode generated! (Code auto-filled below — click Verify to enter).`);
      }
    } catch (err: any) {
      setError(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify 6-digit code and sign in
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
          userName: userName.trim() || email.split('@')[0],
          password: password || 'MetroHunt@2026!'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed. Please check the code.');
      }

      if (onVerifiedLogin && data.token) {
        onVerifiedLogin(data.token, {
          id: data.userId,
          userName: data.userName,
          email: data.email,
          liquidBalance: data.liquidBalance
        });
      } else {
        await onLogin(email.trim(), password || 'MetroHunt@2026!');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Login / Register
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (authMode === 'register') {
        await onRegister(email.trim(), userName.trim() || email.split('@')[0], password);
        setSuccessMsg(`Account created for ${email}! Entering Metro Hunt...`);
      } else {
        await onLogin(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Google Account Click
  const handleSelectGoogleAccount = async (accountEmail: string, accountName: string) => {
    setGoogleLoadingAccount({ email: accountEmail, name: accountName });
    setGoogleModalError(null);
    setError(null);

    try {
      await onGoogleLogin(accountEmail, accountName);
      // Success will cause parent App component to update user state and navigate
      setIsGoogleModalOpen(false);
    } catch (err: any) {
      setGoogleModalError(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoadingAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="/metrohunt-mark.svg" 
              alt="Metro Hunt Logo" 
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-500/25 border border-cyan-500/30 shrink-0" 
            />
            <span className="font-extrabold tracking-wider text-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              METRO HUNT
            </span>
          </div>
          <p className="text-xs font-mono text-emerald-400/90 mt-1 uppercase tracking-widest">
            Real Estate Tycoon Simulation
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs text-center">
            Sign in to access your portfolio, broker deals, and build your real estate empire
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl backdrop-blur-md">
          
          {/* Quick Clean Google Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setGoogleModalError(null);
                setGoogleLoadingAccount(null);
                setIsGoogleModalOpen(true);
              }}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-700/80 bg-slate-950 hover:bg-slate-850 hover:border-slate-600 text-slate-100 text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">Or Use Email</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound size={12} />
              <span>Email Code (OTP)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'password'
                  ? 'bg-slate-800 text-slate-100 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-slate-800 text-slate-100 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: 6-DIGIT EMAIL CODE (OTP) FLOW */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              {!codeSent ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Your Email Address</label>
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
                    <label className="text-xs font-mono text-slate-400 block mb-1">Investor Display Name (Optional)</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Davide"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold tracking-wide uppercase shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending Code...</span>
                      </span>
                    ) : (
                      <>
                        <span>Send 6-Digit Verification Code</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4 animate-in fade-in">
                  
                  {/* Generated Code Quick Banner */}
                  {generatedCode && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                        {emailDelivered ? 'Dispatched to Inbox & Ready:' : 'Verification Passcode (Auto-Filled):'}
                      </div>
                      <div className="text-2xl font-black font-mono tracking-widest text-emerald-300">
                        {generatedCode}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Valid for 10 minutes • Click Verify to enter
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-mono text-slate-400">Enter 6-Digit Code</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCodeSent(false);
                          setOtpCode('');
                          setGeneratedCode(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        Change Email ({email})
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base tracking-widest font-mono text-center font-bold text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold tracking-wide uppercase shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Verifying Code...</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Verify & Enter Metro Hunt</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendCode}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2 & 3: PASSWORD LOGIN OR REGISTRATION */}
          {(authMode === 'password' || authMode === 'register') && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Investor Display Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Davide"
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
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : authMode === 'register' ? (
                  <span>Create Account & Enter</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Network & Mobile Hotspot Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex items-center justify-center gap-2.5 text-xs text-slate-400 font-mono">
          <Smartphone size={15} className="text-cyan-400 shrink-0" />
          <span>
            Connected via iPhone Hotspot? Use your live Cloudflare Tunnel URL!
          </span>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER & AUTHENTICATION MODAL */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#121212] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-xs font-medium text-slate-300">Sign in with Google</span>
              </div>
              {!googleLoadingAccount && (
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* DEDICATED GOOGLE AUTHENTICATION LOADING STATE */}
            {googleLoadingAccount ? (
              <div className="p-8 text-center space-y-5 animate-in fade-in">
                {/* Google Animated Loading Spinner */}
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-emerald-500 border-b-yellow-500 border-l-rose-500 animate-spin"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-bold text-slate-100">
                    Signing in with Google
                  </div>
                  <div className="text-xs text-emerald-400 font-mono font-medium">
                    {googleLoadingAccount.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {googleLoadingAccount.email}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2">
                  <Loader2 size={13} className="animate-spin text-cyan-400" />
                  <span>Connecting portfolio to Metro Hunt...</span>
                </div>
              </div>
            ) : (
              <>
                {/* App Branding Header */}
                <div className="px-6 pt-5 pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src="/metrohunt-mark.svg" 
                      alt="Metro Hunt Logo" 
                      className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-500/25 border border-cyan-500/30 shrink-0" 
                    />
                    <div>
                      <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent block">
                        METRO HUNT
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Real Estate Tycoon
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Choose an account</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    to continue to <strong className="text-slate-200">Metro Hunt</strong>
                  </p>
                </div>

                {/* Modal Error */}
                {googleModalError && (
                  <div className="mx-4 mb-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{googleModalError}</span>
                  </div>
                )}

                {/* Account List */}
                <div className="px-3 py-2 space-y-1 max-h-[50vh] overflow-y-auto">
                  
                  {/* Account 1: Davide Luca Sfia */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount('double.d10xd@gmail.com', 'Davide Luca Sfia')}
                    className="w-full p-3 rounded-xl hover:bg-slate-800/80 active:bg-slate-800 transition-colors flex items-center gap-3.5 text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                      DLS
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                        Davide Luca Sfia
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        double.d10xd@gmail.com
                      </div>
                    </div>
                  </button>

                  {/* Account 2: Davide */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount('forlearningonytdavide@gmail.com', 'Davide')}
                    className="w-full p-3 rounded-xl hover:bg-slate-800/80 active:bg-slate-800 transition-colors flex items-center gap-3.5 text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                      D
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                        Davide
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        forlearningonytdavide@gmail.com
                      </div>
                    </div>
                  </button>

                  {/* Account 3: Ticul */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount('davide.lucasfia@gmail.com', 'Ticul')}
                    className="w-full p-3 rounded-xl hover:bg-slate-800/80 active:bg-slate-800 transition-colors flex items-center gap-3.5 text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                      T
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                        Ticul
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        davide.lucasfia@gmail.com
                      </div>
                    </div>
                  </button>

                  {/* Option 4: Use another account */}
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(!showCustomGoogleInput)}
                    className="w-full p-3 rounded-xl hover:bg-slate-800/80 active:bg-slate-800 transition-colors flex items-center gap-3.5 text-left cursor-pointer text-slate-300"
                  >
                    <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <User size={18} />
                    </div>
                    <div className="text-xs font-medium">
                      Use another account
                    </div>
                  </button>

                  {/* Expanded Custom Account Input */}
                  {showCustomGoogleInput && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5 mt-2 animate-in fade-in">
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="Your Full Name (e.g. Davide)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="your.google@gmail.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={!customGoogleEmail || !customGoogleEmail.includes('@')}
                        onClick={() => handleSelectGoogleAccount(customGoogleEmail.trim(), customGoogleName.trim() || customGoogleEmail.split('@')[0])}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Continue with this Account
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  Before using this app, you can review Metro Hunt's{' '}
                  <span className="text-blue-400 hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                  <span className="text-blue-400 hover:underline cursor-pointer">Terms of Service</span>.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
