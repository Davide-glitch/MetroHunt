import React, { useState } from 'react';
import { Landmark, X, AlertCircle } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeLoan: (amount: number) => void;
  isTakingLoan: boolean;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onTakeLoan,
  isTakingLoan
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500_000);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Landmark size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Commercial Credit Facility
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Leverage your balance sheet with fixed 6.5% interest bank debt amortized over 24 turns to rapidly acquire high-yield assets.
        </p>

        <div className="space-y-2 mb-6">
          {[250_000, 500_000, 1_000_000, 2_500_000].map((amt) => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              className={`w-full p-3 rounded-xl border text-left font-mono text-xs flex justify-between items-center transition-all cursor-pointer ${
                selectedAmount === amt
                  ? 'bg-blue-500/10 border-blue-500 text-blue-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>${amt.toLocaleString()} Principal</span>
              <span className="text-slate-400">
                ~${Math.round((amt * 1.065) / 24).toLocaleString()}/mo
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 flex gap-2 items-start mb-6">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <span>
            Debt offsets your Net Worth immediately until capital is converted into cashflowing real estate.
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={isTakingLoan}
            onClick={() => onTakeLoan(selectedAmount)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isTakingLoan ? 'Financing...' : `Borrow $${(selectedAmount / 1_000).toFixed(0)}k`}
          </button>
        </div>
      </div>
    </div>
  );
};
