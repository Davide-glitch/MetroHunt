import React from 'react';
import { ShoppingBag, Sparkles, Lock, KeyRound } from 'lucide-react';
import { getPropertyVisual } from '../utils/propertyVisuals';

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
  isBuying,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag size={18} className="text-blue-400" />
            Live Property Marketplace
          </h3>
          <p className="text-xs text-slate-400">
            Compare asking prices, rental income, and property condition across the city.
          </p>
        </div>

        <button
          onClick={onGenerateProperties}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={14} className="text-amber-400" />
          Seed More Listings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {properties.map((prop) => {
          const isOwned = !!prop.ownerId;
          const isOwnedByMe = prop.ownerId === currentUserId;
          const canAfford = liquidBalance >= prop.price && !isOwned;
          const visual = getPropertyVisual(prop.type, prop.district, prop.id, prop.title);

          return (
            <div
              key={prop.id}
              className={`group rounded-2xl flex flex-col justify-between transition-all duration-200 overflow-hidden border ${
                isOwnedByMe
                  ? 'bg-slate-950/70 border-emerald-500/30 shadow-md'
                  : isOwned
                  ? 'bg-slate-950/70 border-slate-800 shadow-md'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:shadow-xl'
              }`}
            >
              <div>
                {/* Visual Image Header */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img
                    src={visual.image}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.visibility = 'hidden';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* District & Style Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                        prop.district === 'Financial'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : prop.district === 'Downtown'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                          : prop.district === 'Industrial'
                          ? 'bg-orange-950/80 text-orange-300 border border-orange-500/30'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {prop.district}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md">
                      {visual.badge}
                    </span>
                  </div>

                  {/* Condition Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/85 text-slate-300 border border-slate-800 backdrop-blur-md">
                      {prop.condition}% Grade
                    </span>
                  </div>

                  {/* Architectural Tag */}
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <span className="text-[10px] font-mono text-slate-300/90 truncate block drop-shadow-md">
                      {visual.architecturalStyle}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 pt-3">
                  <h4 className="font-bold text-slate-100 text-sm mb-2 truncate" title={prop.title}>
                    {prop.title}
                  </h4>

                  <div className="space-y-1.5 mb-3 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Valuation:</span>
                      <span className="text-slate-100 font-bold">
                        ${prop.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Gross rent:</span>
                      <span className="text-emerald-400 font-bold">
                        +${prop.monthlyRent.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400" title="Annual rent divided by asking price, before expenses, vacancy, taxes, or financing.">
                      <span>Gross yield estimate:</span>
                      <span className="text-slate-200 font-bold">
                        {prop.price > 0 ? ((prop.monthlyRent * 12 / prop.price) * 100).toFixed(1) : '0.0'}% / yr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="p-4 pt-0">
                {isOwned ? (
                  <div className="space-y-2">
                    <div className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
                      <Lock size={12} className="text-slate-500" />
                      {isOwnedByMe ? (
                        <span className="text-emerald-400 font-bold">Held in your portfolio</span>
                      ) : (
                        <span className="truncate">Owned by {prop.ownerName || 'another profile'}</span>
                      )}
                    </div>

                  </div>
                ) : (
                  <button
                    disabled={!canAfford || isBuying}
                    onClick={() => onBuyProperty(prop.id, prop.rowVersion)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    <KeyRound size={13} />
                    {liquidBalance < prop.price ? 'Insufficient Funds' : 'Acquire Asset'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
