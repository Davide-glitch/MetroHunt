import React from 'react';
import { Building2, Home, CheckCircle2, Wrench } from 'lucide-react';
import { getPropertyVisual } from '../utils/propertyVisuals';

export interface OwnedProperty {
  id: number;
  title: string;
  district: string;
  type: string;
  price: number;
  monthlyRent: number;
  condition: number;
  isOccupied: boolean;
}

interface PortfolioTableProps {
  properties: OwnedProperty[];
  liquidBalance: number;
  onRenovate: (propertyId: number) => void;
  isRenovating: boolean;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  properties,
  liquidBalance,
  onRenovate,
  isRenovating
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-400" />
            Active Real Estate Holdings
          </h3>
          <p className="text-xs text-slate-400">
            {properties.length} {properties.length === 1 ? 'asset' : 'assets'} generating recurring rental income
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
          <Home size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-400 font-medium">No properties currently held</p>
          <p className="text-xs text-slate-500 mt-1">Acquire assets from the marketplace to build equity</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Asset / Title</th>
                <th className="pb-3 font-semibold">District</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Current Value</th>
                <th className="pb-3 font-semibold">Monthly Rent</th>
                <th className="pb-3 font-semibold">Condition</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {properties.map((prop) => {
                const renoCost = Math.round(prop.price * 0.05);
                const canAffordReno = liquidBalance >= renoCost;
                const isPristine = prop.condition >= 100;
                const visual = getPropertyVisual(prop.type, prop.district, prop.id, prop.title);

                return (
                  <tr key={prop.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-sans font-semibold text-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={visual.image}
                          alt={prop.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/properties/apartment-loft.jpg';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-slate-100 truncate max-w-[200px]" title={prop.title}>
                            {prop.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {visual.badge}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                        {prop.district}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{prop.type}</td>
                    <td className="py-3 font-bold text-slate-100">
                      ${prop.price.toLocaleString()}
                    </td>
                    <td className="py-3 text-emerald-400 font-bold">
                      +${prop.monthlyRent.toLocaleString()}/mo
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${
                              prop.condition > 70
                                ? 'bg-emerald-500'
                                : prop.condition > 40
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${prop.condition}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{prop.condition}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={10} /> Occupied
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        disabled={isPristine || !canAffordReno || isRenovating}
                        onClick={() => onRenovate(prop.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isPristine
                            ? 'bg-slate-950 text-slate-500 border border-slate-800 cursor-default'
                            : canAffordReno
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                        }`}
                        title={isPristine ? 'Pristine condition' : `Renovate for $${renoCost.toLocaleString()}`}
                      >
                        <Wrench size={12} className={canAffordReno && !isPristine ? 'text-amber-400' : ''} />
                        {isPristine ? 'Pristine' : `Renovate ($${(renoCost / 1000).toFixed(0)}k)`}
                      </button>
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
