import yfinance as yf
import json

symbols = ["AAPL", "BTC-USD", "NVDA", "BYDDY"]

for sym in symbols:
    print(f"--- {sym} ---")
    try:
        ticker = yf.Ticker(sym)
        news = ticker.news
        print(f"Count: {len(news)}")
        if news:
            print(json.dumps(news[0], indent=2))
        else:
            print("No news found.")
            # Try search fallback?
            # print("Attempting fallback search...")
            # search = yf.Search(sym, news_count=3)
            # print(search.news)
    except Exception as e:
        print(f"Error: {e}")
