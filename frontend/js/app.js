/* ============================================================
   StockMind AI – app.js
   Handles API calls, UI state, animations, and history.
   ============================================================ */

"use strict";

// ── Configuration ────────────────────────────────────────────
const API_BASE = "/api";
const HISTORY_KEY = "stockmind_history";
const MAX_HISTORY = 10;

// ── DOM refs ─────────────────────────────────────────────────
const form         = document.getElementById("analyze-form");
const stockInput   = document.getElementById("stock-input");
const submitBtn    = document.getElementById("submit-btn");
const clearBtn     = document.getElementById("clear-btn");
const loadingEl    = document.getElementById("loading");
const resultsEl    = document.getElementById("results");
const errorBox     = document.getElementById("error-box");
const copyBtn      = document.getElementById("copy-btn");
const historyList  = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const clearHist    = document.getElementById("clear-history-btn");

// Loading sub-elements
const loadingTitle  = document.getElementById("loading-title");
const loadingSub    = document.getElementById("loading-sub");
const progressFill  = document.getElementById("progress-fill");

// Result sub-elements
const decisionBadge   = document.getElementById("decision-badge");
const decisionIcon    = document.getElementById("decision-icon");
const decisionText    = document.getElementById("decision-text");
const decisionGlow    = document.getElementById("decision-glow");
const stockLabelDisp  = document.getElementById("stock-label-display");
const analysisTime    = document.getElementById("analysis-time");
const confidenceFill  = document.getElementById("confidence-fill");
const confidencePct   = document.getElementById("confidence-pct");
const whyText         = document.getElementById("why-text");

// Pipeline steps
const pipeSteps = {
  research: document.getElementById("pipe-research"),
  analyst:  document.getElementById("pipe-analyst"),
  risk:     document.getElementById("pipe-risk"),
  trader:   document.getElementById("pipe-trader"),
};

// Agent cards in loading section
const agtCards = {
  research: document.getElementById("agt-research"),
  analyst:  document.getElementById("agt-analyst"),
  risk:     document.getElementById("agt-risk"),
  trader:   document.getElementById("agt-trader"),
};

