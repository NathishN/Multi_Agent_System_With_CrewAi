from dotenv import load_dotenv

load_dotenv()

import crewai_patch  # noqa: F401

from service import analyze_stock


def run(stock: str):
    result = analyze_stock(stock)
    print("\n" + "=" * 50)
    print("FINAL TRADING CALL")
    print("=" * 50)
    print(f"Decision: {result['decision'].capitalize()}")
    print(f"Why: {result['why']}")


if __name__ == "__main__":
    run("APPLE")
