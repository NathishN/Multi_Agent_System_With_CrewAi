from crewai import Agent, LLM

from tools.stock_research_tool import get_stock_price

# initialize the llm
llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.0,
)

analyst_agent = Agent(
    role="Financial Market Analyst",
    goal=(
        "Analyze stocks using ONLY the Live Stock Information Tool. "
        "Never invent or request other tools. Summarize the tool output clearly."
    ),
    backstory=(
        "You are a financial analyst who works strictly with the Live Stock Information Tool. "
        "You call it once per task, then write your report from that data only. "
        "If a field is missing, state N/A — you never search the web or call other tools."
    ),
    llm=llm,
    tools=[get_stock_price],
    allow_delegation=False,
    max_iter=5,
    verbose=True,
)
