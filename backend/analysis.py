import yfinance as yf
import pandas as pd
import json
from datetime import datetime

def get_market_summary():
    # Real-world implementation would fetch top gainers/losers from an API
    # For now, we return major indices
    tickers = ["^GSPC", "^DJI", "^IXIC", "BTC-USD", "ETH-USD"]
    data = []
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        try:
            info = stock.info
            # Provide safe defaults if keys are missing
            hist = stock.history(period="2d")
            
            price = 0.0
            change = 0.0
            
            if not hist.empty:
                 current = hist['Close'].iloc[-1]
                 prev = hist['Close'].iloc[0] # roughly previous close if period is 2d?
                 # Actually yfinance history returns days. iloc[-1] is today/latest, iloc[-2] is yesterday.
                 if len(hist) > 1:
                     prev = hist['Close'].iloc[-2]
                     price = current
                     change = ((current - prev) / prev) * 100
                 else:
                     price = current
            
            name = info.get('shortName', ticker)
            
            data.append({
                "symbol": ticker,
                "name": name,
                "price": price,
                "change_percent": change
            })
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            
    return {"indices": data}

def calculate_rsi(data, window=14):
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1]

def get_comprehensive_analysis(symbol):
    # Ticker fixes
    if "PEPE" in symbol: symbol = "PEPE-USD"
    
    stock = yf.Ticker(symbol)
    info = stock.info
    
    # 1. Fundamentals
    fundamentals = {
        "name": info.get("longName", symbol),
        "sector": info.get("sector", "N/A"),
        "industry": info.get("industry", "N/A"),
        "market_cap": info.get("marketCap", "N/A"),
        "pe_ratio": info.get("trailingPE", "N/A"),
        "revenue": info.get("totalRevenue", "N/A"),
        "debt_to_equity": info.get("debtToEquity", "N/A"),
        "profit_margins": info.get("profitMargins", "N/A"),
        "52_week_high": info.get("fiftyTwoWeekHigh", "N/A"),
        "52_week_low": info.get("fiftyTwoWeekLow", "N/A"),
    }
    
    
    # 2. Technical Analysis (Enhanced)
    hist = stock.history(period="6mo")
    
    # Defaults
    signal_data = {
        "action": "HOLD",
        "signal": "NEUTRAL",
        "explanation": "Market data is insufficient for a clear signal.",
        "next_check": "24 Hours",
        "suggested_investment": "€0"
    }
    
    rsi_val = 50
    
    if not hist.empty and len(hist) > 30:
        rsi_val = calculate_rsi(hist)
        
        # Simple Moving Averages
        sma_50 = hist['Close'].rolling(window=50).mean().iloc[-1]
        current_price = hist['Close'].iloc[-1]
        
        # Logic for Recommendations
        # User wants small comfortable investments (e.g. 50-100 EUR)
        if rsi_val < 30:
            signal_data = {
                "action": "BUY NOW",
                "signal": "STRONG BUY",
                "explanation": f"RSI is {rsi_val:.1f} (Oversold). Price is at a discount. Good time to enter.",
                "next_check": "4 Hours",
                "suggested_investment": "€100 - €150"
            }
        elif rsi_val > 75:
            signal_data = {
                "action": "SELL NOW",
                "signal": "STRONG SELL",
                "explanation": f"RSI is {rsi_val:.1f} (Overbought). Profit Taking Opportunity!",
                "next_check": "2 Hours",
                "suggested_investment": "Consider Selling 25%-50%"
            }
        elif rsi_val > 65:
             signal_data = {
                "action": "WAIT / SELL",
                "signal": "SELL",
                "explanation": f"RSI is {rsi_val:.1f}. High momentum. Watch closely for sell signal.",
                "next_check": "8 Hours",
                 "suggested_investment": "Hold / Sell partial"
            }
        elif rsi_val < 40:
             signal_data = {
                "action": "ACCUMULATE",
                "signal": "BUY",
                "explanation": f"RSI is {rsi_val:.1f}. Good zone to start building position.",
                "next_check": "12 Hours",
                "suggested_investment": "€50 - €75"
            }
        else:
            # Trend Check
            trend = "Uptrend" if current_price > sma_50 else "Downtrend"
            signal_data = {
                "action": "HOLD",
                "signal": "NEUTRAL",
                "explanation": f"RSI is {rsi_val:.1f} (Neutral). Market is in a {trend}. No clear entry.",
                "next_check": "1 Day",
                "suggested_investment": "€0 (Wait)"
            }
            
    # 3. News
    news_items = []
    if hasattr(stock, 'news'):
        for n in stock.news[:5]:
            try:
                # Handle different yfinance news structures
                title = n.get('title')
                link = n.get('link')
                publisher = n.get('publisher')
                
                # New structure (nested in 'content')
                if not title and 'content' in n and isinstance(n['content'], dict):
                    content = n['content']
                    title = content.get('title')
                    
                    # Link locations vary
                    if 'clickThroughUrl' in content and content['clickThroughUrl'] and 'url' in content['clickThroughUrl']:
                        link = content['clickThroughUrl']['url']
                    elif 'canonicalUrl' in content and content['canonicalUrl'] and 'url' in content['canonicalUrl']:
                        link = content['canonicalUrl']['url']
                        
                    # Publisher
                    if 'provider' in content and content['provider'] and 'displayName' in content['provider']:
                        publisher = content['provider']['displayName']
                
                if title:
                    news_items.append({
                        "title": title,
                        "link": link,
                        "publisher": publisher,
                        "relatedTickers": n.get('relatedTickers', [])
                    })
            except Exception as e:
                print(f"Error parsing news item for {symbol}: {e}")
                continue
            
    return {
        "symbol": symbol,
        "fundamentals": fundamentals,
        "technical_analysis": {
            "signal": signal_data["signal"],
            "action": signal_data["action"],
            "explanation": signal_data["explanation"],
            "next_check": signal_data["next_check"],
            "suggested_investment": signal_data["suggested_investment"],
            "rsi": rsi_val
        },
        "price_history": hist['Close'].tail(30).to_dict(),
        "news": news_items
    }

