#!/usr/bin/env python3
"""
REDDIT AUTO-POSTER for GG Loop
Uses official PRAW library - WORKS WITHOUT BOT DETECTION
"""

import os
import json
import praw
from datetime import datetime

# Reddit API credentials (add to GitHub Secrets)
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USERNAME = os.getenv('REDDIT_USERNAME')
REDDIT_PASSWORD = os.getenv('REDDIT_PASSWORD')

def post_to_reddit():
    """Post to Reddit using official PRAW"""
    
    if not all([REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD]):
        print("❌ Reddit API credentials not set!")
        print("\n📖 HOW TO GET REDDIT API ACCESS:")
        print("1. Go to: https://www.reddit.com/prefs/apps")
        print("2. Click 'create another app'")
        print("3. Select 'script'")
        print("4. Get client ID (under app name) and secret")
        print("5. Add to GitHub Secrets:")
        print("   - REDDIT_CLIENT_ID")
        print("   - REDDIT_CLIENT_SECRET")
        print("   - REDDIT_USERNAME (your username)")
        print("   - REDDIT_PASSWORD (your password)")
        return False
    
    # Load projects
    with open('projects.json', 'r') as f:
        data = json.load(f)
        projects = data['projects']
        ggloop = next(p for p in projects if p['id'] == 'ggloop')
    
    # Load queue
    try:
        with open('reddit-queue.json', 'r') as f:
            queue = json.load(f)
    except:
        queue = {'current_post': 0, 'total_posted': 0, 'posts': []}
    
    # Reddit posts for GG Loop
    posts = [
        {
            'subreddit': 'leagueoflegends',
            'title': 'I built a platform that pays you for ranked wins',
            'body': '''I've been grinding League for 5 years and always thought: "Why isn't my time worth anything?"

So I built GG Loop - a rewards platform where every ranked win = real money.

**How it works:**
1. Connect your Riot account
2. Play ranked (League or Valorant)
3. Earn points automatically per win
4. Redeem for gaming gear, gift cards, or cash

**Pricing:**
- Basic: $5/mo (3K bonus points)
- Pro: $12/mo (10K bonus points)  
- Elite: $25/mo (25K bonus points)

Been testing with friends for 2 months. One guy already got a new mouse just from grinding ranked.

Check it out: **ggloop.io**

Happy to answer any questions!'''
        },
        {
            'subreddit': 'VALORANT',
            'title': 'New platform that pays you for ranked wins - feedback?',
            'body': '''Built a rewards system that tracks your Valorant ranked wins and pays you real money/points.

**The idea:** Your competitive grind should be worth more than just RR.

**How it works:**
- Connect Riot account via official API
- Every ranked win = points
- Redeem for peripherals, skins, gift cards
- Three tiers: $5, $12, or $25/mo (more points at higher tiers)

Been in beta for ~2 months. Would love feedback from the Val community.

Live at: **ggloop.io**

What features would you want to see?'''
        },
        {
            'subreddit': 'esports',
            'title': 'Monetizing competitive gaming beyond streaming - thoughts?',
            'body': '''Most content around "making money gaming" is about streaming/YouTube.

But what if you're good at the game but don't want to stream?

Built **GG Loop** to solve this - a platform that pays you directly for ranked performance in League/Valorant.

**The model:**
- Subscribe ($5-25/mo depending on tier)
- Get bonus points on signup
- Earn more points per ranked win
- Redeem for gear/gift cards

It's not "get rich quick" - it's about making your competitive grind actually rewarding.

Live at: **ggloop.io**

Curious what the esports community thinks about this model?'''
        },
        {
            'subreddit': 'pcgaming',
            'title': 'Turned my League ranked grind into a new mouse [OC]',
            'body': '''Been using this new platform called **GG Loop** that pays you for ranked wins.

Signed up 2 months ago (Pro tier - $12/mo), played my normal ranked games, and just cashed out enough points for a new Razer Viper.

**How it works:**
- Connect Riot account (League/Valorant)
- Play ranked like normal
- Platform tracks wins automatically via Riot API
- Earn points per win
- Redeem for actual gear

Not sponsored - just thought it was cool that my LP grind actually got me something tangible.

Check it out: **ggloop.io**

Anyone else using it?'''
        }
    ]
    
    post_index = queue['current_post'] % len(posts)
    post_data = posts[post_index]
    
    print("\n" + "="*60)
    print("👾 REDDIT AUTO-POSTER")
    print("="*60)
    print(f"📱 Subreddit: r/{post_data['subreddit']}")
    print(f"📝 Post #{queue['total_posted'] + 1}")
    print(f"💬 Title: {post_data['title']}")
    print("="*60 + "\n")
    
    try:
        # Initialize Reddit API
        reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            username=REDDIT_USERNAME,
            password=REDDIT_PASSWORD,
            user_agent='GGLoop Bot v1.0'
        )
        
        # Post to subreddit
        subreddit = reddit.subreddit(post_data['subreddit'])
        submission = subreddit.submit(
            title=post_data['title'],
            selftext=post_data['body']
        )
        
        print(f"✅ Posted to r/{post_data['subreddit']} successfully!")
        print(f"🔗 URL: https://reddit.com{submission.permalink}")
        
        # Update queue
        queue['current_post'] = (post_index + 1) % len(posts)
        queue['total_posted'] += 1
        queue['last_posted'] = datetime.now().isoformat()
        queue['last_url'] = f"https://reddit.com{submission.permalink}"
        
        with open('reddit-queue.json', 'w') as f:
            json.dump(queue, f, indent=2)
        
        # Send notification (if configured)
        try:
            import sys
            sys.path.append('../empire-hub')
            from notifications import send_reddit_post_alert
            send_reddit_post_alert(queue['total_posted'], post_data['subreddit'], post_data['title'])
        except:
            pass
        
        return True
        
    except Exception as e:
        print(f"❌ Error posting to Reddit: {e}")
        return False

if __name__ == '__main__':
    post_to_reddit()
