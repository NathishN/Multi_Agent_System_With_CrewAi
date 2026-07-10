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

// Live data elements
const liveDataBanner = document.getElementById("live-data-banner");
const liveTicker     = document.getElementById("live-ticker");
const livePrice      = document.getElementById("live-price");
const liveChange     = document.getElementById("live-change");

// Market toggle elements
const marketToggle   = document.getElementById("market-toggle");
const marketBtnUS    = document.getElementById("market-us");
const marketBtnIndia = document.getElementById("market-india");
const chipsUS        = document.getElementById("chips-us");
const chipsIndia     = document.getElementById("chips-india");

// ── Market state ──────────────────────────────────────────────
let selectedMarket = "US"; // "US" | "India"

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

// ── Market Toggle ─────────────────────────────────────────────
function setMarket(market) {
  selectedMarket = market;

  // Update button states
  [marketBtnUS, marketBtnIndia].forEach(btn => {
    const isActive = btn.dataset.market === market;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  // Toggle chip rows
  if (market === "India") {
    hide(chipsUS);
    show(chipsIndia);
    stockInput.placeholder = "e.g. TCS, RELIANCE, INFY, HDFCBANK";
    document.body.classList.add("market-india");
  } else {
    show(chipsUS);
    hide(chipsIndia);
    stockInput.placeholder = "e.g. AAPL, TSLA, NVIDIA";
    document.body.classList.remove("market-india");
  }
}

marketToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".market-btn");
  if (btn && btn.dataset.market) {
    setMarket(btn.dataset.market);
  }
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

  // Resolve ticker: in India mode, auto-append .NS if not already suffixed
  let resolvedInput = stock;
  if (selectedMarket === "India") {
    const upper = stock.toUpperCase();
    if (!upper.endsWith(".NS") && !upper.endsWith(".BO")) {
      resolvedInput = upper + ".NS";
    } else {
      resolvedInput = upper;
    }
  }

  const startTime = Date.now();
  setLoading(true);
  hide(liveDataBanner);

  // Fetch live data immediately for the banner
  fetch(`${API_BASE}/stock-data/${encodeURIComponent(resolvedInput)}`)
    .then(r => r.json())
    .then(data => {
      if (data && !data.error && data.price) {
        liveTicker.textContent = data.resolvedTicker || resolvedInput.toUpperCase();
        const currencySymbol = (data.market === "India" || data.currency === "INR") ? "₹" : "$";
        livePrice.textContent = `${currencySymbol}${data.price.toFixed(2)}`;
        
        const chg = data.change || 0;
        const pct = data.changePercent || 0;
        const sign = chg >= 0 ? "+" : "";
        liveChange.textContent = `${sign}${chg.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
        liveChange.className = `live-change ${chg >= 0 ? "bull" : "bear"}`;
        
        show(liveDataBanner);
      } else {
        hide(liveDataBanner);
      }
    })
    .catch(() => hide(liveDataBanner));

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ stock: resolvedInput }),
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


/* ╔══════════════════════════════════════════════════════════╗
   ║          PORTFOLIO TRACKING & P&L SIMULATION            ║
   ╚══════════════════════════════════════════════════════════╝ */

"use strict";

// ── Storage keys ──────────────────────────────────────────────
const PORTFOLIO_KEY  = "stockmind_portfolio";
const TRADES_KEY     = "stockmind_trades";
const WINRATE_KEY    = "stockmind_winrate";
const INITIAL_CASH   = 10000;

// ── State ─────────────────────────────────────────────────────
let modalPrice     = 0;
let modalStock     = "";
let modalDecision  = "buy";
let modalDirection = "buy";   // user-selected direction (may differ from AI)

// ── Portfolio DOM refs ─────────────────────────────────────────
const statCash          = document.getElementById("stat-cash");
const statInvested      = document.getElementById("stat-invested");
const statPnl           = document.getElementById("stat-pnl");
const statWinRate       = document.getElementById("stat-winrate");

const positionsEmpty    = document.getElementById("positions-empty");
const positionsWrap     = document.getElementById("positions-table-wrap");
const positionsTbody    = document.getElementById("positions-tbody");

const winrateEmpty      = document.getElementById("winrate-empty");
const winrateBoard      = document.getElementById("winrate-board");
const winratePct        = document.getElementById("winrate-pct");
const donutFill         = document.getElementById("donut-fill");
const wrBuy             = document.getElementById("wr-buy");
const wrSell            = document.getElementById("wr-sell");
const wrHold            = document.getElementById("wr-hold");
const winrateBars       = document.getElementById("winrate-bars");

const tradeHistEmpty    = document.getElementById("trade-history-empty");
const tradeLogWrap      = document.getElementById("trade-log-wrap");
const tradeLog          = document.getElementById("trade-log");

const ptCta             = document.getElementById("paper-trade-cta");
const ptcIcon           = document.getElementById("ptc-icon");
const btnPaperTrade     = document.getElementById("btn-paper-trade");

const tradeModal        = document.getElementById("trade-modal-overlay");
const modalTicker       = document.getElementById("modal-ticker");
const modalPriceEl      = document.getElementById("modal-price");
const modalDirBtns      = document.getElementById("modal-dir-btns");
const dirBuyBtn         = document.getElementById("dir-buy");
const dirSellBtn        = document.getElementById("dir-sell");
const modalQty          = document.getElementById("modal-qty");
const qtyDec            = document.getElementById("qty-dec");
const qtyInc            = document.getElementById("qty-inc");
const modalCost         = document.getElementById("modal-cost");
const modalCashAvail    = document.getElementById("modal-cash-avail");
const modalError        = document.getElementById("modal-error");
const modalClose        = document.getElementById("modal-close");
const modalCancel       = document.getElementById("modal-cancel");
const modalConfirm      = document.getElementById("modal-confirm");

const btnRefresh        = document.getElementById("btn-refresh-portfolio");
const btnReset          = document.getElementById("btn-reset-portfolio");

const tabPositions      = document.getElementById("tab-positions");
const tabWinrate        = document.getElementById("tab-winrate");
const tabHistory        = document.getElementById("tab-history");
const panelPositions    = document.getElementById("panel-positions");
const panelWinrate      = document.getElementById("panel-winrate");
const panelHistory      = document.getElementById("panel-history");


// ── Storage helpers ───────────────────────────────────────────
function loadPortfolio() {
  try {
    const data = JSON.parse(localStorage.getItem(PORTFOLIO_KEY));
    if (!data) return { cash: INITIAL_CASH, positions: {} };
    return data;
  } catch { return { cash: INITIAL_CASH, positions: {} }; }
}

function savePortfolio(p) {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(p));
}

function loadTrades() {
  try { return JSON.parse(localStorage.getItem(TRADES_KEY)) || []; }
  catch { return []; }
}

function saveTrades(t) {
  localStorage.setItem(TRADES_KEY, JSON.stringify(t));
}

function loadWinRate() {
  try {
    return JSON.parse(localStorage.getItem(WINRATE_KEY)) || { buy: {w:0,l:0}, sell: {w:0,l:0}, hold: {w:0,l:0} };
  } catch { return { buy: {w:0,l:0}, sell: {w:0,l:0}, hold: {w:0,l:0} }; }
}

function saveWinRate(wr) {
  localStorage.setItem(WINRATE_KEY, JSON.stringify(wr));
}


// ── Currency formatter ─────────────────────────────────────────
function fmtCurrency(val, symbol = "$") {
  const sign = val < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(val).toFixed(2)}`;
}

function fmtPnl(val, symbol = "$") {
  const sign = val >= 0 ? "+" : "";
  return `${sign}${symbol}${val.toFixed(2)}`;
}

function getCurrencySymbol(ticker) {
  if (!ticker) return "$";
  const t = ticker.toUpperCase();
  return (t.endsWith(".NS") || t.endsWith(".BO")) ? "₹" : "$";
}


// ── Tab navigation ─────────────────────────────────────────────
function activateTab(tab) {
  [tabPositions, tabWinrate, tabHistory].forEach(t => {
    t.classList.toggle("active", t === tab);
    t.setAttribute("aria-selected", t === tab ? "true" : "false");
  });
  [panelPositions, panelWinrate, panelHistory].forEach(p => p.classList.add("hidden"));
  if (tab === tabPositions) panelPositions.classList.remove("hidden");
  if (tab === tabWinrate)   panelWinrate.classList.remove("hidden");
  if (tab === tabHistory)   panelHistory.classList.remove("hidden");
}

tabPositions.addEventListener("click", () => activateTab(tabPositions));
tabWinrate.addEventListener("click",   () => activateTab(tabWinrate));
tabHistory.addEventListener("click",   () => activateTab(tabHistory));


// ── Render portfolio overview ─────────────────────────────────
async function renderPortfolio(skipPriceFetch = false) {
  const p  = loadPortfolio();
  const wr = loadWinRate();
  const trades = loadTrades();

  const posKeys = Object.keys(p.positions || {});

  // ── Stats bar ──────────────────────────────────────────────
  let totalInvested  = 0;
  let totalUnrealPnl = 0;

  for (const sym of posKeys) {
    const pos = p.positions[sym];
    const cost = pos.entryPrice * pos.qty;
    totalInvested += cost;

    // Compute unrealized P&L using cached or live price
    if (!skipPriceFetch && pos.currentPrice) {
      const diff = pos.direction === "sell"
        ? (pos.entryPrice - pos.currentPrice) * pos.qty
        : (pos.currentPrice - pos.entryPrice) * pos.qty;
      totalUnrealPnl += diff;
    }
  }

  const realizedPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const totalPnl    = realizedPnl + totalUnrealPnl;

  const sym = getCurrencySymbol("");

  statCash.textContent     = fmtCurrency(p.cash, "$");
  statInvested.textContent = fmtCurrency(totalInvested, "$");

  statPnl.textContent = fmtPnl(totalPnl, "$");
  statPnl.className   = "stat-value" + (totalPnl > 0 ? " positive" : totalPnl < 0 ? " negative" : "");

  // Win rate
  const allW = wr.buy.w + wr.sell.w + wr.hold.w;
  const allL = wr.buy.l + wr.sell.l + wr.hold.l;
  const total = allW + allL;
  if (total > 0) {
    const pct = Math.round((allW / total) * 100);
    statWinRate.textContent = `${pct}%`;
    statWinRate.className = "stat-value" + (pct >= 60 ? " positive" : pct < 40 ? " negative" : " neutral");
  } else {
    statWinRate.textContent = "—";
    statWinRate.className   = "stat-value";
  }

  // ── Positions table ────────────────────────────────────────
  renderPositionsTable(p);

  // ── Win Rate board ─────────────────────────────────────────
  renderWinRateBoard(wr);

  // ── Trade log ─────────────────────────────────────────────
  renderTradeLog(trades);
}


// ── Render positions table ────────────────────────────────────
function renderPositionsTable(p) {
  const posKeys = Object.keys(p.positions || {});

  if (posKeys.length === 0) {
    positionsEmpty.classList.remove("hidden");
    positionsWrap.classList.add("hidden");
    return;
  }

  positionsEmpty.classList.add("hidden");
  positionsWrap.classList.remove("hidden");
  positionsTbody.innerHTML = "";

  posKeys.forEach(sym => {
    const pos = p.positions[sym];
    const cur = pos.currentPrice ?? pos.entryPrice;
    const diff = pos.direction === "sell"
      ? (pos.entryPrice - cur) * pos.qty
      : (cur - pos.entryPrice) * pos.qty;
    const cs = getCurrencySymbol(sym);

    const pnlClass = diff >= 0 ? "positive" : "negative";
    const pnlSign  = diff >= 0 ? "+" : "";

    const dirIcon = pos.direction === "buy" ? "📈" : "📉";
    const aiSignal = pos.aiDecision ? `AI: ${pos.aiDecision.toUpperCase()}` : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="pos-ticker">${escHtml(sym)}</div>
        ${aiSignal ? `<div style="font-size:0.67rem;color:var(--text-muted);margin-top:2px;">${aiSignal}</div>` : ""}
      </td>
      <td><span class="pos-dir ${pos.direction}">${dirIcon} ${pos.direction.toUpperCase()}</span></td>
      <td class="pos-price">${pos.qty}</td>
      <td class="pos-price">${cs}${pos.entryPrice.toFixed(2)}</td>
      <td class="pos-price" id="cur-${sym.replace(/\./g,'-')}">${cs}${cur.toFixed(2)}</td>
      <td class="pos-pnl ${pnlClass}">${pnlSign}${cs}${Math.abs(diff).toFixed(2)}</td>
      <td><button class="btn-close-pos" data-sym="${escHtml(sym)}" aria-label="Close position ${escHtml(sym)}">Close ✕</button></td>
    `;
    positionsTbody.appendChild(tr);
  });

  // Bind close buttons
  positionsTbody.querySelectorAll(".btn-close-pos").forEach(btn => {
    btn.addEventListener("click", () => closePosition(btn.dataset.sym));
  });
}


// ── Render win rate board ─────────────────────────────────────
function renderWinRateBoard(wr) {
  const allW = wr.buy.w + wr.sell.w + wr.hold.w;
  const allL = wr.buy.l + wr.sell.l + wr.hold.l;
  const total = allW + allL;

  if (total === 0) {
    winrateEmpty.classList.remove("hidden");
    winrateBoard.classList.add("hidden");
    return;
  }

  winrateEmpty.classList.add("hidden");
  winrateBoard.classList.remove("hidden");

  const overallPct = Math.round((allW / total) * 100);
  winratePct.textContent = `${overallPct}%`;

  // Donut chart
  const dashArray = `${overallPct} ${100 - overallPct}`;
  donutFill.setAttribute("stroke-dasharray", dashArray);
  // Color based on performance
  donutFill.style.stroke = overallPct >= 60 ? "var(--buy)" : overallPct < 40 ? "var(--sell)" : "var(--hold)";

  // Legend values
  wrBuy.textContent  = `${wr.buy.w}W / ${wr.buy.l}L`;
  wrSell.textContent = `${wr.sell.w}W / ${wr.sell.l}L`;
  wrHold.textContent = `${wr.hold.w}W / ${wr.hold.l}L`;

  // Bars
  winrateBars.innerHTML = "";
  const categories = [
    { key: "buy",  label: "Buy",  data: wr.buy },
    { key: "sell", label: "Sell", data: wr.sell },
    { key: "hold", label: "Hold", data: wr.hold },
  ];

  categories.forEach(c => {
    const t = c.data.w + c.data.l;
    const pct = t > 0 ? Math.round((c.data.w / t) * 100) : 0;
    const row = document.createElement("div");
    row.className = "wr-bar-row";
    row.innerHTML = `
      <span class="wr-bar-label ${c.key}">${c.label}</span>
      <div class="wr-bar-track"><div class="wr-bar-fill ${c.key}" style="width:0%" data-target="${pct}"></div></div>
      <span class="wr-bar-pct">${t > 0 ? pct + "%" : "—"}</span>
    `;
    winrateBars.appendChild(row);
  });

  // Animate bars after render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      winrateBars.querySelectorAll(".wr-bar-fill").forEach(bar => {
        bar.style.width = bar.dataset.target + "%";
      });
    });
  });
}


// ── Render trade log ──────────────────────────────────────────
function renderTradeLog(trades) {
  if (trades.length === 0) {
    tradeHistEmpty.classList.remove("hidden");
    tradeLogWrap.classList.add("hidden");
    return;
  }

  tradeHistEmpty.classList.add("hidden");
  tradeLogWrap.classList.remove("hidden");
  tradeLog.innerHTML = "";

  [...trades].reverse().forEach(t => {
    const outcome = t.outcome;   // "win" | "loss" | "draw"
    const icon = outcome === "win" ? "✅" : outcome === "loss" ? "❌" : "⏸️";
    const cs   = getCurrencySymbol(t.stock);
    const pnlClass = t.pnl >= 0 ? "positive" : "negative";

    const item = document.createElement("div");
    item.className = "trade-log-item";
    item.setAttribute("role", "listitem");
    item.innerHTML = `
      <div class="tl-badge ${outcome}">${icon}</div>
      <div class="tl-meta">
        <p class="tl-ticker">${escHtml(t.stock)}</p>
        <p class="tl-detail">${t.direction.toUpperCase()} · AI: ${(t.aiDecision||'—').toUpperCase()} · ${t.qty} shares @ ${cs}${t.entryPrice.toFixed(2)} → ${cs}${t.exitPrice.toFixed(2)}</p>
      </div>
      <span class="tl-pnl ${pnlClass}">${fmtPnl(t.pnl, cs)}</span>
      <span class="tl-outcome ${outcome}">${outcome.toUpperCase()}</span>
    `;
    tradeLog.appendChild(item);
  });
}


// ── Paper Trade button in results ─────────────────────────────
// Called after renderResult() — updates CTA color to match decision
function updatePaperTradeCta(stock, price, decision) {
  modalStock    = stock;
  modalPrice    = price;
  modalDecision = decision;

  // Tint the CTA to match decision
  const decisionMap = { buy: "buy", sell: "sell", hold: "buy" }; // hold → suggest buy
  const dir = decisionMap[decision] || "buy";

  ptCta.className = `paper-trade-cta ${decision}-cta`;
  btnPaperTrade.className = `btn-paper-trade ${dir}-btn`;
  ptcIcon.textContent = decision === "buy" ? "📈" : decision === "sell" ? "📉" : "⏸️";
}

btnPaperTrade.addEventListener("click", () => {
  openTradeModal(modalStock, modalPrice, modalDecision);
});


// ── Trade Modal ───────────────────────────────────────────────
function openTradeModal(stock, price, aiDecision) {
  const portfolio = loadPortfolio();
  const cs = getCurrencySymbol(stock);

  // Pre-fill modal
  modalTicker.textContent = stock.toUpperCase();
  modalPriceEl.textContent = `${cs}${price.toFixed(2)}`;

  // Pre-select direction based on AI decision
  // If AI says Hold, default to Buy direction
  const suggestedDir = aiDecision === "sell" ? "sell" : "buy";
  setModalDirection(suggestedDir);

  // Qty
  modalQty.value = "1";
  updateModalCost(price, portfolio.cash, cs);

  // Clear error
  modalError.textContent = "";
  modalError.classList.add("hidden");

  // Store price reference
  modalPrice    = price;
  modalDecision = aiDecision;

  // Show modal
  tradeModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  modalQty.focus();
}

function closeTradeModal() {
  tradeModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function setModalDirection(dir) {
  modalDirection = dir;
  dirBuyBtn.classList.toggle("active",  dir === "buy");
  dirSellBtn.classList.toggle("active", dir === "sell");
  const portfolio = loadPortfolio();
  const cs = getCurrencySymbol(modalStock);
  updateModalCost(modalPrice, portfolio.cash, cs);
}

function updateModalCost(price, cash, cs) {
  const qty = Math.max(1, parseInt(modalQty.value) || 1);
  const totalCost = price * qty;
  modalCost.textContent     = `${cs}${totalCost.toFixed(2)}`;
  modalCashAvail.textContent = `$${cash.toFixed(2)}`;

  // Disable confirm if not enough cash (only for buy direction)
  const insufficient = modalDirection === "buy" && totalCost > cash;
  modalConfirm.disabled = insufficient;
  if (insufficient) {
    modalError.textContent = "⚠ Insufficient cash for this position.";
    modalError.classList.remove("hidden");
  } else {
    modalError.classList.add("hidden");
  }
}

dirBuyBtn.addEventListener("click",  () => setModalDirection("buy"));
dirSellBtn.addEventListener("click", () => setModalDirection("sell"));

modalClose.addEventListener("click",  closeTradeModal);
modalCancel.addEventListener("click", closeTradeModal);
tradeModal.addEventListener("click", (e) => { if (e.target === tradeModal) closeTradeModal(); });

// Keyboard close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !tradeModal.classList.contains("hidden")) closeTradeModal();
});

// Qty controls
qtyDec.addEventListener("click", () => {
  const v = Math.max(1, parseInt(modalQty.value) - 1);
  modalQty.value = v;
  const p = loadPortfolio();
  updateModalCost(modalPrice, p.cash, getCurrencySymbol(modalStock));
});

qtyInc.addEventListener("click", () => {
  const v = Math.min(1000, parseInt(modalQty.value) + 1);
  modalQty.value = v;
  const p = loadPortfolio();
  updateModalCost(modalPrice, p.cash, getCurrencySymbol(modalStock));
});

modalQty.addEventListener("input", () => {
  const p = loadPortfolio();
  updateModalCost(modalPrice, p.cash, getCurrencySymbol(modalStock));
});

// Confirm trade
modalConfirm.addEventListener("click", () => {
  const qty = Math.max(1, parseInt(modalQty.value) || 1);
  executeTrade(modalStock, modalPrice, qty, modalDirection, modalDecision);
});


// ── Execute a paper trade ─────────────────────────────────────
function executeTrade(stock, price, qty, direction, aiDecision) {
  const portfolio = loadPortfolio();
  const cost = price * qty;

  // Check cash for longs
  if (direction === "buy" && cost > portfolio.cash) {
    modalError.textContent = "⚠ Insufficient cash.";
    modalError.classList.remove("hidden");
    return;
  }

  // Create / update position (aggregate on same ticker)
  if (portfolio.positions[stock]) {
    // Average into existing position
    const existing = portfolio.positions[stock];
    const newQty   = existing.qty + qty;
    const newEntry = ((existing.entryPrice * existing.qty) + (price * qty)) / newQty;
    portfolio.positions[stock] = {
      ...existing,
      qty:        newQty,
      entryPrice: newEntry,
      currentPrice: price,
    };
  } else {
    portfolio.positions[stock] = {
      stock,
      direction,
      qty,
      entryPrice:   price,
      currentPrice: price,
      aiDecision,
      openedAt:     new Date().toISOString(),
    };
  }

  if (direction === "buy") {
    portfolio.cash -= cost;
  }
  // For shorts, no cash deduction (simplified paper trading)

  savePortfolio(portfolio);
  closeTradeModal();
  renderPortfolio(true);

  // Flash toast notification
  showToast(`📄 Paper trade opened: ${direction.toUpperCase()} ${qty}× ${stock}`, "buy");

  // Scroll to portfolio
  document.getElementById("portfolio-section").scrollIntoView({ behavior: "smooth", block: "start" });
}


// ── Close a position ──────────────────────────────────────────
async function closePosition(stock) {
  const portfolio = loadPortfolio();
  const pos = portfolio.positions[stock];
  if (!pos) return;

  // Fetch current price
  let exitPrice = pos.currentPrice ?? pos.entryPrice;
  try {
    const res = await fetch(`${API_BASE}/stock-data/${encodeURIComponent(stock)}`);
    const data = await res.json();
    if (data && data.price && !data.error) {
      exitPrice = data.price;
    }
  } catch { /* use cached price */ }

  const diff = pos.direction === "sell"
    ? (pos.entryPrice - exitPrice) * pos.qty
    : (exitPrice - pos.entryPrice) * pos.qty;

  // Determine win/loss for AI call
  const outcome = evaluateOutcome(pos.direction, pos.aiDecision, pos.entryPrice, exitPrice);

  // Record closed trade
  const trades = loadTrades();
  trades.push({
    stock,
    direction:  pos.direction,
    aiDecision: pos.aiDecision,
    qty:        pos.qty,
    entryPrice: pos.entryPrice,
    exitPrice,
    pnl:        diff,
    outcome,
    closedAt:   new Date().toISOString(),
  });
  saveTrades(trades);

  // Update win rate
  const wr  = loadWinRate();
  const cat = pos.aiDecision in wr ? pos.aiDecision : "hold";
  if (outcome === "win")  wr[cat].w++;
  else if (outcome === "loss") wr[cat].l++;
  else { /* draw — don't count as loss */ wr[cat].w++; }
  saveWinRate(wr);

  // Return cash for long positions
  if (pos.direction === "buy") {
    portfolio.cash += exitPrice * pos.qty;
  }

  delete portfolio.positions[stock];
  savePortfolio(portfolio);
  renderPortfolio(true);

  const cs    = getCurrencySymbol(stock);
  const sign  = diff >= 0 ? "+" : "";
  const color = diff >= 0 ? "buy" : "sell";
  showToast(`Position closed: ${stock} ${sign}${cs}${diff.toFixed(2)} · AI ${outcome.toUpperCase()}`, color);
}


// ── Evaluate AI outcome ───────────────────────────────────────
// A Buy call wins if exit > entry. Sell call wins if exit < entry.
// Hold wins if price moves < ±3%.
function evaluateOutcome(posDirection, aiDecision, entryPrice, exitPrice) {
  const pct = ((exitPrice - entryPrice) / entryPrice) * 100;
  const decision = (aiDecision || "hold").toLowerCase();

  if (decision === "buy") {
    return exitPrice > entryPrice ? "win" : "loss";
  }
  if (decision === "sell") {
    return exitPrice < entryPrice ? "win" : "loss";
  }
  // hold
  return Math.abs(pct) <= 3 ? "draw" : (exitPrice > entryPrice ? "loss" : "win");
}


// ── Refresh live prices for all open positions ────────────────
async function refreshPortfolioPrices() {
  btnRefresh.classList.add("spinning");
  const portfolio = loadPortfolio();
  const posKeys   = Object.keys(portfolio.positions || {});

  if (posKeys.length === 0) {
    btnRefresh.classList.remove("spinning");
    return;
  }

  await Promise.all(posKeys.map(async sym => {
    try {
      const res  = await fetch(`${API_BASE}/stock-data/${encodeURIComponent(sym)}`);
      const data = await res.json();
      if (data && data.price && !data.error) {
        portfolio.positions[sym].currentPrice = data.price;
      }
    } catch { /* keep old price */ }
  }));

  savePortfolio(portfolio);
  await renderPortfolio(true);
  btnRefresh.classList.remove("spinning");
  showToast("Portfolio prices refreshed ✓", "buy");
}

btnRefresh.addEventListener("click", refreshPortfolioPrices);


// ── Reset portfolio ───────────────────────────────────────────
btnReset.addEventListener("click", () => {
  if (!confirm("Reset your paper portfolio? This will clear all positions, trades, and win rate data.")) return;
  localStorage.removeItem(PORTFOLIO_KEY);
  localStorage.removeItem(TRADES_KEY);
  localStorage.removeItem(WINRATE_KEY);
  renderPortfolio(true);
  showToast("Portfolio reset. Starting fresh with $10,000 💸", "hold");
});


// ── Hook into existing renderResult ──────────────────────────
// Patch renderResult to also update paper trade CTA
const _origRenderResult = renderResult;
window.renderResult = function(data, durationMs) {
  _origRenderResult(data, durationMs);

  const decision = (data.decision || "hold").toLowerCase();

  // Try to get live price from banner
  let entryPrice = 0;
  const priceText = document.getElementById("live-price")?.textContent || "";
  const priceNum  = parseFloat(priceText.replace(/[^0-9.]/g, ""));
  if (priceNum > 0) entryPrice = priceNum;

  if (entryPrice > 0) {
    updatePaperTradeCta(data.stock, entryPrice, decision);
    ptCta.classList.remove("hidden");
  } else {
    // Fetch price lazily and show the CTA when ready
    fetch(`${API_BASE}/stock-data/${encodeURIComponent(data.stock)}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.price && !d.error) {
          updatePaperTradeCta(data.stock, d.price, decision);
          ptCta.classList.remove("hidden");
        }
      }).catch(() => {});
  }
};


// ── Toast notification ────────────────────────────────────────
function showToast(message, type = "buy") {
  const colors = {
    buy:  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)", text: "#6ee7b7" },
    sell: { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)",  text: "#fca5a5" },
    hold: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fcd34d" },
  };
  const c = colors[type] || colors.buy;

  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 2000;
    background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
    padding: 12px 18px; border-radius: 12px;
    font-size: 0.85rem; font-weight: 600; font-family: var(--font);
    max-width: 320px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    animation: slide-in 0.3s ease;
    display: flex; align-items: center; gap: 8px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity    = "0";
    toast.style.transform  = "translateY(8px)";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}


// ── Initial portfolio render ──────────────────────────────────
renderPortfolio(true);

