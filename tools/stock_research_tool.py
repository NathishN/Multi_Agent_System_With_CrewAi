import yfinance as yf
from crewai.tools import tool

_NAME_TO_TICKER = {
    "APPLE": "AAPL",
    "TESLA": "TSLA",
    "MICROSOFT": "MSFT",
    "GOOGLE": "GOOG",
    "ALPHABET": "GOOG",
    "AMAZON": "AMZN",
    "NVIDIA": "NVDA",
    "META": "META",
    "NETFLIX": "NFLX",
}


def _resolve_ticker(stock_symbol: str) -> str:
    symbol = stock_symbol.strip().upper()
    if symbol in _NAME_TO_TICKER:
        return _NAME_TO_TICKER[symbol]
    return symbol


@tool("Live Stock Information Tool")
def get_stock_price(stock_symbol: str) -> str:
    """
    Retrieves live market data for a stock ticker or company name (e.g. AAPL, APPLE, TSLA).
    Returns price, daily change, volume, day range, and related fields in one response.
    Call this tool once; use only the returned data for your analysis.
    """
    ticker = _resolve_ticker(stock_symbol)
    stock = yf.Ticker(ticker)
    info = stock.info

    current_price = info.get("regularMarketPrice") or info.get("currentPrice")
    if current_price is None:
        return f"Could not fetch price for {stock_symbol} ({ticker}). Check the symbol."

    change = info.get("regularMarketChange")
    change_percent = info.get("regularMarketChangePercent")
    volume = info.get("regularMarketVolume") or info.get("volume")
    day_high = info.get("regularMarketDayHigh") or info.get("dayHigh")
    day_low = info.get("regularMarketDayLow") or info.get("dayLow")
    open_price = info.get("regularMarketOpen") or info.get("open")
    prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose")
    currency = info.get("currency", "USD")

    def _fmt(value, suffix=""):
        if value is None:
            return "N/A"
        if isinstance(value, float):
            return f"{value:,.2f}{suffix}"
        return f"{value}{suffix}"

    pct = round(change_percent * 100, 2) if change_percent is not None else "N/A"

    return (
        f"Stock: {ticker}\n"
        f"Price: {_fmt(current_price)} {currency}\n"
        f"Daily change: {_fmt(change)} ({pct}%)\n"
        f"Open: {_fmt(open_price)} {currency}\n"
        f"Previous close: {_fmt(prev_close)} {currency}\n"
        f"Day range: {_fmt(day_low)} - {_fmt(day_high)} {currency}\n"
        f"Volume: {_fmt(volume)}\n"
        f"Note: All available live fields from this tool are listed above."
    )
