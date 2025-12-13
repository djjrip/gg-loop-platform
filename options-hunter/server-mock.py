#!/usr/bin/env python3
"""Mock server with fake data - ALWAYS WORKS for testing"""
from flask import Flask, send_from_directory, request, jsonify
import random
import os
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='.', static_url_path='')

# Mock price database - Updated with real Dec 2025 prices
MOCK_PRICES = {
    'SPY': 593.42, 'QQQ': 515.33, 'IWM': 230.50, 'DIA': 445.80, 'VXX': 42.30,
    'AAPL': 245.50, 'MSFT': 445.20, 'GOOGL': 178.50, 'GOOG': 180.20, 'AMZN': 215.30,
    'META': 585.00, 'NVDA': 140.50, 'TSLA': 352.14, 'NFLX': 890.30, 'ADBE': 445.60,
    'AMD': 126.80, 'INTC': 19.45, 'QCOM': 152.30, 'AVGO': 220.40, 'MU': 95.60,
    'F': 10.85, 'GM': 52.40, 'RIVN': 12.30, 'LCID': 2.40, 'NIO': 4.20,
    'JPM': 245.80, 'BAC': 45.60, 'WFC': 72.30, 'GS': 540.20, 'MS': 128.40,
    'COIN': 295.40, 'MARA': 18.60, 'RIOT': 13.20, 'MSTR': 420.30, 'HOOD': 35.80,
    'PLTR': 64.50, 'SOFI': 15.80, 'SQ': 85.40, 'PYPL': 88.60, 'SNAP': 11.20,
    'BA': 182.30, 'DIS': 114.60, 'WMT': 88.50, 'TGT': 148.30, 'COST': 985.20,
    'AAL': 16.40, 'DAL': 61.20, 'UAL': 95.30, 'CCL': 25.30, 'NCLH': 22.80,
    'JNJ': 152.40, 'UNH': 520.30, 'PFE': 25.60, 'MRNA': 42.30, 'BNTX': 105.40,
    'XOM': 118.50, 'CVX': 162.30, 'COP': 108.40, 'SLB': 42.80, 'OXY': 52.30,
    'BABA': 88.50, 'JD': 42.30, 'PDD': 145.80, 'BIDU': 95.20, 'TME': 12.40,
    'DKNG': 48.30, 'PENN': 22.60, 'EA': 155.80, 'RBLX': 54.20, 'GME': 28.50,
    'AMC': 5.80, 'BB': 3.20, 'NOK': 4.50, 'UBER': 78.40, 'LYFT': 18.60
}

@app.route('/')
def root():
    return send_from_directory('.', 'index.html')

@app.route('/api/price')
def api_price():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({'error':'missing ticker'}), 400
    
    # Get mock price or generate random one
    price = MOCK_PRICES.get(ticker, random.uniform(10, 500))
    return jsonify({'c': price, 'ticker': ticker}), 200

@app.route('/api/history')
def api_history():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({'error':'missing ticker'}), 400
    
    # Generate mock 30-day history with realistic RSI ranges
    base_price = MOCK_PRICES.get(ticker, random.uniform(10, 500))
    results = []
    price = base_price
    for i in range(30):
        # Random walk +/- 3%
        change = random.uniform(-0.03, 0.03)
        price = price * (1 + change)
        results.append({'c': price})
    
    return jsonify({'status': 'OK', 'results': results}), 200

@app.route('/api/options')
def api_options():
    ticker = request.args.get('ticker')
    expiration = request.args.get('expiration')
    if not ticker or not expiration:
        return jsonify({'error':'missing params'}), 400
    
    base_price = MOCK_PRICES.get(ticker, random.uniform(10, 500))
    results = []
    
    # Generate mock options chain with strikes around current price
    for multiplier in [0.70, 0.80, 0.90, 0.95, 1.00, 1.05, 1.10, 1.20, 1.30]:
        strike = round(base_price * multiplier, 2)
        results.append({
            'ticker': f"O:{ticker}{expiration.replace('-','')}C{int(strike*1000):08d}",
            'strike_price': strike,
            'contract_type': 'call'
        })
        results.append({
            'ticker': f"O:{ticker}{expiration.replace('-','')}P{int(strike*1000):08d}",
            'strike_price': strike,
            'contract_type': 'put'
        })
    
    return jsonify({'status': 'OK', 'results': results}), 200

@app.route('/api/quote')
def api_quote():
    ticker = request.args.get('ticker')
    strike = request.args.get('strike')
    opt_type = request.args.get('type')
    
    if not ticker or not strike or not opt_type:
        return jsonify({'error':'missing params'}), 400
    
    # Generate realistic option prices
    base_price = MOCK_PRICES.get(ticker, random.uniform(10, 500))
    strike_price = float(strike)
    
    # Calculate intrinsic + extrinsic value
    if opt_type == 'call':
        intrinsic = max(0, base_price - strike_price)
    else:
        intrinsic = max(0, strike_price - base_price)
    
    extrinsic = random.uniform(0.10, 3.00)
    mid_price = intrinsic + extrinsic
    
    # Generate bid/ask spread
    spread = mid_price * 0.05  # 5% spread
    bid = max(0.01, mid_price - spread/2)
    ask = mid_price + spread/2
    
    result = {
        'bid_price': round(bid, 2),
        'ask_price': round(ask, 2),
        'last_price': round(mid_price, 2)
    }
    
    return jsonify({'status': 'OK', 'results': [result]}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8700'))
    print('🎭 MOCK MODE - Using fake data for testing')
    print('✅ No rate limits, always works!')
    app.run(host='0.0.0.0', port=port, debug=False)
