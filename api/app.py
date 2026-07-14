from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from service import analyze_stock

app = FastAPI(
    title="Stock Trading Advisor API",
    description="Multi-agent CrewAI analysis returning Buy, Sell, or Hold.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class StockRequest(BaseModel):
    stock: str = Field(..., min_length=1, max_length=64, examples=["AAPL", "TCS.NS", "RELIANCE"])


class StockResponse(BaseModel):
    stock: str
    decision: str
    why: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


import yfinance as yf
from tools.stock_research_tool import _resolve_ticker, _detect_market

@app.get("/api/stock-data/{ticker}")
def get_stock_data(ticker: str):
    try:
        resolved_ticker = _resolve_ticker(ticker)
        stock = yf.Ticker(resolved_ticker)
        info = stock.info
        current_price = info.get("regularMarketPrice") or info.get("currentPrice")
        
        if current_price is None:
            return {"error": "Could not fetch data for this ticker."}
            
        change = info.get("regularMarketChange")
        change_percent = info.get("regularMarketChangePercent")
        market = _detect_market(resolved_ticker)
        currency = info.get("currency", "INR" if market == "India" else "USD")
        
        return {
            "price": current_price,
            "change": change,
            "changePercent": change_percent * 100 if change_percent else 0,
            "currency": currency,
            "market": market,
            "volume": info.get("regularMarketVolume") or info.get("volume"),
            "resolvedTicker": resolved_ticker
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/analyze", response_model=StockResponse)
def analyze(request: StockRequest):
    try:
        return analyze_stock(request.stock)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {exc}",
        ) from exc

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Serve the static files from the frontend directory
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")
app.mount("/js", StaticFiles(directory="frontend/js"), name="js")

@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join("frontend", "index.html"))
