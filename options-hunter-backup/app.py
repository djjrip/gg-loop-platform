import streamlit as st
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime, timedelta
import requests
import os

# --- Configuration ---
st.set_page_config(page_title="Options Hunter Pro", layout="wide", page_icon="🎯")

# --- Constants ---
DEFAULT_TICKERS = [
    "SPY", "QQQ", "IWM", "AAPL", "MSFT", "TSLA", "NVDA", "AMD", "AMZN", "GOOGL",
    "META", "NFLX", "BA", "DIS", "JPM", "GS", "COIN", "MARA", "PLTR", "SOFI",
    "UBER", "ABNB", "RIVN", "LCID", "NIO", "BABA", "TGT", "WMT", "COST", "HD",
    "ROKU", "SQ", "PYPL", "V", "MA", "SHOP"
]

# --- Helper Functions ---
def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

@st.cache_data(ttl=300)
def get_stock_data(tickers, period="6mo", interval="1d"):
    """Fetch stock data and calculate technical indicators"""
    data = {}
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    for i, ticker in enumerate(tickers):
        status_text.text(f"Fetching {ticker}... ({i+1}/{len(tickers)})")
        try:
            df = yf.download(ticker, period=period, interval=interval, progress=False)
            if not df.empty and len(df) >= 15:
                # Calculate RSI (14-period)
                delta = df['Close'].diff()
                gain = (delta.where(delta > 0, 0)).ewm(alpha=1/14, adjust=False).mean()
                loss = (-delta.where(delta < 0, 0)).ewm(alpha=1/14, adjust=False).mean()
                rs = gain / loss
                df['RSI'] = 100 - (100 / (1 + rs))
                
                # SMA crossovers
                df['SMA_20'] = df['Close'].rolling(window=20).mean()
                df['SMA_50'] = df['Close'].rolling(window=50).mean()
                # Volume analysis
                df['Volume_Avg'] = df['Volume'].rolling(window=20).mean()
                
                # Only store if we have valid RSI data
                if not df['RSI'].isna().all():
                    data[ticker] = df
        except Exception as e:
            st.warning(f"⚠️ Error fetching {ticker}: {str(e)}")
        
        progress_bar.progress((i + 1) / len(tickers))
    
    progress_bar.empty()
    status_text.empty()
    return data

def get_next_friday(days_ahead=0):
    """Get next Friday for options expiration"""
    d = datetime.now() + timedelta(days=days_ahead)
    while d.weekday() != 4:  # 4 = Friday
        d += timedelta(days=1)
    return d.strftime('%Y-%m-%d')

def analyze_market(data, min_rsi=30, max_rsi=70):
    """Analyze market for extreme RSI conditions"""
    opportunities = []
    
    for ticker, df in data.items():
        if df.empty or len(df) < 14:
            continue
            
        current_price = df['Close'].iloc[-1]
        current_rsi = df['RSI'].iloc[-1]
        
        if pd.isna(current_rsi):
            continue
        
        # Strategy 1: Oversold (Buy Calls)
        if current_rsi < min_rsi:
            confidence = "🟢 HIGH" if current_rsi < 25 else "🟡 MEDIUM"
            opportunities.append({
                "Ticker": ticker,
                "Price": f"${current_price:.2f}",
                "Action": "📈 BUY CALL",
                "RSI": f"{current_rsi:.1f}",
                "Signal": "Oversold - Bounce Expected",
                "Confidence": confidence,
                "RSI_Value": current_rsi  # For sorting
            })
            
        # Strategy 2: Overbought (Buy Puts)
        elif current_rsi > max_rsi:
            confidence = "🔴 HIGH" if current_rsi > 75 else "🟡 MEDIUM"
            opportunities.append({
                "Ticker": ticker,
                "Price": f"${current_price:.2f}",
                "Action": "📉 BUY PUT",
                "RSI": f"{current_rsi:.1f}",
                "Signal": "Overbought - Pullback Expected",
                "Confidence": confidence,
                "RSI_Value": current_rsi
            })

    df_result = pd.DataFrame(opportunities)
    
    # Sort by extremeness (distance from 50)
    if not df_result.empty:
        df_result['Extremeness'] = df_result['RSI_Value'].apply(lambda x: abs(x - 50))
        df_result = df_result.sort_values('Extremeness', ascending=False)
        df_result = df_result.drop(['RSI_Value', 'Extremeness'], axis=1)
    
    return df_result

