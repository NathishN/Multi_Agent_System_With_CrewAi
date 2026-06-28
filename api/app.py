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
    stock: str = Field(..., min_length=1, max_length=64, examples=["AAPL"])


class StockResponse(BaseModel):
    stock: str
    decision: str
    why: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


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
