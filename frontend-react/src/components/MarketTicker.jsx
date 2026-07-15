import React from 'react';

const MarketTicker = () => {
  const items = [
    { symbol: 'AAPL', change: '+1.23%', isBull: true },
    { symbol: 'TSLA', change: '-2.45%', isBull: false },
    { symbol: 'NVDA', change: '+4.17%', isBull: true },
    { symbol: 'TCS.NS', change: '+0.85%', isBull: true },
    { symbol: 'AMZN', change: '-0.89%', isBull: false },
    { symbol: 'MSFT', change: '+0.64%', isBull: true },
    { symbol: 'RELIANCE.NS', change: '+1.32%', isBull: true },
    { symbol: 'GOOGL', change: '+1.88%', isBull: true },
    { symbol: 'META', change: '-1.12%', isBull: false },
    { symbol: 'INFY.NS', change: '+2.10%', isBull: true },
    { symbol: 'JPM', change: '+2.05%', isBull: true },
    { symbol: 'HDFCBANK.NS', change: '-0.43%', isBull: false },
    { symbol: 'AMD', change: '+3.41%', isBull: true },
    { symbol: 'WIPRO.NS', change: '-0.76%', isBull: false },
    { symbol: 'ICICIBANK.NS', change: '+1.54%', isBull: true },
    { symbol: 'NFLX', change: '-0.76%', isBull: false },
  ];

  return (
    <div className="ticker-wrapper" aria-label="Live market ticker">
      <div className="ticker-track" id="ticker-track">
        {/* Render items twice for seamless loop */}
        {[...items, ...items].map((item, index) => (
          <span 
            key={index} 
            className={`ticker-item ${item.isBull ? 'bull' : 'bear'}`}
          >
            {item.symbol} {item.change}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
