import React, { useEffect, useState } from 'react';

const Background = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ["#6366f1", "#06b6d4", "#8b5cf6", "#22d3ee", "#a5b4fc"];
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      newParticles.push({
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          background: color,
          '--dur': `${Math.random() * 15 + 10}s`,
          '--delay': `${Math.random() * -20}s`,
          boxShadow: `0 0 ${size * 3}px currentColor`,
        }
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <>
      <div className="bg-grid" aria-hidden="true"></div>
      <div className="particles" id="particles" aria-hidden="true">
        {particles.map(p => (
          <div key={p.id} className="particle" style={p.style}></div>
        ))}
      </div>
    </>
  );
};

export default Background;
