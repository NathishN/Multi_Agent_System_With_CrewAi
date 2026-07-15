import React from 'react';

const History = ({ history, onClear, onLoadHistoryItem }) => {
  return (
    <section className="history-section" aria-label="Analysis history">
      <div className="history-header-row">
        <h2 className="history-title">Recent Analyses</h2>
        <button 
          type="button" 
          className="clear-history-btn" 
          onClick={onClear} 
          aria-label="Clear history"
        >
          Clear all
        </button>
      </div>
      <div className="history-list" role="list">
        {history.length === 0 ? (
          <p className="history-empty">No analyses yet. Run your first query above.</p>
        ) : (
          history.map((item, index) => (
            <div 
              key={index} 
              className="history-card" 
              role="listitem"
              onClick={() => onLoadHistoryItem(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="hc-header">
                <span className="hc-stock">{item.stockSymbol}</span>
                <span className="hc-time">{item.time}</span>
              </div>
              <div className="hc-body">
                <span className={`hc-badge ${item.decision.toLowerCase()}`}>
                  {item.decision}
                </span>
                <span className="hc-conf">Conf: {item.confidence}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default History;
