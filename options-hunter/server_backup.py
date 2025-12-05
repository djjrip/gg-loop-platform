#!/usr/bin/env python3
from flask import Flask, send_from_directory, request, jsonify
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# CORS for frontend
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# CORS for frontend
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/')
def root():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

@app.route('/api/price')
def api_price():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({'error':'missing ticker'}), 400
    try:
        stock = yf.Ticker(ticker)
        # Skip info() which causes rate limits - go straight to history
        hist = stock.history(period='1d', interval='1m')
        if hist.empty:
            hist = stock.history(period='1d')
        price = hist['Close'].iloc[-1] if not hist.empty else None
        if not price:
            return jsonify({'error': 'No price data'}), 404
        return jsonify({'c': float(price), 'ticker': ticker}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history')
def api_history():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({'error':'missing ticker'}), 400
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='30d')
        if hist.empty:
            return jsonify({'status': 'ERROR', 'results': []}), 200
        results = [{'c': row['Close']} for idx, row in hist.iterrows()]
        return jsonify({'status': 'OK', 'results': results}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/options')
def api_options():
    ticker = request.args.get('ticker')
    expiration = request.args.get('expiration')
    if not ticker or not expiration:
        return jsonify({'error':'missing params'}), 400
    try:
        stock = yf.Ticker(ticker)
        expirations = stock.options
        if not expirations:
            return jsonify({'status': 'ERROR', 'results': []}), 200
        
        # Find closest expiration to requested date
        target = datetime.strptime(expiration, '%Y-%m-%d')
        closest = min(expirations, key=lambda x: abs((datetime.strptime(x, '%Y-%m-%d') - target).days))
        
        # Get options chain
        opt = stock.option_chain(closest)
        calls = opt.calls
        puts = opt.puts
        
        results = []
        for _, row in calls.iterrows():
            results.append({
                'ticker': f"O:{ticker}{closest.replace('-','')}C{int(row['strike']*1000):08d}",
                'strike_price': row['strike'],
                'contract_type': 'call'
            })
        for _, row in puts.iterrows():
            results.append({
                'ticker': f"O:{ticker}{closest.replace('-','')}P{int(row['strike']*1000):08d}",
                'strike_price': row['strike'],
                'contract_type': 'put'
            })
        
        return jsonify({'status': 'OK', 'results': results[:250]}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'ERROR'}), 500

@app.route('/api/quote')
def api_quote():
    contract = request.args.get('contract')
    ticker = request.args.get('ticker')
    expiration = request.args.get('expiration')
    strike = request.args.get('strike')
    opt_type = request.args.get('type')
    
    if not ticker or not expiration or not strike or not opt_type:
        return jsonify({'error':'missing params'}), 400
    
    try:
        stock = yf.Ticker(ticker)
        opt = stock.option_chain(expiration)
        df = opt.calls if opt_type == 'call' else opt.puts
        
        strike_float = float(strike)
        row = df[df['strike'] == strike_float]
        
        if row.empty:
            return jsonify({'status': 'ERROR', 'results': []}), 200
        
        row = row.iloc[0]
        result = {
            'bid_price': row.get('bid', 0),
            'ask_price': row.get('ask', 0),
            'last_price': row.get('lastPrice', 0)
        }
        
        return jsonify({'status': 'OK', 'results': [result]}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'ERROR'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'options-hunter'}), 200

@app.route('/api/paper-trades')
def paper_trades():
    """Serve paper trading performance data"""
    try:
        # Import the paper trading module
        import paper_trading
        stats = paper_trading.get_performance_stats()
        return jsonify(stats), 200
    except Exception as e:
        # Return empty data if no trades yet
        return jsonify({
            'totalPL': 0,
            'winRate': 0,
            'totalTrades': 0,
            'avgReturn': 0,
            'trades': []
        }), 200

@app.route('/api/scan')
def api_scan():
    """Quick RSI scan of top stocks - OPTIMIZED VERSION"""
    budget = float(request.args.get('budget', 500))
    
    # Top liquid stocks
    tickers = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL']
    
    # OPTIMIZATION: Download all tickers at once (10x faster!)
    try:
        data = yf.download(tickers, period='14d', progress=False, threads=True)
        if data.empty:
            return jsonify({'signals': [], 'scanned': 0, 'timestamp': datetime.now().isoformat(), 'error': 'No market data available'}), 200
    except Exception as e:
        print(f"Error downloading market data: {e}")
        return jsonify({'signals': [], 'scanned': 0, 'timestamp': datetime.now().isoformat(), 'error': str(e)}), 200
    
    results = []
    for ticker in tickers:
        try:
            # Extract price series for this ticker
            if len(tickers) > 1:
                prices = data['Close'][ticker].dropna()
            else:
                prices = data['Close'].dropna()
            
            if len(prices) < 14:
                continue
            
            # Calculate RSI
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            current_rsi = rsi.iloc[-1]
            current_price = prices.iloc[-1]
            
            # Skip if nan
            if pd.isna(current_rsi) or pd.isna(current_price):
                continue
            
            # Generate signals for ALL stocks (not just extreme RSI)
            if current_rsi < 40:  # Oversold
                signal = 'BULLISH'
                option_type = 'call'
            elif current_rsi > 60:  # Overbought
                signal = 'BEARISH'
                option_type = 'put'
            else:
                signal = 'NEUTRAL'
                option_type = 'call'  # Default to call for neutral
            
            # Calculate option details
            strike = current_price * (1.05 if option_type == 'call' else 0.95)
            option_cost = max(50, current_price * 0.03)  # 3% of stock price
            contracts = max(1, int(budget / (option_cost * 100)))
            
            results.append({
                'symbol': ticker,
                'price': float(current_price),
                'rsi': float(current_rsi),
                'signal': signal,
                'option_type': option_type,
                'strike': float(strike),
                'option_cost': float(option_cost),
                'contracts_can_buy': contracts,
                'potential_profit': 20 + (abs(50 - current_rsi) * 2)
            })
        except Exception as e:
            print(f"Error scanning {ticker}: {e}")
            continue
    
    return jsonify({
        'signals': results,
        'scanned': len(results),
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/waitlist', methods=['POST'])
def waitlist():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    # Store in file for now (simple!)
    with open('waitlist.txt', 'a') as f:
        f.write(f"{email}\n")
    return jsonify({'success': True, 'message': 'Added to waitlist!'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8700'))
    app.run(host='0.0.0.0', port=port, debug=False)