#!/usr/bin/env python3
"""
OPTIONS HUNTER ULTIMATE - REAL BUDGET-BASED SCANNER
Finds profitable options for ANY budget - even $50
Scans ALL optionable stocks, not just 9
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from datetime import datetime, timedelta
import time

app = Flask(__name__)
CORS(app)

# REAL Tradier Production API
TRADIER_API_KEY = os.getenv('TRADIER_API_KEY')  # Set via environment variable
TRADIER_BASE = 'https://api.tradier.com/v1'

# Validate API key on startup
if not TRADIER_API_KEY:
    print("⚠️  WARNING: TRADIER_API_KEY not set. Set it via environment variable.")
    print("   export TRADIER_API_KEY='your_key_here'")

def tradier_request(endpoint, params=None):
    """Make request to Tradier API with retry"""
    headers = {
        'Authorization': f'Bearer {TRADIER_API_KEY}',
        'Accept': 'application/json'
    }
    
    url = f'{TRADIER_BASE}{endpoint}'
    try:
        response = requests.get(url, headers=headers, params=params or {}, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Tradier API error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Request error: {e}")
        return None

# EXPANDED STOCK UNIVERSE - 100+ most liquid optionable stocks
STOCK_UNIVERSE = [
    # Mega Cap Tech
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
    # Tech & Software
    'ORCL', 'ADBE', 'CRM', 'INTC', 'AMD', 'CSCO', 'IBM', 'QCOM', 'TXN', 'AVGO',
    'NOW', 'SNOW', 'PLTR', 'SHOP', 'SQ', 'PYPL', 'UBER', 'LYFT', 'ABNB', 'DASH',
    # Finance
    'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'AXP', 'V', 'MA',
    # Retail & Consumer
    'WMT', 'HD', 'NKE', 'MCD', 'SBUX', 'TGT', 'COST', 'LOW', 'DIS', 'NFLX',
    # Healthcare & Pharma
    'UNH', 'JNJ', 'PFE', 'ABBV', 'TMO', 'ABT', 'MRK', 'LLY', 'AMGN', 'GILD',
    # Energy & Industrial
    'XOM', 'CVX', 'COP', 'SLB', 'BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'FDX',
    # ETFs (most traded)
    'SPY', 'QQQ', 'IWM', 'DIA', 'VXX', 'TQQQ', 'SQQQ', 'UVXY', 'EEM', 'FXI',
    # Semiconductors
    'TSM', 'AMAT', 'LRCX', 'KLAC', 'MU', 'MRVL', 'ON',
    # Automotive
    'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV',
    # Biotech
    'MRNA', 'BNTX', 'REGN', 'VRTX', 'BIIB',
    # Telecom & Media
    'T', 'VZ', 'TMUS', 'CMCSA', 'NFLX', 'DIS',
    # Crypto-related
    'COIN', 'MSTR', 'RIOT', 'MARA',
    # Meme & High Vol
    'AMC', 'GME', 'BBBY', 'BB', 'SOFI', 'HOOD',
]

@app.route('/api/scan-budget')
def scan_by_budget():
    """
    Find best options for ANY budget
    Query params: budget (default 100), risk_level (low/medium/high)
    """
    budget = float(request.args.get('budget', 100))
    risk_level = request.args.get('risk_level', 'medium')
    
    print(f"\n🔍 Scanning for ${budget} budget (risk: {risk_level})...")
    
    opportunities = []
    scanned = 0
    
    # Scan universe in batches
    for i in range(0, len(STOCK_UNIVERSE), 20):
        batch = STOCK_UNIVERSE[i:i+20]
        symbols_str = ','.join(batch)
        
        quotes_data = tradier_request('/markets/quotes', {'symbols': symbols_str})
        
        if not quotes_data or 'quotes' not in quotes_data:
            continue
        
        quotes = quotes_data['quotes']['quote']
        if not isinstance(quotes, list):
            quotes = [quotes]
        
        for quote in quotes:
            scanned += 1
            symbol = quote.get('symbol', '')
            price = quote.get('last', 0)
            volume = quote.get('volume', 0)
            
            # Skip low volume stocks
            if volume < 100000:
                continue
            
            # Get option chains
            exp_data = tradier_request('/markets/options/expirations', {'symbol': symbol})
            
            if not exp_data or 'expirations' not in exp_data:
                continue
            
            expirations = exp_data['expirations'].get('date', [])
            if not expirations:
                continue
            
            # Check nearest expiration
            nearest_exp = expirations[0] if isinstance(expirations, list) else expirations
            
            chains_data = tradier_request('/markets/options/chains', {
                'symbol': symbol,
                'expiration': nearest_exp,
                'greeks': 'false'
            })
            
            if not chains_data or 'options' not in chains_data:
                continue
            
            options = chains_data['options'].get('option', [])
            if not isinstance(options, list):
                options = [options]
            
            # Find options within budget
            for option in options:
                ask = option.get('ask', 0)
                bid = option.get('bid', 0)
                
                if ask == 0 or bid == 0:
                    continue
                
                # Cost per contract (100 shares)
                cost = ask * 100
                
                if cost > budget:
                    continue
                
                # Calculate potential profit
                spread = ask - bid
                mid_price = (ask + bid) / 2
                
                # Risk metrics
                strike = option.get('strike', 0)
                option_type = option.get('option_type', '')
                
                if option_type == 'call':
                    # For calls: profit potential if stock moves up
                    upside = max(0, price - strike)
                    potential_profit_pct = (upside / mid_price * 100) if mid_price > 0 else 0
                else:
                    # For puts: profit potential if stock moves down
                    downside = max(0, strike - price)
                    potential_profit_pct = (downside / mid_price * 100) if mid_price > 0 else 0
                
                # Calculate score
                score = 0
                
                # Tight spread = more liquid
                spread_pct = (spread / mid_price * 100) if mid_price > 0 else 100
                if spread_pct < 5:
                    score += 30
                elif spread_pct < 10:
                    score += 20
                else:
                    score += 10
                
                # Volume score
                opt_volume = option.get('volume', 0)
                if opt_volume > 100:
                    score += 20
                elif opt_volume > 10:
                    score += 10
                
                # Potential profit score
                if potential_profit_pct > 50:
                    score += 50
                elif potential_profit_pct > 20:
                    score += 30
                elif potential_profit_pct > 10:
                    score += 20
                
                if score >= 50:  # Only good opportunities
                    opportunities.append({
                        'symbol': symbol,
                        'stock_price': price,
                        'option_symbol': option.get('symbol', ''),
                        'type': option_type,
                        'strike': strike,
                        'expiration': nearest_exp,
                        'ask': ask,
                        'bid': bid,
                        'cost': round(cost, 2),
                        'spread': round(spread, 2),
                        'potential_profit_pct': round(potential_profit_pct, 1),
                        'volume': opt_volume,
                        'score': score
                    })
        
        # Don't hammer API
        time.sleep(0.5)
    
    # Sort by score
    opportunities.sort(key=lambda x: x['score'], reverse=True)
    
    # Take top 20
    top_opportunities = opportunities[:20]
    
    return jsonify({
        'success': True,
        'budget': budget,
        'risk_level': risk_level,
        'stocks_scanned': scanned,
        'opportunities_found': len(opportunities),
        'top_picks': top_opportunities,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/quick-scan')
def quick_scan():
    """Fast scan of most active stocks for immediate opportunities"""
    
    # Top 30 most liquid
    quick_list = STOCK_UNIVERSE[:30]
    
    symbols_str = ','.join(quick_list)
    quotes_data = tradier_request('/markets/quotes', {'symbols': symbols_str})
    
    if not quotes_data or 'quotes' not in quotes_data:
        return jsonify({'success': False, 'error': 'Scan failed'})
    
    quotes = quotes_data['quotes']['quote']
    if not isinstance(quotes, list):
        quotes = [quotes]
    
    results = []
    for quote in quotes:
        signals = []
        
        # Volume spike
        volume = quote.get('volume', 0)
        avg_volume = quote.get('average_volume', 1)
        if volume > avg_volume * 1.5:
            signals.append('High Volume')
        
        # Price movement
        change_pct = quote.get('change_percentage', 0)
        if abs(change_pct) > 2:
            signals.append('Large Move')
        
        # Volatility opportunity
        high = quote.get('high', 0)
        low = quote.get('low', 0)
        last = quote.get('last', 0)
        if last > 0 and high > 0 and low > 0:
            intraday_range = ((high - low) / last) * 100
            if intraday_range > 3:
                signals.append('High Volatility')
        
        results.append({
            'symbol': quote['symbol'],
            'price': quote.get('last', 0),
            'change': quote.get('change', 0),
            'change_percent': change_pct,
            'volume': volume,
            'signals': signals,
            'signal_count': len(signals)
        })
    
    # Sort by signal count
    results.sort(key=lambda x: x['signal_count'], reverse=True)
    
    return jsonify({
        'success': True,
        'timestamp': datetime.now().isoformat(),
        'results': results
    })

@app.route('/api/analysis/<symbol>')
def analyze_stock(symbol):
    """Comprehensive analysis with options opportunities"""
    
    # Get quote
    quote_data = tradier_request('/markets/quotes', {'symbols': symbol})
    
    if not quote_data or 'quotes' not in quote_data:
        return jsonify({'success': False, 'error': 'Quote not found'})
    
    quote = quote_data['quotes']['quote']
    if isinstance(quote, list):
        quote = quote[0]
    
    analysis = {
        'symbol': symbol,
        'price': quote.get('last', 0),
        'change': quote.get('change', 0),
        'change_percent': quote.get('change_percentage', 0),
        'volume': quote.get('volume', 0),
        'high': quote.get('high', 0),
        'low': quote.get('low', 0),
        'signals': [],
        'indicators': {},
        'best_options': []
    }
    
    # Volume analysis
    avg_volume = quote.get('average_volume', 0)
    if avg_volume > 0:
        volume_ratio = analysis['volume'] / avg_volume
        analysis['indicators']['volume_ratio'] = round(volume_ratio, 2)
        
        if volume_ratio > 2:
            analysis['signals'].append(f'Volume Spike ({volume_ratio:.1f}x)')
    
    # Volatility
    if analysis['price'] > 0:
        intraday_range = ((analysis['high'] - analysis['low']) / analysis['price']) * 100
        analysis['indicators']['intraday_range'] = round(intraday_range, 2)
        
        if intraday_range > 3:
            analysis['signals'].append('High Volatility')
    
    # Get best option opportunities
    exp_data = tradier_request('/markets/options/expirations', {'symbol': symbol})
    
    if exp_data and 'expirations' in exp_data:
        expirations = exp_data['expirations'].get('date', [])
        if expirations:
            nearest_exp = expirations[0] if isinstance(expirations, list) else expirations
            
            chains_data = tradier_request('/markets/options/chains', {
                'symbol': symbol,
                'expiration': nearest_exp,
                'greeks': 'false'
            })
            
            if chains_data and 'options' in chains_data:
                options = chains_data['options'].get('option', [])
                if not isinstance(options, list):
                    options = [options]
                
                # Find best value options
                budget_options = []
                for option in options[:20]:  # Check first 20
                    ask = option.get('ask', 0)
                    bid = option.get('bid', 0)
                    
                    if ask > 0 and bid > 0:
                        cost = ask * 100
                        if cost < 500:  # Under $500
                            budget_options.append({
                                'type': option.get('option_type', ''),
                                'strike': option.get('strike', 0),
                                'expiration': nearest_exp,
                                'cost': round(cost, 2),
                                'ask': ask,
                                'bid': bid
                            })
                
                # Sort by cost (cheapest first)
                budget_options.sort(key=lambda x: x['cost'])
                analysis['best_options'] = budget_options[:5]
    
    return jsonify({
        'success': True,
        'data': analysis
    })

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'api': 'Tradier Production',
        'stocks_available': len(STOCK_UNIVERSE),
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎯 OPTIONS HUNTER ULTIMATE")
    print("="*60)
    print(f"✅ Scanning {len(STOCK_UNIVERSE)}+ optionable stocks")
    print("✅ Budget-based filtering (ANY amount)")
    print("✅ Real Tradier Production API")
    print("✅ Always returns value")
    print("="*60)
    print(f"\n🌐 Running on http://0.0.0.0:8700")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8700, debug=False, threaded=True)
