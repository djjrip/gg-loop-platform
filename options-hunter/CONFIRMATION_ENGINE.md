# Confirmation Engine - Technical Documentation

## Overview
The confirmation engine scores each options trade using 6 technical signals, returning only high-confidence trades (≥40%) with clear reasoning.

## Scoring System

### Base Signals (Max 60 points without sector/IV)
| Signal | Points | Description |
|--------|--------|-------------|
| **Trend/EMA** | 25 | Price structure relative to 9 & 20 EMAs |
| **RSI** | 20 | Momentum confirmation (45-70 rising for calls, 30-55 falling for puts) |
| **Volume** | 15 | BONUS: Volume ≥1.2x 20-day average on directional move |

### Additional Signals
| Signal | Points | Description |
|--------|--------|-------------|
| **Sector ETF** | 15 | Sector alignment (e.g., XLF for BAC, XLK for tech) |
| **IV Rank** | 10 | Favorable IV context (20-60 for calls, 30-70 for puts) |
| **Event Risk** | -15 | Penalty if expiry within 3 days (likely earnings) |

### Confidence Threshold
- **Minimum**: 40 points (40% confidence)
- **Typical passing scores**: 40-60 (2-3 signals firing)
- **Strong setup**: 70+ (all signals aligned)

## Signal Details

### 1. Trend/EMA Structure (25 points)
**For Calls:**
- ✅ Price > EMA9 > EMA20 (bullish structure)
- ❌ Any other configuration

**For Puts:**
- ✅ Price < EMA9 < EMA20 (bearish structure)
- ❌ Any other configuration

**Example:** AAPL at $278.85, EMA9=$274.25, EMA20=$270.95
- CALL: ✅ 25 points (price > EMA9 > EMA20)
- PUT: ❌ 0 points (wrong structure)

### 2. RSI Momentum (20 points)
**For Calls:**
- ✅ RSI between 45-70 AND rising (slope > 0)
- ❌ RSI outside range or falling

**For Puts:**
- ✅ RSI between 30-55 AND falling (slope < 0)
- ❌ RSI outside range or rising

**Example:** INTC RSI=58.9, slope=+20.51
- CALL: ✅ 20 points (58.9 in range, rising)
- PUT: ❌ 0 points (outside 30-55 range)

### 3. Volume Expansion (15 points - BONUS)
**Requirements:**
- Volume must be ≥1.2x the 20-day average
- Price change must align with direction:
  - CALL: Volume spike on UP day (price change > 0)
  - PUT: Volume spike on DOWN day (price change < 0)

**Example:** INTC volume=95.8M vs avg=78.2M = 1.22x, price +10.19%
- CALL: ✅ 15 points (volume expansion on up day)
- PUT: ❌ 0 points (volume high but wrong direction)

**Note:** Most tickers won't have volume expansion, so this is a bonus, not required to pass 40-point threshold.

### 4. Sector ETF Alignment (15 points)
Checks if the sector ETF supports the directional thesis:

**For Calls:**
- Sector ETF must be:
  - Price change > +0.3% today
  - Trading above 20-day EMA

**For Puts:**
- Sector ETF must be:
  - Price change < -0.3% today
  - Trading below 20-day EMA

**Sector Mappings:**
```python
SECTOR_ETF_MAP = {
    'AAPL': 'XLK',  # Technology
    'MSFT': 'XLK',
    'NVDA': 'XLK',
    'BAC': 'XLF',   # Financials
    'JPM': 'XLF',
    'DIS': 'XLY',   # Consumer Discretionary
    'F': 'XLY',
    # ... etc
}
```

### 5. IV Rank Context (10 points)
Checks if current implied volatility is favorable:

**For Calls:**
- ✅ IV rank between 20-60 (moderate volatility)

**For Puts:**
- ✅ IV rank between 30-70 (slightly higher volatility acceptable)

**Calculation:** 
```
IV Rank = (Current IV - 30-day Low) / (30-day High - 30-day Low) * 100
```

### 6. Event Risk (-15 points penalty)
Applies penalty if:
- Expiration is within 3 calendar days
- Likely an earnings event or major catalyst

**Example:** If today is Dec 1 and expiry is Dec 4:
- -15 points penalty applied
- Tagged as `penalty_earnings_nearby`

## Scoring Examples

### Example 1: INTC Call (60 points - PASSES)
```
Price: $40.56
EMA9: $36.74, EMA20: $36.68
RSI: 58.9, Slope: +20.51
Volume: 95.8M vs avg 78.2M = 1.22x
Price Change: +10.19%

✅ Trend: 25 points (price > EMA9 > EMA20)
✅ RSI: 20 points (58.9 rising)
✅ Volume: 15 points (1.22x on up day)
TOTAL: 60 points ✅ PASSES
```

