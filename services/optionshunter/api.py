"""
OPTIONS HUNTER SERVICE - Internal GG LOOP API

Provides HTTP endpoints for Options Hunter functionality that can be consumed by:
- antisocial-bot (for market signal tweets/posts)
- Main GG LOOP app (for premium features)
- Empire Hub (for monitoring)
- Any future services

This is the SINGLE SOURCE OF TRUTH for Options Hunter within GG LOOP platform.
"""

from flask import Flask, jsonify, request, Blueprint
import logging
from datetime import datetime
import os

# Import the unified Tradier client
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from optionshunter.tradier_client import get_tradier_client

logger = logging.getLogger(__name__)

# Create Blueprint for Options Hunter routes
optionshunter_bp = Blueprint('optionshunter', __name__, url_prefix='/api/optionshunter')

# ============================================================================
# HEALTH & STATUS
# ============================================================================

@optionshunter_bp.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint
    
    Returns:
        JSON with service health status
    """
    client = get_tradier_client()
    tradier_status = client.health_check()
    
    return jsonify({
        'service': 'Options Hunter',
        'status': tradier_status['status'],
        'version': '2.0.0-fused',
        'tradier_api': tradier_status,
        'timestamp': datetime.now().isoformat()
    }), 200 if tradier_status['status'] == 'healthy' else 503


@optionshunter_bp.route('/status', methods=['GET'])
def status():
    """
    Detailed service status
    
    Returns:
        JSON with comprehensive status info
    """
    client = get_tradier_client()
    
    return jsonify({
        'service': 'Options Hunter by GG LOOP',
        'description': 'Unified options analysis and market data service',
        'version': '2.0.0-fused',
        'mode': 'sandbox' if client.use_sandbox else 'production',
        'api_configured': bool(client.api_key),
        'endpoints': [
            '/api/optionshunter/health',
            '/api/optionshunter/scan',
            '/api/optionshunter/signals',
            '/api/optionshunter/quote/<symbol>',
            '/api/optionshunter/options/<symbol>',
            '/api/optionshunter/unusual'
        ],
        'integration_status': {
            'antisocial_bot': 'active',
            'empire_hub': 'active',
            'main_app': 'available'
        },
        'timestamp': datetime.now().isoformat()
    })

# ============================================================================
# MARKET DATA
# ============================================================================

@optionshunter_bp.route('/quote/<symbol>', methods=['GET'])
def get_quote(symbol):
    """
    Get real-time quote for symbol
    
    Args:
        symbol: Stock symbol (URL parameter)
        
    Returns:
        JSON with quote data
    """
    client = get_tradier_client()
    quote = client.get_quote(symbol.upper())
    
    if quote:
        return jsonify({
            'success': True,
            'data': quote
        })
    else:
        return jsonify({
            'success': False,
            'error': f'Could not get quote for {symbol}'
        }), 404


@optionshunter_bp.route('/options/<symbol>', methods=['GET'])
def get_options(symbol):
    """
    Get affordable options for symbol
    
    Args:
        symbol: Stock symbol (URL parameter)
        
    Query params:
        max_cost: Maximum cost per contract (default: 500)
        
    Returns:
        JSON with affordable calls and puts
    """
    max_cost = float(request.args.get('max_cost', 500))
    
    client = get_tradier_client()
    options = client.scan_affordable_options(symbol.upper(), max_cost)
    
    return jsonify({
        'success': True,
        'data': options
    })

# ============================================================================
# SCANNING & SIGNALS
# ============================================================================

@optionshunter_bp.route('/scan', methods=['GET'])
def scan():
    """
    Scan market for options opportunities
    
    Query params:
        symbols: Comma-separated list of symbols (optional)
        max_cost: Maximum cost per contract (default: 500)
        
    Returns:
        JSON with scan results
    """
    symbols_param = request.args.get('symbols', '')
    max_cost = float(request.args.get('max_cost', 500))
    
    if symbols_param:
        symbols = [s.strip().upper() for s in symbols_param.split(',')]
    else:
        # Default watchlist
        symbols = ['AAPL', 'MSFT', 'GOOGL', 'META', 'TSLA', 'NVDA', 'AMD', 'SPY', 'QQQ']
    
    client = get_tradier_client()
    results = []
    
    for symbol in symbols[:10]:  # Limit to 10 symbols max
        try:
            options = client.scan_affordable_options(symbol, max_cost)
            
            if 'error' not in options:
                results.append({
                    'symbol': symbol,
                    'stock_price': options['stock_price'],
                    'calls_found': len(options['calls']),
                    'puts_found': len(options['puts']),
                    'cheapest_call': options['calls'][0] if options['calls'] else None,
                    'cheapest_put': options['puts'][0] if options['puts'] else None
                })
        
        except Exception as e:
            logger.error(f"Error scanning {symbol}: {e}")
            continue
    
    return jsonify({
        'success': True,
        'scanned': len(symbols),
        'results_found': len(results),
        'data': results,
        'max_cost': max_cost,
        'timestamp': datetime.now().isoformat()
    })


@optionshunter_bp.route('/signals', methods=['GET'])
def signals():
    """
    Get trading signals for bots and alerts
    
    This endpoint is specifically designed for:
    - antisocial-bot to generate tweet content
    - Discord/webhook alerts
    - Empire Hub monitoring
    
    Returns:
        JSON with actionable trading signals
    """
    client = get_tradier_client()
    unusual = client.get_unusual_activity()
    
    # Format signals for bot consumption
    formatted_signals = []
    
    for signal in unusual[:5]:  # Top 5 signals
        formatted_signals.append({
            'symbol': signal['symbol'],
            'type': signal['type'],
            'strike': signal['strike'],
            'expiration': signal['expiration'],
            'volume': signal['volume'],
            'open_interest': signal['open_interest'],
            'volume_oi_ratio': signal['volume_oi_ratio'],
            'alert_type': signal['alert_type'],
            'headline': f"Unusual {signal['type']} activity on ${signal['symbol']}: {signal['volume']/1000:.1f}K volume vs {signal['open_interest']/1000:.1f}K OI",
            'tweet_ready': f"🚨 ${signal['symbol']} unusual {signal['type']} volume\n\n{signal['volume']:,} contracts vs {signal['open_interest']:,} OI ({signal['volume_oi_ratio']}x ratio)\n\nStrike: ${signal['strike']}\nExp: {signal['expiration']}\n\n#OptionsHunter #Trading"
        })
    
    return jsonify({
        'success': True,
        'signal_count': len(formatted_signals),
        'signals': formatted_signals,
        'timestamp': datetime.now().isoformat(),
        'note': 'Signals auto-formatted for bot posting'
    })


@optionshunter_bp.route('/unusual', methods=['GET'])
def unusual_activity():
    """
    Get unusual options activity
    
    Query params:
        symbols: Comma-separated list of symbols (optional)
        limit: Max number of results (default: 20)
        
    Returns:
        JSON with unusual activity alerts
    """
    symbols_param = request.args.get('symbols', '')
    limit = int(request.args.get('limit', 20))
    
    symbols = None
    if symbols_param:
        symbols = [s.strip().upper() for s in symbols_param.split(',')]
    
    client = get_tradier_client()
    unusual = client.get_unusual_activity(symbols)
    
    return jsonify({
        'success': True,
        'alert_count': len(unusual),
        'signals': unusual[:limit],
        'timestamp': datetime.now().isoformat()
    })


# ============================================================================
# EXPORT BLUEPRINT
# ============================================================================

def init_optionshunter_routes(app: Flask):
    """
    Initialize Options Hunter routes in Flask app
    
    Usage:
        from services.optionshunter.api import init_optionshunter_routes
        init_optionshunter_routes(app)
    """
    app.register_blueprint(optionshunter_bp)
    logger.info("✅ Options Hunter routes registered")


# For standalone testing
if __name__ == '__main__':
    app = Flask(__name__)
    init_optionshunter_routes(app)
    app.run(host='0.0.0.0', port=8700, debug=True)
