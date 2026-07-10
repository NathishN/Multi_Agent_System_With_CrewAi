# StockMind AI - Project Documentation

## 1. Project Architecture and Tech-Stack
The project is built on a modern, decoupled architecture, separating the front-end user interface from the heavy AI backend, orchestrated via Docker.

**Tech-Stack:**
* **AI Framework:** **CrewAI** (Handles the orchestration and sequential execution of the multi-agent pipeline).
* **LLM Engine:** **Groq** utilizing the `llama-3.3-70b-versatile` model (Ensures lightning-fast, high-quality reasoning). **LiteLLM** is used for provider abstraction.
* **Backend Server:** **FastAPI** with **Uvicorn** (Provides a high-performance REST API).
* **Frontend Web App:** Vanilla **HTML, CSS, and JavaScript** (A single-page application built with dark-theme styling).
* **Data Providers:** 
  * **yfinance:** Fetches live quantitative market data (price, volume, day ranges).
  * **duckduckgo-search:** Fetches qualitative real-time news headlines.
* **Deployment:** **Docker** and **Docker Compose** (Containerizes the frontend behind Nginx and the backend, making it deployable with a single command).

**Architecture Flow:**
1. **Client Tier:** The user interacts with the Web UI on port `8080`.
2. **API Tier:** The frontend sends a `POST /api/analyze` request with a stock symbol (e.g., "AAPL" or "TCS") to the FastAPI backend on port `8000`.
3. **Agent Tier:** FastAPI triggers the CrewAI pipeline (`crew.py`).
4. **External Services Tier:** The agents interact with Groq (for LLM reasoning), Yahoo Finance (for market data), and DuckDuckGo (for web searches).
5. **Response:** The final trading decision is parsed in `service.py` and returned as a JSON object to the frontend.

---

## 2. How this Project Works Internally
Internally, the project operates as a **Sequential Agent Pipeline**. Rather than having one AI try to do everything (which often leads to hallucinations), StockMind AI breaks the problem down into a 4-stage assembly line:

1. **Input Parsing:** A user inputs a stock name (e.g., "APPLE" or "AAPL"). The backend normalizes this input (the codebase even contains specific logic to automatically detect if it is a US or Indian stock, mapping common names to Yahoo Finance tickers like `TCS.NS` for Indian stocks).
2. **Phase 1 - Quantitative Analysis:** The system hands the ticker to the **Analyst Agent**. This agent uses the `yfinance` tool to get hard numbers: current price, daily change, volume, open, and previous close. It summarizes this data.
3. **Phase 2 - Risk Validation:** The **Risk Reviewer Agent** takes the Analyst's output. It acts as a safety mechanism, ensuring the numbers make sense and assigning a risk level (Low/Medium/High) based on volatility and volume.
4. **Phase 3 - Qualitative Research:** Meanwhile, the **Research Agent** takes the ticker and hits DuckDuckGo. It searches for the latest news headlines, sources, and snippets to understand market sentiment (e.g., "Did the CEO resign?", "Was there a massive earnings beat?").
5. **Phase 4 - Synthesis & Decision:** Finally, the **Trader Agent** receives the Quantitative Data (from Phase 2) and the Qualitative News (from Phase 3). It synthesizes all this context and generates a final `Buy`, `Sell`, or `Hold` decision, along with a detailed paragraph explaining *why*.

---

## 3. Explain Each Agent, Task, and Tool

### The Tools
* **Live Stock Information Tool (`tools/stock_research_tool.py`):** Uses the `yfinance` library. It contains a clever resolution system (`_resolve_ticker`) to convert plain names like "TCS" or "APPLE" into accurate tickers (`TCS.NS`, `AAPL`). It returns a formatted string of the current price, daily change percentage, open, close, and volume.
* **Stock News Search Tool (`tools/web_research_tool.py`):** Uses the `duckduckgo_search` library. It queries `"[Company] stock latest news market"`, fetching the top 5 recent headlines, their sources, dates, and short summary snippets.

### The Agents & Their Tasks
1. **Financial Market Analyst (Agent) & Analyse Task:**
   * *Role:* Strictly deals with quantitative data.
   * *Task:* Call the `Live Stock Information Tool` exactly once. Retrieve the live numbers and write a factual, numeric summary. 
   * *Rule:* Never invent data or search the web.
