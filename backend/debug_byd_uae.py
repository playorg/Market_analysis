import yfinance as yf

def check_ticker(symbol):
    print(f"--- Checking {symbol} ---")
    try:
        t = yf.Ticker(symbol)
        hist = t.history(period="1d")
        if not hist.empty:
            price = hist['Close'].iloc[-1]
            currency = t.info.get('currency', 'Unknown')
            name = t.info.get('longName', 'Unknown')
            print(f"Success: {name} ({symbol})")
            print(f"Price: {price} {currency}")
        else:
            print(f"No Data for {symbol}")
    except Exception as e:
        print(f"Error: {e}")

# Check BYD
check_ticker("BYD")
check_ticker("BYDDY")

# Check Potential UAE Tickers
uae_tickers = [
    "EMAAR.AE",   # Emaar Properties (Dubai)
    "DEWA.AE",    # Dubai Electricity & Water
    "FAB.AD",     # First Abu Dhabi Bank
    "ADNOCDIST.AD", # ADNOC Distribution
    "ETISALAT.AD", # e&
    "ALDAR.AD",   # Aldar Properties
    "DIB.AE",     # Dubai Islamic Bank
    "AIRARABIA.AE", # Air Arabia
    "TABREED.AE",   # Tabreed
    "SALIK.AE"      # Salik
]

for t in uae_tickers:
    check_ticker(t)