### Example 2: F Call (25 points - FAILS)
```
Price: $13.28
EMA9: $13.06, EMA20: $12.95
RSI: 51.4, Slope: -2.55
Volume: 29.5M vs avg 67.4M = 0.44x

✅ Trend: 25 points (price > EMA9 > EMA20)
❌ RSI: 0 points (falling, need rising)
❌ Volume: 0 points (only 0.44x)
TOTAL: 25 points ❌ FAILS (need 40)
```

### Example 3: AAPL Call (45 points - PASSES)
```
Price: $278.85
EMA9: $274.25, EMA20: $270.95
RSI: 67.2, Slope: +5.67
Volume: Low (0.42x)

✅ Trend: 25 points (price > EMA9 > EMA20)
✅ RSI: 20 points (67.2 rising)
❌ Volume: 0 points (only 0.42x)
TOTAL: 45 points ✅ PASSES
```

## Tuning Guide

### If Too Few Trades Pass (Threshold Too High):
- Lower `CONFIDENCE_MIN_THRESHOLD` (currently 40)
- Increase individual signal weights
- Relax RSI ranges (e.g., 40-75 for calls)

### If Too Many Low-Quality Trades Pass (Threshold Too Low):
- Raise `CONFIDENCE_MIN_THRESHOLD`
- Add more penalties (e.g., low liquidity penalty)
- Tighten RSI ranges

### Volume Expansion Tuning:
- **Current**: 1.2x average (fairly strict)
- **More lenient**: 1.1x or 1.15x
- **More strict**: 1.3x or 1.5x

### Configuration File Location:
`server-alphavantage.py` lines 87-95:
```python
CONFIDENCE_MIN_THRESHOLD = 40
SCORE_TREND = 25
SCORE_RSI = 20
SCORE_VOLUME = 15
SCORE_SECTOR = 15
SCORE_IV = 10
PENALTY_EARNINGS = -15
```

## Testing

### Test Single Ticker:
```bash
cd /workspaces/optionshunter/options-hunter
python test_confirmations.py TICKER
```

### Example Output:
```
🔍 Testing Confirmation Scoring for INTC

📊 Technical Indicators:
  Price: $40.56
  EMA9: $36.74
  EMA20: $36.68
  RSI: 58.9
  RSI Slope: +20.51
  Volume: 95,799,500 vs avg 78,206,065 = 1.22x
  Price Change: +10.19%

📈 CALL Scoring:
  ✅ Bullish trend: price > EMA9 > EMA20
  ✅ RSI bullish: 58.9 (rising)
  ✅ Volume expansion: 1.22x on up day
  TOTAL: 60 points

💡 Minimum threshold: 40 points
   CALL passes: YES ✅
```

### Test API Endpoint:
```bash
curl "http://localhost:8700/api/auto-recommend?budget=200&expiry=2025-12-05" | jq
```

## Frontend Display

The UI shows:
- **Confidence percentage**: Large number with color gradient
  - 🟢 Green: 60-100%
  - 🟡 Yellow: 50-59%
  - 🔴 Red: 40-49%
- **Confirmations**: Hover over info icon to see which signals fired
- **Market Direction**: 📈 BULLISH or 📉 BEARISH

## Why This Approach?

### Rules-Based vs ML:
- ✅ **Transparent**: Users can see exactly why a trade was recommended
- ✅ **Tunable**: Easy to adjust weights without retraining
- ✅ **Fast**: No model inference, instant scoring
- ✅ **Explainable**: Each signal has clear financial reasoning

### Signal Selection:
- **Trend**: Establishes directional bias (most important)
- **RSI**: Confirms momentum without being overbought/oversold
- **Volume**: Validates conviction (institutional interest)
- **Sector**: Ensures tailwinds at sector level
- **IV**: Prevents overpaying for inflated options
- **Events**: Avoids binary risk (earnings, FOMC, etc.)

## Future Enhancements

1. **Dynamic Thresholds**: Adjust based on VIX (higher threshold in low-vol markets)
2. **Historical Backtesting**: Validate signal effectiveness over 1-2 years
3. **Machine Learning Layer**: Use ML to optimize weights based on win rate
4. **Additional Signals**:
   - MACD crossover
   - Support/resistance levels
   - Options flow (unusual activity)
   - Put/call ratio
5. **Multi-Timeframe Analysis**: Check alignment across daily/weekly charts
