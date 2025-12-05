#!/usr/bin/env python3
"""
TWITTER AUTO-POSTER for Options Hunter
Posts market analysis using pre-generated content library
"""

import os
import json
import sys
from pathlib import Path

try:
    import tweepy
except ImportError:
    print("Installing tweepy...")
    os.system("pip install tweepy")
    import tweepy

from datetime import datetime

# Twitter API credentials from GitHub Secrets
TWITTER_API_KEY = os.getenv('TWITTER_API_KEY')
TWITTER_API_SECRET = os.getenv('TWITTER_API_SECRET')
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
TWITTER_ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET')

def get_next_post():
    """Get next post from content library"""
    script_dir = Path(__file__).parent.parent
    content_file = script_dir / 'CONTENT-LIBRARY-180-DAYS.json'
    
    # Load content library
    with open(content_file, 'r') as f:
        content = json.load(f)
    
    # Load/create queue tracker
    queue_file = Path(__file__).parent / 'twitter-queue.json'
    try:
        with open(queue_file, 'r') as f:
            queue = json.load(f)
    except:
        queue = {'current_post': 0, 'total_posted': 0}
    
    # Get current post
    post_index = queue['current_post'] % len(content)
    post = content[post_index]
    
    # Update queue
    queue['current_post'] = post_index + 1
    queue['total_posted'] += 1
    queue['last_posted'] = datetime.now().isoformat()
    
    with open(queue_file, 'w') as f:
        json.dump(queue, f, indent=2)
    
    return post['content']

def post_to_twitter():
    """Post to Twitter using official API"""
    
    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        print("❌ Twitter API credentials not set!")
        sys.exit(1)
    
    # Get tweet content from library
    try:
        tweet_text = get_next_post()
    except Exception as e:
        print(f"❌ Error loading content: {e}")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("🐦 TWITTER AUTO-POSTER")
    print("="*60)
    print(f"📱 Account: @marketscanner_759")
    print(f"💬 Text: {tweet_text[:80]}...")
    print("="*60 + "\n")
    
    try:
        # Initialize Twitter API v2
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=TWITTER_ACCESS_TOKEN,
            access_token_secret=TWITTER_ACCESS_SECRET
        )
        
        # Post tweet
        response = client.create_tweet(text=tweet_text)
        
        print(f"✅ Tweet posted successfully!")
        print(f"🔗 Tweet ID: {response.data['id']}")
        print(f"📊 View: https://twitter.com/user/status/{response.data['id']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error posting to Twitter: {e}")
        sys.exit(1)

if __name__ == '__main__':
    print("🐦 Twitter Auto-Poster Starting...")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    post_to_twitter()
