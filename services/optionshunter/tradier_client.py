"""
OPTIONS HUNTER SERVICE - Unified API Module

This module provides a centralized Tradier API client and market data access
for the entire GG LOOP platform. All services (antisocial-bot, main app, etc.)
should import from here instead of duplicating API logic.

Environment Variables Required:
- TRADIER_API_KEY: Your Tradier API key
- TRADIER_ACCOUNT_ID: (optional) Your Tradier account ID
"""

import os
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

# Configuration
TRADIER_API_KEY = os.getenv('TRADIER_API_KEY', '')
TRADIER_ACCOUNT_ID = os.getenv('TRADIER_ACCOUNT_ID', '')
TRADIER_BASE_URL = 'https://api.tradier.com/v1'
TRADIER_SANDBOX_URL = 'https://sandbox.tradier.com/v1'

# Use sandbox if no API key is configured
USE_SANDBOX = not TRADIER_API_KEY or os.getenv('TRADIER_SANDBOX', 'false').lower() == 'true'
BASE_URL = TRADIER_SANDBOX_URL if USE_SANDBOX else TRADIER_BASE_URL

class TradierClient:
    """
    Unified Tradier API client for Options Hunter functionality
    """
    
    def __init__(self, api_key: str = None, use_sandbox: bool = None):
        self.api_key = api_key or TRADIER_API_KEY
        self.use_sandbox = use_sandbox if use_sandbox is not None else USE_SANDBOX
        self.base_url = TRADIER_SANDBOX_URL if self.use_sandbox else TRADIER_BASE_URL
        
        if not self.api_key:
            logger.warning("No Tradier API key configured - API calls will fail")
    
    def _make_request(self, endpoint: str, params: Dict = None, method: str = 'GET') -> Optional[Dict]:
        """
        Make authenticated request to Tradier API
        
        Args:
            endpoint: API endpoint (e.g. '/markets/quotes')
            params: Query parameters
            method: HTTP method
            
        Returns:
            JSON response or None if error
        """
        if not self.api_key:
            logger.error("Cannot make Tradier API request - no API key configured")
            return None
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Accept': 'application/json'
        }
        
        url = f'{self.base_url}{endpoint}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params or {}, timeout=10)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=params or {}, timeout=10)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Tradier API request failed: {e}")
            return None
    
    def get_quote(self, symbol: str) -> Optional[Dict]:
        """
        Get real-time quote for symbol
        
        Args:
            symbol: Stock symbol (e.g. 'AAPL')
            
        Returns:
            Quote data or None
        """
        data = self._make_request('/markets/quotes', {'symbols': symbol})
        
        if data and 'quotes' in data:
            quote = data['quotes']['quote']
            if isinstance(quote, list):
                quote = quote[0]
            
            return {
                'symbol': symbol,
                'last': quote.get('last', 0),
                'change': quote.get('change', 0),
                'change_percentage': quote.get('change_percentage', 0),
                'volume': quote.get('volume', 0),
                'high': quote.get('high', 0),
                'low': quote.get('low', 0),
                'bid': quote.get('bid', 0),
                'ask': quote.get('ask', 0),
                'timestamp': datetime.now().isoformat()
            }
        
        return None
    
    def get_options_expirations(self, symbol: str) -> List[str]:
        """
        Get available option expiration dates for symbol
        
        Args:
            symbol: Stock symbol
            
        Returns:
            List of expiration dates (YYYY-MM-DD format)
        """
        data = self._make_request('/markets/options/expirations', {'symbol': symbol})
        
        if data and 'expirations' in data:
            expirations = data['expirations'].get('date', [])
            return expirations if isinstance(expirations, list) else [expirations]
        
        return []
    
    def get_options_chain(self, symbol: str, expiration: str) -> List[Dict]:
        """
        Get options chain for symbol and expiration
        
        Args:
            symbol: Stock symbol
            expiration: Expiration date (YYYY-MM-DD)
            
        Returns:
            List of option contracts
        """
        data = self._make_request('/markets/options/chains', {
            'symbol': symbol,
            'expiration': expiration,
            'greeks': 'true'
        })
        
        if data and 'options' in data:
            options = data['options'].get('option', [])
            return options if isinstance(options, list) else [options]
        
        return []
    
    def scan_affordable_options(self, symbol: str, max_cost: float = 500.0) -> Dict:
        """
        Scan for affordable option opportunities
        
        Args:
            symbol: Stock symbol to scan
            max_cost: Maximum cost per contract (default: $500)
            
        Returns:
            Dict with 'calls' and 'puts' lists of affordable options
        """
        # Get stock price
        quote = self.get_quote(symbol)
        if not quote:
            return {'calls': [], 'puts': [], 'error': 'Could not get quote'}
        
        stock_price = quote['last']
        
        # Get next 3 expirations
        expirations = self.get_options_expirations(symbol)[:3]
        
        if not expirations:
            return {'calls': [], 'puts': [], 'error': 'No expirations found'}
        
        affordable_calls = []
        affordable_puts = []
        
        for expiration in expirations:
            options = self.get_options_chain(symbol, expiration)
            
            for opt in options:
                # Skip if no bid/ask
                if not opt.get('bid') or not opt.get('ask'):
                    continue
                
                # Calculate mid price
                mid_price = (opt['bid'] + opt['ask']) / 2
                contract_cost = mid_price * 100  # Cost per contract
                
                # Only include affordable options
                if contract_cost <= max_cost and mid_price > 0:
                    option_data = {
                        'symbol': opt['symbol'],
                        'strike': opt['strike'],
                        'expiration': expiration,
                        'bid': opt['bid'],
                        'ask': opt['ask'],
                        'mid_price': round(mid_price, 2),
                        'contract_cost': round(contract_cost, 2),
                        'volume': opt.get('volume', 0),
                        'open_interest': opt.get('open_interest', 0),
                        'implied_volatility': opt.get('greeks', {}).get('smv_vol', 0)
                    }
                    
                    if opt['option_type'] == 'call':
                        option_data['distance_from_price'] = round((opt['strike'] - stock_price) / stock_price * 100, 2)
                        affordable_calls.append(option_data)
                    else:
                        option_data['distance_from_price'] = round((stock_price - opt['strike']) / stock_price * 100, 2)
                        affordable_puts.append(option_data)
        
        # Sort by contract cost (cheapest first)
        affordable_calls.sort(key=lambda x: x['contract_cost'])
        affordable_puts.sort(key=lambda x: x['contract_cost'])
        
        return {
            'symbol': symbol,
            'stock_price': stock_price,
            'calls': affordable_calls[:10],  # Top 10 cheapest calls
            'puts': affordable_puts[:10],    # Top 10 cheapest puts
            'timestamp': datetime.now().isoformat(),
            'expirations_scanned': len(expirations)
        }
    
    def get_unusual_activity(self, symbols: List[str] = None) -> List[Dict]:
        """
        Scan for unusual options activity
        
        Args:
            symbols: List of symbols to scan (default: popular tickers)
            
        Returns:
            List of unusual activity signals
        """
        if symbols is None:
            symbols = ['AAPL', 'MSFT', 'GOOGL', 'META', 'TSLA', 'NVDA', 'AMD', 'SPY', 'QQQ']
        
        signals = []
        
        for symbol in symbols:
            try:
                expirations = self.get_options_expirations(symbol)
                if not expirations:
                    continue
                
                # Check this week's expiration
                expiration = expirations[0]
                options = self.get_options_chain(symbol, expiration)
                
                for opt in options:
                    volume = opt.get('volume', 0)
                    open_interest = opt.get('open_interest', 1)
                    
                    # Unusual activity: volume > 2x open interest
                    if volume > 0 and volume > (open_interest * 2):
                        signals.append({
                            'symbol': symbol,
                            'option_symbol': opt['symbol'],
                            'type': opt['option_type'],
                            'strike': opt['strike'],
                            'expiration': expiration,
                            'volume': volume,
                            'open_interest': open_interest,
                            'volume_oi_ratio': round(volume / open_interest, 2),
                            'last_price': opt.get('last', 0),
                            'alert_type': 'UNUSUAL_VOLUME'
                        })
            
            except Exception as e:
                logger.error(f"Error scanning {symbol}: {e}")
                continue
        
        # Sort by volume/OI ratio (most unusual first)
        signals.sort(key=lambda x: x['volume_oi_ratio'], reverse=True)
        
        return signals[:20]  # Top 20 signals
    
    def health_check(self) -> Dict:
        """
        Check if Tradier API is accessible
        
        Returns:
            Health status dict
        """
        if not self.api_key:
            return {
                'status': 'unhealthy',
                'error': 'No API key configured',
                'mode': 'sandbox' if self.use_sandbox else 'production'
            }
        
        # Try to get a simple quote
        try:
            data = self._make_request('/markets/quotes', {'symbols': 'SPY'})
            
            if data and 'quotes' in data:
                return {
                    'status': 'healthy',
                    'mode': 'sandbox' if self.use_sandbox else 'production',
                    'api_accessible': True,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'status': 'degraded',
                    'error': 'API returned invalid response',
                    'mode': 'sandbox' if self.use_sandbox else 'production'
                }
        
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'mode': 'sandbox' if self.use_sandbox else 'production'
            }


# Global singleton instance
_tradier_client = None

def get_tradier_client() -> TradierClient:
    """Get singleton Tradier client instance"""
    global _tradier_client
    if _tradier_client is None:
        _tradier_client = TradierClient()
    return _tradier_client
