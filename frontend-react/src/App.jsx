import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Background from './components/Background';
import MarketTicker from './components/MarketTicker';
import AnalysisForm from './components/AnalysisForm';
import LoadingState from './components/LoadingState';
import Results from './components/Results';
import History from './components/History';
import Portfolio from './components/Portfolio';
import TradeModal from './components/TradeModal';

const API_BASE = '/api';
const HISTORY_KEY = 'stockmind_history';
const PORTFOLIO_KEY = 'stockmind_portfolio';

const initialPortfolio = {
  cash: 10000.0,
  invested: 0.0,
  pnl: 0.0,
  winRate: '—',
  positions: [],
  tradeHistory: [],
  winStats: { total: 0, pct: 0, buyW: 0, buyL: 0, sellW: 0, sellL: 0, holdW: 0, holdL: 0 }
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Agents are working…');
  const [loadingSub, setLoadingSub] = useState('Initializing research pipeline');
  const [progress, setProgress] = useState(0);
  const [agentStatuses, setAgentStatuses] = useState({
    research: 'idle', analyst: 'idle', risk: 'idle', trader: 'idle'
  });
  
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState(null);

  // Load history and portfolio on mount
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY));
      if (savedHistory) setHistory(savedHistory);
      
      const savedPortfolio = JSON.parse(localStorage.getItem(PORTFOLIO_KEY));
      if (savedPortfolio) setPortfolio(savedPortfolio);
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
  }, []);

  // Save history to local storage when changed
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Save portfolio to local storage when changed
  useEffect(() => {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  const handleAnalyze = async (stockSymbol, market) => {
    setError('');
    setResult(null);
    setIsLoading(true);
    setProgress(18);
    setAgentStatuses({ research: 'running', analyst: 'idle', risk: 'idle', trader: 'idle' });
    setLoadingText('Agents are working…');
    setLoadingSub('Research agent scanning news & market data');

    // Simulate Agent Sequence for UI effect
    setTimeout(() => {
      setAgentStatuses({ research: 'done', analyst: 'running', risk: 'idle', trader: 'idle' });
      setProgress(42);
      setLoadingText('Crunching numbers…');
      setLoadingSub('Analyst agent evaluating financial metrics');
    }, 2000);

    let resolvedInput = stockSymbol;
    if (market === "India") {
      const upper = stockSymbol.toUpperCase();
      if (!upper.endsWith(".NS") && !upper.endsWith(".BO")) {
        resolvedInput = upper + ".NS";
      } else {
        resolvedInput = upper;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: resolvedInput }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Request failed.");
      }

      setAgentStatuses({ research: 'done', analyst: 'done', risk: 'done', trader: 'done' });
      setProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        const decision = (data.decision || "hold").toLowerCase();
        const newResult = {
          stockSymbol: resolvedInput.toUpperCase(),
          decision: decision.toUpperCase(),
          confidence: 85, // Dummy calculated
          reasoning: data.why || "No reasoning provided.",
          time: new Date().toLocaleTimeString(),
          price: 150.0 // Mock price
        };
        setResult(newResult);
        setHistory(prev => [newResult, ...prev].slice(0, 10));
      }, 500);

    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Something went wrong. Check that the API is running.");
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleLoadHistoryItem = (item) => {
    setResult(item);
  };

  const handleOpenPaperTrade = (res) => {
    setTradeTarget(res);
    setIsTradeModalOpen(true);
  };

  const handleConfirmTrade = ({ direction, quantity, cost }) => {
    // Add position logic here
    const newPos = {
      symbol: tradeTarget.stockSymbol,
      direction,
      qty: quantity,
      entryPrice: tradeTarget.price,
      currentPrice: tradeTarget.price,
      unrealizedPnl: 0
    };
    
    setPortfolio(prev => ({
      ...prev,
      cash: prev.cash - cost,
      invested: prev.invested + cost,
      positions: [...prev.positions, newPos]
    }));
    
    setIsTradeModalOpen(false);
  };

  const handleClosePosition = (index) => {
    setPortfolio(prev => {
      const pos = prev.positions[index];
      const newPositions = prev.positions.filter((_, i) => i !== index);
      
      // Calculate PNL based on direction
      const diff = pos.currentPrice - pos.entryPrice;
      const rawPnl = pos.direction === 'buy' ? diff : -diff;
      const tradePnl = rawPnl * pos.qty;
      
      const newCash = prev.cash + (pos.entryPrice * pos.qty) + tradePnl;
      const newInvested = prev.invested - (pos.entryPrice * pos.qty);
      const totalPnl = prev.pnl + tradePnl;
      
      const trade = {
        symbol: pos.symbol,
        time: new Date().toLocaleTimeString(),
        direction: pos.direction,
        qty: pos.qty,
        entryPrice: pos.entryPrice,
        closePrice: pos.currentPrice,
        pnl: tradePnl
      };
      
      // Update WinStats
      const newWinStats = { ...prev.winStats };
      newWinStats.total += 1;
      
      const isWin = tradePnl > 0;
      if (pos.direction === 'buy') {
        if (isWin) newWinStats.buyW++; else newWinStats.buyL++;
      } else {
        if (isWin) newWinStats.sellW++; else newWinStats.sellL++;
      }
      
      const wins = newWinStats.buyW + newWinStats.sellW + newWinStats.holdW;
      newWinStats.pct = Math.round((wins / newWinStats.total) * 100);
      
      return {
        ...prev,
        cash: newCash,
        invested: Math.max(0, newInvested),
        pnl: totalPnl,
        winRate: `${newWinStats.pct}%`,
        positions: newPositions,
        tradeHistory: [trade, ...prev.tradeHistory],
        winStats: newWinStats
      };
    });
  };

  const handleRefreshPortfolio = () => {
    // Implement refresh logic
  };

  const handleResetPortfolio = () => {
    setPortfolio(initialPortfolio);
  };

  return (
    <>
      <Background />
      <MarketTicker />
      
      <div className="page">
        <Header />
        
        <main className="card" id="main-card">
          <AnalysisForm onAnalyze={handleAnalyze} />
          
          {error && <div className="error-box" role="alert">{error}</div>}
          
          <LoadingState 
            isLoading={isLoading} 
            loadingText={loadingText} 
            loadingSub={loadingSub} 
            progress={progress} 
            agentStatuses={agentStatuses} 
          />
          
          {!isLoading && result && (
            <Results result={result} onPaperTrade={handleOpenPaperTrade} />
          )}
        </main>
        
        <History 
          history={history} 
          onClear={handleClearHistory} 
          onLoadHistoryItem={handleLoadHistoryItem} 
        />
        
        <Portfolio 
          portfolioData={portfolio} 
          onRefresh={handleRefreshPortfolio} 
          onReset={handleResetPortfolio} 
          onClosePosition={handleClosePosition}
        />
        
        <footer className="footer">
          <p>Built with <span className="heart">♥</span> using <strong>CrewAI</strong> · <strong>FastAPI</strong> · <strong>React</strong></p>
          <p className="footer-sub">For educational purposes only — not financial advice.</p>
        </footer>
      </div>

      {tradeTarget && (
        <TradeModal 
          isOpen={isTradeModalOpen} 
          onClose={() => setIsTradeModalOpen(false)} 
          stockSymbol={tradeTarget.stockSymbol}
          entryPrice={tradeTarget.price}
          availableCash={portfolio.cash}
          onConfirm={handleConfirmTrade}
        />
      )}
    </>
  );
}

export default App;