# --- UI Layout ---
st.title("🎯 Options Hunter Pro - Market Scanner")
st.markdown("**Find extreme RSI setups for high-probability options trades**")

# Sidebar
with st.sidebar:
    st.header("⚙️ Scanner Settings")
    
    st.subheader("Tickers")
    use_default = st.checkbox("Use Default Liquid Stocks", value=True)
    
    if use_default:
        selected_tickers = DEFAULT_TICKERS
        st.info(f"📊 Scanning {len(selected_tickers)} liquid stocks/ETFs")
    else:
        ticker_input = st.text_area(
            "Custom Tickers (comma separated)", 
            "AAPL, TSLA, NVDA", 
            height=100
        )
        selected_tickers = [t.strip().upper() for t in ticker_input.split(",") if t.strip()]
    
    st.markdown("---")
    st.subheader("RSI Thresholds")
    
    col1, col2 = st.columns(2)
    with col1:
        min_rsi = st.number_input("Oversold (<)", value=30, min_value=10, max_value=40)
    with col2:
        max_rsi = st.number_input("Overbought (>)", value=70, min_value=60, max_value=90)
    
    st.markdown("---")
    st.subheader("💡 Strategy Guide")
    st.info("""
**RSI < 30 (Oversold)**
- Stock beaten down
- Look for bounce
- **Action**: Buy CALL options

**RSI > 70 (Overbought)**  
- Stock overheated
- Look for pullback
- **Action**: Buy PUT options
    """)
    
    st.markdown("---")
    st.caption("⚠️ **Risk Warning**: Options trading involves significant risk. You can lose 100% of your investment.")

