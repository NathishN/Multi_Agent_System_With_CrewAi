import yfinance as yf
from crewai.tools import tool

# ── US company name → ticker ──────────────────────────────────────────────────
_US_NAME_TO_TICKER = {
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

# ── Indian company name → NSE ticker (Yahoo Finance format) ───────────────────
_INDIA_NAME_TO_TICKER = {
    # IT / Technology
    "TCS": "TCS.NS",
    "TATA CONSULTANCY": "TCS.NS",
    "TATA CONSULTANCY SERVICES": "TCS.NS",
    "INFOSYS": "INFY.NS",
    "INFY": "INFY.NS",
    "WIPRO": "WIPRO.NS",
    "HCL": "HCLTECH.NS",
    "HCLTECH": "HCLTECH.NS",
    "HCL TECHNOLOGIES": "HCLTECH.NS",
    "TECHM": "TECHM.NS",
    "TECH MAHINDRA": "TECHM.NS",
    "MPHASIS": "MPHASIS.NS",
    "LTIM": "LTIM.NS",
    "LTI MINDTREE": "LTIM.NS",
    "LTIMINDTREE": "LTIM.NS",
    "PERSISTENT": "PERSISTENT.NS",
    # Banking & Finance
    "HDFC BANK": "HDFCBANK.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICI BANK": "ICICIBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "SBI": "SBIN.NS",
    "STATE BANK": "SBIN.NS",
    "STATE BANK OF INDIA": "SBIN.NS",
    "SBIN": "SBIN.NS",
    "AXIS BANK": "AXISBANK.NS",
    "AXISBANK": "AXISBANK.NS",
    "KOTAK": "KOTAKBANK.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "KOTAK MAHINDRA": "KOTAKBANK.NS",
    "KOTAK MAHINDRA BANK": "KOTAKBANK.NS",
    "BAJAJ FINANCE": "BAJFINANCE.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "BAJAJ FINSERV": "BAJAJFINSV.NS",
    "BAJAJFINSV": "BAJAJFINSV.NS",
    "INDUSIND": "INDUSINDBK.NS",
    "INDUSIND BANK": "INDUSINDBK.NS",
    # Energy & Utilities
    "RELIANCE": "RELIANCE.NS",
    "RELIANCE INDUSTRIES": "RELIANCE.NS",
    "ONGC": "ONGC.NS",
    "OIL AND NATURAL GAS": "ONGC.NS",
    "NTPC": "NTPC.NS",
    "POWERGRID": "POWERGRID.NS",
    "POWER GRID": "POWERGRID.NS",
    "ADANI GREEN": "ADANIGREEN.NS",
    "ADANIGREEN": "ADANIGREEN.NS",
    "ADANI ENTERPRISES": "ADANIENT.NS",
    "ADANIENT": "ADANIENT.NS",
    "ADANI PORTS": "ADANIPORTS.NS",
    "ADANIPORTS": "ADANIPORTS.NS",
    # Conglomerates / Diversified
    "TATA MOTORS": "TATAMOTORS.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "TATA STEEL": "TATASTEEL.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "M&M": "M&M.NS",
    "MAHINDRA": "M&M.NS",
    "MAHINDRA AND MAHINDRA": "M&M.NS",
    "LARSEN": "LT.NS",
    "LARSEN AND TOUBRO": "LT.NS",
    "L&T": "LT.NS",
    "LT": "LT.NS",
    "ITC": "ITC.NS",
    "HINDUSTAN UNILEVER": "HINDUNILVR.NS",
    "HUL": "HINDUNILVR.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    # Pharma
    "SUN PHARMA": "SUNPHARMA.NS",
    "SUNPHARMA": "SUNPHARMA.NS",
    "DR REDDY": "DRREDDY.NS",
    "DR. REDDYS": "DRREDDY.NS",
    "DRREDDY": "DRREDDY.NS",
    "CIPLA": "CIPLA.NS",
    "DIVI": "DIVISLAB.NS",
    "DIVIS": "DIVISLAB.NS",
    "DIVISLAB": "DIVISLAB.NS",
    # Telecom
    "AIRTEL": "BHARTIARTL.NS",
    "BHARTI AIRTEL": "BHARTIARTL.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "JIO": "RELIANCE.NS",
    # Auto
    "MARUTI": "MARUTI.NS",
    "MARUTI SUZUKI": "MARUTI.NS",
    "HERO MOTOCORP": "HEROMOTOCO.NS",
    "HERO": "HEROMOTOCO.NS",
    "BAJAJ AUTO": "BAJAJ-AUTO.NS",
    "BAJAJAUTO": "BAJAJ-AUTO.NS",
    # Cement / Materials
    "ULTRATECH": "ULTRACEMCO.NS",
    "ULTRACEMCO": "ULTRACEMCO.NS",
    "ULTRATECH CEMENT": "ULTRACEMCO.NS",
    "GRASIM": "GRASIM.NS",
    "SHREE CEMENT": "SHREECEM.NS",
    # Consumer / FMCG
    "NESTLE": "NESTLEIND.NS",
    "NESTLEIND": "NESTLEIND.NS",
    "ASIAN PAINTS": "ASIANPAINT.NS",
    "ASIANPAINT": "ASIANPAINT.NS",
    "TITAN": "TITAN.NS",
    # Indices (for reference)
    "NIFTY": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "BANK NIFTY": "^NSEBANK",
}

# Set of known bare Indian NSE symbols that should get .NS auto-appended
_INDIA_BARE_SYMBOLS = {
    "TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "MPHASIS", "LTIM", "PERSISTENT",
    "HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK", "BAJFINANCE",
    "BAJAJFINSV", "INDUSINDBK", "RELIANCE", "ONGC", "NTPC", "POWERGRID",
    "ADANIGREEN", "ADANIENT", "ADANIPORTS", "TATAMOTORS", "TATASTEEL",
    "LT", "ITC", "HINDUNILVR", "SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB",
    "BHARTIARTL", "MARUTI", "HEROMOTOCO", "ULTRACEMCO", "GRASIM", "SHREECEM",
    "NESTLEIND", "ASIANPAINT", "TITAN", "GRASIM", "M&M", "BAJAJ-AUTO",
}


def _resolve_ticker(stock_symbol: str) -> str:
    """
    Resolve a user-provided stock name or symbol to a Yahoo Finance ticker.

    Priority:
    1. Already suffixed (.NS or .BO) — pass through unchanged.
    2. Indian company name lookup (e.g., "Reliance" → "RELIANCE.NS").
    3. US company name lookup (e.g., "Apple" → "AAPL").
    4. Known bare Indian NSE symbol (e.g., "TCS" → "TCS.NS").
    5. Return as-is (assumed to be a valid US ticker or raw YF ticker).
    """
    symbol = stock_symbol.strip().upper()

    # Already has a market suffix — return unchanged
    if symbol.endswith(".NS") or symbol.endswith(".BO"):
        return symbol

    # Check Indian name map first
    if symbol in _INDIA_NAME_TO_TICKER:
        return _INDIA_NAME_TO_TICKER[symbol]

    # Check US name map
    if symbol in _US_NAME_TO_TICKER:
        return _US_NAME_TO_TICKER[symbol]

    # Auto-append .NS for known Indian bare symbols
    if symbol in _INDIA_BARE_SYMBOLS:
        return f"{symbol}.NS"

    # Return as-is (e.g. AAPL, TSLA, or an unknown ticker)
    return symbol


def _detect_market(ticker: str) -> str:
    """Return 'India' if the ticker is an NSE/BSE ticker, else 'US'."""
    upper = ticker.upper()
    if upper.endswith(".NS") or upper.endswith(".BO"):
        return "India"
    if upper in _INDIA_BARE_SYMBOLS or upper in _INDIA_NAME_TO_TICKER:
        return "India"
    return "US"


@tool("Live Stock Information Tool")
def get_stock_price(stock_symbol: str) -> str:
    """
    Retrieves live market data for a stock ticker or company name.
    Supports both US stocks (e.g. AAPL, APPLE, TSLA) and Indian stocks
    (e.g. TCS, RELIANCE, INFY, or explicit Yahoo Finance tickers like TCS.NS, RELIANCE.NS).
    Returns price, daily change, volume, day range, and related fields in one response.
    Call this tool once; use only the returned data for your analysis.
    """
    ticker = _resolve_ticker(stock_symbol)
    market = _detect_market(ticker)
    stock = yf.Ticker(ticker)
    info = stock.info

    current_price = info.get("regularMarketPrice") or info.get("currentPrice")
    if current_price is None:
        return (
            f"Could not fetch price for {stock_symbol} ({ticker}). "
            "Please make sure to use an exact Yahoo Finance ticker symbol "
            "(e.g., AAPL for US stocks, TCS.NS for Indian NSE stocks, TCS.BO for BSE)."
        )

    change = info.get("regularMarketChange")
    change_percent = info.get("regularMarketChangePercent")
    volume = info.get("regularMarketVolume") or info.get("volume")
    day_high = info.get("regularMarketDayHigh") or info.get("dayHigh")
    day_low = info.get("regularMarketDayLow") or info.get("dayLow")
    open_price = info.get("regularMarketOpen") or info.get("open")
    prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose")
    currency = info.get("currency", "INR" if market == "India" else "USD")
    exchange = info.get("exchange", "NSE" if market == "India" else "")

    def _fmt(value, suffix=""):
        if value is None:
            return "N/A"
        if isinstance(value, float):
            return f"{value:,.2f}{suffix}"
        return f"{value}{suffix}"

    pct = round(change_percent * 100, 2) if change_percent is not None else "N/A"

    return (
        f"Stock: {ticker}\n"
        f"Market: {market}{' (' + exchange + ')' if exchange else ''}\n"
        f"Price: {_fmt(current_price)} {currency}\n"
        f"Daily change: {_fmt(change)} ({pct}%)\n"
        f"Open: {_fmt(open_price)} {currency}\n"
        f"Previous close: {_fmt(prev_close)} {currency}\n"
        f"Day range: {_fmt(day_low)} - {_fmt(day_high)} {currency}\n"
        f"Volume: {_fmt(volume)}\n"
        f"Note: All available live fields from this tool are listed above."
    )
