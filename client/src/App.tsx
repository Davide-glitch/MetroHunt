import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RaceTracker } from './components/RaceTracker';
import type { PlayerScore } from './components/RaceTracker';
import { FinancialMetrics } from './components/FinancialMetrics';
import { PortfolioTable } from './components/PortfolioTable';
import type { OwnedProperty } from './components/PortfolioTable';
import { Marketplace } from './components/Marketplace';
import type { MarketProperty } from './components/Marketplace';
import { LoanModal } from './components/LoanModal';
import { VictoryModal } from './components/VictoryModal';
import type { VictoryData } from './components/VictoryModal';
import { LobbyPage } from './components/LobbyPage';
import { WorkDealModal } from './components/WorkDealModal';
import { MarketCycleTimer } from './components/MarketCycleTimer';
import { Sparkles } from 'lucide-react';

export function App() {
  // Navigation: Starts directly at the Singleplayer Lobby (Mission Control)
  const [currentView, setCurrentView] = useState<'lobby' | 'game'>('lobby');

  // Authentication & Session State
  const [user, setUser] = useState<{ id: string; userName: string; email: string; liquidBalance: number } | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('metrohunt_token'));

  // Financial Simulation State
  const [netWorth, setNetWorth] = useState<number>(100_000);
  const [turnsSurvived, setTurnsSurvived] = useState<number>(0);
  const [centralBankRate] = useState<number>(0.05);
  const [targetNetWorth, setTargetNetWorth] = useState<number>(10_000_000);
  const [ownedProperties, setOwnedProperties] = useState<OwnedProperty[]>([]);
  const [marketProperties, setMarketProperties] = useState<MarketProperty[]>([]);
  
  // UI Modals & Actions
  const [isLoanOpen, setIsLoanOpen] = useState<boolean>(false);
  const [isWorkDealOpen, setIsWorkDealOpen] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [isRenovating, setIsRenovating] = useState<boolean>(false);
  const [isTakingLoan, setIsTakingLoan] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Estimated monthly operating cash flow before financing costs.
  const monthlyCashflow = ownedProperties.reduce(
    (sum, property) => sum + property.monthlyRent * 0.95 - property.price * 0.01 / 12,
    0
  );



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

        if (data.netWorth >= targetNetWorth && targetNetWorth > 0 && data.turnsSurvived > 0 && !victoryData) {
          setVictoryData({
            winnerId: data.id,
            winnerName: data.userName,
            finalNetWorth: data.netWorth,
            totalTurns: data.turnsSurvived,
            target: targetNetWorth
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch user state: ', err);
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

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      if (token) {
        await fetchUserData();
        await fetchMarketProperties();
        await fetchSession();
      }
    };
    init();
  }, [token]);

  // Start New Career from Lobby with Name & Password
  const handleStartCareer = async (chosenName: string, pass: string, chosenTarget: number) => {
    try {
      const res = await fetch('/api/auth/investor-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: chosenName, password: pass, isNewCareer: true })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Could not initialize career session.');
        return false;
      }

      localStorage.setItem('metrohunt_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        userName: data.userName,
        email: data.email,
        liquidBalance: data.liquidBalance
      });

      await handleSetTarget(chosenTarget);
      await fetchUserData();
      await fetchMarketProperties();
      setCurrentView('game');
      showToast(data.message);
      return true;
    } catch (err: any) {
      showToast(`Connection error: ${err.message}`);
      return false;
    }
  };

  // Sign In & Resume Saved Career with Name & Password
  const handleResumeSavedCareer = async (chosenName: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/investor-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: chosenName, password: pass, isNewCareer: false })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Incorrect investor name or password.');
        return false;
      }

      localStorage.setItem('metrohunt_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        userName: data.userName,
        email: data.email,
        liquidBalance: data.liquidBalance
      });

      await fetchUserData();
      await fetchMarketProperties();
      setCurrentView('game');
      showToast(data.message);
      return true;
    } catch (err: any) {
      showToast(`Sign in error: ${err.message}`);
      return false;
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

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || data?.title || 'The market could not advance. Try again.');
      if (!data || typeof data.turnNumber !== 'number' || typeof data.newBalance !== 'number') {
        throw new Error('Incomplete response from market engine.');
      }

      setTurnsSurvived(turn => turn + 1);
      setNetWorth(data.newNetWorth);
      if (user) setUser({ ...user, liquidBalance: data.newBalance });
      showToast(`Market cycle ${turnsSurvived + 1} complete · Net cash flow ${data.netCashflow >= 0 ? '+' : ''}$${data.netCashflow?.toLocaleString()}`);
      
      // Check win condition
      if (data.newNetWorth >= targetNetWorth && targetNetWorth > 0) {
        setVictoryData({
          winnerId: user?.id || 'player',
          winnerName: user?.userName || 'You',
          finalNetWorth: data.newNetWorth,
          totalTurns: turnsSurvived + 1,
          target: targetNetWorth
        });
      }

      fetchUserData();
      fetchMarketProperties();
    } catch (err: any) {
      const message = err instanceof TypeError
        ? 'Cannot reach the Metro Hunt API on port 5000. Make sure the server is running, then retry.'
        : err.message;
      showToast(`Market update failed: ${message}`);
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

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        showToast(data.message);
        fetchUserData();
        fetchMarketProperties();
      } else {
        showToast(data?.message || 'Transaction aborted by market engine.');
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

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        showToast(data.message);
        fetchUserData();
        fetchMarketProperties();
      } else {
        showToast(data?.message || 'Renovation declined.');
      }
    } catch (err: any) {
      showToast(`Renovation error: ${err.message}`);
    } finally {
      setIsRenovating(false);
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
        showToast('All portfolios, loans, and turns reset to initial state.');
        fetchUserData();
        fetchMarketProperties();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Abandon Career Session
  const handleAbandonCareer = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/game/abandon', { method: 'POST', headers });
      setVictoryData(null);
      showToast('🏳 Career forfeited. Holdings returned to market.');
      await fetchUserData();
      await fetchMarketProperties();
      setCurrentView('lobby');
    } catch (err) {
      console.warn('Abandon error:', err);
      setCurrentView('lobby');
    }
  };

  // Current player's progress toward their selected net-worth goal.
  const soloLeaderboard: PlayerScore[] = [
    {
      playerId: user?.id || 'player',
      playerName: user?.userName || 'You',
      netWorth: netWorth,
      propertiesOwned: ownedProperties.length,
      isEliminated: false
    }
  ];

  // VIEW 1: SINGLEPLAYER LOBBY PAGE (Mission Control / Starting Gate)
  if (currentView === 'lobby') {
    return (
      <>
        <LobbyPage
          initialPlayerName={user?.userName && user.userName !== 'Investor' ? user.userName : ''}
          initialTarget={targetNetWorth}
          onStartCareer={handleStartCareer}
          onResumeSavedCareer={handleResumeSavedCareer}
          onBackToGame={() => setCurrentView('game')}
          hasActiveCareer={!!user && (turnsSurvived > 0 || ownedProperties.length > 0)}
          onNotify={showToast}
        />
        {/* Live Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono text-slate-100 animate-in slide-in-from-bottom-5">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // VIEW 2: ACTIVE PROPERTY INVESTMENT SIMULATION
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        userName={user?.userName || 'You'}
        onOpenLobby={() => setCurrentView('lobby')}
        onAbandon={handleAbandonCareer}
        onOpenLoan={() => setIsLoanOpen(true)}
        onWorkDeal={() => setIsWorkDealOpen(true)}
        isWorking={false}
        onAdvanceTurn={handleAdvanceTurn}
        isAdvancing={isAdvancing}
        onResetGame={handleResetGame}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Macro Cycle Timer Bar */}
        <MarketCycleTimer
          currentTurn={turnsSurvived}
          onAdvanceTurn={handleAdvanceTurn}
          isAdvancing={isAdvancing}
          centralBankRate={centralBankRate}
        />

        {/* Net-worth goal progress */}
        <RaceTracker
          targetNetWorth={targetNetWorth}
          players={soloLeaderboard}
          currentPlayerId={user?.id || 'davide'}
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
          onGenerateProperties={handleGenerateProperties}
          isBuying={isBuying}
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