# Main content
if st.button("🚀 Scan Market Now", type="primary", use_container_width=True):
    with st.spinner("🔍 Hunting for extreme setups..."):
        # Fetch data
        data = get_stock_data(selected_tickers)
        
        if not data:
            st.error("❌ No data retrieved. Check your internet connection or ticker symbols.")
        else:
            # Analyze
            results = analyze_market(data, min_rsi=min_rsi, max_rsi=max_rsi)
            
            if not results.empty:
                st.success(f"✅ Found **{len(results)}** potential trades!")
                
                # Display results table
                st.dataframe(
                    results,
                    use_container_width=True,
                    hide_index=True,
                    column_config={
                        "Ticker": st.column_config.TextColumn("Ticker", width="small"),
                        "Price": st.column_config.TextColumn("Price", width="small"),
                        "Action": st.column_config.TextColumn("Action", width="medium"),
                        "RSI": st.column_config.TextColumn("RSI", width="small"),
                        "Signal": st.column_config.TextColumn("Signal", width="large"),
                        "Confidence": st.column_config.TextColumn("Confidence", width="small")
                    }
                )
                
                # Detailed analysis section
                st.markdown("---")
                st.subheader("📊 Detailed Chart Analysis")
                
                selected_ticker = st.selectbox(
                    "Select ticker to view chart:", 
                    results['Ticker'].unique()
                )
                
                if selected_ticker and selected_ticker in data:
                    df = data[selected_ticker]
                    
                    # Price chart
                    fig = go.Figure()
                    fig.add_trace(go.Candlestick(
                        x=df.index,
                        open=df['Open'],
                        high=df['High'],
                        low=df['Low'],
                        close=df['Close'],
                        name=selected_ticker
                    ))
                    
                    # Add SMAs
                    if 'SMA_20' in df.columns:
                        fig.add_trace(go.Scatter(
                            x=df.index, 
                            y=df['SMA_20'], 
                            name='SMA 20',
                            line=dict(color='orange', width=1)
                        ))
                    if 'SMA_50' in df.columns:
                        fig.add_trace(go.Scatter(
                            x=df.index, 
                            y=df['SMA_50'], 
                            name='SMA 50',
                            line=dict(color='blue', width=1)
                        ))
                    
                    fig.update_layout(
                        title=f"{selected_ticker} Price Action",
                        xaxis_rangeslider_visible=False,
                        height=500
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # RSI subplot
                    fig_rsi = go.Figure()
                    fig_rsi.add_trace(go.Scatter(
                        x=df.index,
                        y=df['RSI'],
                        name='RSI',
                        line=dict(color='purple', width=2)
                    ))
                    fig_rsi.add_hline(y=70, line_dash="dash", line_color="red", annotation_text="Overbought")
                    fig_rsi.add_hline(y=30, line_dash="dash", line_color="green", annotation_text="Oversold")
                    fig_rsi.update_layout(
                        title="RSI (14)",
                        yaxis=dict(range=[0, 100]),
                        height=250
                    )
                    st.plotly_chart(fig_rsi, use_container_width=True)
                    
                    # Current stats
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Current Price", f"${df['Close'].iloc[-1]:.2f}")
                    with col2:
                        st.metric("RSI (14)", f"{df['RSI'].iloc[-1]:.1f}")
                    with col3:
                        change = ((df['Close'].iloc[-1] - df['Close'].iloc[-5]) / df['Close'].iloc[-5]) * 100
                        st.metric("5-Day Change", f"{change:+.2f}%")
                    
                    # Options suggestion
                    st.markdown("---")
                    st.subheader("💡 Options Trade Idea")
                    
                    current_price = df['Close'].iloc[-1]
                    current_rsi = df['RSI'].iloc[-1]
                    expiration = get_next_friday(7)
                    
                    if current_rsi < min_rsi:
                        strike = round(current_price * 1.02, 2)
                        st.success(f"""
**🟢 CALL Option Setup**
- **Ticker**: {selected_ticker}
- **Current Price**: ${current_price:.2f}
- **RSI**: {current_rsi:.1f} (Oversold)
- **Suggested Strike**: ${strike} (slightly OTM)
- **Expiration**: {expiration} (next Friday)
- **Thesis**: Stock is oversold and due for a bounce

**⚠️ In Robinhood:**
1. Search for {selected_ticker}
2. Tap "Trade" → "Trade Options"
3. Select "CALL"
4. Choose expiration close to {expiration}
5. Select strike near ${strike}
6. Verify the premium cost fits your budget
7. Use LIMIT order
                        """)
                    elif current_rsi > max_rsi:
                        strike = round(current_price * 0.98, 2)
                        st.error(f"""
**🔴 PUT Option Setup**
- **Ticker**: {selected_ticker}
- **Current Price**: ${current_price:.2f}
- **RSI**: {current_rsi:.1f} (Overbought)
- **Suggested Strike**: ${strike} (slightly OTM)
- **Expiration**: {expiration} (next Friday)
- **Thesis**: Stock is overbought and due for a pullback

**⚠️ In Robinhood:**
1. Search for {selected_ticker}
2. Tap "Trade" → "Trade Options"
3. Select "PUT"
4. Choose expiration close to {expiration}
5. Select strike near ${strike}
6. Verify the premium cost fits your budget
7. Use LIMIT order
                        """)
                
            else:
                st.warning(f"""
### 📊 No Extreme Setups Found

The market is currently neutral. All scanned stocks have RSI between {min_rsi} and {max_rsi}.

**What to do:**
- Wait for more extreme conditions
- Adjust RSI thresholds in sidebar
- Try again later when market is more volatile
                """)

else:
    # Landing page
    st.markdown("""
### 👋 Welcome to Options Hunter Pro

This tool helps you find **high-probability options trades** based on RSI (Relative Strength Index).

#### 🎯 How It Works:
1. **Click "Scan Market Now"** to analyze 30+ liquid stocks
2. **Find extreme RSI setups**:
   - RSI < 30 = Oversold → Buy CALL options
   - RSI > 70 = Overbought → Buy PUT options
3. **Get detailed charts and trade ideas** for each opportunity

#### ⚙️ Customize Your Scan:
- Adjust RSI thresholds in the sidebar
- Add custom tickers
- View detailed technical analysis

---

**Ready?** Click the button above to start hunting! 🚀
    """)
    
    st.info("💡 **Tip**: Options trading requires understanding risk. Only trade with money you can afford to lose.")

st.markdown("---")
st.caption("Built with Streamlit • Data from Yahoo Finance • Not financial advice")
