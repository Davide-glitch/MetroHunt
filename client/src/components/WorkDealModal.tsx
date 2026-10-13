import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  X, 
  Zap, 
  Building, 
  Landmark,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface WorkDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteDeal: (tier: string) => Promise<{ success: boolean; earnedAmount?: number; dealTitle?: string; message: string }>;
  turnsSurvived: number;
}

interface DealContract {
  id: string;
  tier: 'quick' | 'syndicate' | 'institutional';
  title: string;
  subtitle: string;
  durationSeconds: number;
  expectedMin: number;
  expectedMax: number;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
}

const CONTRACTS: DealContract[] = [
  {
    id: 'quick',
    tier: 'quick',
    title: 'Quick Wholesale Contract Flip',
    subtitle: 'Assign off-market wholesale residential contracts to retail cash investors.',
    durationSeconds: 3,
    expectedMin: 5000,
    expectedMax: 12000,
    icon: Zap,
    color: 'text-amber-400',
    bgGlow: 'from-amber-500/10 to-amber-500/5'
  },
  {
    id: 'syndicate',
    tier: 'syndicate',
    title: 'Commercial Brokerage Deal',
    subtitle: 'Structure private placement debt & equity for suburban shopping and retail plazas.',
    durationSeconds: 6,
    expectedMin: 18000,
    expectedMax: 38000,
    icon: Building,
    color: 'text-cyan-400',
    bgGlow: 'from-cyan-500/10 to-cyan-500/5'
  },
  {
    id: 'institutional',
    tier: 'institutional',
    title: 'Institutional REIT M&A Advisory',
    subtitle: 'Advise multi-asset real estate investment trusts on prime downtown high-rise portfolios.',
    durationSeconds: 12,
    expectedMin: 55000,
    expectedMax: 125000,
    icon: Landmark,
    color: 'text-emerald-400',
    bgGlow: 'from-emerald-500/10 to-emerald-500/5'
  }
];

export const WorkDealModal: React.FC<WorkDealModalProps> = ({
  isOpen,
  onClose,
  onCompleteDeal,
  turnsSurvived
}) => {
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [completedResult, setCompletedResult] = useState<{ amount: number; title: string } | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startDeal = (contract: DealContract) => {
    if (activeTier) return; // Already negotiating a deal

    setActiveTier(contract.tier);
    setProgress(0);
    setRemainingTime(contract.durationSeconds);
    setCompletedResult(null);

    const steps = [
      'Originating off-market sellers...',
      'Underwriting cash flow & cap rates...',
      'Structuring terms with institutional escrow...',
      'Executing municipal title transfer...',
      'Clearing advisory commission funds...'
    ];

    setStatusText(steps[0]);

    const totalMs = contract.durationSeconds * 1000;
    const intervalMs = 50;
    let elapsedMs = 0;

    intervalRef.current = window.setInterval(async () => {
      elapsedMs += intervalMs;
      const pct = Math.min(100, (elapsedMs / totalMs) * 100);
      setProgress(pct);
      setRemainingTime(Math.max(0, (totalMs - elapsedMs) / 1000));

      const stepIndex = Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length));
      setStatusText(steps[stepIndex]);

      if (elapsedMs >= totalMs) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatusText('Commission secured! Depositing funds...');

        try {
          const res = await onCompleteDeal(contract.tier);
          if (res.success && res.earnedAmount) {
            setCompletedResult({
              amount: res.earnedAmount,
              title: res.dealTitle || contract.title
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setActiveTier(null);
        }
      }
    }, intervalMs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-100">Brokerage Deal Desk</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Active Cash Flow
                </span>
              </div>
              <p className="text-xs text-slate-400">Spend time negotiating commercial deals to earn liquid capital for property acquisitions</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!activeTier) onClose();
            }}
            disabled={!!activeTier}
            className={`p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ${
              activeTier ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Recent Payout Banner */}
          {completedResult && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Deal Closed & Deposited!</div>
                  <div className="text-xs text-slate-300">{completedResult.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  +${completedResult.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Reserves Credited</div>
              </div>
            </div>
          )}

          {/* Active Progress Bar if Negotiating */}
          {activeTier && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                  <Clock size={14} className="animate-spin text-amber-400" />
                  <span>{statusText}</span>
                </div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  {remainingTime.toFixed(1)}s remaining ({progress.toFixed(0)}%)
                </div>
              </div>

              {/* High-Tech Animated Loading Bar */}
              <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 transition-all duration-75 relative rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Contracts List */}
          <div className="space-y-3 pt-2">
            {CONTRACTS.map((contract) => {
              const Icon = contract.icon;
              const isCurrent = activeTier === contract.tier;
              const isOtherActive = activeTier !== null && !isCurrent;

              return (
                <div
                  key={contract.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-950/20 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  } ${isOtherActive ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`h-11 w-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${contract.color} shrink-0`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100">{contract.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                            <Clock size={10} /> {contract.durationSeconds}s
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {contract.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        ${contract.expectedMin.toLocaleString()} - ${contract.expectedMax.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">Estimated Commission</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span>Experience Bonus: +${(Math.min(35000, turnsSurvived * 800)).toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => startDeal(contract)}
                      disabled={activeTier !== null}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950'
                          : activeTier !== null
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Clock size={13} className="animate-spin" />
                          <span>Negotiating...</span>
                        </>
                      ) : (
                        <>
                          <span>Broker Deal ({contract.durationSeconds}s)</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs font-mono text-slate-500">
          Active brokerage commissions scale with turns survived and market economic cycles.
        </div>
      </div>
    </div>
  );
};
