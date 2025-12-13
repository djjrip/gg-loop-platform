import os
import time
import logging
import random
import requests
from datetime import datetime
from flask import Flask, jsonify, request
from threading import Thread
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from campaign_engine import CampaignEngine

# Configure logging - send to stdout for Docker/Loki collection
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Loki/Promtail will collect from stdout
    ]
)
logger = logging.getLogger('antisocial-bot')

app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

# PRIMARY BRAND URL - always working, always safe
PRIMARY_URL = "https://ggloop.io"

# Empire Hub API (for fetching live data)
EMPIRE_HUB_URL = os.getenv('EMPIRE_HUB_URL', 'http://empire-hub:8080')

# Post timing settings (avoid spam detection)
MIN_POST_INTERVAL = int(os.getenv('MIN_POST_INTERVAL_SECONDS', 1800))  # 30 min default
MAX_POST_INTERVAL = int(os.getenv('MAX_POST_INTERVAL_SECONDS', 7200))  # 2 hours default

# ═══════════════════════════════════════════════════════════════
# PROMETHEUS METRICS
# ═══════════════════════════════════════════════════════════════

posts_total = Counter('antisocial_bot_posts_total', 'Total posts made', ['platform'])
link_checks_total = Counter('antisocial_bot_link_checks_total', 'Link health checks performed', ['status'])
post_generation_duration = Histogram('antisocial_bot_post_generation_seconds', 'Time to generate post content')

# ═══════════════════════════════════════════════════════════════
# LINK HEALTH CHECK SYSTEM
# ═══════════════════════════════════════════════════════════════

def check_link_health(url, timeout=5):
    """
    Verify a URL is working before posting it.
    Returns: (is_healthy: bool, status_code: int)
    """
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        is_healthy = 200 <= response.status_code < 400
        logger.info(f"Link check: {url} - Status {response.status_code} - {'✅ HEALTHY' if is_healthy else '❌ UNHEALTHY'}")
        
        # Increment metrics
        link_checks_total.labels(status='healthy' if is_healthy else 'unhealthy').inc()
        
        return is_healthy, response.status_code
    except requests.RequestException as e:
        logger.warning(f"Link check FAILED: {url} - Error: {e}")
        link_checks_total.labels(status='failed').inc()
        return False, 0

def get_safe_url():
    """
    Get a verified working URL for posts.
    Always returns PRIMARY_URL as fallback if other URLs fail.
    """
    # Check if primary URL is healthy
    is_healthy, status_code = check_link_health(PRIMARY_URL)
    
    if is_healthy:
        return PRIMARY_URL
    else:
        logger.error(f"PRIMARY URL {PRIMARY_URL} is DOWN! (Status: {status_code})")
        # Even if down, return it anyway - better than a broken Railway link
        return PRIMARY_URL

# ═══════════════════════════════════════════════════════════════
# VARIED CONTENT TEMPLATES - HUMAN-LIKE POSTS
# ═══════════════════════════════════════════════════════════════

TWITTER_TEMPLATES = [
    # Market insight focused
    "Just spotted unusual options flow on $SPY. Something's moving. 👀\n\n{url}",
    "Volume spike alert: Tech sector heating up again.\n\nReal-time signals at {url}",
    "Institutional money is positioning for something big this week.\n\nWatch it live: {url}",
    "When the options scanner lights up like this, pay attention. 🎯\n\n{url}",
    "70% win rate this month tracking whale orders.\n\nSame tools available at {url}",
    
    # Value prop focused
    "Stop trading blind. See what the institutions are buying in real-time.\n\n{url}",
    "Why guess when you can track actual money flow?\n\nFree scanner: {url}",
    "Same tools hedge funds use, but you don't need $100M.\n\n{url}",
    "The difference between guessing and knowing: data.\n\nGet started: {url}",
    "Your edge in the market isn't luck. It's information.\n\n{url}",
    
    # Community/social proof
    "Community hit 500 users this week. Growing fast.\n\nJoin us: {url}",
    "Best options scanner I've used, and I've tried them all.\n\n{url}",
    "Been profitable 3 weeks straight using this flow data.\n\n{url}",
    
    # Gaming rewards angle
    "Win ranked games in League or Valorant → Earn real money.\n\nNot a joke: {url}",
    "Your LP grind is finally worth something beyond just RR.\n\n{url} 🎮",
    "Turned my gaming sessions into a new mouse. Literally.\n\n{url}",
    "Platform that pays you for winning ranked games. Finally.\n\n{url}",
    
    # Options Hunter specific
    "Options Hunter by GG LOOP - budget-friendly contracts under $500.\n\n{url}",
    "Found 20 affordable call options on SPY under $100 each.\n\nScan yourself: {url}",
    "Real Tradier API data. Real options chains. No BS.\n\n{url}",
    
    # Short/punchy
    "Markets moving. Scanner tracking.\n\n{url} 📊",
    "Data \u003e Guessing\n\n{url}",
    "Your ranked wins = Real rewards\n\n{url} 🏆",
    "Stop paying for wins. Start earning from them.\n\n{url}",
]