def get_portfolio_status():
    # Load from JSON
    try:
        with open("portfolio.json", "r") as f:
            holdings = json.load(f)
    except FileNotFoundError:
        holdings = []
    
    portfolio_summary = []
    total_value = 0.0
    total_cost = 0.0
    
    usd_to_eur = get_currency_rate("USD", "EUR")
    
    for item in holdings:
        symbol = item["symbol"]
        qty = item["quantity"]
        cost = item["total_investment_eur"]
        
        # Get Current Price
        # Handle PEPE specifically or general
        search_sym = symbol
        if "PEPE" in symbol: search_sym = "PEPE-USD"
        if "BTC" in symbol: search_sym = "BTC-USD"
        
        try:
             ticker = yf.Ticker(search_sym)
             hist = ticker.history(period="1d")
             
             # Fallback for PEPE if yfinance fails (common for meme coins)
             if hist.empty and "PEPE" in search_sym:
                 # Create a dummy dataframe with approximate current price
                 import pandas as pd
                 current_price_usd = 0.0000185 # Hardcoded estimation
                 print(f"Using fallback price for {search_sym}: {current_price_usd}")
                 
                 # Logic duplication handling (simplified)
                 if "EUR" in symbol: 
                     current_price_eur = current_price_usd * usd_to_eur
                 else:
                     current_price_eur = current_price_usd * usd_to_eur
                     
                 current_value = qty * current_price_eur
                 pl = current_value - cost
                 pl_percent = (pl / cost) * 100 if cost > 0 else 0
                 
                 portfolio_summary.append({
                     "symbol": symbol.split('-')[0],
                     "full_symbol": symbol,
                     "quantity": qty,
                     "current_price_eur": current_price_eur,
                     "current_value_eur": current_value,
                     "cost_basis_eur": cost,
                     "pl_eur": pl,
                     "pl_percent": pl_percent
                 })
                 total_value += current_value
                 total_cost += item.get("total_investment_eur", 0)
                 continue # Skip standard logic

             if not hist.empty:
                 current_price_usd = hist['Close'].iloc[-1]
                 
                 # Convert to EUR if needed
                 if "EUR" in symbol:
                     current_price_eur = current_price_usd * usd_to_eur
                 else:
                     current_price_eur = current_price_usd * usd_to_eur
                 
                 # For PEPE, price is tiny.
                 current_value = qty * current_price_eur
                 
                 pl = current_value - cost
                 pl_percent = (pl / cost) * 100 if cost > 0 else 0
                 
                 portfolio_summary.append({
                     "symbol": symbol.split('-')[0],
                     "full_symbol": symbol, # Keep full symbol for deletion
                     "quantity": qty,
                     "current_price_eur": current_price_eur,
                     "current_value_eur": current_value,
                     "cost_basis_eur": cost,
                     "pl_eur": pl,
                     "pl_percent": pl_percent
                 })
                 
                 total_value += current_value
                 total_cost += item.get("total_investment_eur", 0)
             else:
                print(f"No data for {symbol}")
                raise Exception("No data found")
        except Exception as e:
            print(f"Error portfolio {symbol}: {e}")
            # Add item even if error, with 0 values so user can delete it
            portfolio_summary.append({
                     "symbol": symbol,
                     "full_symbol": symbol,
                     "quantity": qty,
                     "current_price_eur": 0,
                     "current_value_eur": 0,
                     "cost_basis_eur": cost,
                     "pl_eur": -cost,
                     "pl_percent": -100
            })
            total_cost += cost

    total_pl = total_value - total_cost
    goal = 10000.0
    goal_progress_percent = (total_pl / goal) * 100 if total_pl > 0 else 0
            
    return {
        "total_value_eur": total_value,
        "total_cost_eur": total_cost,
        "total_pl_eur": total_pl,
        "goal_target": goal,
        "goal_progress_percent": min(goal_progress_percent, 100), # Cap at 100%
        "holdings": portfolio_summary
    }

