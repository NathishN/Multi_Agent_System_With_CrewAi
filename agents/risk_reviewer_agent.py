from crewai import Agent, LLM

from tools.stock_research_tool import get_stock_price

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.0,
)

risk_reviewer_agent = Agent(
    role="Risk & Quality Reviewer",
    goal=(
        "Cross-check the analyst report against fresh Live Stock Information Tool data, "
        "correct inconsistencies, and produce a validated briefing with risk signals for the trader."
    ),
    backstory=(
        "You are a senior risk officer who never trusts a single draft. "
        "You call the Live Stock Information Tool once to verify figures, compare them to the "
        "analyst's report, flag gaps or errors, and deliver a concise, fact-checked market briefing."
    ),
    llm=llm,
    tools=[get_stock_price],
    allow_delegation=False,
    max_iter=5,
    verbose=True,
)