// ── Particle initialization ───────────────────────────────────
(function initParticles() {
  const container = document.getElementById("particles");
  const colors = ["#6366f1", "#06b6d4", "#8b5cf6", "#22d3ee", "#a5b4fc"];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --dur: ${Math.random() * 15 + 10}s;
      --delay: ${Math.random() * -20}s;
      box-shadow: 0 0 ${size * 3}px currentColor;
    `;
    container.appendChild(p);
  }
})();

// ── Utilities ─────────────────────────────────────────────────
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// Derive a simple "confidence" score from the why text and decision
function deriveConfidence(decision, why) {
  const text = why.toLowerCase();
  const strongWords = ["strong", "clearly", "definitely", "significantly", "highly",
                       "evident", "substantial", "certainly", "robust", "bullish",
                       "bearish", "outstanding", "exceptional", "critical"];
  const weakWords   = ["uncertain", "mixed", "unclear", "volatile", "risk",
                       "cautious", "moderate", "slight", "minor", "limited"];
  let score = 65;
  strongWords.forEach(w => { if (text.includes(w)) score += 4; });
  weakWords.forEach(w   => { if (text.includes(w)) score -= 3; });
  return Math.min(97, Math.max(42, score));
}

// ── Clear button ──────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  stockInput.value = "";
  stockInput.focus();
});

// ── Quick-pick chips ──────────────────────────────────────────
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    stockInput.value = chip.dataset.stock;
    stockInput.focus();
  });
});

// ── Loading animation sequence ────────────────────────────────
let agentTimers = [];

const agentSequence = [
  { key: "research", title: "Agents are working…",      sub: "Research agent scanning news & market data",  progress: 18 },
  { key: "analyst",  title: "Crunching numbers…",        sub: "Analyst agent evaluating financial metrics",  progress: 42 },
  { key: "risk",     title: "Assessing risk…",           sub: "Risk reviewer checking exposure & volatility", progress: 68 },
  { key: "trader",   title: "Formulating decision…",     sub: "Trader agent generating final recommendation", progress: 88 },
];

const decisionEmoji = { buy: "📈", sell: "📉", hold: "⏸️" };

function resetAgentCards() {
  Object.entries(agtCards).forEach(([key, card]) => {
    card.classList.remove("running", "done");
    const stateEl = card.querySelector(".agt-state");
    stateEl.textContent = "Idle";
    stateEl.className = "agt-state idle";
  });
  Object.values(pipeSteps).forEach(s => s.classList.remove("active", "done"));
  progressFill.style.width = "0%";
}

function startAgentAnimation() {
  agentTimers.forEach(clearTimeout);
  agentTimers = [];
  resetAgentCards();

  const pipeKeys = ["research", "analyst", "risk", "trader"];

  agentSequence.forEach((step, idx) => {
    const delay = idx * 28000;   // ~28s per agent (tuned for 1-3 min total)

    agentTimers.push(setTimeout(() => {
      // Mark previous as done
      if (idx > 0) {
        const prevKey = agentSequence[idx - 1].key;
        const prevCard = agtCards[prevKey];
        prevCard.classList.remove("running");
        prevCard.classList.add("done");
        const prevState = prevCard.querySelector(".agt-state");
        prevState.textContent = "Done ✓";
        prevState.className = "agt-state done";
        pipeSteps[prevKey].classList.remove("active");
        pipeSteps[prevKey].classList.add("done");
      }

      // Activate current
      const card = agtCards[step.key];
      card.classList.add("running");
      const stateEl = card.querySelector(".agt-state");
      stateEl.textContent = "Running…";
      stateEl.className = "agt-state running";
      pipeSteps[step.key].classList.add("active");

      loadingTitle.textContent = step.title;
      loadingSub.textContent   = step.sub;
      progressFill.style.width = `${step.progress}%`;
    }, delay));
  });
}

function stopAgentAnimation(markAllDone = false) {
  agentTimers.forEach(clearTimeout);
  agentTimers = [];

  if (markAllDone) {
    Object.entries(agtCards).forEach(([key, card]) => {
      card.classList.remove("running");
      card.classList.add("done");
      const stateEl = card.querySelector(".agt-state");
      stateEl.textContent = "Done ✓";
      stateEl.className = "agt-state done";
      pipeSteps[key].classList.remove("active");
      pipeSteps[key].classList.add("done");
    });
    progressFill.style.width = "100%";
  }
}

// ── Set loading state ─────────────────────────────────────────
function setLoading(isLoading) {
  submitBtn.disabled  = isLoading;
  stockInput.disabled = isLoading;

  if (isLoading) {
    show(loadingEl);
    hide(resultsEl);
    hide(errorBox);
    startAgentAnimation();
  } else {
    hide(loadingEl);
  }
}

// ── Show error ────────────────────────────────────────────────
function showError(message) {
  errorBox.textContent = message;
  show(errorBox);
  hide(resultsEl);
}

// ── Render result ─────────────────────────────────────────────
function renderResult(data, durationMs) {
  const decision = (data.decision || "hold").toLowerCase();
  const conf = deriveConfidence(decision, data.why || "");

  // Badge
  decisionBadge.className = `decision-badge ${decision}`;
  decisionIcon.textContent = decisionEmoji[decision] || "📊";
  decisionText.textContent = decision.toUpperCase();

  // Glow
  decisionGlow.className = `decision-glow ${decision}`;

  // Meta
  stockLabelDisp.textContent = data.stock.toUpperCase();
  analysisTime.textContent   = durationMs
    ? `Analysis completed in ${formatDuration(durationMs)} · ${formatTime(new Date())}`
    : `Analysis completed · ${formatTime(new Date())}`;

  // Confidence bar
  confidenceFill.className     = `confidence-bar-fill ${decision}`;
  confidencePct.textContent    = `${conf}%`;
  // Trigger animation after next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      confidenceFill.style.width = `${conf}%`;
    });
  });

  // Why
  whyText.textContent = data.why || "No explanation provided.";

  hide(errorBox);
  show(resultsEl);
}

// ── Copy reasoning ────────────────────────────────────────────
copyBtn.addEventListener("click", async () => {
  const text = whyText.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add("copied");
    copyBtn.querySelector("span:last-child").textContent = "Copied!";
    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtn.querySelector("span:last-child").textContent = "Copy";
    }, 2000);
  } catch {
    // fallback: select text
    const range = document.createRange();
    range.selectNodeContents(whyText);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
});

// ── History ───────────────────────────────────────────────────
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.appendChild(historyEmpty);
    historyEmpty.style.display = "";
    return;
  }

  history.forEach((item, idx) => {
    const el = document.createElement("button");
    el.className = "history-item";
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label", `Load ${item.stock} analysis: ${item.decision}`);
    el.innerHTML = `
      <div class="hist-badge ${item.decision}">${item.decision.toUpperCase()}</div>
      <div class="hist-meta">
        <p class="hist-stock">${escHtml(item.stock)}</p>
        <p class="hist-why">${escHtml((item.why || "").slice(0, 120))}…</p>
      </div>
      <span class="hist-time">${item.time || ""}</span>
    `;
    el.addEventListener("click", () => {
      stockInput.value = item.stock;
      renderResult(item, null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    historyList.appendChild(el);
  });
}

function addToHistory(data) {
  const history = loadHistory();
  const entry = {
    stock:    data.stock,
    decision: (data.decision || "hold").toLowerCase(),
    why:      data.why || "",
    time:     formatTime(new Date()),
  };
  // Remove duplicate ticker
  const filtered = history.filter(h => h.stock.toUpperCase() !== data.stock.toUpperCase());
  filtered.unshift(entry);
  saveHistory(filtered.slice(0, MAX_HISTORY));
  renderHistory();
}

function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

clearHist.addEventListener("click", () => {
  saveHistory([]);
  renderHistory();
});

// ── Form submit ───────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const stock = stockInput.value.trim();
  if (!stock) {
    showError("Please enter a stock symbol or company name.");
    return;
  }

  const startTime = Date.now();
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ stock }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const detail =
        typeof data.detail === "string"
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map(d => d.msg || d).join(", ")
            : "Request failed. Please try again.";
      throw new Error(detail);
    }

    const duration = Date.now() - startTime;
    stopAgentAnimation(true);

    // Short pause so user sees 100% progress
    await delay(500);

    setLoading(false);
    renderResult(data, duration);
    addToHistory(data);

  } catch (err) {
    stopAgentAnimation(false);
    setLoading(false);
    showError(err.message || "Something went wrong. Check that the API is running.");
  }
});

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Health check on load ──────────────────────────────────────
(async function checkHealth() {
  try {
    const res  = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    if (data.status !== "ok") throw new Error();
  } catch {
    // Show a soft warning — don't block the UI
    const warn = document.createElement("div");
    warn.style.cssText = `
      position: fixed; bottom: 1rem; right: 1rem; z-index: 999;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5; padding: 10px 16px; border-radius: 10px;
      font-size: 0.8rem; font-family: var(--font); max-width: 260px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    `;
    warn.innerHTML = "⚠ API server not reachable. Start the backend before analyzing.";
    document.body.appendChild(warn);
    setTimeout(() => warn.remove(), 8000);
  }
})();

// ── Init ──────────────────────────────────────────────────────
renderHistory();
