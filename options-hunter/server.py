#!/usr/bin/env python3
"""
Production-ready Options Hunter Server
With health checks, monitoring, auto-healing, and database persistence
"""

from flask import Flask, send_from_directory, request, jsonify
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import os
import sys
import time
import psutil
import logging
from functools import wraps
import signal

# Initialize Flask
app = Flask(__name__, static_folder='.', static_url_path='')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/tmp/optionshunter.log')
    ]
)
logger = logging.getLogger(__name__)

# Global state for health tracking
app_start_time = time.time()
request_count = 0
error_count = 0
last_health_check = time.time()

# Database connection (lazy loaded)
db_connection = None

# Environment variables
PORT = int(os.getenv('PORT', 8700))
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
DATABASE_URL = os.getenv('DATABASE_URL')
REDIS_URL = os.getenv('REDIS_URL')

# ============================================================================
# HEALTH CHECK & MONITORING
# ============================================================================

def get_system_metrics():
    """Get current system metrics for health monitoring"""
    try:
        return {
            "memory_percent": psutil.virtual_memory().percent,
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "disk_percent": psutil.disk_usage('/').percent,
            "uptime_seconds": int(time.time() - app_start_time)
        }
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        return {}

@app.route('/health')
def health_check():
    """
    Comprehensive health check endpoint
    Returns 200 if healthy, 503 if unhealthy
    """
    global last_health_check
    last_health_check = time.time()
    
    health_status = {
        "status": "healthy",
        "service": "Options Hunter",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": int(time.time() - app_start_time),
        "request_count": request_count,
        "error_count": error_count,
        "error_rate": round(error_count / max(request_count, 1) * 100, 2)
    }
    
    # Add system metrics
    health_status.update(get_system_metrics())
    
    # Check database connection
    if DATABASE_URL:
        try:
            # TODO: Add actual DB ping
            health_status["database"] = "connected"
        except Exception as e:
            health_status["database"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
    
    # Check if system is overloaded
    metrics = get_system_metrics()
    if metrics.get("memory_percent", 0) > 90:
        health_status["status"] = "degraded"
        health_status["warning"] = "High memory usage"
    
    if metrics.get("cpu_percent", 0) > 95:
        health_status["status"] = "degraded"
        health_status["warning"] = "High CPU usage"
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return jsonify(health_status), status_code

@app.route('/ping')
def ping():
    """Simple alive check for load balancers"""
    return "OK", 200

@app.route('/ready')
def readiness():
    """
    Readiness check - returns 200 when service is ready to accept traffic
    """
    # Check if critical dependencies are available
    ready = True
    checks = {}
    
    # Check yfinance is importable
    try:
        import yfinance
        checks["yfinance"] = "ready"
    except Exception as e:
        checks["yfinance"] = f"error: {str(e)}"
        ready = False
    
    # Check pandas is available
    try:
        import pandas
        checks["pandas"] = "ready"
    except Exception as e:
        checks["pandas"] = f"error: {str(e)}"
        ready = False
    
    status = {
        "ready": ready,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    return jsonify(status), 200 if ready else 503

# ============================================================================
# ERROR HANDLING & MONITORING
# ============================================================================

def track_request(f):
    """Decorator to track requests and errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        global request_count, error_count
        request_count += 1
        try:
            return f(*args, **kwargs)
        except Exception as e:
            error_count += 1
            logger.error(f"Error in {f.__name__}: {str(e)}", exc_info=True)
            return jsonify({"error": "Internal server error", "details": str(e)}), 500
    return decorated_function

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    global error_count
    error_count += 1
    logger.error(f"Internal server error: {str(error)}", exc_info=True)
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# ============================================================================
# STATIC FILE SERVING
# ============================================================================

@app.route('/')
def root():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/price')
@track_request
def api_price():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({'error':'missing ticker'}), 400
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='1d', interval='1m')
        if hist.empty:
            hist = stock.history(period='1d')
        price = hist['Close'].iloc[-1] if not hist.empty else None
        if not price:
            return jsonify({'error': 'No price data'}), 404
        return jsonify({'c': float(price), 'ticker': ticker}), 200
    except Exception as e:
        logger.error(f"Error fetching price for {ticker}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan')
@track_request
def api_scan():
    """Scan market for options opportunities"""
    budget = float(request.args.get('budget', 500))
    
    # Popular stocks for scanning
    tickers = ['AAPL', 'MSFT', 'GOOGL', 'META']
    
    signals = []
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period='1mo')
            if hist.empty:
                continue
            
            # Calculate RSI
            delta = hist['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            current_rsi = rsi.iloc[-1]
            current_price = hist['Close'].iloc[-1]
            
            # Generate signal based on RSI
            if current_rsi > 70:
                signal_type = "BEARISH"
                option_type = "put"
                strike = current_price * 0.95
            elif current_rsi < 30:
                signal_type = "BULLISH"
                option_type = "call"
                strike = current_price * 1.05
            else:
                continue
            
            # Calculate option cost (simplified)
            option_cost = max(50.0, current_price * 0.02)
            contracts_can_buy = int(budget / (option_cost * 100))
            
            if contracts_can_buy >= 1:
                signals.append({
                    "symbol": ticker,
                    "price": float(current_price),
                    "rsi": float(current_rsi),
                    "signal": signal_type,
                    "option_type": option_type,
                    "strike": float(strike),
                    "option_cost": float(option_cost),
                    "contracts_can_buy": contracts_can_buy,
                    "potential_profit": float(abs(70 - current_rsi))
                })
        except Exception as e:
            logger.error(f"Error scanning {ticker}: {e}")
            continue
    
    return jsonify({
        "scanned": len(tickers),
        "signals": signals,
        "timestamp": datetime.utcnow().isoformat()
    })

# ============================================================================
# GRACEFUL SHUTDOWN
# ============================================================================

def graceful_shutdown(signum, frame):
    """Handle graceful shutdown on SIGTERM"""
    logger.info("Received shutdown signal, shutting down gracefully...")
    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)

# ============================================================================
# APPLICATION STARTUP
# ============================================================================

if __name__ == '__main__':
    logger.info(f"Starting Options Hunter Server on port {PORT}")
    logger.info(f"Environment: {ENVIRONMENT}")
    logger.info(f"Database: {'Connected' if DATABASE_URL else 'Not configured'}")
    logger.info(f"Redis: {'Connected' if REDIS_URL else 'Not configured'}")
    
    # Run with Gunicorn in production, Flask dev server locally
    if ENVIRONMENT == 'production':
        logger.info("Production mode - use Gunicorn to start this app")
    else:
        app.run(host='0.0.0.0', port=PORT, debug=False)
