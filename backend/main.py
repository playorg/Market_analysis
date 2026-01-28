from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import analysis

app = FastAPI(title="Market Analysis Tool", description="Backend for analyzing market trends")

# CORS setup to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    symbol: str

@app.get("/")
def read_root():
    return {"message": "Market Analysis Tool API is running"}

@app.get("/api/market-summary")
def get_market_summary():
    """Returns top gainers, losers, and general market info."""
    return analysis.get_market_summary()

@app.get("/api/analyze/{symbol}")
def analyze_stock(symbol: str):
    """Analyzes a specific stock/crypto symbol."""
    try:
        data = analysis.get_comprehensive_analysis(symbol)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news")
def get_news(symbol: Optional[str] = None):
    """Fetches market news, optionally filtered by symbol."""
    return analysis.get_news(symbol)

@app.get("/api/dashboard-news")
def get_dashboard_news():
    """Returns news categorized by rising and falling stocks."""
    return analysis.get_dashboard_news()

@app.get("/api/currency-rate")
def get_currency_rate(to: str = "EUR"):
    """Returns exchange rate from USD to target currency."""
    return {"rate": analysis.get_currency_rate("USD", to)}

@app.get("/api/market-categories")
def get_categories():
    """Returns curated stock lists by category."""
    return analysis.get_market_categories()

@app.get("/api/portfolio")
def get_portfolio():
    """Returns user's portfolio status with P/L."""
    return analysis.get_portfolio_status()

@app.post("/api/portfolio/add")
def add_portfolio_item(item: dict):
    if analysis.add_portfolio_item(item):
        return {"status": "success"}
    return {"status": "error"}

@app.delete("/api/portfolio/{symbol}")
def delete_portfolio_item(symbol: str):
    if analysis.delete_portfolio_item(symbol):
        return {"status": "success"}
    return {"status": "error"}

@app.get("/api/watchlist")
def get_watchlist():
    return analysis.get_watchlist()

@app.post("/api/watchlist/add")
def add_to_watchlist(item: dict):
    # item = {"symbol": "AAPL", "category": "My Faves"}
    if analysis.add_to_watchlist(item["symbol"], item["category"]):
        return {"status": "success"}
    return {"status": "error"}

@app.post("/api/watchlist/delete")
def delete_from_watchlist(item: dict):
    if analysis.delete_from_watchlist(item["symbol"], item["category"]):
        return {"status": "success"}
    return {"status": "error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
