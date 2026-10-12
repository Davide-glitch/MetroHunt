import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RaceTracker } from './components/RaceTracker';
import { FinancialMetrics } from './components/FinancialMetrics';
import { PortfolioTable } from './components/PortfolioTable';
import type { OwnedProperty } from './components/PortfolioTable';
import { Marketplace } from './components/Marketplace';
import type { MarketProperty } from './components/Marketplace';
import { LoanModal } from './components/LoanModal';
import { AuthModal } from './components/AuthModal';
import { VictoryModal } from './components/VictoryModal';
import { AuditLedger } from './components/AuditLedger';
import type { AuditLogItem } from './components/AuditLedger';
import { LoginPage } from './components/LoginPage';
import { LobbyPage } from './components/LobbyPage';
import { WorkDealModal } from './components/WorkDealModal';
import { MarketCycleTimer } from './components/MarketCycleTimer';
import { useGameHub } from './hooks/useGameHub';
import type { VictoryData } from './hooks/useGameHub';
import { Sparkles } from 'lucide-react';

export function App() {
  // Navigation: 3-page flow ('login' handled by !user, 'lobby' is room/matchmaking, 'game' is board)
  const [currentView, setCurrentView] = useState<'lobby' | 'game'>('lobby');
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer'>('solo');

  // State
  const [user, setUser] = useState<{ id: string; userName: string; email: string; liquidBalance: number } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('metrohunt_token'));
  const [netWorth, setNetWorth] = useState<number>(100_000);
  const [turnsSurvived, setTurnsSurvived] = useState<number>(0);
  const [centralBankRate] = useState<number>(0.05);
  const [targetNetWorth, setTargetNetWorth] = useState<number>(10_000_000);
  const [ownedProperties, setOwnedProperties] = useState<OwnedProperty[]>([]);
  const [marketProperties, setMarketProperties] = useState<MarketProperty[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  
  // UI Modals & Actions
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLoanOpen, setIsLoanOpen] = useState<boolean>(false);
  const [isWorkDealOpen, setIsWorkDealOpen] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [isRenovating, setIsRenovating] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isTakingLoan, setIsTakingLoan] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // SignalR Hub Hook with Lobby & DBD Ready System
  const { 
    isConnected, 
    leaderboard, 
    lobbyState, 
    roomsList,
    currentRoomId,
    joinRoom,
    joinLobby, 
    createRoom,
    setReady, 
    setTargetGoal, 
    startMatch, 
    returnToLobby 
  } = useGameHub({
    token,
    currentUser: user,
    onVictory: (data: VictoryData) => {
      setVictoryData(data);
      showToast(`🏆 Game Over! ${data.winnerName} crossed the target!`);
      fetchAuditLogs();
    },
    onMatchStarted: (data) => {
      setGameMode('multiplayer');
      setCurrentView('game');
      setTargetNetWorth(data.targetGoal);
      showToast(`🚀 Multiplayer Match Started! Target: $${(data.targetGoal / 1_000_000).toLocaleString()}M`);
      fetchUserData();
      fetchMarketProperties();
      fetchAuditLogs();
    },
    onReturnedToLobby: () => {
      setCurrentView('lobby');
      showToast('Returned to Multiplayer Matchmaking Lounge.');
    },
    onPropertyPurchased: (data: any) => {
      showToast(`⚡ Market Shift: ${data.buyerName} acquired ${data.title}!`);
      fetchMarketProperties();
      fetchUserData();
      fetchAuditLogs();
    },
    onTurnAdvanced: (data: any) => {
      showToast(`Turn ${data.round} processed for ${data.playerName} (Net: $${data.netCashflow?.toLocaleString()})`);
      fetchMarketProperties();
      fetchUserData();
      fetchAuditLogs();
    },
    onMarketEvent: (data: any) => {
      showToast(`📢 Macro Alert: ${data.title} - ${data.description}`);
    },
    onPropertyRenovated: (data: any) => {
      showToast(`🔧 Capital Upgrade: ${data.ownerName} renovated ${data.title} to 100%!`);
      fetchMarketProperties();
      fetchUserData();
      fetchAuditLogs();
    },
    onRegulatoryAuditTriggered: (data: any) => {
      showToast(`🚨 Code Violation: ${data.investorName} filed inspection on ${data.targetProperty}! Penalty: $${data.penaltyAmount?.toLocaleString()}`);
      fetchMarketProperties();
      fetchUserData();
      fetchAuditLogs();
    },
    onGameReset: () => {
      setVictoryData(null);
      showToast('Game state has been reset.');
      fetchUserData();
      fetchMarketProperties();
      fetchAuditLogs();
    }
  });

  // Calculate Monthly Cashflow
  const monthlyCashflow = ownedProperties.reduce((sum, p) => sum + p.monthlyRent - Math.round(p.price * 0.006), 0);

  // Fetch Current User
  const fetchUserData = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id,
          userName: data.userName,
          email: data.email,
          liquidBalance: data.liquidBalance
        });
        setNetWorth(data.netWorth);
        setTurnsSurvived(data.turnsSurvived);
        setOwnedProperties(data.ownedProperties || []);

        // Automatically join lobby roster
        joinLobby(data.id, data.userName);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to fetch user state: ', err);
      setUser(null);
    }
  };

  // Fetch Market Properties
  const fetchMarketProperties = async () => {
    try {
      const res = await fetch('/api/market/properties');
      if (res.ok) {
        const data = await res.json();
        setMarketProperties(data);
      }
    } catch (err) {
      console.warn('Failed to fetch properties: ', err);
    }
  };

  // Fetch Session Configuration
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/game/session');
      if (res.ok) {
        const data = await res.json();
        setTargetNetWorth(data.targetNetWorth || 10_000_000);
        if (data.isCompleted) {
          setVictoryData({
            winnerId: data.winnerId,
            winnerName: data.winnerName,
            finalNetWorth: data.winningNetWorth,
            target: data.targetNetWorth,
            totalTurns: data.currentRound
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch session: ', err);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/market/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs: ', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchMarketProperties();
    fetchSession();
    fetchAuditLogs();
  }, [token]);

  // Auth Handlers
  const handleLogin = async (email: string, password = 'password123') => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('metrohunt_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        userName: data.userName,
        email: data.email,
        liquidBalance: data.liquidBalance
      });
      joinLobby(data.userId, data.userName);
      showToast(`Welcome back, ${data.userName}!`);
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid credentials.');
    }
  };

  const handleRegister = async (email: string, regUserName: string, password = 'password123') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userName: regUserName, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('metrohunt_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        userName: data.userName,
        email: data.email,
        liquidBalance: data.liquidBalance
      });
      joinLobby(data.userId, data.userName);
      showToast(`Registered investor profile: ${data.userName}!`);
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed.');
    }
  };

  const handleGoogleLogin = async (email: string, name: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('metrohunt_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        userName: data.userName,
        email: data.email,
        liquidBalance: data.liquidBalance
      });
      joinLobby(data.userId, data.userName);
      showToast(`Authenticated via Google profile: ${data.userName}!`);
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Google authentication failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('metrohunt_token');
    setToken(null);
    setUser(null);
    setCurrentView('lobby');
    showToast('Signed out of investor session.');
  };

  const handleVerifiedLogin = (tokenVal: string, userObj: { id: string; userName: string; email: string; liquidBalance: number }) => {
    localStorage.setItem('metrohunt_token', tokenVal);
    setToken(tokenVal);
    setUser(userObj);
    joinLobby(userObj.id, userObj.userName);
    showToast(`Welcome, ${userObj.userName}! Email verified successfully.`);
  };

  const handleAbandonMatch = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/game/abandon', {
        method: 'POST',
        headers
      });

      if (res.ok) {
        showToast('🏳 Match forfeited. Portfolio liquidated and balance reset.');
        await fetchUserData();
        await fetchMarketProperties();
        await fetchAuditLogs();
        setCurrentView('lobby');
      } else {
        showToast('Could not abandon match.');
      }
    } catch (err) {
      console.warn('Abandon match error:', err);
    }
  };

  // Complete Brokerage Deal Execution
  const handleExecuteDeal = async (tier: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/game/work?tier=${tier}`, {
        method: 'POST',
        headers
      });

      if (res.ok) {
        const data = await res.json();
        setNetWorth(data.newNetWorth);
        if (user) setUser({ ...user, liquidBalance: data.newBalance });
        showToast(`💼 ${data.message}`);
        fetchUserData();
        fetchAuditLogs();
        return {
          success: true,
          earnedAmount: data.earnedAmount,
          dealTitle: data.dealTitle,
          message: data.message
        };
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Deal negotiation failed.');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      showToast(`Deal error: ${err.message}`);
      return { success: false, message: err.message };
    }
  };

  // Turn Progression
  const handleAdvanceTurn = async () => {
    setIsAdvancing(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/game/advance-turn', {
        method: 'POST',
        headers
      });

      if (res.ok) {
        const data = await res.json();
        setNetWorth(data.newNetWorth);
        if (user) setUser({ ...user, liquidBalance: data.newBalance });
        showToast(`Turn ${data.turnNumber} advanced! Net Cashflow: +$${data.netCashflow?.toLocaleString()}`);
        fetchUserData();
        fetchMarketProperties();
      }
    } catch (err: any) {
      showToast(`Error advancing turn: ${err.message}`);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Acquire Property with RowVersion Optimistic Concurrency Token
  const handleBuyProperty = async (propertyId: number, rowVersion: string) => {
    setIsBuying(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/market/buy/${propertyId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rowVersionBase64: rowVersion })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchUserData();
        fetchMarketProperties();
      } else {
        showToast(data.message || 'Transaction aborted by market engine.');
        fetchMarketProperties();
      }
    } catch (err: any) {
      showToast(`Transaction error: ${err.message}`);
    } finally {
      setIsBuying(false);
    }
  };

  // Renovate Property
  const handleRenovateProperty = async (propertyId: number) => {
    setIsRenovating(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/market/renovate/${propertyId}`, {
        method: 'POST',
        headers
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchUserData();
        fetchMarketProperties();
        fetchAuditLogs();
      } else {
        showToast(data.message || 'Renovation declined.');
      }
    } catch (err: any) {
      showToast(`Renovation error: ${err.message}`);
    } finally {
      setIsRenovating(false);
    }
  };

  // Launch Regulatory Safety Audit on Competitor Property
  const handleAuditProperty = async (propertyId: number) => {
    setIsAuditing(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/market/audit/${propertyId}`, {
        method: 'POST',
        headers
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchUserData();
        fetchMarketProperties();
        fetchAuditLogs();
      } else {
        showToast(data.message || 'Regulatory audit aborted.');
      }
    } catch (err: any) {
      showToast(`Audit error: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  // Procedural Property Seeding
  const handleGenerateProperties = async () => {
    try {
      const res = await fetch('/api/market/generate?count=6', { method: 'POST' });
      if (res.ok) {
        showToast('Procedural market generator seeded 6 new properties!');
        fetchMarketProperties();
      }
    } catch (err) {
      showToast('Generation failed.');
    }
  };

  // Commercial Bank Loan
  const handleTakeLoan = async (principal: number) => {
    setIsTakingLoan(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/market/loan', {
        method: 'POST',
        headers,
        body: JSON.stringify({ principal })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        setIsLoanOpen(false);
        fetchUserData();
      } else {
        showToast(data.message || 'Loan request declined.');
      }
    } catch (err: any) {
      showToast(`Credit error: ${err.message}`);
    } finally {
      setIsTakingLoan(false);
    }
  };

  // Target Net Worth Update
  const handleSetTarget = async (newTarget: number) => {
    try {
      const res = await fetch(`/api/game/target?target=${newTarget}`, { method: 'POST' });
      if (res.ok) {
        setTargetNetWorth(newTarget);
        showToast(`Winning target adjusted to $${(newTarget / 1_000_000).toLocaleString()}M`);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Reset Game State
  const handleResetGame = async () => {
    try {
      const res = await fetch('/api/game/reset', { method: 'POST' });
      if (res.ok) {
        setVictoryData(null);
        showToast('All portfolios, loans, and turns reset to Day 1.');
        fetchUserData();
        fetchMarketProperties();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // PAGE 1: AUTHENTICATION / LOGIN PAGE (Dedicated entry gate)
  if (!user || !token) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
        onVerifiedLogin={handleVerifiedLogin}
      />
    );
  }

  // PAGE 2: LOBBY & MATCHMAKING LOUNGE (Dead by Daylight / Multiplayer Room style)
  if (currentView === 'lobby') {
    return (
      <LobbyPage
        currentUser={user}
        lobbyState={lobbyState}
        roomsList={roomsList}
        currentRoomId={currentRoomId}
        isSignalRConnected={isConnected}
        onJoinRoom={joinRoom}
        onCreateRoom={createRoom}
        onSetReady={(isReady) => setReady(isReady)}
        onSetTargetGoal={(target) => {
          setTargetGoal(target);
          handleSetTarget(target);
        }}
        onStartMatch={() => {
          setGameMode('multiplayer');
          startMatch();
        }}
        onStartSolo={(target) => {
          setGameMode('solo');
          setTargetNetWorth(target);
          handleSetTarget(target);
          setCurrentView('game');
        }}
        onLogout={handleLogout}
      />
    );
  }

  // PAGE 3: ACTIVE SIMULATION BOARD (Live trading floor, properties, race tracker)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        userName={user?.userName}
        gameMode={gameMode}
        isSignalRConnected={isConnected}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLoan={() => setIsLoanOpen(true)}
        onWorkDeal={() => setIsWorkDealOpen(true)}
        isWorking={false}
        onAdvanceTurn={handleAdvanceTurn}
        isAdvancing={isAdvancing}
        onResetGame={handleResetGame}
        onLogout={handleLogout}
        onReturnToLobby={() => {
          returnToLobby();
          setCurrentView('lobby');
        }}
        onAbandonMatch={handleAbandonMatch}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Macro Cycle Timer Bar (Live active loading bar!) */}
        <MarketCycleTimer
          currentTurn={turnsSurvived}
          onAdvanceTurn={handleAdvanceTurn}
          isAdvancing={isAdvancing}
          centralBankRate={centralBankRate}
        />

        {/* Live Race Tracker Bar */}
        <RaceTracker
          targetNetWorth={targetNetWorth}
          players={leaderboard}
          currentPlayerId={user?.id}
          gameMode={gameMode}
          currentNetWorth={netWorth}
          currentPropertiesCount={ownedProperties.length}
          onSetTarget={handleSetTarget}
        />

        {/* Financial Metrics Strip */}
        <FinancialMetrics
          liquidBalance={user?.liquidBalance || 100_000}
          netWorth={netWorth}
          monthlyCashflow={monthlyCashflow}
          centralBankRate={centralBankRate}
          turnsSurvived={turnsSurvived}
        />

        {/* Portfolio Table */}
        <PortfolioTable
          properties={ownedProperties}
          liquidBalance={user?.liquidBalance || 100_000}
          onRenovate={handleRenovateProperty}
          isRenovating={isRenovating}
        />

        {/* Marketplace */}
        <Marketplace
          properties={marketProperties}
          liquidBalance={user?.liquidBalance || 100_000}
          currentUserId={user?.id}
          onBuyProperty={handleBuyProperty}
          onAuditProperty={handleAuditProperty}
          onGenerateProperties={handleGenerateProperties}
          isBuying={isBuying}
          isAuditing={isAuditing}
        />

        {/* Audit Ledger */}
        <AuditLedger
          logs={auditLogs}
          onRefresh={fetchAuditLogs}
        />
      </main>

      {/* Live Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono text-slate-100 animate-in slide-in-from-bottom-5">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <WorkDealModal
        isOpen={isWorkDealOpen}
        onClose={() => setIsWorkDealOpen(false)}
        onCompleteDeal={handleExecuteDeal}
        turnsSurvived={turnsSurvived}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />

      <LoanModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
        onTakeLoan={handleTakeLoan}
        isTakingLoan={isTakingLoan}
      />

      <VictoryModal
        victory={victoryData}
        currentUserId={user?.id}
        onResetGame={handleResetGame}
      />
    </div>
  );
}
export default App;
