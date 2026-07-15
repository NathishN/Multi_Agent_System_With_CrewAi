import React, { useState } from 'react';

const Portfolio = ({ portfolioData, onRefresh, onReset, onClosePosition }) => {
  const [activeTab, setActiveTab] = useState('positions');

  const { cash, invested, pnl, winRate, positions, tradeHistory, winStats } = portfolioData;

  return (
    <section className="portfolio-section" aria-label="Paper trading portfolio">
      {/* Header */}
      <div className="portfolio-header">
        <div className="portfolio-title-row">
          <div className="portfolio-icon">📊</div>
          <div>
            <h2 className="portfolio-title">Paper Portfolio</h2>
            <p className="portfolio-sub">Simulated trading based on AI signals</p>
          </div>
        </div>
        <div className="portfolio-actions">
          <button type="button" className="btn-refresh-portfolio" onClick={onRefresh} title="Refresh live prices" aria-label="Refresh portfolio prices">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
            Refresh
          </button>
          <button type="button" className="btn-reset-portfolio" onClick={onReset} aria-label="Reset portfolio">Reset</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="portfolio-stats-grid">
        <div className="stat-card">
          <span className="stat-label">💵 Cash</span>
          <span className="stat-value">${cash.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">📦 Invested</span>
          <span className="stat-value">${invested.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">📈 Total P&amp;L</span>
          <span className="stat-value">${pnl.toFixed(2)}</span>
        </div>
        <div className="stat-card winrate-stat">
          <span className="stat-label">🏆 Win Rate</span>
          <span className="stat-value">{winRate || '—'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="portfolio-tabs" role="tablist" aria-label="Portfolio views">
        <button 
          type="button" 
          className={`ptab ${activeTab === 'positions' ? 'active' : ''}`} 
          role="tab" 
          aria-selected={activeTab === 'positions'}
          onClick={() => setActiveTab('positions')}
        >Open Positions</button>
        <button 
          type="button" 
          className={`ptab ${activeTab === 'winrate' ? 'active' : ''}`} 
          role="tab" 
          aria-selected={activeTab === 'winrate'}
          onClick={() => setActiveTab('winrate')}
        >AI Win Rate</button>
        <button 
          type="button" 
          className={`ptab ${activeTab === 'history' ? 'active' : ''}`} 
          role="tab" 
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >Trade History</button>
      </div>

      {/* Panel: Open Positions */}
      {activeTab === 'positions' && (
        <div role="tabpanel">
          {positions.length === 0 ? (
            <div className="portfolio-empty">
              <span className="empty-icon">📭</span>
              <p>No open positions. Run an analysis and click <strong>Trade</strong> to paper trade.</p>
            </div>
          ) : (
            <div className="positions-table-wrap">
              <table className="positions-table" aria-label="Open positions">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Direction</th>
                    <th>Qty</th>
                    <th>Entry</th>
                    <th>Current</th>
                    <th>Unreal. P&amp;L</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => (
                    <tr key={i}>
                      <td>{pos.symbol}</td>
                      <td>{pos.direction === 'buy' ? '📈 Long' : '📉 Short'}</td>
                      <td>{pos.qty}</td>
                      <td>${pos.entryPrice.toFixed(2)}</td>
                      <td>${pos.currentPrice.toFixed(2)}</td>
                      <td className={pos.unrealizedPnl >= 0 ? 'profit' : 'loss'}>
                        ${pos.unrealizedPnl.toFixed(2)}
                      </td>
                      <td>
                        <button className="btn-close-pos" onClick={() => onClosePosition(i)}>Close</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Panel: AI Win Rate */}
      {activeTab === 'winrate' && (
        <div role="tabpanel">
          {winStats.total === 0 ? (
            <div className="portfolio-empty">
              <span className="empty-icon">🏁</span>
              <p>No closed trades yet. Close a position to start tracking the AI's accuracy.</p>
            </div>
          ) : (
            <div className="winrate-board">
              <div className="winrate-overall">
                <div className="winrate-circle">
                  <svg viewBox="0 0 36 36" className="winrate-donut" aria-hidden="true">
                    <circle className="donut-track" cx="18" cy="18" r="15.915" fill="none" strokeWidth="3"/>
                    <circle 
                      className="donut-fill" 
                      cx="18" cy="18" r="15.915" fill="none" strokeWidth="3"
                      strokeDasharray={`${winStats.pct} 100`} strokeDashoffset="25"
                    />
                  </svg>
                  <div className="winrate-circle-inner">
                    <span className="winrate-pct">{winStats.pct}%</span>
                    <span className="winrate-lbl">AI Accuracy</span>
                  </div>
                </div>
                <div className="winrate-legend">
                  <div className="wrl-row">
                    <span className="wrl-dot buy"></span>
                    <span className="wrl-label">Buy Signals</span>
                    <span className="wrl-val">{winStats.buyW}W / {winStats.buyL}L</span>
                  </div>
                  <div className="wrl-row">
                    <span className="wrl-dot sell"></span>
                    <span className="wrl-label">Sell Signals</span>
                    <span className="wrl-val">{winStats.sellW}W / {winStats.sellL}L</span>
                  </div>
                  <div className="wrl-row">
                    <span className="wrl-dot hold"></span>
                    <span className="wrl-label">Hold Signals</span>
                    <span className="wrl-val">{winStats.holdW}W / {winStats.holdL}L</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Panel: Trade History */}
      {activeTab === 'history' && (
        <div role="tabpanel">
          {tradeHistory.length === 0 ? (
            <div className="portfolio-empty">
              <span className="empty-icon">📜</span>
              <p>No closed trades yet.</p>
            </div>
          ) : (
            <div className="trade-log-wrap">
              <div className="trade-log" role="list">
                {tradeHistory.map((trade, i) => (
                  <div key={i} className="trade-log-item">
                    <div className="tli-header">
                      <span className="tli-symbol">{trade.symbol}</span>
                      <span className="tli-time">{trade.time}</span>
                    </div>
                    <div className="tli-details">
                      <span>{trade.direction === 'buy' ? 'Long' : 'Short'} {trade.qty} @ ${trade.entryPrice.toFixed(2)}</span>
                      <span>Closed @ ${trade.closePrice.toFixed(2)}</span>
                      <span className={trade.pnl >= 0 ? 'profit' : 'loss'}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Portfolio;
