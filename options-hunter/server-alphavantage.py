#!/usr/bin/env python3
"""
Options Hunter - REAL, LIVE, PROFIT-FIRST Options Helper
All data from REAL APIs only. NO simulated chains, NO fake prices, NO mock data.
"""

from flask import Flask, jsonify, request, send_file
import os
import requests
from datetime import datetime, timedelta
import time
from math import exp
import yfinance as yf
import pandas as pd
import numpy as np
from explanations import build_explanation

app = Flask(__name__)

def compute_confidence(profit_score: float, mid: float = 1.0, steepness: float = 3.0) -> float:
    """
    Convert a raw profit_score into a 0–100 confidence rating via a logistic function.
    Scores near 'mid' map to ~50; very high profit_scores approach 100.
    """
    return 100.0 / (1.0 + exp(-steepness * (profit_score - mid)))

# ============================================================================
# PROVIDER API KEYS
# ============================================================================
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_KEY") or os.getenv("ALPHAVANTAGE_API_KEY", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
IEX_API_KEY = os.getenv("IEX_API_KEY") or os.getenv("IEX_TOKEN", "")
POLYGON_API_KEY = os.getenv("POLYGON_API_KEY", "")
TRADIER_TOKEN = os.getenv("TRADIER_TOKEN", "")
TRADIER_ENV = os.getenv("TRADIER_ENV", "live").lower()  # "live" or "sandbox"

# API Base URLs
ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"
FINNHUB_BASE = "https://finnhub.io/api/v1"
IEX_BASE = "https://cloud.iexapis.com/stable"
POLYGON_BASE = "https://api.polygon.io"
TRADIER_BASE = "https://api.tradier.com" if TRADIER_ENV == "live" else "https://sandbox.tradier.com"

# Simple cache (5-minute TTL)
price_cache = {}
CACHE_TTL = 300

# Technical indicators cache (10-minute TTL)
indicators_cache = {}
INDICATORS_CACHE_TTL = 600

# Default ticker universe for auto-scan mode - broad market coverage
DEFAULT_TICKERS = [
    "SPY", "QQQ", "AAPL", "MSFT", "NVDA", "AMD", "META", "TSLA", "GOOGL", "AMZN",
    "BAC", "PFE", "DIS", "INTC", "CRM", "NIO", "PLTR", "SOFI", "AAL", "F", "T", "CSCO",
    "NFLX", "UBER", "PYPL", "WMT", "HD", "V", "MA", "JPM", "GE", "C", "ORCL"
]

# Sector ETF mapping for confirmation engine
SECTOR_ETF_MAP = {
    # Technology
    "AAPL": "XLK", "MSFT": "XLK", "NVDA": "XLK", "AMD": "XLK", "GOOGL": "XLK", 
    "META": "XLK", "INTC": "XLK", "CRM": "XLK", "ORCL": "XLK",
    # Financials
    "BAC": "XLF", "JPM": "XLF", "GS": "XLF", "C": "XLF",
    # Consumer Discretionary
    "TSLA": "XLY", "AMZN": "XLY", "DIS": "XLY", "HD": "XLY", "WMT": "XLY",
    "NFLX": "XLY", "UBER": "XLY", "AAL": "XLY",
    # Healthcare
    "PFE": "XLV",
    # Industrials
    "GE": "XLI", "BA": "XLI",
    # Materials
    "X": "XLB",
    # Telecom
    "T": "XLC", "CSCO": "XLC",
    # Fintech / Growth
    "SOFI": "XLF", "PLTR": "XLK", "NIO": "XLY", "PYPL": "XLK",
    # Payments
    "V": "XLK", "MA": "XLK",
    # Broad market ETFs map to themselves
    "SPY": "SPY", "QQQ": "QQQ", "IWM": "IWM",
    # Energy
    "F": "XLE",
}

# Confirmation scoring thresholds (tunable)
CONFIDENCE_MIN_THRESHOLD = 40  # Only return options with confidence >= this value (lowered from 55)
SCORE_TREND = 25               # Points for bullish/bearish trend confirmation (increased)
SCORE_RSI = 20                 # Points for RSI momentum (increased)
SCORE_VOLUME = 15              # BONUS for volume expansion (not required to pass)
SCORE_SECTOR = 15              # Points for sector alignment
SCORE_IV = 10                  # Points for favorable IV rank
PENALTY_EARNINGS = -15         # Penalty for earnings within 3 days (reduced from -20)
PENALTY_MACRO_EVENT = -10      # Penalty for major macro events

# ============================================================================
# 1️⃣ TECHNICAL INDICATORS & CONFIRMATION ENGINE
# ============================================================================

def calculate_ema(series, period):
    """Calculate Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()

def calculate_rsi(series, period=14):
    """Calculate RSI (Relative Strength Index)."""
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def get_technical_indicators(ticker):
    """
    Fetch and calculate technical indicators for a ticker.
    Returns dict with: price, ema9, ema20, rsi, rsi_slope, volume, avg_volume_20, price_change_pct
    Cached for INDICATORS_CACHE_TTL seconds.
    """
    cache_key = f"indicators_{ticker}"
    now = time.time()
    
    if cache_key in indicators_cache:
        cached = indicators_cache[cache_key]
        if now - cached['timestamp'] < INDICATORS_CACHE_TTL:
            return cached['data']
    
    try:
        # Fetch 60 days of daily data (enough for 20-day averages + buffer)
        stock = yf.Ticker(ticker)
        hist = stock.history(period="60d", interval="1d")
        
        if hist.empty or len(hist) < 20:
            return None
        
        # Calculate indicators
        close = hist['Close']
        volume = hist['Volume']
        
        ema9 = calculate_ema(close, 9)
        ema20 = calculate_ema(close, 20)
        rsi = calculate_rsi(close, 14)
        
        # Current values (most recent)
        current_price = float(close.iloc[-1])
        current_ema9 = float(ema9.iloc[-1]) if not pd.isna(ema9.iloc[-1]) else None
        current_ema20 = float(ema20.iloc[-1]) if not pd.isna(ema20.iloc[-1]) else None
        current_rsi = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else None
        current_volume = float(volume.iloc[-1])
        
        # RSI slope (rising or falling) - compare last 3 days
        if len(rsi) >= 3:
            rsi_slope = float(rsi.iloc[-1] - rsi.iloc[-3])
        else:
            rsi_slope = 0.0
        
        # Average volume (20-day)
        avg_volume_20 = float(volume.tail(20).mean())
        
        # Price change % today
        if len(close) >= 2:
            price_change_pct = float((close.iloc[-1] - close.iloc[-2]) / close.iloc[-2] * 100)
        else:
            price_change_pct = 0.0
        
        indicators = {
            'price': current_price,
            'ema9': current_ema9,
            'ema20': current_ema20,
            'rsi': current_rsi,
            'rsi_slope': rsi_slope,
            'volume': current_volume,
            'avg_volume_20': avg_volume_20,
            'price_change_pct': price_change_pct
        }
        
        # Cache result
        indicators_cache[cache_key] = {
            'timestamp': now,
            'data': indicators
        }
        
        return indicators
        
    except Exception as e:
        print(f"[Indicators] {ticker} error: {e}")
        return None

def get_sector_etf_indicators(ticker):
    """
    Get sector ETF indicators for alignment check.
    Returns dict with: price_change_pct, above_ema20
    """
    sector_etf = SECTOR_ETF_MAP.get(ticker)
    if not sector_etf:
        return None
    
    try:
        indicators = get_technical_indicators(sector_etf)
        if not indicators:
            return None
        
        above_ema20 = (indicators['price'] > indicators['ema20']) if indicators['ema20'] else None
        
        return {
            'price_change_pct': indicators['price_change_pct'],
            'above_ema20': above_ema20
        }
    except:
        return None

def calculate_iv_rank(ticker, current_iv, lookback_days=30):
    """
    Calculate IV rank (0-100) based on recent IV range.
    IV Rank = (current_iv - min_iv) / (max_iv - min_iv) * 100
    
    Note: Simplified version - uses option chain historical IV if available,
    otherwise estimates from historical volatility.
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=f"{lookback_days}d", interval="1d")
        
        if hist.empty or len(hist) < 10:
            return 50.0  # Default to midpoint if insufficient data
        
        # Calculate historical volatility as proxy for IV range
        returns = hist['Close'].pct_change().dropna()
        hist_vol = returns.std() * np.sqrt(252)  # Annualized
        
        # Estimate IV range (simplified)
        # Typically IV ranges from 0.5x to 2x historical volatility
        min_iv = hist_vol * 0.5
        max_iv = hist_vol * 2.0
        
        if max_iv <= min_iv or current_iv is None:
            return 50.0
        
        iv_rank = ((current_iv - min_iv) / (max_iv - min_iv)) * 100
        return max(0.0, min(100.0, iv_rank))
        
    except:
        return 50.0  # Default to midpoint on error

