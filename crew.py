from crewai import Crew, Process

from agents.analyst_agent import analyst_agent
from agents.research_agent import research_agent
from agents.risk_reviewer_agent import risk_reviewer_agent
from agents.trader_agent import trader_agent
from tasks.analyse_task import get_stock_analysis
from tasks.research_task import research_stock_news
from tasks.review_task import validate_analysis
from tasks.trade_task import trade_decision

stock_crew = Crew(
    agents=[analyst_agent, risk_reviewer_agent, research_agent, trader_agent],
    tasks=[
        get_stock_analysis,
        validate_analysis,
        research_stock_news,
        trade_decision,
    ],
    process=Process.sequential,
    verbose=True,
)
