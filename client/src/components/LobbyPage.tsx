import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  CheckCircle2, 
  Clock, 
  Play, 
  Wifi, 
  Smartphone, 
  Copy, 
  Check, 
  Building2, 
  Target, 
  LogOut, 
  Layers
} from 'lucide-react';
import type { LobbyState } from '../hooks/useGameHub';

interface LobbyPageProps {
  currentUser: { id: string; userName: string; email: string; liquidBalance: number };
  lobbyState: LobbyState;
  isSignalRConnected: boolean;
  onSetReady: (isReady: boolean) => void;
  onSetTargetGoal: (target: number) => void;
  onStartMatch: () => void;
  onStartSolo: (target: number) => void;
  onLogout: () => void;
}

const GOAL_OPTIONS = [
  { value: 2_000_000, label: '$2M Sprint', subtitle: 'Fast 5-min round', badge: 'Sprint' },
  { value: 10_000_000, label: '$10M Fast', subtitle: 'Recommended classic', badge: 'Standard' },
  { value: 100_000_000, label: '$100M Marathon', subtitle: 'High-stakes tycoon', badge: 'Marathon' },
  { value: 1_000_000_000_000, label: '$1 Trillion Empire', subtitle: 'Global financial monopoly', badge: 'Empire' },
];

export const LobbyPage: React.FC<LobbyPageProps> = ({
  currentUser,
  lobbyState,
  isSignalRConnected,
  onSetReady,
  onSetTargetGoal,
  onStartMatch,
  onStartSolo,
  onLogout
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSoloGoal, setSelectedSoloGoal] = useState<number>(10_000_000);
  const [activeTab, setActiveTab] = useState<'multiplayer' | 'solo'>('multiplayer');

  // Find current user's lobby record
  const currentLobbyPlayer = lobbyState.players.find(p => p.playerId === currentUser.id);
  const isHost = currentLobbyPlayer?.isHost ?? (lobbyState.players.length === 0);
  const isReady = currentLobbyPlayer?.isReady ?? false;

  const totalPlayers = lobbyState.players.length;
  const readyCount = lobbyState.players.filter(p => p.isReady).length;
  const allReady = totalPlayers > 0 && readyCount === totalPlayers;

  // Active session URL for multiplayer or mobile hotspot play
  const localLanUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(localLanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
              MH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  METRO HUNT
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Matchmaking Lounge
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Multiplayer Syndicate Lobby • DBD Ready System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${
              isSignalRConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <Wifi size={13} className={isSignalRConnected ? 'animate-pulse' : ''} />
              <span>{isSignalRConnected ? 'SignalR Live' : 'Connecting...'}</span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{currentUser.userName}</div>
                <div className="text-[10px] font-mono text-emerald-400">${currentUser.liquidBalance?.toLocaleString()} Cash</div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('multiplayer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'multiplayer'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Users size={16} />
              <span>Multiplayer Syndicate Match</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white font-semibold">
                {totalPlayers} Online
              </span>
            </button>

            <button
              onClick={() => setActiveTab('solo')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'solo'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Play size={16} />
              <span>Solo Tycoon Practice</span>
            </button>
          </div>

          {/* Wi-Fi & Multi-device connection banner */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-300">
            <Smartphone size={15} className="text-cyan-400 shrink-0" />
            <span className="text-slate-300">Join from iPhone/PC:</span>
            <span className="font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
              {localLanUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1 hover:bg-cyan-500/20 rounded transition-colors text-cyan-400"
              title="Copy link"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Tab 1: MULTIPLAYER LOBBY (DBD Ready System) */}
        {activeTab === 'multiplayer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Player Ready Roster (Dead by Daylight Style) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <Users className="text-emerald-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-100">Investor Ready Room</h2>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                      {readyCount}/{totalPlayers} Ready
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {isHost ? '👑 You are Room Host' : '💼 Joined as Investor'}
                  </div>
                </div>

                {/* Dead by Daylight Style Player Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lobbyState.players.map((player) => {
                    const isCurrent = player.playerId === currentUser.id;
                    return (
                      <div
                        key={player.connectionId}
                        className={`relative rounded-xl p-4 border transition-all duration-300 ${
                          player.isReady
                            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-950/50 border-slate-800/90'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                              player.isReady 
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black' 
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {player.playerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-slate-100">
                                  {player.playerName}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-0.5">
                                {player.isHost ? (
                                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                    <Crown size={11} /> Room Host
                                  </span>
                                ) : (
                                  <span>Syndicate Partner</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* DBD Style Status Pill */}
                          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full border ${
                            player.isReady
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {player.isReady ? (
                              <>
                                <CheckCircle2 size={13} className="text-emerald-400" />
                                <span>READY</span>
                              </>
                            ) : (
                              <>
                                <Clock size={13} className="text-rose-400" />
                                <span>NOT READY</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Animated ready indicator bar */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Evaluation State</span>
                          <span className={player.isReady ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                            {player.isReady ? '⚡ Confirmed' : 'Waiting for input...'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slot for iPhone or Friend */}
                  {lobbyState.players.length === 1 && (
                    <div className="rounded-xl p-5 border border-dashed border-slate-800 bg-slate-950/20 flex flex-col items-center justify-center text-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-500">
                        <Smartphone size={18} />
                      </div>
                      <div className="text-xs font-semibold text-slate-300">Invite 2nd Player (iPhone / PC)</div>
                      <p className="text-[11px] text-slate-500 font-mono max-w-xs">
                        Open <span className="text-cyan-400 underline">{localLanUrl}</span> on your phone on the same Wi-Fi to join!
                      </p>
                    </div>
                  )}
                </div>

                {/* Player Self-Ready Toggle Button */}
                <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Your Ready State</div>
                    <p className="text-[11px] text-slate-400">Lock in your portfolio to allow the host to launch the match</p>
                  </div>

                  <button
                    onClick={() => onSetReady(!isReady)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${
                      isReady
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20 hover:scale-[1.02]'
                    }`}
                  >
                    {isReady ? (
                      <>
                        <Clock size={16} />
                        <span>CANCEL READY</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>READY UP (LOCK IN)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Host Match Launch Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="text-amber-400" size={18} />
                      <h3 className="font-bold text-base text-slate-100">Host Launch Control</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {allReady
                        ? '🟢 All investors are locked in and ready. Launch whenever you are prepared!'
                        : `⏳ Waiting for all investors to click READY UP (${readyCount}/${totalPlayers} ready)`}
                    </p>
                  </div>

                  {isHost ? (
                    <button
                      onClick={onStartMatch}
                      disabled={!allReady}
                      className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm tracking-wider uppercase transition-all shadow-xl ${
                        allReady
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-slate-950 hover:brightness-110 shadow-emerald-500/30 scale-105 animate-pulse'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      <Play size={18} className="fill-current" />
                      <span>{allReady ? 'START MULTIPLAYER MATCH' : `LOCKED (${readyCount}/${totalPlayers} READY)`}</span>
                    </button>
                  ) : (
                    <div className="text-xs font-mono bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300">
                      Waiting for Room Host to start match...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Goal & Mode Selection */}
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="text-cyan-400" size={18} />
                  <h3 className="font-bold text-sm text-slate-100">Match Target Net Worth</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  First investor to amass this net worth in cash and equity secures immediate victory.
                </p>

                <div className="flex flex-col gap-3">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = (lobbyState.targetGoal || 10_000_000) === goal.value;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => {
                          if (isHost) onSetTargetGoal(goal.value);
                        }}
                        disabled={!isHost}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-100">{goal.label}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {goal.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{goal.subtitle}</p>
                      </button>
                    );
                  })}
                </div>

                {!isHost && (
                  <p className="text-[11px] font-mono text-slate-500 mt-4 text-center">
                    * Only the Room Host can adjust the target goal.
                  </p>
                )}
              </div>

              {/* Quick Info Box */}
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 text-xs text-slate-400 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Layers size={15} className="text-emerald-400" />
                  <span>How Multiplayer Works</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                  <li>Broker deals with active timers to earn capital</li>
                  <li>Acquire properties before opponents grab them</li>
                  <li>Renovate properties to surge their value and rent</li>
                  <li>Advance turns to collect recurring rental income</li>
                  <li>Launch hostile inspections on competitor assets!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SOLO PRACTICE MODE */}
        {activeTab === 'solo' && (
          <div className="max-w-2xl mx-auto w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Solo Tycoon Challenge</h2>
                <p className="text-xs text-slate-400">Practice your real estate strategy, broker deals, and race against the market cycle</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Select Victory Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setSelectedSoloGoal(goal.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedSoloGoal === goal.value
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-100">{goal.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{goal.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStartSolo(selectedSoloGoal)}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} className="fill-current" />
              <span>START SOLO TYCOON SIMULATION</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
