from crewai import Task

from agents.trader_agent import trader_agent
from tasks.research_task import research_stock_news
from tasks.review_task import validate_analysis

trade_decision = Task(
    description=(
        "For {stock}, make a final trading decision using:\n"
        "1) The validated market briefing (price, volume, risk level)\n"
        "2) The news brief (headlines and sentiment)\n"
        "Weigh both equally. Do not use tools."
    ),
    expected_output=(
        "Use exactly this format:\n"
        "Decision: Hold\n"
        "Why: A detailed paragraph (3–6 sentences) explaining the call. "
        "Cite specific price, volume, risk level from the market briefing and "
        "headlines/sentiment from the news brief. Explain how both sources support the decision.\n"
        "\n"
        "Decision must be exactly one word: Buy, Sell, or Hold."
    ),
    agent=trader_agent,
    context=[validate_analysis, research_stock_news],
)