2. **Risk Reviewer (Agent) & Review Task:**
   * *Role:* Quality Assurance and Risk Assessor.
   * *Task:* Take the Analyst's report, cross-validate it for obvious errors, and assign a clear risk profile. If volume is abnormally high or prices are highly volatile, it flags the stock as high risk.
3. **Research Agent & Research Task:**
   * *Role:* Market Sentiment Analyst.
   * *Task:* Use the `Stock News Search Tool` to scour the web for recent news. Filter out noise and compile a brief report on current market sentiment (bullish/bearish headlines).
4. **Strategic Stock Trader (Agent) & Trade Task:**
   * *Role:* The Final Decision Maker.
   * *Task:* Combine the Risk Reviewer's validated numbers with the Research Agent's news report. Make a definitive `Buy`, `Sell`, or `Hold` call. Output the decision strictly along with a comprehensive "Why" paragraph to justify the logic.

---

## 4. What Problem this Project Solves & Target Audience
**The Problem it Solves:**
* **Cognitive Overload in Trading:** Everyday investors are overwhelmed. To analyze a stock, you usually have to look at charts, check Yahoo Finance for numbers, and read through dozens of articles on Bloomberg or Reuters to gauge sentiment.
* **Hallucinations in Basic LLMs:** If you ask ChatGPT "Should I buy AAPL?", it gives generic, outdated advice. By explicitly forcing the LLM to use live tools (yfinance + DuckDuckGo) and breaking the reasoning into 4 specialized personas, this project prevents hallucinations and grounds the AI's logic in real-time reality.

**Target Audiences:**
1. **Retail Investors & Hobbyists:** People who want a quick, 60-second comprehensive overview of a stock's current quantitative and qualitative standing before making an investment.
2. **AI & Python Developers:** Because it's open-source and cleanly separated, it serves as an excellent reference architecture for developers wanting to learn how to build Multi-Agent Systems using CrewAI, FastAPI, and Docker.
3. **Educational / FinTech Students:** Users studying the intersection of algorithmic logic, large language models, and financial analysis. *(Note: As stated in the project disclaimer, it is for educational purposes and not literal financial advice).*

---

## 5. Explanation of the UI Design
The UI of **StockMind AI** is designed as a premium, modern Single-Page Application (SPA) with a heavy focus on user experience, real-time feedback, and dynamic visualizations. It is built entirely using Vanilla HTML, CSS, and JavaScript.

### Overall Theme & Aesthetics
* **Dark Mode by Default:** The UI uses a deep midnight blue/black palette (`#050810` background, `#0d1526` cards) which is standard for professional trading terminals.
* **Animated Backgrounds:** The background features a subtle geometric grid (`bg-grid`) and floating, glowing particles (`particles`) controlled by CSS animations, giving the app a futuristic, AI-driven feel.
* **Brand Gradients:** The primary accent colors are a gradient of **Indigo (`#6366f1`)** and **Cyan (`#06b6d4`)**, used on buttons, loading spinners, and the logo.
* **Typography:** It uses **Inter** for clean, readable body text and **JetBrains Mono** for financial numbers and tickers to align decimals properly.

### Header & Pipeline Visualization
* **Live Ticker Tape:** At the absolute top, a continuously scrolling marquee displays market data (e.g., `AAPL +1.23%`). Bullish stocks are green; bearish are red.
* **Agent Pipeline Diagram:** Below the title, there is a visual flowchart of the 4 agents (`Research ➔ Analyst ➔ Risk ➔ Trader`). During an active analysis, this diagram lights up step-by-step to show the user exactly which AI agent is currently processing the data.

### The Main Interaction Card
* **Market Toggle (US / India):** A pill-shaped toggle lets the user switch markets. 
  * *Dynamic Styling:* Clicking "US" sets the theme accents to Indigo/Cyan. Clicking "India" shifts the UI accents to Saffron/Green and changes the placeholder text and suggestions.
* **Smart Input & Quick Chips:** A sleek input field for the stock ticker. Below it are clickable "Quick-pick chips" (e.g., `AAPL`, `TSLA` or `TCS`, `RELIANCE`) that instantly populate the input.