def compute_confirmation_score(ticker, option_type, current_iv=None, expiry_date=None):
    """
    Compute intelligent confidence score based on technical confirmations.
    
    Args:
        ticker: Stock symbol
        option_type: "CALL" or "PUT"
        current_iv: Current implied volatility (optional)
        expiry_date: Expiration date string YYYY-MM-DD (optional, for earnings check)
    
    Returns:
        dict with:
            - confidence: 0-100 score
            - confirmations: list of confirmation reasons
    """
    score = 0
    confirmations = []
    
    # Get technical indicators
    indicators = get_technical_indicators(ticker)
    if not indicators:
        # If we can't get indicators, return minimal confidence
        return {'confidence': 0, 'confirmations': ['no_data_available']}
    
    price = indicators['price']
    ema9 = indicators['ema9']
    ema20 = indicators['ema20']
    rsi = indicators['rsi']
    rsi_slope = indicators['rsi_slope']
    volume = indicators['volume']
    avg_volume_20 = indicators['avg_volume_20']
    
    # === RULE 1: Trend / Moving Averages ===
    if ema9 and ema20:
        if option_type == 'CALL':
            if price > ema9 and ema9 > ema20:
                score += SCORE_TREND
                confirmations.append('bullish_trend')
        else:  # PUT
            if price < ema9 and ema9 < ema20:
                score += SCORE_TREND
                confirmations.append('bearish_trend')
    
    # === RULE 2: RSI Trend ===
    if rsi:
        if option_type == 'CALL':
            # Bullish: RSI rising and between 45-70
            if 45 < rsi < 70 and rsi_slope > 0:
                score += SCORE_RSI
                confirmations.append('rsi_bullish')
        else:  # PUT
            # Bearish: RSI falling and between 30-55
            if 30 < rsi < 55 and rsi_slope < 0:
                score += SCORE_RSI
                confirmations.append('rsi_bearish')
    
    # === RULE 3: Volume Expansion ===
    if volume and avg_volume_20 and avg_volume_20 > 0:
        if volume >= 1.2 * avg_volume_20:
            # Check if volume expansion matches direction
            price_change = indicators['price_change_pct']
            if option_type == 'CALL' and price_change > 0:
                score += SCORE_VOLUME
                confirmations.append('volume_expansion')
            elif option_type == 'PUT' and price_change < 0:
                score += SCORE_VOLUME
                confirmations.append('volume_expansion')
    
    # === RULE 4: Sector ETF Alignment ===
    sector_data = get_sector_etf_indicators(ticker)
    if sector_data:
        sector_change = sector_data['price_change_pct']
        sector_above_ema = sector_data['above_ema20']
        
        if option_type == 'CALL':
            if sector_change > 0.3 and sector_above_ema:
                score += SCORE_SECTOR
                confirmations.append('sector_bullish')
        else:  # PUT
            if sector_change < -0.3 and not sector_above_ema:
                score += SCORE_SECTOR
                confirmations.append('sector_bearish')
    
    # === RULE 5: IV Context ===
    if current_iv:
        iv_rank = calculate_iv_rank(ticker, current_iv)
        
        if option_type == 'CALL':
            # Prefer moderate IV (20-60) for calls
            if 20 <= iv_rank <= 60:
                score += SCORE_IV
                confirmations.append('iv_ok_for_calls')
        else:  # PUT
            # Prefer slightly higher IV (30-70) for puts
            if 30 <= iv_rank <= 70:
                score += SCORE_IV
                confirmations.append('iv_ok_for_puts')
    
    # === RULE 6: Event Risk (Earnings & Macro) ===
    # Simplified: Check if expiry is within 3 trading days (approx 4 calendar days)
    # In production, would check actual earnings calendar API
    if expiry_date:
        try:
            expiry_dt = datetime.strptime(expiry_date, '%Y-%m-%d')
            days_to_expiry = (expiry_dt - datetime.now()).days
            
            # Penalty if very close to expiry (likely earnings window)
            if days_to_expiry <= 4:
                score += PENALTY_EARNINGS
                confirmations.append('penalty_earnings_nearby')
        except:
            pass
    
    # Clamp score to 0-100
    score = max(0, min(100, score))
    
    return {
        'confidence': score,
        'confirmations': confirmations
    }

# ============================================================================
# 2️⃣ LIVE-ONLY PRICE PIPELINE
# ============================================================================

def fetch_price_alpha_vantage(ticker):
    """Fetch price from Alpha Vantage."""
    if not ALPHA_VANTAGE_API_KEY:
        return None
    try:
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': ticker,
            'apikey': ALPHA_VANTAGE_API_KEY
        }
        r = requests.get(ALPHA_VANTAGE_BASE, params=params, timeout=8)
        data = r.json()
        if 'Global Quote' in data and '05. price' in data['Global Quote']:
            price = data['Global Quote']['05. price']
            if price:
                return float(price)
    except Exception as e:
        print(f"[Alpha Vantage] {ticker} error: {e}")
    return None

def fetch_price_finnhub(ticker):
    """Fetch price from Finnhub."""
    if not FINNHUB_API_KEY:
        return None
    try:
        url = f"{FINNHUB_BASE}/quote"
        params = {'symbol': ticker, 'token': FINNHUB_API_KEY}
        r = requests.get(url, params=params, timeout=8)
        data = r.json()
        if data.get('c'):
            return float(data['c'])
    except Exception as e:
        print(f"[Finnhub] {ticker} error: {e}")
    return None