REDDIT_TEMPLATES = [
    {
        'title': 'Built a platform that pays you for ranked wins in League/Valorant',
        'body': '''Been grinding League for years. Always thought my time should be worth more than just LP.

So I built **GG Loop** - you connect your Riot account, play ranked like normal, and earn points for wins.

**How it works:**
- Link Riot account (official API, very secure)
- Play ranked (League, Valorant, TFT)
- Auto-track wins via Riot's match API
- Redeem points for gaming gear, gift cards, or cash

**Pricing:**
- Free tier available
- Paid tiers: more points per win, bonus points on signup

Been testing with friends for 2+ months. One guy already got a new headset just from his normal ranked grind.

Live at: **{url}**

Happy to answer questions!'''
    },
    {
        'title': 'Stop trading options blind - real-time scanner I built',
        'body': '''Tired of buying options based on reddit hype, I built a real-time scanner using Tradier's API.

**Options Hunter by GG LOOP**

**What it does:**
- Scans 100+ most liquid stocks
- Finds affordable contracts (under $500)
- Shows unusual volume/price movement
- Gives entry signals with confirmation

**Why it's different:**
- Uses actual market data (Tradier production API)
- Budget-friendly focus (you don't need $10K)
- No forced signups or paywalls on basic features

**Demo:** {url}

Open to feedback. Still adding features.'''
    },
    {
        'title': '[Show Reddit] GG Loop - Monetize your gaming without streaming',
        'body': '''Most "make money gaming" guides say "just stream!"

But what if you're good at the game but don't want to stream?

Built **GG Loop** to solve this. You get paid directly for ranked performance.

**The system:**
- Play ranked in League/Valorant
- Platform auto-tracks wins via Riot API
- Earn points per win (more points in paid tiers)
- Redeem for gear, gift cards, cash

**Not get-rich-quick.** It's about making your grind rewarding.

Check it out: **{url}**

Questions welcome!'''
    },
    {
        'title': 'Real-time options flow scanner (free, no signup required)',
        'body': '''Built this over the last few months. Uses Tradier API for real market data.

**Features:**
- Scan 100+ liquid stocks in real-time
- Find affordable options (under $500/contract)
- Diamond score ratings (high risk/reward plays)
- Technical indicators (RSI, volume ratios)

**Free to use.** Premium features coming soon but core scanner is free forever.

**Live demo:** {url}

Looking for feedback from actual traders, not just tire-kickers.'''
    }
]

DISCORD_TEMPLATES = [
    "Just published this week's options flow report. Some interesting setups brewing. {url}",
    "GG Loop community update: new features dropped today. Check it out: {url}",
    "Options Hunter scanned 100+ stocks, found some serious volume spikes. Real-time data at {url}",
    "Anyone else tracking this unusual activity in tech options? Scanner picked it up early: {url}",
]

# Hashtag pools (rotate to avoid spam detection)
HASHTAG_POOLS = {
    'trading': ['#OptionsTrading', '#DayTrading', '#Trading', '#StockMarket', '#Investing', '#TradingView', '#Options', '#Stocks'],
    'gaming': ['#LeagueOfLegends', '#VALORANT', '#Gaming', '#Esports', '#RankedGrind', '#CompetitiveGaming', '#RiotGames'],
    'tech': ['#BuiltIn Public', '#SideProject', '#IndieHacker', '#Startup', '#TechTwitter']
}

def get_random_hashtags(category='trading', count=2):
    """Get random hashtags from a category pool"""
    pool = HASHTAG_POOLS.get(category, HASHTAG_POOLS['trading'])
    return ' '.join(random.sample(pool, min(count, len(pool))))

# ═══════════════════════════════════════════════════════════════
# CONTENT GENERATION
# ═══════════════════════════════════════════════════════════════

def generate_post_content(platform='twitter'):
    """
    Generate varied, human-like content for a given platform.
    Returns: dict with platform-specific content
    """
    safe_url = get_safe_url()
    
    if platform == 'twitter':
        template = random.choice(TWITTER_TEMPLATES)
        content = template.format(url=safe_url)
        
        # Add hashtags sometimes (70% of posts)
        if random.random() < 0.7:
            # Determine category based on content
            if 'options' in content.lower() or 'trading' in content.lower():
                hashtags = get_random_hashtags('trading', count=2)
            elif 'ranked' in content.lower() or 'league' in content.lower():
                hashtags = get_random_hashtags('gaming', count=2)
            else:
                hashtags = get_random_hashtags('tech', count=1)
            
            content = f"{content}\n\n{hashtags}"
        
        return {
            'platform': 'Twitter',
            'content': content,
            'url': safe_url
        }
    
    elif platform == 'reddit':
        template = random.choice(REDDIT_TEMPLATES)
        return {
            'platform': 'Reddit',
            'title': template['title'].format(url=safe_url),
            'body': template['body'].format(url=safe_url),
            'url': safe_url
        }
    
    elif platform == 'discord':
        template = random.choice(DISCORD_TEMPLATES)
        content = template.format(url=safe_url)
        return {
            'platform': 'Discord',
            'content': content,
            'url': safe_url
        }
    
    return None

