# 🚀 Options Hunter - Quick Start Guide

## For Complete Beginners

### What You Have
Two powerful tools to find profitable options trades:
1. **HTML App** (`index.html`) - Single page, works in any browser
2. **Streamlit App** (`app.py`) - Python-based with advanced charts

---

## 🎯 Method 1: HTML App (Easiest)

### Step 1: Open the App
```bash
# From your terminal:
cd /workspaces/optionshunter/options-hunter
open index.html

# Or just double-click index.html in your file browser
```

### Step 2: Get Your API Key
1. Go to https://polygon.io/dashboard/signup
2. Sign up (free, no credit card)
3. Copy your API key
4. Paste it in the app and click "Save & Start"

### Step 3: Run Your First Scan
1. **Set Budget**: $500 recommended (minimum $100)
2. **Choose Timeframe**: 30 days is safest
3. Click **"Analyze Market with Real Data"**
4. Wait 2-3 minutes while it scans

### Step 4: Read the Results
You'll see top 3 opportunities ranked by profit potential:
- **Green banner = BUY CALL** (bet stock goes UP)
- **Red banner = BUY PUT** (bet stock goes DOWN)

### Step 5: Execute in Robinhood
Each result shows 10 clear steps:
1. Open Robinhood
2. Search for ticker (e.g., AAPL)
3. Tap "Trade" → "Trade Options"
4. Select CALL or PUT
5. Pick expiration date (shown in app)
6. Pick strike price (shown in app)
7. **VERIFY THE PRICE** - must match what app showed
8. Enter number of contracts
9. Use LIMIT order
10. Confirm and buy

---

## 📊 Method 2: Streamlit App (Advanced)

### Step 1: Start the App
```bash
cd /workspaces/optionshunter/options-hunter
source .venv/bin/activate
streamlit run app.py
```

### Step 2: Use the Interface
- **Left Sidebar**: Adjust settings
  - Choose tickers to scan
  - Set RSI thresholds
  - Enable/disable default stock list

- **Main Area**: 
  - Click "Scan Market Now"
  - View results table
  - Click any ticker for detailed chart

### Step 3: Analyze Charts
- **Candlestick chart**: Shows price movement
- **RSI indicator**: Shows overbought/oversold
- **Current metrics**: Price, RSI, 5-day change
- **Trade idea**: Specific option recommendation

---

## ⚠️ CRITICAL: Before You Trade Real Money

### Test First (Paper Trading)
1. Run a scan and screenshot the recommendations
2. **DO NOT BUY** the options yet
3. Check back in 1 week - would they have been profitable?
4. Track 5-10 recommendations to validate accuracy
5. Only use real money once you trust the system

### Budget Guidelines
- **$100-200**: Can buy 1-2 contracts of cheap options
- **$500**: Recommended starting point (diversify 2-3 trades)
- **$1000+**: Can take multiple positions

### Risk Management
- **Never risk more than 5% of your portfolio on one trade**
- Options can expire worthless (100% loss)
- Only trade with money you can afford to lose
- Use LIMIT orders, not market orders
- Set stop-loss at 50% (exit if down 50%)

---

## 🔧 Troubleshooting

### "No historical data" Error
**Problem**: Polygon API key issue
**Fix**: 
```javascript
// Open browser console (F12)
localStorage.clear()  // Clear old keys
// Refresh page and re-enter key
```

### Prices Don't Match Robinhood
**Problem**: Market moves fast, quotes may be delayed
**Fix**: 
- Always verify price in Robinhood before buying
- Use LIMIT orders at mid-price or better
- Don't chase - if price moved too much, skip the trade

### "Budget too low" Error
**Problem**: Options cost more than your budget
**Fix**:
- Increase budget to $200-500
- Or choose longer expiration (cheaper premiums)
- Or wait for cheaper stocks (< $100/share)

### App is Slow
**Problem**: Free API tier has rate limits (5 calls/min)
**Fix**:
- Wait 60 seconds between scans
- Reduce number of stocks scanned
- Or upgrade to Polygon paid tier ($9/mo)

---

## 📈 Understanding the Strategy

### RSI Explained (Simple)
**RSI = Relative Strength Index**
- Scale: 0 to 100
- **Below 30** = Stock oversold (beaten down) → Likely to bounce UP
- **Above 70** = Stock overbought (too hot) → Likely to pull back DOWN
- **30-70** = Neutral (no clear signal)

### Why This Works
1. **Mean reversion**: Prices tend to return to average
2. **Extreme emotions**: When everyone panics (RSI < 30) or gets greedy (RSI > 70), reversal is likely
3. **Historical accuracy**: RSI is one of the most reliable technical indicators

### When It Doesn't Work
- **Trending markets**: Stock in strong uptrend can stay "overbought" for weeks
- **Breaking news**: Fundamental changes override technical signals
- **Low liquidity**: Thinly traded stocks can have false RSI signals

---

## 🎓 Learning Resources

### Before You Trade
- Watch: "Options Trading for Beginners" on YouTube
- Read: Investopedia's options guide
- Practice: Use paper trading for 2-4 weeks

### Recommended Videos
- InTheMoney: Options Basics
- ProjectFinance: RSI Strategy Explained
- Kamikaze Cash: Robinhood Options Tutorial

### Key Terms to Know
- **Strike Price**: Price where option can be exercised
- **Premium**: Cost to buy the option contract
- **Expiration**: Date when option expires worthless if not profitable
- **ITM/OTM**: In-the-money (profitable) vs Out-of-the-money (not profitable yet)
- **Bid/Ask**: Bid = what buyers pay, Ask = what sellers charge

---

## 📞 Getting Help

### If App Isn't Working
1. Check browser console (F12) for errors
2. Verify API key is correct
3. Try clearing cache and restarting
4. Check GitHub issues for known problems

### If You're Losing Money
- **STOP TRADING** immediately
- Review your past trades - what went wrong?
- Was it bad timing? Wrong expiration? Too aggressive?
- Go back to paper trading until you're consistently profitable

---

## 🚀 Next Steps

### Once You're Comfortable
1. **Track your performance**: Use a spreadsheet
2. **Refine the strategy**: Adjust RSI thresholds
3. **Add filters**: Volume, IV, earnings dates
4. **Explore spreads**: Bull/bear call/put spreads
5. **Automate alerts**: Get notified of extreme RSI

### Deployment Options
- **Netlify**: Host HTML app online (free)
- **Streamlit Cloud**: Host Python app online (free)
- **Docker**: Run in container (advanced)
- **Cron job**: Auto-scan every morning

---

**Remember**: This tool gives you an edge, but NO GUARANTEES. Markets are unpredictable. Always do your own research before trading.

*Happy hunting! 🎯*
