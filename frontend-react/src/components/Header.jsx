import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-row">
        <div className="logo-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 20 L10 12 L16 16 L22 6" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="22" cy="6" r="2.5" fill="url(#grad)"/>
            <defs>
              <linearGradient id="grad" x1="4" y1="20" x2="22" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="logo-text">StockMind <span className="logo-ai">AI</span></span>
      </div>
      <div className="badge-row">
        <span className="badge">CrewAI</span>
        <span className="badge">Multi-Agent</span>
        <span className="badge badge-live"><span className="dot"></span>Live Analysis</span>
      </div>
      <h1>AI-Powered Trading Intelligence</h1>
      <p className="subtitle">
        Four specialized AI agents — <strong>Researcher</strong>, <strong>Analyst</strong>,
        <strong>Risk Reviewer</strong>, and <strong>Trader</strong> — collaborate in real-time
        to deliver confident <strong>Buy</strong>, <strong>Sell</strong>, or <strong>Hold</strong> signals.
      </p>

      {/* Agent pipeline visualization */}
      <div className="pipeline" aria-label="Agent pipeline">
        <div className="pipeline-step" id="pipe-research">
          <div className="pipe-icon">🔍</div>
          <div className="pipe-label">Research</div>
        </div>
        <div className="pipe-connector" aria-hidden="true"></div>
        <div className="pipeline-step" id="pipe-analyst">
          <div className="pipe-icon">📊</div>
          <div className="pipe-label">Analyst</div>
        </div>
        <div className="pipe-connector" aria-hidden="true"></div>
        <div className="pipeline-step" id="pipe-risk">
          <div className="pipe-icon">🛡️</div>
          <div className="pipe-label">Risk</div>
        </div>
        <div className="pipe-connector" aria-hidden="true"></div>
        <div className="pipeline-step" id="pipe-trader">
          <div className="pipe-icon">⚡</div>
          <div className="pipe-label">Trader</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
