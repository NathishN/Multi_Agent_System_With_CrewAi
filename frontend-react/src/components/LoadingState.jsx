import React from 'react';

const LoadingState = ({ isLoading, loadingText, loadingSub, progress, agentStatuses }) => {
  if (!isLoading) return null;

  return (
    <div className="loading" aria-live="polite">
      <div className="loading-inner">
        <div className="orbit-spinner" aria-hidden="true">
          <div className="orbit-ring ring1"></div>
          <div className="orbit-ring ring2"></div>
          <div className="orbit-ring ring3"></div>
          <div className="orbit-core"></div>
        </div>
        <div className="loading-text-col">
          <p className="loading-title">{loadingText || "Agents are working…"}</p>
          <p className="loading-sub">{loadingSub || "Initializing research pipeline"}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="agent-status-grid">
        <div className="agent-card" aria-label="Research agent status">
          <span className="agt-icon">🔍</span>
          <span className="agt-name">Research Agent</span>
          <span className={`agt-state ${agentStatuses.research}`}>{agentStatuses.research}</span>
        </div>
        <div className="agent-card" aria-label="Analyst agent status">
          <span className="agt-icon">📊</span>
          <span className="agt-name">Analyst Agent</span>
          <span className={`agt-state ${agentStatuses.analyst}`}>{agentStatuses.analyst}</span>
        </div>
        <div className="agent-card" aria-label="Risk agent status">
          <span className="agt-icon">🛡️</span>
          <span className="agt-name">Risk Reviewer</span>
          <span className={`agt-state ${agentStatuses.risk}`}>{agentStatuses.risk}</span>
        </div>
        <div className="agent-card" aria-label="Trader agent status">
          <span className="agt-icon">⚡</span>
          <span className="agt-name">Trader Agent</span>
          <span className={`agt-state ${agentStatuses.trader}`}>{agentStatuses.trader}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
