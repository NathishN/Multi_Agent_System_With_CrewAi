import React, { useState } from 'react';

const AnalysisForm = ({ onAnalyze }) => {
  const [market, setMarket] = useState('US');
  const [stockSymbol, setStockSymbol] = useState('');

  const usChips = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'];
  const indiaChips = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'WIPRO'];

  const handleChipClick = (symbol) => {
    setStockSymbol(symbol);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stockSymbol.trim()) {
      onAnalyze(stockSymbol.trim(), market);
    }
  };

  return (
    <form id="analyze-form" className="form" onSubmit={handleSubmit} noValidate>
      {/* Market Toggle */}
      <div className="market-toggle-row">
        <span className="market-toggle-label">Market</span>
        <div className="market-toggle" id="market-toggle" role="group" aria-label="Select market">
          <button 
            type="button" 
            className={`market-btn ${market === 'US' ? 'active' : ''}`} 
            onClick={() => setMarket('US')}
            aria-pressed={market === 'US'}
          >
            <span className="market-flag">🇺🇸</span>
            <span>US</span>
          </button>
          <button 
            type="button" 
            className={`market-btn ${market === 'India' ? 'active' : ''}`} 
            onClick={() => setMarket('India')}
            aria-pressed={market === 'India'}
          >
            <span className="market-flag">🇮🇳</span>
            <span>India</span>
          </button>
        </div>
      </div>

      <label htmlFor="stock-input" className="form-label">Stock Symbol or Company Name</label>
      <div className="input-row">
        <div className="input-wrapper">
          <span className="input-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </span>
          <input
            id="stock-input"
            name="stock"
            type="text"
            placeholder="e.g. AAPL, TSLA, NVIDIA"
            autoComplete="off"
            spellCheck="false"
            required
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
          />
          {stockSymbol && (
            <button 
              type="button" 
              className="input-clear" 
              onClick={() => setStockSymbol('')}
              aria-label="Clear input" 
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" id="submit-btn" className="btn-analyze">
          <span className="btn-text">Analyze</span>
          <span className="btn-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      {/* Quick-pick chips */}
      {market === 'US' ? (
        <div className="chips-row" role="group" aria-label="Quick pick US stocks">
          <span className="chips-label">Try:</span>
          {usChips.map(stock => (
            <button key={stock} type="button" className="chip" onClick={() => handleChipClick(stock)}>
              {stock}
            </button>
          ))}
        </div>
      ) : (
        <div className="chips-row" role="group" aria-label="Quick pick Indian stocks">
          <span className="chips-label">Try:</span>
          {indiaChips.map(stock => (
            <button key={stock} type="button" className="chip chip-india" onClick={() => handleChipClick(stock)}>
              {stock}
            </button>
          ))}
        </div>
      )}

      <p className="hint">⏱ Analysis takes 1–3 minutes while agents run in parallel.</p>
    </form>
  );
};

export default AnalysisForm;
