import React from 'react';
import { History, ShieldAlert, Wrench, DollarSign, Award, ArrowUpRight } from 'lucide-react';

export interface AuditLogItem {
  id: number;
  actionType: string;
  description?: string;
  amount?: number;
  postBalance?: number;
  turnNumber?: number;
  timestamp: string;
  propertyTitle?: string;
  // legacy/fallback fields
  userId?: string;
  userName?: string;
  title?: string;
  details?: string;
  financialImpact?: number;
}

interface AuditLedgerProps {
  logs: AuditLogItem[];
  onRefresh?: () => void;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({ logs, onRefresh }) => {
  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'Renovation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wrench size={10} />
            Renovation
          </span>
        );
      case 'RegulatoryAudit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert size={10} />
            Audit Levy
          </span>
        );
      case 'PropertyAcquisition':
      case 'Acquisition':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <DollarSign size={10} />
            Acquisition
          </span>
        );
      case 'RentalIncome':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <DollarSign size={10} />
            Rental Income
          </span>
        );
      case 'MaintenanceFee':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Wrench size={10} />
            Maintenance
          </span>
        );
      case 'WorkIncome':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <DollarSign size={10} />
            Brokerage Deal
          </span>
        );
      case 'TurnSettlement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ArrowUpRight size={10} />
            Settlement
          </span>
        );
      case 'Victory':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award size={10} />
            Victory
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {actionType}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History size={18} className="text-purple-400" />
            Financial Audit Ledger & Regulatory Log
          </h3>
          <p className="text-xs text-slate-400">
            Live enterprise audit trail of municipal inspections, property renovations, and portfolio transfers
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Refresh Ledger
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <History size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-medium">Audit trail clean</p>
          <p className="text-[11px] text-slate-500 mt-1">Actions such as renovations and municipal audits will log here</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-72 overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 sticky top-0 bg-slate-900 z-10">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Actor / Investor</th>
                <th className="pb-3 font-semibold">Summary</th>
                <th className="pb-3 font-semibold text-right">Cashflow Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => {
                const rawAmount = log.amount !== undefined ? log.amount : log.financialImpact;
                const parsed = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount || '0'));
                const impact = !isNaN(parsed) ? parsed : 0;
                const isPositive = impact > 0;
                const isZero = Math.abs(impact) < 0.001;

                const displayTitle = log.propertyTitle || log.title || log.actionType;
                const displayDetails = log.description || log.details || '';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      {getActionBadge(log.actionType)}
                    </td>
                    <td className="py-2.5 text-slate-200 font-medium">
                      {log.userName || 'System'}
                    </td>
                    <td className="py-2.5 text-slate-300 max-w-md truncate" title={displayDetails}>
                      <span className="font-semibold text-slate-100 mr-1">{displayTitle}:</span>
                      {displayDetails}
                    </td>
                    <td className={`py-2.5 text-right font-semibold whitespace-nowrap ${
                      isZero ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isZero ? '$0' : `${isPositive ? '+' : '-'}$${Math.abs(impact).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
