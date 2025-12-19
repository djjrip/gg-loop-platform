#!/usr/bin/env python3
"""
TWITTER AUTO-POSTER for GG LOOP LLC
Secure, verified content only.
"""

import os
import json
import sys
import random
from pathlib import Path
from datetime import datetime

# ==============================================================================
# GUARDRAILS & CONFIG
# ==============================================================================
APPROVED_DOMAINS = ["ggloop.io", "github.com/jaysonquindao"]
BANNED_TERMS = ["optionshunter", "3890.up.railway.app", "marketscanner", "free scanner"]

TWEET_TEMPLATES = [
    "GG LOOP LLC is building verified gameplay → real rewards. PLAY. EARN. LOOP. https://ggloop.io",
    "We’re building the trust layer for gaming. Verified IDs, real progression, no fluff. https://ggloop.io",
    "Creators + competitors: we’re making gameplay verification worth something. PLAY. EARN. LOOP. https://ggloop.io",
    "Gaming needs trust, not more noise. We are building the infrastructure. https://ggloop.io"
]

def validate_content(text):
    """Ensure content is safe and brand-aligned"""
    text_lower = text.lower()
    for term in BANNED_TERMS:
        if term in text_lower:
            print(f"⛔ SECURITY BLOCK: Attempted to post banned term: {term}")
            return False
    return True

# ==============================================================================
# POSTING LOGIC
# ==============================================================================

try:
    import tweepy
except ImportError:
    print("Installing tweepy...")
    os.system("pip install tweepy")
    import tweepy

# Twitter API credentials from GitHub Secrets / Env Vars
TWITTER_API_KEY = os.getenv('TWITTER_API_KEY')
TWITTER_API_SECRET = os.getenv('TWITTER_API_SECRET')
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
TWITTER_ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET')

def post_to_twitter():
    """Post to Twitter using official API"""
    
    # 1. CREDENTIAL CHECK
    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        print("❌ Twitter API credentials not set! Aborting.")
        # We exit successfully to prevent crash loops, but do nothing.
        sys.exit(0)
    
    # 2. SELECT CONTENT
    tweet_text = random.choice(TWEET_TEMPLATES)
    
    # 3. GUARDRAIL CHECK
    if not validate_content(tweet_text):
        sys.exit(1)

    print("\n" + "="*60)
    print("🐦 GG LOOP AUTO-POSTER")
    print("="*60)
    print(f"💬 Text: {tweet_text}")
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
        
        return True
        
    except Exception as e:
        print(f"❌ Error posting to Twitter: {e}")
        # Exit 0 to avoid container restarts spamming logs
        sys.exit(0)

if __name__ == '__main__':
    print("🐦 GG LOOP Twitter Bot Starting...")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    post_to_twitter()