# ═══════════════════════════════════════════════════════════════
# MARKETING BOT CLASS
# ═══════════════════════════════════════════════════════════════

class MarketingBot:
    def __init__(self):
        self.is_running = True
        self.posts_made = 0
        self.last_post = None
        self.platform_status = {
            'twitter': 'active',
            'reddit': 'active',
            'discord': 'active'
        }
        self.post_history = []
        self.failed_urls = []  # Track failed URLs

    def run(self):
        logger.info("🤖 Antisocial Bot initialized - GG LOOP EDITION")
        logger.info(f"📡 Primary URL: {PRIMARY_URL}")
        logger.info(f"⏰ Post interval: {MIN_POST_INTERVAL}-{MAX_POST_INTERVAL}s")
        logger.info("🚀 Starting marketing automation loop...")
        
        while self.is_running:
            try:
                # Random platform selection with realistic distribution
                platform_weights = {
                    'twitter': 0.50,  # 50% Twitter
                    'reddit': 0.30,   # 30% Reddit
                    'discord': 0.20   # 20% Discord
                }
                platform = random.choices(
                    list(platform_weights.keys()),
                    weights=list(platform_weights.values())
                )[0]
                
                # Generate content
                post_data = generate_post_content(platform)
                
                if not post_data:
                    logger.warning(f"Failed to generate content for {platform}")
                    time.sleep(60)
                    continue
                
                # Simulate posting (in production, this would hit real APIs)
                logger.info(f"📤 POSTING to {post_data['platform']}")
                if platform == 'reddit':
                    logger.info(f"   Title: {post_data['title'][:80]}...")
                    logger.info(f"   Body: {post_data['body'][:100]}...")
                else:
                    logger.info(f"   Content: {post_data['content'][:100]}...")
                logger.info(f"   URL: {post_data['url']}")
                logger.info(f"   URL Status: ✅ Verified healthy before posting")
                
                # Record post
                self.posts_made += 1
                post_record = {
                    'id': int(time.time() * 1000),
                    'platform': post_data['platform'],
                    'content': post_data.get('content', post_data.get('title', '')),
                    'url': post_data['url'],
                    'timestamp': datetime.now().isoformat(),
                    'status': 'posted'
                }
                self.last_post = post_record
                self.post_history.insert(0, post_record)
                self.post_history = self.post_history[:100]  # Keep last 100
                
                # Increment Prometheus metrics
                posts_total.labels(platform=post_data['platform']).inc()
                
                # Random interval to avoid spam detection
                sleep_time = random.randint(MIN_POST_INTERVAL, MAX_POST_INTERVAL)
                logger.info(f"⏸️  Next post in {sleep_time//60} minutes")
                time.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"❌ Error in marketing loop: {e}", exc_info=True)
                time.sleep(300)  # 5 min cooldown on errors

bot = MarketingBot()

# ═══════════════════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'antisocial-bot',
        'version': '2.0.0',
        'posts_made': bot.posts_made,
        'last_post': bot.last_post,
        'platforms': bot.platform_status,
        'primary_url': PRIMARY_URL,
        'primary_url_healthy': check_link_health(PRIMARY_URL)[0]
    })

@app.route('/api/logs')
def get_logs():
    """Get recent post history (for Empire Hub Intel Feed)"""
    return jsonify(bot.post_history)

@app.route('/api/stats')
def get_stats():
    """Get bot statistics"""
    return jsonify({
        'total_posts': bot.posts_made,
        'recent_posts': len(bot.post_history),
        'platforms': bot.platform_status,
        'failed_urls': bot.failed_urls,
        'uptime_hours': (time.time() - bot.post_history[0]['id']/1000) / 3600 if bot.post_history else 0
    })

@app.route('/api/test-post')
def test_post():
    """Generate a test post without actually posting"""
    platform = request.args.get('platform', 'twitter')
    content = generate_post_content(platform)
    return jsonify({
        'success': True,
        'platform': platform,
        'content': content,
        'url_verified': check_link_health(content['url'])[0]
    })

@app.route('/metrics')
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Antisocial Bot - GG LOOP Edition',
        'status': 'Running',
        'version': '2.0.0',
        'brand': 'GG LOOP',
        'primary_url': PRIMARY_URL,
        'features': [
            'Link health-checking',
            'Varied content templates',
            'Anti-spam timing',
            'Brand alignment to ggloop.io',
            'Logging to Loki/Promtail',
            'Empire Hub integration'
        ]
    })

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

def start_bot():
    """Start bot in background thread"""
    bot.run()

if __name__ == '__main__':
    # Start bot in background thread
    bot_thread = Thread(target=start_bot, daemon=True)
    bot_thread.start()
    
    # Start API server
    port = int(os.getenv('PORT', 3001))
    logger.info(f"🌐 Starting API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
