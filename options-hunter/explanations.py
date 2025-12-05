"""
explanations.py - Generate human-readable explanations from confirmations
Robinhood-style copy for option recommendations
"""

from typing import List

def build_explanation(ticker: str, strike: float, option_type: str, 
                     confidence: float, confirmations: List[str]) -> str:
    """
    Turn confirmation tags into Robinhood-style user-friendly explanation.
    
    Args:
        ticker: Stock ticker symbol
        strike: Option strike price
        option_type: 'call' or 'put'
        confidence: Confidence score 0-100
        confirmations: List of confirmation tags
    
    Returns:
        Human-readable explanation string
    """
    parts: List[str] = []
    dir_word = "bullish" if option_type == "call" else "bearish"
    
    # Core narrative based on confirmations
    if "bullish_trend" in confirmations:
        parts.append("Price is trending above the 9 & 20 EMAs (strong bullish momentum).")
    
    if "bearish_trend" in confirmations:
        parts.append("Price is trading below the 9 & 20 EMAs (strong bearish momentum).")
    
    if "rsi_bullish" in confirmations:
        parts.append("RSI is rising from a neutral zone, suggesting buyers are stepping in.")
    
    if "rsi_bearish" in confirmations:
        parts.append("RSI is rolling over from a neutral zone, suggesting sellers are gaining control.")
    
    if "volume_expansion" in confirmations:
        parts.append("Current volume is elevated vs the 20-day average, confirming real participation.")
    
    if "sector_bullish" in confirmations:
        parts.append("Sector ETF is green and above its trend, backing the bullish move.")
    
    if "sector_bearish" in confirmations:
        parts.append("Sector ETF is red and below its trend, backing the bearish move.")
    
    if "iv_ok_for_calls" in confirmations:
        parts.append("IV is in a reasonable range for calls (not overpriced, not totally dead).")
    
    if "iv_ok_for_puts" in confirmations:
        parts.append("IV is supportive for puts, giving decent downside payout.")
    
    if "penalty_earnings_nearby" in confirmations:
        parts.append("⚠️ Earnings are close – extra risk baked into this setup.")
    
    if "penalty_macro_event" in confirmations:
        parts.append("⚠️ Major macro event nearby (Fed/CPI/etc.), which could add volatility.")
    
    # Fallback if somehow nothing triggered
    if not parts:
        parts.append(f"Standard {dir_word} setup with no major confirmations. Treat as speculative.")
    
    # Header
    header = f"{ticker} ${strike} {option_type.upper()} – {int(round(confidence))}% confidence {dir_word} setup."
    
    return header + " " + " ".join(parts)
