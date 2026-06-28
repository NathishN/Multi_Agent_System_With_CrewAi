from duckduckgo_search import DDGS

from crewai.tools import tool

from tools.stock_research_tool import _NAME_TO_TICKER


def _company_label(stock: str) -> str:
    symbol = stock.strip().upper()
    if symbol in _NAME_TO_TICKER:
        return f"{symbol} ({_NAME_TO_TICKER[symbol]})"
    return symbol


@tool("Stock News Search Tool")
def search_stock_news(stock: str) -> str:
    """
    Searches the web for recent news about a stock or company (e.g. APPLE, AAPL, TESLA).
    Returns headlines, sources, dates, and short snippets. Call once per task.
    """
    label = _company_label(stock)
    query = f"{label} stock latest news market"

    try:
        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=5))
    except Exception as exc:
        return f"News search failed for {label}: {exc}"

    if not results:
        return f"No recent news found for {label}. Proceed using market data only."

    lines = [f"Recent news for {label}:", ""]
    for i, item in enumerate(results, 1):
        title = item.get("title", "No title")
        source = item.get("source", "Unknown")
        date = item.get("date", "Unknown date")
        snippet = item.get("body", item.get("snippet", "")) or ""
        snippet = snippet[:200] + ("..." if len(snippet) > 200 else "")
        lines.append(f"{i}. {title}")
        lines.append(f"   Source: {source} | Date: {date}")
        if snippet:
            lines.append(f"   Summary: {snippet}")
        lines.append("")

    return "\n".join(lines)
