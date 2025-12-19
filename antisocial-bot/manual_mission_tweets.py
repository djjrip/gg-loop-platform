
import tweepy
import time
import sys

# Credentials from temp_hunter_2/EMPIRE-MEMORY.md
API_KEY = "gQaG7RAfWo0HlsM7qrxO2xdaE"
API_SECRET = "8OOXeH2G5MtV9JIWuZz7N3xLbsJQ3CiRBM5uDpGUwInHNTiXjx"
ACCESS_TOKEN = "1861611995009908736-R2nvW3Sop5wjb7b3fxqtWjhjF5SOnJ"
ACCESS_SECRET = "D87VfkF86NZXqQpTKXe2mGd7w8aF3KjHaFGzCdK8cPPq6"

# The 3 Specific Mission Tweets
TWEETS = [
    "Direction: We are building the identity layer for competitive gaming. No aggressive monetization, no promised riches. Just a loop: Play -> Verify -> Earn. V1 is live. #ggloop",
    "Founder update: Personal site is live. Theme is locked. Now focusing 100% on the loop mechanics. Transparency is the only marketing strategy we need.",
    "Trust Score V1 is live. It penalizes smurfs and rewards consistency. If you verify your Riot ID and play on Desktop, you’re already earning. Check your dashboard."
]

def post_mission_tweets():
    print("🐦 Initializing Mission 2 Tweet Sequence...")
    
    try:
        client = tweepy.Client(
            consumer_key=API_KEY,
            consumer_secret=API_SECRET,
            access_token=ACCESS_TOKEN,
            access_token_secret=ACCESS_SECRET
        )
        
        # Verify credentials by getting me
        me = client.get_me()
        print(f"✅ Authenticated as: @{me.data.username}")
        
    except Exception as e:
        print(f"❌ Authentication Failed: {e}")
        sys.exit(1)

    for i, text in enumerate(TWEETS, 1):
        print(f"\n[{i}/3] Posting: {text[:50]}...")
        try:
            response = client.create_tweet(text=text)
            print(f"   ✅ Posted! ID: {response.data['id']}")
            
            if i < len(TWEETS):
                print("   ⏳ Waiting 60 seconds...")
                time.sleep(60)
                
        except Exception as e:
            print(f"   ❌ Failed to post tweet {i}: {e}")
            # Continue to next tweet even if one fails? Maybe stop?
            # Let's stop to be safe.
            sys.exit(1)

    print("\n✅ Mission 2 Complete: All tweets posted.")

if __name__ == "__main__":
    post_mission_tweets()
