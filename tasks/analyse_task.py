from crewai import Task
from agents.analyst_agent import analyst_agent


get_stock_analysis = Task(
    description=(
        "Analyze the recent performance of the stock: {stock}. "
        "You MUST use only the Live Stock Information Tool (call it once with the ticker or company name). "
        "Do NOT use any other tools or web search. "
        "Write your summary from the tool output only. "
        "If the tool cannot fetch data, say N/A for missing fields."
    ),
    expected_output=(
        "A clear, bullet-pointed summary of:\n"
        "- Current stock price\n"
        "- Daily price change and percentage\n"
        "- Volume and day range (use N/A if not in tool output)\n"
        "- Brief trend observations based only on the tool data"
    ),
    agent=analyst_agent,
)
