from crewai import Agent, LLM

from tools.web_research_tool import search_stock_news

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.0,
)

research_agent = Agent(
    role="Web Research Analyst",
    goal=(
        "Find the latest online news for a stock using ONLY the Stock News Search Tool. "
        "Summarize sentiment and key headlines for the trader. "
        "If the tool fails or returns no results, report that explicitly (no invention)."
    ),
    backstory=(
        "You monitor financial news on the web. You call the Stock News Search Tool once, "
        "then write a concise news brief: top headlines, overall sentiment (bullish/bearish/neutral), "
        "and what matters for a trading decision. You never invent news or use other tools."
    ),
    llm=llm,
    tools=[search_stock_news],
    allow_delegation=False,
    max_iter=5,
    verbose=True,
)
