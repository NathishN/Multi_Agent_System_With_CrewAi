from crewai import Task

from agents.research_agent import research_agent

research_stock_news = Task(
    description=(
        "Research the latest online news for {stock}. "
        "This may be a US stock (e.g. AAPL, TSLA) or an Indian stock (e.g. TCS, RELIANCE, INFY on NSE/BSE). "
        "Call the Stock News Search Tool once with the company name or ticker. "
        "Do NOT use any other tools. Summarize what the news implies for near-term price action. "
        "If the stock is Indian, focus on relevant Indian market news, regulatory developments, and sector trends."
    ),
    expected_output=(
        "A news brief with:\n"
        "- Top 3 headlines (one line each)\n"
        "- Overall news sentiment: Bullish / Bearish / Neutral\n"
        "- 2-3 bullet points on how news may affect the stock"
    ),
    agent=research_agent,
)