def fetch_price_iex(ticker):
    """Fetch price from IEX Cloud."""
    if not IEX_API_KEY:
        return None
    try:
        url = f"{IEX_BASE}/stock/{ticker}/quote"
        params = {'token': IEX_API_KEY}
        r = requests.get(url, params=params, timeout=8)
        data = r.json()
        if data.get('latestPrice'):
            return float(data['latestPrice'])
    except Exception as e:
        print(f"[IEX] {ticker} error: {e}")
    return None

def fetch_price_yfinance(ticker):
    """Fetch price from yfinance as final fallback."""
    try:
        import yfinance as yf
        stock = yf.Ticker(ticker)
        hist = stock.history(period='1d', interval='1m')
        if not hist.empty:
            return float(hist['Close'].iloc[-1])
    except Exception as e:
        print(f"[yfinance] {ticker} error: {e}")
    return None

def get_live_price(ticker):
    """
    Unified price function with provider fallback chain.
    Returns: { "ticker": str, "price": float, "source": str, "timestamp": str }
    or None if ALL providers fail.
    
    Order: Alpha Vantage -> Finnhub -> IEX -> yfinance
    """
    now = time.time()
    
    # Check cache
    if ticker in price_cache:
        cached_data, cached_time = price_cache[ticker]
        if now - cached_time < CACHE_TTL:
            return cached_data
    
    # Provider fallback chain
    providers = [
        ('AlphaVantage', fetch_price_alpha_vantage),
        ('Finnhub', fetch_price_finnhub),
        ('IEX', fetch_price_iex),
        ('Yahoo', fetch_price_yfinance)
    ]
    
    for source_name, fetch_func in providers:
        price = fetch_func(ticker)
        if price is not None and price > 0:
            result = {
                'ticker': ticker,
                'price': price,
                'source': source_name,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            price_cache[ticker] = (result, now)
            return result
    
    # ALL providers failed
    return None

# ============================================================================
# 2️⃣ DATA MODE DETECTION & HYBRID OPTIONS FETCHING
# ============================================================================

def get_data_mode():
    """
    Detect if we're in live or delayed mode.
    Returns: "live" if Tradier is configured for live, else "delayed"
    """
    if TRADIER_TOKEN and TRADIER_ENV == "live":
        return "live"
    return "delayed"

def fetch_options_yfinance(ticker, expiry):
    """
    Fetch REAL but DELAYED options data from yfinance (15-min delay, no key required).
    Returns list of normalized contracts.
    """
    try:
        import yfinance as yf
        import pandas as pd
        stock = yf.Ticker(ticker)
        
        # Get available expirations
        expirations = stock.options
        if not expirations or expiry not in expirations:
            print(f"[yfinance] {ticker} has no options for {expiry}")
            return []
        
        # Fetch option chain for this expiry
        chain = stock.option_chain(expiry)
        
        contracts = []
        
        # Process calls
        if hasattr(chain, 'calls') and not chain.calls.empty:
            for _, row in chain.calls.iterrows():
                bid = row.get('bid', 0)
                ask = row.get('ask', 0)
                mid = None
                if bid and ask and bid > 0 and ask > 0:
                    mid = (float(bid) + float(ask)) / 2.0
                
                contracts.append({
                    'symbol': row.get('contractSymbol'),
                    'type': 'CALL',  # Normalized to uppercase
                    'strike': float(row.get('strike', 0)),
                    'expiry': expiry,
                    'bid': float(bid) if bid else None,
                    'ask': float(ask) if ask else None,
                    'mid': mid,
                    'last': float(row.get('lastPrice', 0)) if row.get('lastPrice') else None,
                    'iv': float(row.get('impliedVolatility', 0)) if row.get('impliedVolatility') else None,
                    'delta': None,  # yfinance doesn't provide greeks directly
                    'theta': None,
                    'volume': int(row.get('volume', 0)) if row.get('volume') and not pd.isna(row.get('volume')) else None,
                    'open_interest': int(row.get('openInterest', 0)) if row.get('openInterest') and not pd.isna(row.get('openInterest')) else None
                })
        
        # Process puts
        if hasattr(chain, 'puts') and not chain.puts.empty:
            for _, row in chain.puts.iterrows():
                bid = row.get('bid', 0)
                ask = row.get('ask', 0)
                mid = None
                if bid and ask and bid > 0 and ask > 0:
                    mid = (float(bid) + float(ask)) / 2.0
                
                contracts.append({
                    'symbol': row.get('contractSymbol'),
                    'type': 'PUT',  # Normalized to uppercase
                    'strike': float(row.get('strike', 0)),
                    'expiry': expiry,
                    'bid': float(bid) if bid else None,
                    'ask': float(ask) if ask else None,
                    'mid': mid,
                    'last': float(row.get('lastPrice', 0)) if row.get('lastPrice') else None,
                    'iv': float(row.get('impliedVolatility', 0)) if row.get('impliedVolatility') else None,
                    'delta': None,
                    'theta': None,
                    'volume': int(row.get('volume', 0)) if row.get('volume') and not pd.isna(row.get('volume')) else None,
                    'open_interest': int(row.get('openInterest', 0)) if row.get('openInterest') and not pd.isna(row.get('openInterest')) else None
                })
        
        return contracts
    
    except Exception as e:
        print(f"[yfinance] Options error for {ticker} {expiry}: {e}")
        return []

def fetch_options_polygon_delayed(ticker, expiry):
    """
    Fetch REAL options from Polygon (EOD data on free tier is acceptable).
    Same as fetch_options_polygon but explicitly for delayed mode.
    """
    # Reuse the existing Polygon fetcher
    return fetch_options_polygon(ticker, expiry)

# ============================================================================
# 2️⃣ REAL OPTIONS DATA ONLY
# ============================================================================

def fetch_options_polygon(ticker, expiry):
    """Fetch REAL options chain from Polygon."""
    if not POLYGON_API_KEY:
        return []
    
    try:
        # Get contracts
        url = f"{POLYGON_BASE}/v3/reference/options/contracts"
        params = {
            'underlying_ticker': ticker,
            'expiration_date': expiry,
            'limit': 1000,
            'apiKey': POLYGON_API_KEY
        }
        r = requests.get(url, params=params, timeout=15)
        data = r.json()
        
        contracts = []
        for contract in data.get('results', []):
            symbol = contract.get('ticker')
            strike = contract.get('strike_price')
            contract_type = contract.get('contract_type', '').upper()
            
            # Get live quote for this option
            bid = ask = last = iv = delta = theta = volume = oi = None
            try:
                quote_url = f"{POLYGON_BASE}/v3/quotes/{symbol}"
                quote_params = {
                    'limit': 1,
                    'order': 'desc',
                    'sort': 'timestamp',
                    'apiKey': POLYGON_API_KEY
                }
                qr = requests.get(quote_url, params=quote_params, timeout=10)
                qdata = qr.json()
                if qdata.get('results'):
                    q = qdata['results'][0]
                    bid = q.get('bid_price')
                    ask = q.get('ask_price')
                    last = q.get('last_price')
            except Exception as e:
                print(f"[Polygon] Quote error for {symbol}: {e}")
            
            # Get snapshot for greeks/volume/OI
            try:
                snap_url = f"{POLYGON_BASE}/v3/snapshot/options/{ticker}/{symbol}"
                snap_params = {'apiKey': POLYGON_API_KEY}
                sr = requests.get(snap_url, params=snap_params, timeout=10)
                sdata = sr.json()
                if sdata.get('results'):
                    snap = sdata['results']
                    greeks = snap.get('greeks', {})
                    iv = greeks.get('implied_volatility')
                    delta = greeks.get('delta')
                    theta = greeks.get('theta')
                    day_data = snap.get('day', {})
                    volume = day_data.get('volume')
                    oi = snap.get('open_interest')
            except Exception as e:
                print(f"[Polygon] Snapshot error for {symbol}: {e}")
            
            # Calculate mid
            mid = None
            if bid is not None and ask is not None and bid >= 0 and ask >= 0:
                mid = (float(bid) + float(ask)) / 2.0
            
            contracts.append({
                'symbol': symbol,
                'type': 'call' if contract_type == 'CALL' else 'put',
                'strike': float(strike),
                'expiry': expiry,
                'bid': float(bid) if bid is not None else None,
                'ask': float(ask) if ask is not None else None,
                'mid': mid,
                'last': float(last) if last is not None else None,
                'iv': float(iv) if iv is not None else None,
                'delta': float(delta) if delta is not None else None,
                'theta': float(theta) if theta is not None else None,
                'volume': int(volume) if volume is not None else None,
                'open_interest': int(oi) if oi is not None else None
            })
        
        return contracts
    
    except Exception as e:
        print(f"[Polygon] Chain error for {ticker} {expiry}: {e}")
        return []

def fetch_options_tradier(ticker, expiry):
    """Fetch REAL options chain from Tradier."""
    if not TRADIER_TOKEN:
        return []
    
    try:
        url = f"{TRADIER_BASE}/v1/markets/options/chains"
        headers = {
            'Authorization': f"Bearer {TRADIER_TOKEN}",
            'Accept': 'application/json'
        }
        params = {
            'symbol': ticker,
            'expiration': expiry,
            'greeks': 'true'
        }
        r = requests.get(url, headers=headers, params=params, timeout=15)
        data = r.json()
        
        options = data.get('options', {}).get('option', [])
        if not isinstance(options, list):
            options = [options] if options else []
        
        contracts = []
        for opt in options:
            bid = opt.get('bid')
            ask = opt.get('ask')
            mid = None
            if bid is not None and ask is not None and bid >= 0 and ask >= 0:
                mid = (float(bid) + float(ask)) / 2.0
            
            greeks = opt.get('greeks', {}) or {}
            
            contracts.append({
                'symbol': opt.get('symbol'),
                'type': 'call' if opt.get('option_type', '').lower() == 'call' else 'put',
                'strike': float(opt.get('strike')),
                'expiry': opt.get('expiration_date', expiry),
                'bid': float(bid) if bid is not None else None,
                'ask': float(ask) if ask is not None else None,
                'mid': mid,
                'last': float(opt.get('last')) if opt.get('last') is not None else None,
                'iv': float(greeks.get('smv_vol')) if greeks.get('smv_vol') else None,
                'delta': float(greeks.get('delta')) if greeks.get('delta') else None,
                'theta': float(greeks.get('theta')) if greeks.get('theta') else None,
                'volume': int(opt.get('volume')) if opt.get('volume') else None,
                'open_interest': int(opt.get('open_interest')) if opt.get('open_interest') else None
            })
        
        return contracts
    
    except Exception as e:
        print(f"[Tradier] Chain error for {ticker} {expiry}: {e}")
        return []

def fetch_options_for_scan(ticker, expiry):
    """
    HYBRID OPTIONS AGGREGATOR
    
    Returns: {
        "contracts": [...],
        "source": "Tradier" | "Polygon" | "yfinance",
        "data_mode": "live" | "delayed"
    }
    
    Logic:
    - If in "live" mode (TRADIER_TOKEN + TRADIER_ENV=live):
        Try Tradier first for real-time OPRA data
    - If in "delayed" mode or Tradier fails:
        Try Polygon (EOD is acceptable) -> yfinance (15-min delayed)
    """
    mode = get_data_mode()
    
    # LIVE MODE: Try Tradier first
    if mode == "live":
        contracts = fetch_options_tradier(ticker, expiry)
        if contracts:
            return {
                'contracts': contracts,
                'source': 'Tradier',
                'data_mode': 'live'
            }
        # If Tradier fails in live mode, fall back to delayed sources
        print(f"[Hybrid] Tradier failed for {ticker}, falling back to delayed sources")
    
    # DELAYED MODE or Tradier fallback: Try Polygon -> yfinance
    if POLYGON_API_KEY:
        contracts = fetch_options_polygon_delayed(ticker, expiry)
        if contracts:
            return {
                'contracts': contracts,
                'source': 'Polygon',
                'data_mode': 'delayed'
            }
    
    # Final fallback: yfinance (no key required, always available)
    contracts = fetch_options_yfinance(ticker, expiry)
    if contracts:
        return {
            'contracts': contracts,
            'source': 'yfinance',
            'data_mode': 'delayed'
        }
    
    # All providers failed
    return {
        'contracts': [],
        'source': None,
        'data_mode': mode
    }

def get_options_chain(ticker, expiry):
    """
    Legacy wrapper for backward compatibility.
    Returns: (contracts_list, source_name) or ([], None)
    """
    result = fetch_options_for_scan(ticker, expiry)
    return result['contracts'], result['source']

# ============================================================================
# 3️⃣ PROFIT-FIRST METRICS & SCORING
# ============================================================================

def compute_metrics(contract, spot_price):
    """
    Compute profit metrics from REAL contract data.
    Returns dict with: cost_to_enter, breakeven, profit_at_plus_5, profit_at_plus_10,
                      liquidity_score, spread, spread_penalty, profit_score
    """
    strike = contract.get('strike')
    ctype = contract.get('type')
    mid = contract.get('mid')
    last = contract.get('last')
    bid = contract.get('bid')
    ask = contract.get('ask')
    iv = contract.get('iv')
    delta = contract.get('delta')
    theta = contract.get('theta')
    volume = contract.get('volume') or 0
    oi = contract.get('open_interest') or 0
    
    # Use mid if available, otherwise fallback to last price
    price = mid if mid and mid > 0 else (last if last and last > 0 else None)
    
    if strike is None or price is None or price <= 0:
        return None
    
    cost_to_enter = price * 100.0
    
    # Breakeven
    if ctype == 'call':
        breakeven = strike + price
    else:  # put
        breakeven = strike - price
    
    # Profit at different moves
    def calc_profit_at_move(pct_move):
        if ctype == 'call':
            new_spot = spot_price * (1 + pct_move)
            intrinsic = max(0, new_spot - strike) * 100
        else:
            new_spot = spot_price * (1 - abs(pct_move))
            intrinsic = max(0, strike - new_spot) * 100
        return intrinsic - cost_to_enter
    
    profit_5 = calc_profit_at_move(0.05)
    profit_10 = calc_profit_at_move(0.10)
    
    # Expected move based on IV (if available)
    expected_move = None
    expected_profit = None
    if iv is not None and iv > 0:
        expected_move = iv * 0.5 * spot_price
        if ctype == 'call':
            exp_spot = spot_price + expected_move
            intrinsic = max(0, exp_spot - strike) * 100
        else:
            exp_spot = spot_price - expected_move
            intrinsic = max(0, strike - exp_spot) * 100
        expected_profit = intrinsic - cost_to_enter
    
    # Spread
    spread = (ask - bid) if (ask is not None and bid is not None) else 0
    spread_pct = (spread / price) if price > 0 else 1.0
    spread_penalty = max(1.0, 1 + spread_pct * 2)
    
    # Liquidity score (0 to 1)
    tight_spread = max(0, 1 - min(1, spread_pct))
    oi_score = min(1.0, oi / 1000.0)
    vol_score = min(1.0, volume / 500.0)
    liquidity_score = max(0.1, 0.3 * tight_spread + 0.4 * oi_score + 0.3 * vol_score)
    
    # Trend alignment (neutral for now - no fabrication)
    trend_alignment = 1.0
    
    # Profit score
    # Use expected_profit if available, else conservative fallback
    if expected_profit is not None:
        profit_potential = expected_profit
    else:
        profit_potential = max(profit_10, profit_5, 0) * 0.3
    
    if cost_to_enter <= 0:
        profit_score = 0
    else:
        profit_score = max(0, (profit_potential / cost_to_enter) * liquidity_score * trend_alignment * (1 / spread_penalty))
    
    return {
        'cost_to_enter': round(cost_to_enter, 2),
        'breakeven': round(breakeven, 4),
        'profit_at_plus_5': round(profit_5, 2),
        'profit_at_plus_10': round(profit_10, 2),
        'expected_move': round(expected_move, 2) if expected_move else None,
        'expected_profit': round(expected_profit, 2) if expected_profit else None,
        'spread': round(spread, 4) if spread else None,
        'spread_penalty': round(spread_penalty, 2),
        'liquidity_score': round(liquidity_score, 3),
        'profit_score': round(profit_score, 4)
    }

# ============================================================================
# 4️⃣ API ENDPOINTS
# ============================================================================

@app.route('/')
def index():
    """Serve main HTML page."""
    return send_file('index.html')

@app.route('/api/price')
def api_price():
    """Get REAL live price with source and timestamp."""
    ticker = request.args.get('ticker', '').upper().strip()
    if not ticker:
        return jsonify({'error': 'Ticker required'}), 400
    
    result = get_live_price(ticker)
    if result is None:
        return jsonify({
            'error': 'LIVE DATA UNAVAILABLE',
            'message': f'Could not fetch live price for {ticker} from any provider.'
        }), 503
    
    return jsonify(result)

@app.route('/api/options')
def api_options():
    """Get REAL options chain."""
    ticker = request.args.get('ticker', '').upper().strip()
    expiry = request.args.get('expiry', '').strip()
    
    if not ticker or not expiry:
        return jsonify({'error': 'Ticker and expiry required'}), 400
    
    contracts, source = get_options_chain(ticker, expiry)
    
    if not contracts:
        return jsonify({
            'error': 'Options data unavailable from live providers',
            'ticker': ticker,
            'expiry': expiry
        }), 503
    
    return jsonify({
        'ticker': ticker,
        'expiry': expiry,
        'source': source,
        'contracts': contracts,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })

@app.route('/api/recommend')
def api_recommend():
    """
    SIMPLE DECISION ENGINE - Robinhood-style recommendation
    
    Params:
      - ticker: string (required)
      - budget: float (required)
      - expiry: YYYY-MM-DD (required)
      - bias: bullish|bearish|neutral (optional, default=neutral)
    
    Returns single recommended contract with action (BUY_CALL or BUY_PUT)
    """
    # Parse params
    ticker = request.args.get('ticker', '').upper().strip()
    if not ticker:
        return jsonify({'error': 'Ticker required'}), 400
    
    try:
        budget = float(request.args.get('budget', '0'))
        if budget <= 0:
            return jsonify({'error': 'Budget must be positive'}), 400
    except:
        return jsonify({'error': 'Invalid budget parameter'}), 400
    
    expiry = request.args.get('expiry', '').strip()
    if not expiry:
        return jsonify({'error': 'Expiry required (YYYY-MM-DD)'}), 400
    
    bias = request.args.get('bias', 'neutral').lower()
    if bias not in ['bullish', 'bearish', 'neutral']:
        bias = 'neutral'
    
    # Get data mode
    data_mode = get_data_mode()
    
    # Get live price
    price_data = get_live_price(ticker)
    if not price_data:
        return jsonify({
            'error': 'LIVE DATA UNAVAILABLE',
            'message': f'Could not fetch live price for {ticker}'
        }), 503
    
    spot = price_data['price']
    price_source = price_data['source']
    
    # Get options chain
    options_result = fetch_options_for_scan(ticker, expiry)
    contracts = options_result['contracts']
    options_source = options_result['source']
    
    if not contracts or not options_source:
        return jsonify({
            'error': 'Options data unavailable',
            'ticker': ticker,
            'expiry': expiry
        }), 503
    
    # Filter candidates based on bias (restrict to ±10% near-the-money)
    candidates = []
    
    for contract in contracts:
        strike = contract.get('strike')
        ctype = contract.get('type', '').upper()
        
        # Check if near-the-money (within ±10% of spot)
        if abs(strike - spot) / spot > 0.10:
            continue
        
        # Get price (mid or last)
        mid = contract.get('mid')
        last = contract.get('last')
        price = mid if mid and mid > 0 else (last if last and last > 0 else None)
        
        if not price or price <= 0:
            continue
        
        cost = price * 100.0
        if cost > budget:
            continue
        
        # Apply bias filter
        if bias == 'bullish':
            # Only evaluate calls
            if ctype != 'CALL':
                continue
        elif bias == 'bearish':
            # Only evaluate puts
            if ctype != 'PUT':
                continue
        # neutral: allow both
        
        # Compute metrics
        metrics = compute_metrics(contract, spot)
        if not metrics:
            continue
        
        # Days to expiry
        try:
            exp_date = datetime.strptime(expiry, '%Y-%m-%d')
            days_to_expiry = (exp_date - datetime.now()).days
        except:
            days_to_expiry = 0
        
        # Traffic light grading
        # GREEN: cost <= 30% budget AND est_profit_10 >= 80% of cost AND 5-45 days
        # YELLOW: cost <= budget AND est_profit_10 >= 30% of cost
        # RED: everything else
        profit_10 = metrics.get('profit_at_plus_10', 0)
        
        if (cost <= budget * 0.3 and 
            profit_10 >= cost * 0.8 and 
            5 <= days_to_expiry <= 45):
            grade = 'GREEN'
        elif (cost <= budget and profit_10 >= cost * 0.3):
            grade = 'YELLOW'
        else:
            grade = 'RED'
        
        # Build candidate
        action = 'BUY_CALL' if ctype == 'CALL' else 'BUY_PUT'
        num_contracts = int(budget / cost)
        
        # Compute confidence
        confidence = compute_confidence(metrics.get('profit_score', 0))
        
        candidate = {
            'action': action,
            'confidence': round(confidence, 1),
            'grade': grade,
            'contracts': num_contracts,
            'strike': strike,
            'expiration': expiry,
            'cost_per_contract': round(cost, 2),
            'total_cost': round(cost * num_contracts, 2),
            'breakeven': metrics.get('breakeven'),
            'est_profit_10': round(profit_10, 2),
            'est_profit_5': round(metrics.get('profit_at_plus_5', 0), 2),
            'iv': contract.get('iv'),
            'delta': contract.get('delta'),
            'profit_score': metrics.get('profit_score', 0),
            'days_to_expiry': days_to_expiry,
            'contract_data': contract  # Keep full contract for reference
        }
        
        candidates.append(candidate)
    
    if not candidates:
        return jsonify({
            'ticker': ticker,
            'spot': spot,
            'bias': bias,
            'data_mode': data_mode,
            'options_source': options_source,
            'primary_recommendation': None,
            'alternatives': [],
            'message': f'No contracts found under ${budget} budget for {bias} bias'
        })
    
    # Sort by grade (GREEN > YELLOW > RED), then by profit_score
    grade_order = {'GREEN': 0, 'YELLOW': 1, 'RED': 2}
    candidates.sort(key=lambda x: (grade_order.get(x['grade'], 3), -x['profit_score']))
    
    # Pick primary
    primary = candidates[0].copy()
    del primary['contract_data']
    del primary['profit_score']
    
    # Generate improved explanations
    direction = 'rise' if primary['action'] == 'BUY_CALL' else 'fall'
    option_type = 'call' if primary['action'] == 'BUY_CALL' else 'put'
    movement = 'above' if primary['action'] == 'BUY_CALL' else 'below'
    
    # Directional bias explanation
    if bias == 'bullish':
        trend_comment = f"Our analysis suggests {ticker} is likely to rise based on your bullish outlook."
    elif bias == 'bearish':
        trend_comment = f"Our analysis suggests {ticker} is likely to fall based on your bearish outlook."
    else:
        trend_comment = f"Our analysis suggests this trade offers balanced risk/reward potential."
    
    primary['explanation_simple'] = f"{trend_comment} This {option_type} option is near the current price (${spot:.2f}) with strong potential if the stock moves {movement} ${primary['breakeven']:.2f}."
    
    primary['explanation_risks'] = f"Maximum risk: You can lose the entire ${primary['cost_per_contract']:.2f} premium if {ticker} does not move {movement} the breakeven price of ${primary['breakeven']:.2f} by expiration."
    
    # Build alternatives (up to 2)
    alternatives = []
    for cand in candidates[1:3]:
        alt = cand.copy()
        del alt['contract_data']
        del alt['profit_score']
        
        # Shorter explanations for alternatives
        alt['explanation_simple'] = f"Alternative {alt['action'].replace('_', ' ')}: strike ${alt['strike']}, cost ${alt['cost_per_contract']}"
        alt['explanation_risks'] = f"Max loss: ${alt['cost_per_contract']}"
        alternatives.append(alt)
    
    return jsonify({
        'ticker': ticker,
        'spot': spot,
        'bias': bias,
        'data_mode': data_mode,
        'options_source': options_source,
        'primary_recommendation': primary,
        'alternatives': alternatives
    })

@app.route('/api/scan')
def api_scan():
    """
    PROFIT-FIRST OPTIONS SCANNER with HYBRID DATA MODE
    
    Params:
      - budget: float (required) - maximum cost per contract
      - expiry: YYYY-MM-DD (required) - expiration date
      - tickers: CSV string (optional) - default: SPY,QQQ,AAPL,MSFT,NVDA,TSLA,AMZN,META
    
    Returns:
      - data_mode: \"live\" or \"delayed\"
      - opportunities: ALL contracts under budget, sorted by profit_score
      - highlights: { highest_profit, cheapest_profit, highest_probability }
    """
    # Parse params
    try:
        budget = float(request.args.get('budget', '0'))
        if budget <= 0:
            return jsonify({'error': 'Budget must be positive'}), 400
    except:
        return jsonify({'error': 'Invalid budget parameter'}), 400
    
    expiry = request.args.get('expiry', '').strip()
    if not expiry:
        return jsonify({'error': 'Expiry required (YYYY-MM-DD)'}), 400
    
    tickers_str = request.args.get('tickers', 'SPY,QQQ,AAPL,MSFT,NVDA,TSLA,AMZN,META')
    tickers = [t.strip().upper() for t in tickers_str.split(',') if t.strip()]
    
    if not tickers:
        return jsonify({'error': 'No valid tickers provided'}), 400
    
    # Detect data mode
    data_mode = get_data_mode()
    
    # Scan all tickers
    opportunities = []
    options_sources_used = set()
    
    for ticker in tickers:
        # Get live price (price pipeline stays the same)
        price_data = get_live_price(ticker)
        if not price_data:
            print(f"[Scan] Skipping {ticker} - no live price")
            continue
        
        spot = price_data['price']
        price_source = price_data['source']
        price_timestamp = price_data['timestamp']
        
        # Get options chain using hybrid fetcher
        options_result = fetch_options_for_scan(ticker, expiry)
        contracts = options_result['contracts']
        options_source = options_result['source']
        
        if not contracts or not options_source:
            print(f"[Scan] Skipping {ticker} - no options data")
            continue
        
        options_sources_used.add(options_source)
        
        # Process each contract
        for contract in contracts:
            mid = contract.get('mid')
            if not mid or mid <= 0:
                continue
            
            cost = mid * 100.0
            if cost > budget:
                continue
            
            # Compute metrics
            metrics = compute_metrics(contract, spot)
            if not metrics:
                continue
            
            # Build opportunity entry
            opportunity = {
                'ticker': ticker,
                'spot': spot,
                'price_source': price_source,
                'price_timestamp': price_timestamp,
                'contract': {
                    'symbol': contract.get('symbol'),
                    'type': contract.get('type').upper(),
                    'strike': contract.get('strike'),
                    'expiry': contract.get('expiry'),
                    'bid': contract.get('bid'),
                    'ask': contract.get('ask'),
                    'mid': contract.get('mid'),
                    'last': contract.get('last'),
                    'iv': contract.get('iv'),
                    'delta': contract.get('delta'),
                    'theta': contract.get('theta'),
                    'volume': contract.get('volume'),
                    'open_interest': contract.get('open_interest')
                },
                'metrics': metrics,
                'options_source': options_source,
                'options_timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            
            opportunities.append(opportunity)
    
    # Check if we found anything
    if not opportunities:
        mode_message = {
            'live': 'No real-time option contracts under this budget with current live data from Tradier.',
            'delayed': 'No option contracts under this budget with delayed data. Tradier live access not yet configured.'
        }
        
        return jsonify({
            'data_mode': data_mode,
            'opportunities': [],
            'highlights': {
                'highest_profit': None,
                'cheapest_profit': None,
                'highest_probability': None
            },
            'message': mode_message.get(data_mode, 'No data available'),
            'options_sources_used': list(options_sources_used),
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })
    
    # Sort by profit_score DESC
    opportunities.sort(key=lambda x: x['metrics']['profit_score'], reverse=True)
    
    # Add rank
    for i, opp in enumerate(opportunities, 1):
        opp['rank'] = i
        
        # Add category tags
        tags = ['budget_fit']
        if opp['metrics']['profit_score'] > 0.5:
            tags.append('high_profit')
        if opp['metrics']['liquidity_score'] > 0.6:
            tags.append('liquid')
        if opp['contract'].get('delta'):
            abs_delta = abs(opp['contract']['delta'])
            if abs_delta > 0.6:
                tags.append('high_probability')
        opp['category_tags'] = tags
    
    # Build highlights
    highest_profit = opportunities[0] if opportunities else None
    
    # Cheapest with positive profit score
    positive_opps = [o for o in opportunities if o['metrics']['profit_score'] > 0]
    cheapest_profit = min(positive_opps, key=lambda x: x['metrics']['cost_to_enter']) if positive_opps else None
    
    # Highest probability (highest abs delta)
    with_delta = [o for o in opportunities if o['contract'].get('delta') is not None]
    if with_delta:
        highest_probability = max(with_delta, key=lambda x: abs(x['contract']['delta']))
    else:
        # Fallback: closest to ITM
        def itm_distance(opp):
            strike = opp['contract']['strike']
            spot = opp['spot']
            ctype = opp['contract']['type']
            if ctype == 'CALL':
                is_itm = 1 if strike <= spot else 0
                dist = abs(spot - strike)
            else:
                is_itm = 1 if strike >= spot else 0
                dist = abs(spot - strike)
            return (-is_itm, dist)
        
        highest_probability = min(opportunities, key=itm_distance) if opportunities else None
    
    highlights = {
        'highest_profit': highest_profit,
        'cheapest_profit': cheapest_profit,
        'highest_probability': highest_probability
    }
    
    # Build mode-specific message
    if data_mode == 'live':
        mode_message = f'LIVE MODE: Real-time options data from {", ".join(options_sources_used)}.'
    else:
        mode_message = f'DELAYED TEST MODE: Using delayed options data from {", ".join(options_sources_used)} for backtesting and practice. Not suitable for real-time entries.'
    
    return jsonify({
        'data_mode': data_mode,
        'opportunities': opportunities,
        'highlights': highlights,
        'total_found': len(opportunities),
        'options_sources_used': list(options_sources_used),
        'message': mode_message,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })

@app.route('/api/auto-recommend')
def api_auto_recommend():
    """
    AUTO-SCANNER: Scans multiple tickers and returns the single best contract across all.
    
    Params:
      - budget: float (required)
      - expiry: YYYY-MM-DD (required)
      - bias: 'bullish' or 'bearish' (optional, default: bullish)
      - tickers: CSV string (optional, default: DEFAULT_TICKERS)
    
    Returns:
      - primary_recommendation: single best contract across all tickers
      - alternatives: next best 5-10 contracts
      - universe_size: number of tickers scanned
      - scanned_tickers: list of tickers attempted
    """
    # Parse params
    try:
        budget = float(request.args.get('budget', '0'))
        if budget <= 0:
            return jsonify({'error': 'Budget must be positive'}), 400
    except:
        return jsonify({'error': 'Invalid budget parameter'}), 400
    
    expiry = request.args.get('expiry', '').strip()
    if not expiry:
        return jsonify({'error': 'Expiry required (YYYY-MM-DD)'}), 400
    
    # Note: bias parameter is now optional - we determine direction by analyzing both calls and puts
    bias = request.args.get('bias', 'auto').strip().lower()
    
    # Get ticker universe
    tickers_param = request.args.get('tickers', '').strip()
    if tickers_param:
        tickers = [t.strip().upper() for t in tickers_param.split(',') if t.strip()]
    else:
        tickers = DEFAULT_TICKERS.copy()
    
    if not tickers:
        return jsonify({'error': 'No valid tickers provided'}), 400
    
    # Detect data mode
    data_mode = get_data_mode()
    
    # Scan all tickers and collect candidates for BOTH calls and puts
    all_call_candidates = []
    all_put_candidates = []
    scanned_tickers = []
    options_sources_used = set()
    
    for ticker in tickers:
        scanned_tickers.append(ticker)
        
        # Get live price
        price_data = get_live_price(ticker)
        if not price_data:
            continue
        
        spot = price_data['price']
        price_source = price_data['source']
        
        # Fetch options
        options_result = fetch_options_for_scan(ticker, expiry)
        if not options_result:
            continue
        
        options_chain = options_result['contracts']
        options_source = options_result['source']
        if options_source:  # Only add if not None
            options_sources_used.add(options_source)
        
        if not options_chain:
            continue
        
        # Filter CALLs near ATM (within ±10% of spot price)
        call_candidates = [c for c in options_chain 
                          if c.get('type') == 'CALL' 
                          and abs(c.get('strike', 0) - spot) / spot <= 0.10]
        
        # Filter PUTs near ATM (within ±10% of spot price)
        put_candidates = [c for c in options_chain 
                         if c.get('type') == 'PUT' 
                         and abs(c.get('strike', 0) - spot) / spot <= 0.10]
        
        # Compute metrics for calls
        for contract in call_candidates:
            metrics = compute_metrics(contract, spot)
            if metrics and metrics['cost_to_enter'] <= budget:
                # Compute confirmation-based confidence score
                confirmation_result = compute_confirmation_score(
                    ticker=ticker,
                    option_type='CALL',
                    current_iv=contract.get('iv'),
                    expiry_date=expiry
                )
                
                all_call_candidates.append({
                    'ticker': ticker,
                    'spot': spot,
                    'contract': contract,
                    'metrics': metrics,
                    'price_source': price_source,
                    'options_source': options_source,
                    'data_mode': data_mode,
                    'confidence': confirmation_result['confidence'],
                    'confirmations': confirmation_result['confirmations']
                })
        
        # Compute metrics for puts
        for contract in put_candidates:
            metrics = compute_metrics(contract, spot)
            if metrics and metrics['cost_to_enter'] <= budget:
                # Compute confirmation-based confidence score
                confirmation_result = compute_confirmation_score(
                    ticker=ticker,
                    option_type='PUT',
                    current_iv=contract.get('iv'),
                    expiry_date=expiry
                )
                
                all_put_candidates.append({
                    'ticker': ticker,
                    'spot': spot,
                    'contract': contract,
                    'metrics': metrics,
                    'price_source': price_source,
                    'options_source': options_source,
                    'data_mode': data_mode,
                    'confidence': confirmation_result['confidence'],
                    'confirmations': confirmation_result['confirmations']
                })
    
    # Debug: Log confirmation scores before filtering
    import sys
    print(f"\n📊 Pre-filter Candidates:", file=sys.stderr, flush=True)
    print(f"  CALLS: {len(all_call_candidates)} candidates", file=sys.stderr, flush=True)
    if all_call_candidates:
        sample_calls = sorted(all_call_candidates, key=lambda x: x['confidence'], reverse=True)[:5]
        for c in sample_calls:
            print(f"    {c['ticker']} CALL: {c['confidence']:.1f}% - {c['confirmations']}", file=sys.stderr, flush=True)
    
    print(f"  PUTS: {len(all_put_candidates)} candidates", file=sys.stderr, flush=True)
    if all_put_candidates:
        sample_puts = sorted(all_put_candidates, key=lambda x: x['confidence'], reverse=True)[:5]
        for p in sample_puts:
            print(f"    {p['ticker']} PUT: {p['confidence']:.1f}% - {p['confirmations']}", file=sys.stderr, flush=True)
    
    # Filter candidates by minimum confidence threshold
    all_call_candidates = [c for c in all_call_candidates if c['confidence'] >= CONFIDENCE_MIN_THRESHOLD]
    all_put_candidates = [p for p in all_put_candidates if p['confidence'] >= CONFIDENCE_MIN_THRESHOLD]
    
    # Determine favored direction by summing profit scores of high-confidence candidates only
    total_call_score = sum(c['metrics']['profit_score'] for c in all_call_candidates)
    total_put_score = sum(p['metrics']['profit_score'] for p in all_put_candidates)
    
    # Override with user bias if specified
    if bias == 'bullish':
        favored = 'CALL'
        all_candidates = all_call_candidates
    elif bias == 'bearish':
        favored = 'PUT'
        all_candidates = all_put_candidates
    else:
        # Auto-detect: choose direction with higher aggregate score
        if total_call_score >= total_put_score:
            favored = 'CALL'
            all_candidates = all_call_candidates
        else:
            favored = 'PUT'
            all_candidates = all_put_candidates
    
    # Sort candidates by confidence score descending (not profit_score)
    all_candidates.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Pick primary recommendation (highest confidence) and alternatives
    primary = None
    alternatives = []
    
    if all_candidates:
        best = all_candidates[0]
        c = best['contract']
        m = best['metrics']
        spot = best['spot']
        
        # Determine action
        action = f"BUY_{c.get('type', 'CALL')}"
        
        # Use confirmation-based confidence (already calculated)
        confidence = best['confidence']
        confirmations = best['confirmations']
        
        # Traffic-light grading (kept for backward compatibility)
        cost = m['cost_to_enter']
        profit_10 = m.get('profit_at_plus_10', 0)
        days = m.get('days_to_expiry', 0)
        
        if cost <= budget * 0.3 and profit_10 >= cost * 0.8 and 5 <= days <= 45:
            grade = 'GREEN'
        elif cost <= budget and profit_10 >= cost * 0.3:
            grade = 'YELLOW'
        else:
            grade = 'RED'
        
        # Improved explanation based on confirmations using explanations.py
        ctype = c.get('type', 'CALL').lower()
        strike = c.get('strike')
        
        # Use the explanation builder for Robinhood-style copy
        explanation_simple = build_explanation(
            ticker=best['ticker'],
            strike=strike,
            option_type=ctype,
            confidence=confidence,
            confirmations=confirmations
        )
        
        movement = 'above' if ctype == 'call' else 'below'
        explanation_risks = f"Maximum risk: You can lose the entire ${cost:.2f} premium if {best['ticker']} does not move {movement} the breakeven price of ${m['breakeven']:.2f} by expiration."
        
        primary = {
            'ticker': best['ticker'],
            'action': action,
            'confidence': round(confidence, 1),
            'confirmations': confirmations,
            'grade': grade,
            'strike': c.get('strike'),
            'expiration': expiry,
            'cost_per_contract': cost,
            'total_cost': cost,
            'contracts': 1,
            'breakeven': m['breakeven'],
            'est_profit_10': m.get('profit_at_plus_10', 0),
            'est_profit_5': m.get('profit_at_plus_5', 0),
            'profit_score': m['profit_score'],
            'iv': c.get('iv'),
            'delta': c.get('delta'),
            'data_mode': data_mode,
            'options_source': best['options_source'],
            'explanation_simple': explanation_simple,
            'explanation_risks': explanation_risks
        }
        
        # Alternatives: next 10 best with confirmations
        for candidate in all_candidates[1:11]:
            c = candidate['contract']
            m = candidate['metrics']
            alternatives.append({
                'ticker': candidate['ticker'],
                'action': f"BUY_{c.get('type', 'CALL')}",
                'confidence': round(candidate['confidence'], 1),
                'confirmations': candidate['confirmations'],
                'strike': c.get('strike'),
                'expiration': expiry,
                'cost_per_contract': m['cost_to_enter'],
                'breakeven': m['breakeven'],
                'est_profit_10': m.get('profit_at_plus_10', 0),
                'profit_score': m['profit_score'],
                'iv': c.get('iv'),
                'delta': c.get('delta')
            })
    
    # Build response
    if primary:
        message = f"Scanned {len(scanned_tickers)} tickers. Found {len(all_candidates)} high-confidence {favored} trades (confidence ≥ {CONFIDENCE_MIN_THRESHOLD}%)."
    else:
        message = f"No high-confidence trades found (confidence ≥ {CONFIDENCE_MIN_THRESHOLD}%). Market conditions do not support strong signals right now. Try adjusting your parameters or check back later."
    
    return jsonify({
        'data_mode': data_mode,
        'options_source': ', '.join(str(s) for s in options_sources_used if s) if options_sources_used else 'none',
        'favored_direction': favored,
        'total_call_score': round(total_call_score, 2),
        'total_put_score': round(total_put_score, 2),
        'budget': budget,
        'universe_size': len(tickers),
        'scanned_tickers': scanned_tickers,
        'primary_recommendation': primary,
        'alternatives': alternatives,
        'message': message,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })

# ============================================================================
# 5️⃣ SERVER STARTUP
# ============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 OPTIONS HUNTER - REAL, LIVE, PROFIT-FIRST")
    print("=" * 70)
    print()
    print("📡 PROVIDER STATUS:")
    print(f"  Alpha Vantage: {'✅ SET' if ALPHA_VANTAGE_API_KEY else '❌ MISSING'}")
    print(f"  Finnhub:       {'✅ SET' if FINNHUB_API_KEY else '❌ MISSING'}")
    print(f"  IEX Cloud:     {'✅ SET' if IEX_API_KEY else '❌ MISSING'}")
    print(f"  Polygon:       {'✅ SET' if POLYGON_API_KEY else '❌ MISSING'}")
    print(f"  Tradier:       {'✅ SET' if TRADIER_TOKEN else '❌ MISSING'}")
    print()
    mode = get_data_mode()
    print(f"DATA MODE: {mode.upper()}")
    if mode == 'live':
        print("  Real-time options from Tradier")
    else:
        print("  Delayed options from Polygon/yfinance (Tradier not configured)")
    print()
    print("NO FAKE DATA - ALL values from real providers only")
    print("⚠️  If providers fail, you get 'LIVE DATA UNAVAILABLE'")
    print()
    
    # Skip connectivity test in production (causes timeout)
    if os.getenv('RAILWAY_ENVIRONMENT'):
        print("🚂 Railway deployment detected - skipping connectivity test")
    else:
        print("🧪 Testing connectivity with SPY...")
        test_result = get_live_price('SPY')
        if test_result:
            print(f"✅ SPY: ${test_result['price']} via {test_result['source']}")
        else:
            print("❌ Could not fetch SPY - check provider keys")
    
    print()
    port = int(os.getenv('PORT', 8700))
    print(f"🌐 Server starting on http://0.0.0.0:{port}")
    print("=" * 70)
    print()
    
    # Production mode for Railway
    debug_mode = not os.getenv('RAILWAY_ENVIRONMENT')
    app.run(host='0.0.0.0', port=port, debug=debug_mode, use_reloader=False)
