# StockMind AI — Multi-Agent Stock Trading Advisor

> A production-ready multi-agent AI system that delivers Buy / Sell / Hold recommendations by combining live market data, real-time news, and a 4-stage reasoning pipeline powered by CrewAI and Groq's Llama 3.3.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)
![CrewAI](https://img.shields.io/badge/CrewAI-Multi--Agent-6C63FF?style=flat)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![LLM](https://img.shields.io/badge/LLM-Llama%203.3%2070B-FF6B35?style=flat)

---

## Overview

StockMind AI uses a collaborative crew of four specialised AI agents to analyse any publicly traded stock. Each agent has a distinct role and tool set. They work sequentially — each building on the previous agent's output — before a final trader agent weighs all evidence and issues a clear decision with a detailed justification.

---

## Agent Pipeline

```
  ┌─────────────────────┐
  │   User Input        │  e.g. "AAPL", "APPLE", "TESLA"
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │  1. Analyst Agent   │  Fetches live price, volume, daily range via yfinance
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │  2. Risk Reviewer   │  Cross-validates analyst data, assigns Low/Medium/High risk
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │  3. Research Agent  │  Searches DuckDuckGo for latest news & sentiment
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │  4. Trader Agent    │  Synthesises all outputs → Decision: Buy / Sell / Hold
  └─────────────────────┘
```

---

## Features

- **4-agent reasoning pipeline** — Analyst, Risk Reviewer, Research, and Trader agents collaborate sequentially
- **Live market data** — Real-time price, volume, and day range via `yfinance`
- **Real-time news search** — Latest headlines and sentiment via DuckDuckGo
- **Paper Portfolio Management** — Simulate trades and track performance of an imaginary portfolio without risking real money
- **Natural language input** — Accepts full company names (`APPLE`, `TESLA`) or ticker symbols (`AAPL`, `TSLA`)
- **Professional web UI** — Dark-theme SPA with animated agent pipeline, decision badges, and analysis history
- **REST API** — Clean FastAPI backend with automatic OpenAPI docs
- **One-command deployment** — Docker Compose runs the full stack with a single command

---

## Pros of this Project

- **Comprehensive Analysis** — Combines quantitative market data with qualitative news sentiment.
- **Risk Averse** — A dedicated Risk Reviewer validates data to prevent hallucination or rash decisions.
- **Zero Financial Risk** — Can be integrated into a paper portfolio to test strategies safely.
- **Extensible Architecture** — Built with FastAPI and CrewAI, making it trivial to add new agents or data sources.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Framework | [CrewAI](https://github.com/joaomdmoura/crewAI) |
| LLM | Groq — `llama-3.3-70b-versatile` |
| LLM Provider Abstraction | LiteLLM |
| Market Data | yfinance |
| News Search | duckduckgo-search |
| Backend | FastAPI + Uvicorn |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Reverse Proxy | Nginx |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

```
├── agents/
│   ├── analyst_agent.py          # Live market data analyst
│   ├── research_agent.py         # Web news researcher
│   ├── risk_reviewer_agent.py    # Data validator & risk scorer
│   └── trader_agent.py           # Final decision maker
├── tasks/
│   ├── analyse_task.py           # Stock price analysis task
│   ├── research_task.py          # News search task
│   ├── review_task.py            # Cross-validation task
│   └── trade_task.py             # Buy/Sell/Hold decision task
├── tools/
│   ├── stock_research_tool.py    # yfinance CrewAI tool
│   └── web_research_tool.py      # DuckDuckGo CrewAI tool
├── api/
│   └── app.py                    # FastAPI application & routes
├── frontend/
│   ├── index.html                # Single-page application
│   ├── css/style.css             # Dark-theme stylesheet
│   ├── js/app.js                 # Frontend logic & API client
│   ├── nginx.conf                # Nginx reverse proxy config
│   └── Dockerfile                # Frontend container
├── crew.py                       # CrewAI crew definition
├── service.py                    # Business logic & output parser
├── crewai_patch.py               # Groq/LiteLLM compatibility patch
├── main.py                       # CLI entry point
├── Dockerfile                    # Backend container
├── docker-compose.yml            # Full-stack orchestration
├── requirements.txt
└── .env.example
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Option A)
- Python 3.12+ and a virtual environment (for Option B)
- A free [Groq API key](https://console.groq.com/)

### 1. Configure environment

```bash
cp .env.example .env
```

Open `.env` and add your Groq API key:

```
GROQ_API_KEY=your_groq_api_key_here
```

---

### Option A — Docker (Recommended)

Runs the full stack (backend + frontend) with a single command.

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:8080 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

### Option B — Local Python

**1. Create and activate a virtual environment:**

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

**2. Install dependencies:**

```bash
pip install -r requirements.txt
```

**3. Start the API server:**

```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

**4. Open the frontend** by loading `frontend/index.html` in your browser.

---

### Option C — CLI

Run a quick one-shot analysis from the terminal:

```bash
python main.py
```

---

## API Reference

### `POST /api/analyze`

Runs the full 4-agent pipeline and returns a trading recommendation.

**Request**
```json
{
  "stock": "AAPL"
}
```

**Response**
```json
{
  "stock": "AAPL",
  "decision": "buy",
  "why": "Apple trades at $211.45 with moderate volume... [full reasoning]"
}
```

**Decision values:** `buy` · `sell` · `hold`

### `GET /api/health`

```json
{ "status": "ok" }
```

Full interactive docs available at `/docs` when the server is running.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Your Groq API key |
| `CREW_VERBOSE` | No | `false` | Set to `true` to see agent reasoning in the terminal |

---

## Disclaimer

StockMind AI is built for **educational and demonstration purposes only**. The analysis it produces is generated by AI agents using publicly available data and does not constitute financial advice. Do not make real investment decisions based on its output.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
