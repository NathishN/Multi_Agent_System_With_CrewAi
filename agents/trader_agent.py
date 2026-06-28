from crewai import Agent, LLM

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0
)

trader_agent = Agent(
    role="Strategic Stock Trader",
    goal=(
        "Decide Buy, Sell, or Hold using the validated market briefing AND the news brief. "
        "Output exactly one word (Buy, Sell, or Hold) plus a detailed why paragraph."
    ),
    backstory=(
        "You combine live market data with recent news before trading. "
        "You never invent figures or headlines. Your final answer uses this format: "
        "Decision: <Buy|Sell|Hold> then Why: <detailed multi-sentence explanation>."
    ),
    llm=llm,
    tools=[],
    allow_delegation=False,
    verbose=True,
)
