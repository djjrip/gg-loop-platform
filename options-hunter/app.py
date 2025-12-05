#!/usr/bin/env python3
"""
OPTIONS HUNTER - REAL TRADIER DATA
Production-ready options scanner with live market data
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import requests
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='.')
CORS(app)

# REAL Tradier Production API
TRADIER_API_KEY = os.getenv('TRADIER_API_KEY', 'GpVYl2LnBJbamiBCH8ucAadF7lps')
TRADIER_BASE = 'https://api.tradier.com/v1'

def tradier_request(endpoint, params=None):
    """Make request to Tradier API"""
    headers = {
        'Authorization': f'Bearer {TRADIER_API_KEY}',
        'Accept': 'application/json'
    }
    
    url = f'{TRADIER_BASE}{endpoint}'
    response = requests.get(url, headers=headers, params=params or {})
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Tradier API error: {response.status_code}")
        return None

@app.route('/api/quote/<symbol>')
def get_quote(symbol):
    """Get real-time quote from Tradier"""
    data = tradier_request('/markets/quotes', {'symbols': symbol})
    
    if data and 'quotes' in data:
        quote = data['quotes']['quote']
        if isinstance(quote, list):
            quote = quote[0]
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'price': quote.get('last', 0),
            'change': quote.get('change', 0),
            'change_percent': quote.get('change_percentage', 0),
            'volume': quote.get('volume', 0),
            'high': quote.get('high', 0),
            'low': quote.get('low', 0),
            'bid': quote.get('bid', 0),
            'ask': quote.get('ask', 0)
        })
    
    return jsonify({'success': False, 'error': 'Quote not found'})

@app.route('/api/options/<symbol>')
def get_options(symbol):
    """Get AFFORDABLE option opportunities for ANY budget"""
    # Get stock quote first
    quote_data = tradier_request('/markets/quotes', {'symbols': symbol})
    if not quote_data or 'quotes' not in quote_data:
        return jsonify({'success': False, 'error': 'Quote not found'})
    
    quote = quote_data['quotes']['quote']
    if isinstance(quote, list):
        quote = quote[0]
    
    stock_price = quote.get('last', 0)
    
    # Get expirations
    exp_data = tradier_request('/markets/options/expirations', {'symbol': symbol})
    
    if not exp_data or 'expirations' not in exp_data:
        return jsonify({'success': False, 'error': 'No options available for this symbol'})
    
    expirations = exp_data['expirations']['date'][:3]  # Next 3 expirations
    
    all_affordable_calls = []
    all_affordable_puts = []
    
    # Scan multiple expirations to find AFFORDABLE options
    for expiration in expirations:
        chains_data = tradier_request('/markets/options/chains', {
            'symbol': symbol,
            'expiration': expiration,
            'greeks': 'true'
        })
        
        if not chains_data or 'options' not in chains_data:
            continue
        
        options = chains_data['options']['option']
        
        # Find BUDGET-FRIENDLY options (under $500 per contract)
        for opt in options:
            bid = opt.get('bid', 0)
            ask = opt.get('ask', 0)
            mid_price = (bid + ask) / 2 if bid and ask else 0
            
            if mid_price == 0:
                continue
            
            contract_cost = mid_price * 100  # Cost per contract
            
            # Only include if under $500 (affordable for small accounts)
            if contract_cost < 500:
                option_info = {
                    'symbol': opt['symbol'],
                    'strike': opt['strike'],
                    'bid': bid,
                    'ask': ask,
                    'mid_price': round(mid_price, 2),
                    'contract_cost': round(contract_cost, 2),
                    'expiration': expiration,
                    'volume': opt.get('volume', 0),
                    'open_interest': opt.get('open_interest', 0),
                    'delta': opt.get('greeks', {}).get('delta', 0),
                    'type': opt['option_type']
                }
                
                if opt['option_type'] == 'call':
                    all_affordable_calls.append(option_info)
                else:
                    all_affordable_puts.append(option_info)
    
    # Sort by affordability (cheapest first) then by volume (most liquid)
    all_affordable_calls.sort(key=lambda x: (x['contract_cost'], -x['volume']))
    all_affordable_puts.sort(key=lambda x: (x['contract_cost'], -x['volume']))
    
    # Budget tiers
    budget_tiers = {
        'micro': {'max': 50, 'name': 'Micro Budget ($50 or less)'},
        'small': {'max': 150, 'name': 'Small Budget ($50-$150)'},
        'medium': {'max': 300, 'name': 'Medium Budget ($150-$300)'},
        'standard': {'max': 500, 'name': 'Standard Budget ($300-$500)'}
    }
    
    return jsonify({
        'success': True,
        'symbol': symbol,
        'stock_price': stock_price,
        'affordable_calls': all_affordable_calls[:20],  # Top 20 cheapest calls
        'affordable_puts': all_affordable_puts[:20],    # Top 20 cheapest puts
        'budget_tiers': budget_tiers,
        'total_affordable_options': len(all_affordable_calls) + len(all_affordable_puts),
        'message': f'Found {len(all_affordable_calls)} affordable calls and {len(all_affordable_puts)} affordable puts (all under $500)'
    })

@app.route('/api/scan')
def scan_market():
    """Scan ALL stocks - FIND DIAMONDS IN THE ROUGH - HIGH RISK HIGH REWARD"""
    # Expanded universe - 100+ most liquid optionable stocks
    symbols = [
        # Mega caps
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 'UNH', 'XOM',
        'JNJ', 'JPM', 'V', 'PG', 'MA', 'HD', 'CVX', 'LLY', 'ABBV', 'MRK',
        # Tech
        'AVGO', 'ORCL', 'CSCO', 'CRM', 'ADBE', 'ACN', 'INTC', 'AMD', 'QCOM', 'TXN',
        'NOW', 'INTU', 'AMAT', 'MU', 'ADI', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL',
        # Finance
        'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'SPGI', 'CB',
        # Consumer
        'COST', 'WMT', 'NKE', 'MCD', 'SBUX', 'DIS', 'NFLX', 'CMCSA', 'PEP', 'KO',
        # Healthcare
        'TMO', 'ABT', 'DHR', 'BMY', 'AMGN', 'GILD', 'VRTX', 'ISRG', 'REGN', 'CI',
        # Energy
        'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL', 'KMI', 'WMB',
        # ETFs & Indexes
        'SPY', 'QQQ', 'IWM', 'DIA', 'EEM', 'GLD', 'SLV', 'USO', 'XLE', 'XLF',
        # Hot stocks - HIGH RISK HIGH REWARD
        'COIN', 'PLTR', 'SNOW', 'CRWD', 'NET', 'DDOG', 'ZS', 'PANW', 'FTNT', 'OKTA'
    ]
    
    # Get quotes for all
    quotes_data = tradier_request('/markets/quotes', {'symbols': ','.join(symbols)})
    
    if not quotes_data or 'quotes' not in quotes_data:
        return jsonify({'success': False, 'error': 'Scan failed'})
    
    quotes = quotes_data['quotes']['quote']
    
    results = []
    for quote in quotes:
        price = quote.get('last', 0)
        if price == 0:
            continue
            
        # Calculate signals
        signals = []
        signal_strength = 0
        
        # Volume spike - DIAMONDS have unusual volume
        volume = quote.get('volume', 0)
        avg_volume = quote.get('average_volume', 1)
        volume_ratio = volume / avg_volume if avg_volume > 0 else 0
        
        if volume_ratio > 5:
            signals.append('💎 DIAMOND - HUGE VOLUME')
            signal_strength += 5
        elif volume_ratio > 3:
            signals.append('🔥 EXPLOSIVE Volume')
            signal_strength += 3
        elif volume_ratio > 1.5:
            signals.append('📈 High Volume')
            signal_strength += 2
        
        # Price movement - BIG MOVES = OPPORTUNITY
        change_pct = quote.get('change_percentage', 0)
        if abs(change_pct) > 10:
            signals.append('🚀 MASSIVE MOVE')
            signal_strength += 5
        elif abs(change_pct) > 5:
            signals.append('⚡ BIG Move')
            signal_strength += 3
        elif abs(change_pct) > 2:
            signals.append('📊 Moving')
            signal_strength += 1
        
        # Budget-friendly opportunities
        if price < 10:
            signals.append('💰 Under $10')
            signal_strength += 2
        elif price < 50:
            signals.append('💵 Under $50')
            signal_strength += 1
        
        # Calculate affordable options estimate
        min_option_cost = round(price * 0.02, 2)
        
        # DIAMOND RATING - for high risk high reward players
        diamond_score = 0
        if volume_ratio > 3 and abs(change_pct) > 3:
            diamond_score = 100  # PERFECT DIAMOND
        elif volume_ratio > 2 and abs(change_pct) > 2:
            diamond_score = 75   # STRONG
        elif volume_ratio > 1.5 or abs(change_pct) > 2:
            diamond_score = 50   # DECENT
        else:
            diamond_score = 25   # MEH
        
        results.append({
            'symbol': quote['symbol'],
            'price': price,
            'change': quote.get('change', 0),
            'change_percent': change_pct,
            'volume': volume,
            'volume_ratio': round(volume_ratio, 2),
            'signals': signals,
            'signal_strength': signal_strength,
            'min_option_cost': min_option_cost,
            'budget_friendly': min_option_cost < 100,
            'diamond_score': diamond_score  # NEW: High risk/reward rating
        })
    
    # Sort by DIAMOND SCORE (best opportunities first) then signal strength
    results.sort(key=lambda x: (x['diamond_score'], x['signal_strength']), reverse=True)
    
    return jsonify({
        'success': True,
        'timestamp': datetime.now().isoformat(),
        'total_scanned': len(results),
        'results': results,
        'message': f'Scanned {len(results)} stocks - sorted by DIAMOND potential (high risk/reward)'
    })

@app.route('/api/analysis/<symbol>')
def analyze_stock(symbol):
    """Get EXACT trading recommendation - ROBINHOOD READY"""
    # Get quote
    quote_data = tradier_request('/markets/quotes', {'symbols': symbol})
    
    if not quote_data or 'quotes' not in quote_data:
        return jsonify({'success': False, 'error': 'Quote not found'})
    
    quote = quote_data['quotes']['quote']
    if isinstance(quote, list):
        quote = quote[0]
    
    stock_price = quote.get('last', 0)
    change_pct = quote.get('change_percentage', 0)
    
    # Get expirations
    exp_data = tradier_request('/markets/options/expirations', {'symbol': symbol})
    
    if not exp_data or 'expirations' not in exp_data:
        return jsonify({'success': False, 'error': 'No options available'})
    
    expirations = exp_data['expirations']['date'][:3]
    
    # Get historical data for RSI
    end = datetime.now().strftime('%Y-%m-%d')
    start = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    history = tradier_request('/markets/history', {
        'symbol': symbol,
        'interval': 'daily',
        'start': start,
        'end': end
    })
    
    rsi = 50  # Default neutral
    if history and 'history' in history:
        prices = [float(day['close']) for day in history['history']['day']]
        
        if len(prices) >= 14:
            gains = []
            losses = []
            for i in range(1, len(prices)):
                change = prices[i] - prices[i-1]
                if change > 0:
                    gains.append(change)
                    losses.append(0)
                else:
                    gains.append(0)
                    losses.append(abs(change))
            
            avg_gain = sum(gains[-14:]) / 14
            avg_loss = sum(losses[-14:]) / 14
            
            if avg_loss != 0:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))
    
    # DECIDE: BUY CALL or BUY PUT
    action = "BUY CALL" if rsi < 50 or change_pct > 0 else "BUY PUT"
    option_type = "call" if action == "BUY CALL" else "put"
    
    # Get best option for their budget
    best_options = []
    for expiration in expirations:
        chains_data = tradier_request('/markets/options/chains', {
            'symbol': symbol,
            'expiration': expiration,
            'greeks': 'true'
        })
        
        if not chains_data or 'options' not in chains_data:
            continue
        
        options = chains_data['options']['option']
        
        for opt in options:
            if opt['option_type'] != option_type:
                continue
            
            bid = opt.get('bid', 0)
            ask = opt.get('ask', 0)
            mid_price = (bid + ask) / 2 if bid and ask else 0
            
            if mid_price == 0:
                continue
            
            contract_cost = mid_price * 100
            
            # Only affordable options under $500
            if contract_cost < 500:
                volume = opt.get('volume', 0)
                open_interest = opt.get('open_interest', 0)
                
                # Calculate score (cheaper + more liquid = better)
                liquidity_score = volume + (open_interest * 0.5)
                
                best_options.append({
                    'symbol': opt['symbol'],
                    'strike': opt['strike'],
                    'expiration': expiration,
                    'cost': round(contract_cost, 2),
                    'mid_price': round(mid_price, 2),
                    'volume': volume,
                    'open_interest': open_interest,
                    'score': liquidity_score - contract_cost  # Higher is better
                })
    
    # Sort by score (best first)
    best_options.sort(key=lambda x: x['score'], reverse=True)
    
    # Format EXACT Robinhood instructions
    recommendation = {
        'action': action,
        'symbol': symbol,
        'stock_price': stock_price,
        'rsi': round(rsi, 2),
        'change_percent': change_pct,
        'best_option': best_options[0] if best_options else None,
        'alternatives': best_options[1:4] if len(best_options) > 1 else [],
        'robinhood_instructions': None
    }
    
    if best_options:
        opt = best_options[0]
        exp_date = datetime.strptime(opt['expiration'], '%Y-%m-%d').strftime('%m/%d/%y')
        
        recommendation['robinhood_instructions'] = {
            'step1': f"Open Robinhood → Search '{symbol}'",
            'step2': f"Tap 'Trade Options' → Select '{option_type.upper()}'",
            'step3': f"Choose strike: ${opt['strike']:.2f}",
            'step4': f"Choose expiration: {exp_date}",
            'step5': f"Buy 1 contract for ~${opt['cost']:.2f}",
            'summary': f"{action} {symbol} ${opt['strike']:.2f} {option_type.upper()} exp {exp_date} @ ${opt['cost']:.2f}"
        }
    
    return jsonify({
        'success': True,
        'recommendation': recommendation,
        'total_options_found': len(best_options)
    })

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'api': 'Tradier Production',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def index():
    """Serve scanner.html"""
    return send_from_directory('.', 'scanner.html')

@app.route('/scanner.html')
def scanner():
    """Serve scanner.html"""
    return send_from_directory('.', 'scanner.html')

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎯 OPTIONS HUNTER - REAL DATA EDITION")
    print("="*60)
    print("✅ Using Tradier Production API")
    print("✅ Real-time quotes")
    print("✅ Live options chains")
    print("✅ Technical analysis")
    print("="*60)
    print(f"\n🌐 Running on http://localhost:8700")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8700, debug=True)
