import os
import re

from dotenv import load_dotenv

load_dotenv()

import crewai_patch  # noqa: F401, E402 — must run before crew import

from crew import stock_crew


def parse_trade_output(text: str) -> dict[str, str]:
    raw = str(text).strip()
    decision: str | None = None
    why = ""

    decision_match = re.search(
        r"Decision:\s*(Buy|Sell|Hold)\b", raw, re.IGNORECASE
    )
    if decision_match:
        decision = decision_match.group(1).lower()

    why_match = re.search(r"Why:\s*(.+)", raw, re.IGNORECASE | re.DOTALL)
    if why_match:
        why = why_match.group(1).strip()

    if not decision:
        for word in ("buy", "sell", "hold"):
            if re.search(rf"\b{word}\b", raw, re.IGNORECASE):
                decision = word
                break

    if not why:
        why = raw

    return {
        "decision": decision or "hold",
        "why": why,
    }


def analyze_stock(stock: str) -> dict[str, str]:
    if not stock.strip():
        raise ValueError("Stock symbol or company name is required")

    verbose = os.getenv("CREW_VERBOSE", "false").lower() == "true"
    stock_crew.verbose = verbose

    result = stock_crew.kickoff(inputs={"stock": stock.strip()})
    parsed = parse_trade_output(str(result))
    return {
        "stock": stock.strip(),
        "decision": parsed["decision"],
        "why": parsed["why"],
    }
