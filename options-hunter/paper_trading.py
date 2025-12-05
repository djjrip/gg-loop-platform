#!/usr/bin/env python3
"""
Paper Trading Engine - Runs real trades with fake money
Tracks performance to show proof of concept
"""
import yfinance as yf
import json
from datetime import datetime, timedelta
import os

TRADES_FILE = 'paper_trades.json'
CAPITAL = 10000  # Start with $10k virtual capital

def load_trades():
    """Load existing paper trades"""
    if os.path.exists(TRADES_FILE):
        with open(TRADES_FILE, 'r') as f:
            return json.load(f)
    return {
        'trades': [],
        'capital': CAPITAL,
        'total_pl': 0,
        'wins': 0,
        'losses': 0
    }

def save_trades(data):
    """Save paper trades to file"""
    with open(TRADES_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_rsi(ticker, period=14):
    """Calculate RSI for a ticker"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='1mo')
        
        if hist.empty or len(hist) < period:
            return None
            
        delta = hist['Close'].diff()
        gain = delta.where(delta > 0, 0).rolling(window=period).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi.iloc[-1]
    except:
        return None

def get_current_price(ticker):
    """Get current stock price"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='1d', interval='1m')
        if hist.empty:
            hist = stock.history(period='1d')
        return hist['Close'].iloc[-1] if not hist.empty else None
    except:
        return None

def scan_for_signals():
    """Scan market for oversold (RSI < 30) opportunities"""
    # Top liquid stocks to scan
    tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 
               'AMD', 'NFLX', 'DIS', 'BABA', 'PYPL', 'SQ', 'COIN', 'SHOP']
    
    signals = []
    for ticker in tickers:
        rsi = calculate_rsi(ticker)
        price = get_current_price(ticker)
        
        if rsi and price:
            if rsi < 30:  # Oversold - BUY signal
                signals.append({
                    'ticker': ticker,
                    'rsi': rsi,
                    'price': price,
                    'signal': 'BUY (Oversold)',
                    'confidence': 'HIGH' if rsi < 25 else 'MEDIUM'
                })
            elif rsi > 70:  # Overbought - potential sell
                signals.append({
                    'ticker': ticker,
                    'rsi': rsi,
                    'price': price,
                    'signal': 'SELL (Overbought)',
                    'confidence': 'HIGH' if rsi > 75 else 'MEDIUM'
                })
    
    return signals

def execute_paper_trade(ticker, signal, entry_price):
    """Execute a paper trade (fake money, real data)"""
    data = load_trades()
    
    # Calculate position size (risk 2% of capital per trade)
    position_size = data['capital'] * 0.02
    shares = int(position_size / entry_price)
    
    if shares > 0:
        trade = {
            'id': len(data['trades']) + 1,
            'date': datetime.now().isoformat(),
            'ticker': ticker,
            'signal': signal,
            'entry': entry_price,
            'shares': shares,
            'cost': shares * entry_price,
            'exit': None,
            'pl': 0,
            'status': 'open'
        }
        
        data['trades'].append(trade)
        save_trades(data)
        
        print(f"📈 PAPER TRADE OPENED: {ticker} @ ${entry_price:.2f} ({shares} shares)")
        return trade
    
    return None

def close_paper_trades():
    """Check open trades and close winners/losers"""
    data = load_trades()
    updated = False
    
    for trade in data['trades']:
        if trade['status'] == 'open':
            current_price = get_current_price(trade['ticker'])
            
            if current_price:
                pl_pct = ((current_price - trade['entry']) / trade['entry']) * 100
                
                # Take profit at +15% or stop loss at -7%
                if pl_pct >= 15 or pl_pct <= -7:
                    trade['exit'] = current_price
                    trade['pl'] = (current_price - trade['entry']) * trade['shares']
                    trade['status'] = 'won' if trade['pl'] > 0 else 'lost'
                    
                    data['total_pl'] += trade['pl']
                    data['capital'] += trade['pl']
                    
                    if trade['pl'] > 0:
                        data['wins'] += 1
                    else:
                        data['losses'] += 1
                    
                    updated = True
                    
                    print(f"🔔 PAPER TRADE CLOSED: {trade['ticker']} @ ${current_price:.2f}")
                    print(f"   P/L: ${trade['pl']:.2f} ({pl_pct:+.1f}%)")
    
    if updated:
        save_trades(data)

def get_performance_stats():
    """Calculate performance statistics"""
    data = load_trades()
    
    total_trades = len([t for t in data['trades'] if t['status'] != 'open'])
    win_rate = (data['wins'] / total_trades * 100) if total_trades > 0 else 0
    
    completed_trades = [t for t in data['trades'] if t['status'] != 'open']
    avg_return = sum(t['pl'] for t in completed_trades) / len(completed_trades) if completed_trades else 0
    
    return {
        'totalPL': data['total_pl'],
        'winRate': win_rate,
        'totalTrades': total_trades,
        'avgReturn': (avg_return / CAPITAL) * 100,
        'trades': [
            {
                'date': t['date'],
                'ticker': t['ticker'],
                'signal': t['signal'],
                'entry': t['entry'],
                'exit': t['exit'],
                'pl': t['pl'],
                'status': t['status']
            }
            for t in reversed(data['trades'][-50:])  # Last 50 trades
        ]
    }

if __name__ == '__main__':
    print("🤖 Paper Trading Engine - Running...")
    print(f"💰 Starting Capital: ${CAPITAL:,.2f}")
    print()
    
    # Close any open trades that hit targets
    close_paper_trades()
    
    # Scan for new opportunities
    signals = scan_for_signals()
    
    print(f"📊 Found {len(signals)} signals:")
    for sig in signals[:3]:  # Top 3 signals
        print(f"   {sig['ticker']}: RSI {sig['rsi']:.1f} - {sig['signal']}")
        
        # Execute paper trade on HIGH confidence oversold signals
        if sig['confidence'] == 'HIGH' and 'BUY' in sig['signal']:
            execute_paper_trade(sig['ticker'], sig['signal'], sig['price'])
    
    print()
    
    # Show current stats
    stats = get_performance_stats()
    print(f"📈 Current Performance:")
    print(f"   Total P/L: ${stats['totalPL']:,.2f}")
    print(f"   Win Rate: {stats['winRate']:.1f}%")
    print(f"   Total Trades: {stats['totalTrades']}")
    print(f"   Avg Return: {stats['avgReturn']:+.2f}%")