def add_portfolio_item(item):
    try:
        with open("portfolio.json", "r") as f:
            holdings = json.load(f)
    except FileNotFoundError:
        holdings = []
    
    holdings.append(item)
    
    with open("portfolio.json", "w") as f:
        json.dump(holdings, f, indent=4)
    return True

def delete_portfolio_item(symbol):
    try:
        with open("portfolio.json", "r") as f:
            holdings = json.load(f)
        
        # Filter out the item
        new_holdings = [h for h in holdings if h["symbol"] != symbol]
        
        with open("portfolio.json", "w") as f:
            json.dump(new_holdings, f, indent=4)
        return True
    except print(0):
        return False

# --- Watchlist Logic ---

def get_watchlist():
    try:
        with open("watchlist.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def add_to_watchlist(symbol, category):
    try:
        with open("watchlist.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    
    if category not in data:
        data[category] = []
    
    if symbol not in data[category]:
        data[category].append(symbol)
    
    with open("watchlist.json", "w") as f:
        json.dump(data, f, indent=4)
    return True

def delete_from_watchlist(symbol, category):
    try:
        with open("watchlist.json", "r") as f:
            data = json.load(f)
        
        if category in data and symbol in data[category]:
            data[category].remove(symbol)
            # Remove category if empty? Maybe keep it for now so user doesn't lose the name
            # if not data[category]: del data[category] 
            
            with open("watchlist.json", "w") as f:
                json.dump(data, f, indent=4)
            return True
        return False
    except FileNotFoundError:
        return False

def get_news(symbol=None):
    # If symbol is provided, get specific news, else general market news
    # For now, we reuse the stock specific one or just return empty for general if yfinance doesn't support general easily
    return []

def get_currency_rate(from_currency="USD", to_currency="EUR"):
    try:
        # yfinance ticker for USD to EUR is 'EUR=X'
        ticker = f"{to_currency}=X" if from_currency == "USD" else f"{from_currency}{to_currency}=X"
        data = yf.Ticker(ticker)
        hist = data.history(period="1d")
        if not hist.empty:
            return hist['Close'].iloc[-1]
        return 0.92 # Fallback
    except:
        return 0.92

def get_market_categories():
    return {
        "AI & Machine Learning": [
            {"symbol": "NVDA", "name": "NVIDIA"},
            {"symbol": "AMD", "name": "AMD"},
            {"symbol": "MSFT", "name": "Microsoft"},
            {"symbol": "GOOGL", "name": "Alphabet"},
            {"symbol": "PLTR", "name": "Palantir"},
            {"symbol": "AI", "name": "C3.ai"},
            {"symbol": "TSMC", "name": "TSMC"}
        ],
        "Semiconductors": [
            {"symbol": "ASML", "name": "ASML (Europe)"},
            {"symbol": "TSM", "name": "TSMC (Taiwan)"},
            {"symbol": "AVGO", "name": "Broadcom"},
            {"symbol": "TXN", "name": "Texas Instruments"},
            {"symbol": "QCOM", "name": "Qualcomm"},
            {"symbol": "INTC", "name": "Intel"},
            {"symbol": "AMAT", "name": "Applied Materials"}
        ],
        "Quantum Computing": [
            {"symbol": "IBM", "name": "IBM"},
            {"symbol": "IONQ", "name": "IonQ"},
            {"symbol": "QUBT", "name": "Quantum Computing Inc"},
            {"symbol": "RGTI", "name": "Rigetti Computing"},
            {"symbol": "GOOGL", "name": "Google Quantum"}
        ],
        "Robotics & Automation": [
            {"symbol": "ISRG", "name": "Intuitive Surgical"},
            {"symbol": "TSLA", "name": "Tesla"},
            {"symbol": "DE", "name": "Deere & Co"},
            {"symbol": "ROK", "name": "Rockwell Automation"},
            {"symbol": "PATH", "name": "UiPath"},
            {"symbol": "ABB", "name": "ABB Ltd"}
        ],
        "Research & Development": [
             {"symbol": "JOBY", "name": "Joby Aviation"},
             {"symbol": "DNA", "name": "Ginkgo Bioworks"},
             {"symbol": "CRSP", "name": "CRISPR Therapeutics"},
             {"symbol": "PLUG", "name": "Plug Power"},
             {"symbol": "SPCE", "name": "Virgin Galactic"}
        ],
        "Cybersecurity": [
            {"symbol": "CRWD", "name": "CrowdStrike"},
            {"symbol": "PANW", "name": "Palo Alto Networks"},
            {"symbol": "FTNT", "name": "Fortinet"},
            {"symbol": "ZS", "name": "Zscaler"},
            {"symbol": "NET", "name": "Cloudflare"}
        ],
        "Green Energy": [
            {"symbol": "ENPH", "name": "Enphase Energy"},
            {"symbol": "FSLR", "name": "First Solar"},
            {"symbol": "NEE", "name": "NextEra Energy"},
            {"symbol": "SEDG", "name": "SolarEdge"},
            {"symbol": "VWDRY", "name": "Vestas Wind"}
        ],
        "Chinese Tech": [
            {"symbol": "BABA", "name": "Alibaba"},
            {"symbol": "PDD", "name": "Pinduoduo"},
            {"symbol": "BIDU", "name": "Baidu"},
            {"symbol": "JD", "name": "JD.com"},
            {"symbol": "NIO", "name": "NIO Inc"},
            {"symbol": "BYDDY", "name": "BYD Co"}
        ],
        "UAE Markets": [
            {"symbol": "EMAAR.AE", "name": "Emaar Properties"},
            {"symbol": "DEWA.AE", "name": "DEWA"},
            {"symbol": "DIB.AE", "name": "Dubai Islamic Bank"},
            {"symbol": "AIRARABIA.AE", "name": "Air Arabia"},
            {"symbol": "SALIK.AE", "name": "Salik"},
            {"symbol": "TABREED.AE", "name": "Tabreed"},
            {"symbol": "DIC.AE", "name": "Dubai Investments"},
            {"symbol": "EMPOWER.AE", "name": "Empower"}
        ],
        "European Giants": [
            {"symbol": "SAP", "name": "SAP SE"},
            {"symbol": "ASML", "name": "ASML"},
            {"symbol": "NVO", "name": "Novo Nordisk"},
            {"symbol": "AZN", "name": "AstraZeneca"},
            {"symbol": "SHEL", "name": "Shell"},
            {"symbol": "SIE.DE", "name": "Siemens (OTC: SMEGF)"} 
        ]
    }

def get_dashboard_news():
    # Curated list of active tickers to scan for news
    tickers_to_scan = [
        "NVDA", "TSLA", "AAPL", "AMD", "MSFT", "GOOGL", "AMZN", "META", # Tech Giants
        "BTC-USD", "ETH-USD", "SOL-USD", # Crypto
        "COIN", "MARA", # Crypto Stocks
        "GME", "AMC", # Meme / Volatile
        "SPY", "QQQ" # Indices
    ]
    
    rising_news = []
    falling_news = []
    processed_titles = set()
    
    for ticker_sym in tickers_to_scan:
        try:
            stock = yf.Ticker(ticker_sym)
            
            # Get Price Change
            hist = stock.history(period="2d")
            if hist.empty or len(hist) < 1:
                continue
                
            current = hist['Close'].iloc[-1]
            prev = hist['Close'].iloc[0]
            if len(hist) > 1:
                prev = hist['Close'].iloc[-2]
                
            change_percent = ((current - prev) / prev) * 100
            
            # Get News
            if hasattr(stock, 'news'):
                for n in stock.news[:2]: # Get top 2 news per ticker to ensure variety
                    try:
                        title = n.get('title')
                        
                        # New structure handling (same as comprehensive analysis)
                        link = n.get('link')
                        publisher = n.get('publisher')
                        
                        if not title and 'content' in n and isinstance(n['content'], dict):
                            content = n['content']
                            title = content.get('title')
                            
                            if 'clickThroughUrl' in content and content['clickThroughUrl'] and 'url' in content['clickThroughUrl']:
                                link = content['clickThroughUrl']['url']
                            elif 'canonicalUrl' in content and content['canonicalUrl'] and 'url' in content['canonicalUrl']:
                                link = content['canonicalUrl']['url']
                                
                            if 'provider' in content and content['provider'] and 'displayName' in content['provider']:
                                publisher = content['provider']['displayName']

                        if not title or title in processed_titles:
                            continue
                            
                        processed_titles.add(title)
                        
                        item = {
                            "title": title,
                            "link": link,
                            "publisher": publisher,
                            "ticker": ticker_sym,
                            "change_percent": change_percent,
                            "price": current
                        }
                        
                        if change_percent >= 0:
                            rising_news.append(item)
                        else:
                            falling_news.append(item)
                            
                    except Exception as e:
                        continue
        except Exception as e:
            print(f"Error scanning {ticker_sym}: {e}")
            continue
            
    # Sort by magnitude of change (absolute value)
    rising_news.sort(key=lambda x: x['change_percent'], reverse=True)
    falling_news.sort(key=lambda x: x['change_percent']) # Ascending (most negative first)
    
    return {
        "rising": rising_news[:10],
        "falling": falling_news[:10]
    }

