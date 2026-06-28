from crewai import Task

from agents.risk_reviewer_agent import risk_reviewer_agent
from tasks.analyse_task import get_stock_analysis

validate_analysis = Task(
    description=(
        "Review the prior market analysis for {stock}. "
        "Call the Live Stock Information Tool once to fetch fresh data and compare it to the analyst report. "
        "Correct any mismatched numbers, note data quality issues, and add a short risk assessment "
        "(momentum, volatility from day range, volume context). "
        "Do NOT use any tools other than Live Stock Information Tool. "
        "If data is missing from the tool output, note it as N/A."
    ),
    expected_output=(
        "A validated briefing with:\n"
        "- Verified figures (price, change %, volume, day range)\n"
        "- Discrepancies found vs the analyst report (or 'none')\n"
        "- Risk level: Low / Medium / High with one-line rationale\n"
        "- Key signals the trader should weigh (3-5 bullets)"
    ),
    agent=risk_reviewer_agent,
    context=[get_stock_analysis],
)
