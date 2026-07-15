import React, { useState } from 'react';

const TradeModal = ({ isOpen, onClose, stockSymbol, entryPrice, availableCash, onConfirm }) => {
  const [direction, setDirection] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const cost = quantity * (entryPrice || 0);
    if (direction === 'buy' && cost > availableCash) {
      setError('Insufficient cash for this trade.');
      return;
    }
    setError('');
    onConfirm({ direction, quantity, cost });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title" id="modal-title">Paper Trade</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="modal-stock-info">
          <div className="modal-ticker">{stockSymbol || '—'}</div>
          <div className="modal-price-wrap">
            <span className="modal-price-label">Entry Price</span>
            <span className="modal-price">{entryPrice ? `$${entryPrice.toFixed(2)}` : '—'}</span>
          </div>
        </div>

        <div className="modal-direction-row">
          <span className="modal-dir-label">Direction</span>
          <div className="modal-dir-btns" role="group" aria-label="Trade direction">
            <button 
              type="button" 
              className={`dir-btn buy ${direction === 'buy' ? 'active' : ''}`}
              onClick={() => setDirection('buy')}
            >
              📈 Buy (Long)
            </button>
            <button 
              type="button" 
              className={`dir-btn sell ${direction === 'sell' ? 'active' : ''}`}
              onClick={() => setDirection('sell')}
            >
              📉 Sell (Short)
            </button>
          </div>
        </div>

        <div className="modal-qty-row">
          <label htmlFor="modal-qty" className="modal-qty-label">Quantity (shares)</label>
          <div className="modal-qty-controls">
            <button 
              type="button" 
              className="qty-btn" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
            >−</button>
            <input 
              type="number" 
              id="modal-qty" 
              min="1" 
              max="1000" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="modal-qty-input" 
            />
            <button 
              type="button" 
              className="qty-btn" 
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        <div className="modal-cost-row">
          <span className="modal-cost-label">Total Cost</span>
          <span className="modal-cost">${(quantity * (entryPrice || 0)).toFixed(2)}</span>
        </div>
        <div className="modal-cash-row">
          <span className="modal-cost-label">Available Cash</span>
          <span className="modal-cash-avail">${availableCash.toFixed(2)}</span>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="modal-confirm" onClick={handleConfirm}>Confirm Trade</button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