### The Loading Sequence (Agent Orchestration)
Because the 4-agent pipeline can take 1–3 minutes to run, the UI masks this wait time with a highly engaging loading state:
* **Orbit Spinner:** A custom CSS-animated multi-ring spinner.
* **Progress Bar & Text:** The text updates dynamically (e.g., *"Crunching numbers..."*, *"Assessing risk..."*).
* **Agent Status Grid:** A grid of 4 agent cards that visually transition their states from `Idle` ➔ `Running...` ➔ `Done ✓` as the JavaScript sequentially updates them using timers.

### The Results Dashboard
* **Decision Badge:** A large, glowing badge that strictly uses color psychology: **Green** for BUY, **Red** for SELL, and **Amber** for HOLD. 
* **Confidence Signal Bar:** A visual progress bar. The JS (`deriveConfidence`) actually scans the AI's text for strong words ("definitely", "highly") vs weak words ("uncertain", "volatile") to calculate a simulated percentage of confidence.
* **Agent Reasoning Card:** A clean, readable box containing the detailed paragraph generated by the Trader agent, complete with a convenient "Copy to clipboard" button.

### Paper Trading & Portfolio Tracking
The UI includes a fully functional, simulated paper-trading environment saved via `localStorage`:
* **Trade Modal:** Clicking "Trade" opens an overlay dialog where you can set your entry direction (Long/Short) and quantity.
* **Portfolio Dashboard:** Features a stats bar tracking your **Cash Balance (Starts at $10k)**, **Invested Capital**, and **Total P&L**.
* **Win Rate Tracker:** Includes a beautiful SVG Donut chart that tracks how often the AI's Buy/Sell signals result in a profitable simulated trade.

---

## 6. How the Backend Works and Data Storage

### How the Backend Works
The backend is built using **FastAPI**, a high-performance Python framework, and it acts as an orchestration layer between the user interface, live data sources, and the Groq LLM API.

1. **The Request:** The frontend sends a `POST /api/analyze` request containing a JSON payload with the stock ticker (e.g., `{"stock": "AAPL"}`) to the FastAPI server (`api/app.py`).
2. **Service Layer:** FastAPI passes the ticker to the `analyze_stock()` function located in `service.py`.
3. **CrewAI Kickoff:** `service.py` triggers the CrewAI pipeline by calling `stock_crew.kickoff(inputs={"stock": "AAPL"})`.
4. **The Multi-Agent Process (`crew.py`):** The framework runs a `Process.sequential` pipeline involving 4 specialized agents.
5. **Output Parsing:** Because LLMs return plain text, `service.py` uses Regex (Regular Expressions) in the `parse_trade_output()` function to strictly extract the core decision (Buy/Sell/Hold) and the explanatory "Why" paragraph from the Trader Agent's text output.
6. **The Response:** The backend packages this parsed data into a clean JSON structure and sends it back to the frontend. 

*(Note: The backend also has a `GET /api/stock-data/{ticker}` endpoint that directly pings Yahoo Finance to instantly update the UI's live ticker banner while the agents are still "thinking" in the background).*

### Where Its Data is Stored
One of the most interesting aspects of this project is its lightweight architecture: **The backend is completely stateless.**

#### No Backend Database
There is **no** database (no SQL, MongoDB, Redis, etc.) attached to the backend server. 
* Market data is fetched live on-the-fly from Yahoo Finance.
* News is fetched live on-the-fly via DuckDuckGo.
* The LLM reasoning happens dynamically via the Groq API.
Once the FastAPI server returns the analysis to the user, it immediately "forgets" it. It holds no persistent memory of past queries on the server.

#### Frontend Local Storage (Client-Side)
All persistent user data is stored entirely on the client side using the browser's **`localStorage`**. 
The `frontend/js/app.js` file relies on four specific storage keys:
1. `stockmind_history`: Saves the last 10 stock analyses the user ran.
2. `stockmind_portfolio`: Saves the user's paper trading data, including their $10,000 virtual cash balance and any open stock positions.
3. `stockmind_trades`: Keeps a log of closed trades and realized profit/loss.
4. `stockmind_winrate`: Tracks the accuracy of the AI's predictions (Wins vs. Losses) for the Donut Chart UI.

Because the data is stored in the browser, if a user opens the app in Incognito mode, switches to a different browser, or clears their browser cache, their Paper Trading Portfolio and Search History will be completely reset.
