import React from 'react';

const Results = ({ result, onPaperTrade }) => {
  if (!result) return null;

  const getDecisionIcon = (decision) => {
    switch(decision) {
      case 'buy': return '📈';
      case 'sell': return '📉';
      case 'hold': return '⚖️';
      default: return '';
    }
  };

  const decisionClass = result.decision.toLowerCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(result.reasoning);
  };

  return (
    <section className="results" aria-live="polite">
      <div className="results-header">
        <div className="decision-badge-wrap">
          <div className={`decision-glow ${decisionClass}`} aria-hidden="true"></div>
          <div className={`decision-badge ${decisionClass}`}>
            <span className="decision-icon" aria-hidden="true">
              {getDecisionIcon(decisionClass)}
            </span>
            <span className="decision-text">{result.decision}</span>
          </div>
        </div>
        <div className="results-meta">
          <p className="stock-label-display">{result.stockSymbol}</p>
          <p className="analysis-time">{result.time}</p>
        </div>
      </div>

      <div className="confidence-row">
        <span className="confidence-label">Confidence Signal</span>
        <div className="confidence-bar-track">
          <div 
            className={`confidence-bar-fill ${decisionClass}`} 
            style={{ width: `${result.confidence}%` }}
          ></div>
        </div>
        <span className="confidence-pct">{result.confidence}%</span>
      </div>

      <div className="why-card">
        <div className="why-header">
          <span className="why-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Agent Reasoning
          </span>
          <button type="button" className="copy-btn" onClick={handleCopy} title="Copy reasoning to clipboard" aria-label="Copy reasoning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <p className="why-text">{result.reasoning}</p>
      </div>

      <div className="disclaimer">
        ⚠️ For educational purposes only — not financial advice.
      </div>

      {/* Paper Trade CTA */}
      <div className="paper-trade-cta">
        <div className="ptc-left">
          <span className="ptc-icon">📈</span>
          <div>
            <p className="ptc-title">Paper Trade this Signal</p>
            <p className="ptc-sub">Simulate trading based on the AI recommendation</p>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-paper-trade" 
          onClick={() => onPaperTrade(result)} 
          aria-label="Open paper trade dialog"
        >
          <span>Trade</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
};

export default Results;
