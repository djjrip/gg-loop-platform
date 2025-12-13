"""
signals.py - Core confidence scoring engine for options
Implements rules-based confirmation system with technical indicators
"""

from typing import Literal, TypedDict, List
from dataclasses import dataclass

Direction = Literal["call", "put"]

class SignalInputs(TypedDict):
    """Input data for confidence computation"""
    direction: Direction
    price: float
    ema9: float
    ema20: float
    rsi: float
    rsi_slope: float  # positive = rising, negative = falling
    volume: float
    avg_volume_20: float
    sector_price_change: float  # % change today, e.g. 0.45 for +0.45%
    sector_above_ema20: bool
    iv_rank: float  # 0-100
    has_near_earnings: bool
    has_major_macro_event: bool

@dataclass
class ConfidenceResult:
    """Result of confidence computation"""
    confidence: float  # 0-100
    confirmations: List[str]  # machine-readable tags

def compute_confidence(inputs: SignalInputs) -> ConfidenceResult:
    """
    Core scoring logic for both calls and puts.
    Weighting is tuned for "3+ confirmations = tradeable".
    
    Returns confidence score 0-100 and list of confirmations.
    """
    score = 0.0
    confirmations: List[str] = []
    
    # 1) Trend / EMA structure
    if inputs['direction'] == 'call':
        if inputs['price'] > inputs['ema9'] and inputs['ema9'] > inputs['ema20']:
            score += 20
            confirmations.append('bullish_trend')
    else:
        if inputs['price'] < inputs['ema9'] and inputs['ema9'] < inputs['ema20']:
            score += 20
            confirmations.append('bearish_trend')
    
    # 2) RSI behaviour
    if inputs['direction'] == 'call':
        if 45 < inputs['rsi'] < 70 and inputs['rsi_slope'] > 0:
            score += 15
            confirmations.append('rsi_bullish')
    else:
        if 30 < inputs['rsi'] < 55 and inputs['rsi_slope'] < 0:
            score += 15
            confirmations.append('rsi_bearish')
    
    # 3) Volume expansion
    if inputs['volume'] >= 1.2 * inputs['avg_volume_20']:
        score += 15
        confirmations.append('volume_expansion')
    
    # 4) Sector ETF alignment
    if inputs['direction'] == 'call':
        if inputs['sector_price_change'] > 0.3 and inputs['sector_above_ema20']:
            score += 15
            confirmations.append('sector_bullish')
    else:
        if inputs['sector_price_change'] < -0.3 and not inputs['sector_above_ema20']:
            score += 15
            confirmations.append('sector_bearish')
    
    # 5) IV rank - bonus if we're not in clown-world extremes
    if inputs['direction'] == 'call':
        if 20 <= inputs['iv_rank'] <= 60:
            score += 10
            confirmations.append('iv_ok_for_calls')
    else:
        if 30 <= inputs['iv_rank'] <= 70:
            score += 10
            confirmations.append('iv_ok_for_puts')
    
    # 6) Event risk penalties
    if inputs['has_near_earnings']:
        score -= 20
        confirmations.append('penalty_earnings_nearby')
    if inputs['has_major_macro_event']:
        score -= 10
        confirmations.append('penalty_macro_event')
    
    # Clamp 0-100
    score = max(0.0, min(100.0, score))
    
    return ConfidenceResult(confidence=score, confirmations=confirmations)
