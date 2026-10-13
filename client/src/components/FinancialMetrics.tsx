import React from 'react';
import { DollarSign, TrendingUp, Landmark, ArrowUpRight } from 'lucide-react';

interface FinancialMetricsProps {
  liquidBalance: number;
  netWorth: number;
  monthlyCashflow: number;
  centralBankRate: number;
  turnsSurvived: number;
}

export const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
  liquidBalance,
  netWorth,
  monthlyCashflow,
  centralBankRate,
  turnsSurvived
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Liquid Cash */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Liquid Reserves
          </span>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
          ${liquidBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <span>Available for acquisitions</span>
        </div>
      </div>

      {/* Net Worth */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Total Net Worth
          </span>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <span>Cash + Equity − Debt</span>
        </div>
      </div>

      {/* Monthly Cashflow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Operating Cash Flow Estimate
          </span>
          <div className={`p-2 rounded-xl border ${
            monthlyCashflow >= 0
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <ArrowUpRight size={18} className={monthlyCashflow < 0 ? 'rotate-90 text-rose-400' : ''} />
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono tracking-tight ${
          monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {monthlyCashflow >= 0 ? '+' : ''}${monthlyCashflow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Rent after vacancy reserve, less upkeep; before loan payments
        </div>
      </div>

      {/* Monetary Policy */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Reference Rate
          </span>
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Landmark size={18} />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          {(centralBankRate * 100).toFixed(1)}% <span className="text-sm font-normal text-slate-400">fixed</span>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Cycle {turnsSurvived} · reference only
        </div>
      </div>
    </div>
  );
};
