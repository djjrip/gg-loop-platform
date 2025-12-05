#!/usr/bin/env python3
"""Test confirmation scoring for a single ticker"""

import sys
import pandas as pd
import numpy as np
import yfinance as yf

def calculate_ema(series, period):
    return series.ewm(span=period, adjust=False).mean()

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def get_technical_indicators(ticker):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="60d", interval="1d")
        
        if hist.empty or len(hist) < 20:
            return None
        
        close = hist['Close']
        volume = hist['Volume']
        
        ema9 = calculate_ema(close, 9)
        ema20 = calculate_ema(close, 20)
        rsi = calculate_rsi(close, 14)
        
        current_price = float(close.iloc[-1])
        current_ema9 = float(ema9.iloc[-1]) if not pd.isna(ema9.iloc[-1]) else None
        current_ema20 = float(ema20.iloc[-1]) if not pd.isna(ema20.iloc[-1]) else None
        current_rsi = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else None
        current_volume = float(volume.iloc[-1])
        
        # RSI slope
        if len(rsi) >= 3:
            rsi_slope = float(rsi.iloc[-1] - rsi.iloc[-3])
        else:
            rsi_slope = 0.0
        
        avg_volume_20 = float(volume.tail(20).mean())
        
        if len(close) >= 2:
            price_change_pct = float((close.iloc[-1] - close.iloc[-2]) / close.iloc[-2] * 100)
        else:
            price_change_pct = 0.0
        
        return {
            'price': current_price,
            'ema9': current_ema9,
            'ema20': current_ema20,
            'rsi': current_rsi,
            'rsi_slope': rsi_slope,
            'volume': current_volume,
            'avg_volume_20': avg_volume_20,
            'price_change_pct': price_change_pct
        }
    except Exception as e:
        print(f"Error: {e}")
        return None

def compute_confirmation_score(indicators, option_type):
    """Compute confirmation score for CALL or PUT"""
    
    SCORE_TREND = 25  # Increased from 20
    SCORE_RSI = 20    # Increased from 15
    SCORE_VOLUME = 15 # BONUS (not required)
    
    score = 0
    confirmations = []
    
    price = indicators['price']
    ema9 = indicators['ema9']
    ema20 = indicators['ema20']
    rsi = indicators['rsi']
    rsi_slope = indicators['rsi_slope']
    volume = indicators['volume']
    avg_volume_20 = indicators['avg_volume_20']
    price_change_pct = indicators['price_change_pct']
    
    # RULE 1: Trend
    if ema9 and ema20:
        if option_type == 'CALL':
            if price > ema9 and ema9 > ema20:
                score += SCORE_TREND
                confirmations.append('✅ Bullish trend: price > EMA9 > EMA20')
            else:
                confirmations.append(f'❌ Trend: price={price:.2f}, ema9={ema9:.2f}, ema20={ema20:.2f}')
        else:  # PUT
            if price < ema9 and ema9 < ema20:
                score += SCORE_TREND
                confirmations.append('✅ Bearish trend: price < EMA9 < EMA20')
            else:
                confirmations.append(f'❌ Trend: price={price:.2f}, ema9={ema9:.2f}, ema20={ema20:.2f}')
    
    # RULE 2: RSI
    if rsi:
        if option_type == 'CALL':
            if 45 < rsi < 70 and rsi_slope > 0:
                score += SCORE_RSI
                confirmations.append(f'✅ RSI bullish: {rsi:.1f} (rising)')
            else:
                confirmations.append(f'❌ RSI: {rsi:.1f}, slope={rsi_slope:.2f} (need 45-70 rising)')
        else:  # PUT
            if 30 < rsi < 55 and rsi_slope < 0:
                score += SCORE_RSI
                confirmations.append(f'✅ RSI bearish: {rsi:.1f} (falling)')
            else:
                confirmations.append(f'❌ RSI: {rsi:.1f}, slope={rsi_slope:.2f} (need 30-55 falling)')
    
    # RULE 3: Volume
    if volume and avg_volume_20 and avg_volume_20 > 0:
        vol_ratio = volume / avg_volume_20
        if volume >= 1.2 * avg_volume_20:
            if option_type == 'CALL' and price_change_pct > 0:
                score += SCORE_VOLUME
                confirmations.append(f'✅ Volume expansion: {vol_ratio:.2f}x on up day')
            elif option_type == 'PUT' and price_change_pct < 0:
                score += SCORE_VOLUME
                confirmations.append(f'✅ Volume expansion: {vol_ratio:.2f}x on down day')
            else:
                confirmations.append(f'❌ Volume high ({vol_ratio:.2f}x) but wrong direction ({price_change_pct:+.2f}%)')
        else:
            confirmations.append(f'❌ Volume: {vol_ratio:.2f}x (need 1.2x)')
    
    return score, confirmations

if __name__ == '__main__':
    ticker = sys.argv[1] if len(sys.argv) > 1 else 'F'
    
    print(f"\n🔍 Testing Confirmation Scoring for {ticker}\n")
    
    indicators = get_technical_indicators(ticker)
    if not indicators:
        print(f"❌ Could not fetch indicators for {ticker}")
        sys.exit(1)
    
    print(f"📊 Technical Indicators:")
    print(f"  Price: ${indicators['price']:.2f}")
    print(f"  EMA9: ${indicators['ema9']:.2f}" if indicators['ema9'] else "  EMA9: N/A")
    print(f"  EMA20: ${indicators['ema20']:.2f}" if indicators['ema20'] else "  EMA20: N/A")
    print(f"  RSI: {indicators['rsi']:.1f}" if indicators['rsi'] else "  RSI: N/A")
    print(f"  RSI Slope: {indicators['rsi_slope']:+.2f}")
    print(f"  Volume: {indicators['volume']:,.0f} vs avg {indicators['avg_volume_20']:,.0f} = {indicators['volume']/indicators['avg_volume_20']:.2f}x")
    print(f"  Price Change: {indicators['price_change_pct']:+.2f}%")
    
    # Test CALL scoring
    print(f"\n📈 CALL Scoring:")
    call_score, call_confirms = compute_confirmation_score(indicators, 'CALL')
    for conf in call_confirms:
        print(f"  {conf}")
    print(f"  TOTAL: {call_score} points")
    
    # Test PUT scoring
    print(f"\n📉 PUT Scoring:")
    put_score, put_confirms = compute_confirmation_score(indicators, 'PUT')
    for conf in put_confirms:
        print(f"  {conf}")
    print(f"  TOTAL: {put_score} points")
    
    print(f"\n💡 Minimum threshold: 40 points (lowered from 55)")
    print(f"   CALL passes: {'YES ✅' if call_score >= 40 else 'NO ❌'}")
    print(f"   PUT passes: {'YES ✅' if put_score >= 40 else 'NO ❌'}")
