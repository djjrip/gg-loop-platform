#!/usr/bin/env python3
"""
API Proxy Server for Options Hunter
Handles CORS and API requests server-side
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta
import os

# Load API keys from environment variables (NEVER hardcode in production)
FINNHUB_KEY = os.getenv('FINNHUB_KEY', 'd4mals9r01qjidhukr8gd4mals9r01qjidhukr90')
POLYGON_KEY = os.getenv('POLYGON_KEY', 'EIlDyTzl0_zaQbLiC1lu5MqvRvg7ybmu')

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            query = urllib.parse.parse_qs(parsed.query)
            
            # Route: /api/price?ticker=AAPL
            if path == '/api/price':
                ticker = query.get('ticker', [''])[0]
                if not ticker:
                    self.send_error(400, 'Missing ticker')
                    return
                
                url = f'https://finnhub.io/api/v1/quote?symbol={ticker}&token={FINNHUB_KEY}'
                response = urllib.request.urlopen(url, timeout=10)
                data = json.loads(response.read())
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
                
            # Route: /api/history?ticker=AAPL
            elif path == '/api/history':
                ticker = query.get('ticker', [''])[0]
                if not ticker:
                    self.send_error(400, 'Missing ticker')
                    return
                
                to_date = datetime.now()
                from_date = to_date - timedelta(days=30)
                
                url = f'https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{from_date.strftime("%Y-%m-%d")}/{to_date.strftime("%Y-%m-%d")}?adjusted=true&sort=asc&apiKey={POLYGON_KEY}'
                response = urllib.request.urlopen(url, timeout=10)
                data = json.loads(response.read())
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
                
            # Route: /api/options?ticker=AAPL&expiration=2025-12-20
            elif path == '/api/options':
                ticker = query.get('ticker', [''])[0]
                expiration = query.get('expiration', [''])[0]
                if not ticker or not expiration:
                    self.send_error(400, 'Missing ticker or expiration')
                    return
                
                url = f'https://api.polygon.io/v3/reference/options/contracts?underlying_ticker={ticker}&expiration_date={expiration}&limit=250&apiKey={POLYGON_KEY}'
                response = urllib.request.urlopen(url, timeout=10)
                data = json.loads(response.read())
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
                
            # Route: /api/quote?contract=O:AAPL251220C00180000
            elif path == '/api/quote':
                contract = query.get('contract', [''])[0]
                if not contract:
                    self.send_error(400, 'Missing contract')
                    return
                
                url = f'https://api.polygon.io/v3/quotes/{contract}?limit=1&order=desc&apiKey={POLYGON_KEY}'
                response = urllib.request.urlopen(url, timeout=10)
                data = json.loads(response.read())
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
                
            else:
                self.send_error(404, 'Not Found')
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
            
        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    PORT = 8701
    server = HTTPServer(('0.0.0.0', PORT), ProxyHandler)
    print(f'🚀 API Proxy running on http://localhost:{PORT}')
    print(f'📡 Proxying Finnhub and Polygon APIs')
    print(f'✅ CORS enabled for browser access')
    server.serve_forever()
