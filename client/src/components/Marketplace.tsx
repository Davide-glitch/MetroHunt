import React from 'react';
import { ShoppingBag, Sparkles, Lock } from 'lucide-react';

export interface MarketProperty {
  id: number;
  title: string;
  district: string;
  type: string;
  price: number;
  monthlyRent: number;
  condition: number;
  isOccupied: boolean;
  ownerId: string | null;
  ownerName: string | null;
  rowVersion: string;
}

interface MarketplaceProps {
  properties: MarketProperty[];
  liquidBalance: number;
  currentUserId?: string;
  onBuyProperty: (propertyId: number, rowVersion: string) => void;
  onGenerateProperties: () => void;
  isBuying: boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  properties,
  liquidBalance,
  currentUserId,
  onBuyProperty,
  onGenerateProperties,
  isBuying
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag size={18} className="text-blue-400" />
            Live Property Marketplace
          </h3>
          <p className="text-xs text-slate-400">
            Acquire real estate across districts with optimistic concurrency locking
          </p>
        </div>

        <button
          onClick={onGenerateProperties}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <Sparkles size={14} className="text-amber-400" />
          Seed Procedural Listings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((prop) => {
          const isOwned = !!prop.ownerId;
          const isOwnedByMe = prop.ownerId === currentUserId;
          const canAfford = liquidBalance >= prop.price && !isOwned;

          return (
            <div
              key={prop.id}
              className={`border rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                isOwned
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      prop.district === 'Financial'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : prop.district === 'Downtown'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : prop.district === 'Industrial'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {prop.district}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {prop.type}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm mb-1 truncate">
                  {prop.title}
                </h4>

                <div className="space-y-1 mb-4 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Valuation:</span>
                    <span className="text-slate-100 font-bold">
                      ${prop.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rent Yield:</span>
                    <span className="text-emerald-400 font-bold">
                      +${prop.monthlyRent.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Condition:</span>
                    <span className="text-slate-300">{prop.condition}% Grade</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isOwned ? (
                <div className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock size={12} className="text-slate-500" />
                  {isOwnedByMe ? (
                    <span className="text-emerald-400 font-bold">Held in your portfolio</span>
                  ) : (
                    <span>Acquired by {prop.ownerName || 'Another Investor'}</span>
                  )}
                </div>
              ) : (
                <button
                  disabled={!canAfford || isBuying}
                  onClick={() => onBuyProperty(prop.id, prop.rowVersion)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    canAfford
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  {liquidBalance < prop.price ? 'Insufficient Funds' : 'Acquire Asset'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
