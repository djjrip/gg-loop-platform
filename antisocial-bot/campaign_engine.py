"""
CAMPAIGN ENGINE - Automated Social Media Marketing

Handles:
- Campaign scheduling (randomized intervals)
- Template selection (weighted random)
- Platform routing (Twitter/Reddit/Discord)
- Link health validation
- Telemetry logging
- Simulation mode (for testing)

No manual posting required. System runs autonomously.
"""

import os
import json
import time
import random
import logging
from datetime import datetime, timedelta
from threading import Thread, Event
import requests

logger = logging.getLogger('campaign-engine')

class CampaignEngine:
    def __init__(self, templates_file='GG_LOOP_SUBSCRIPTION_TEMPLATES.json', config_file='campaign_config.json'):
        self.templates_file = templates_file
        self.config_file = config_file
        self.log_file = 'campaign_log.json'
        self.stop_event = Event()
        
        # Load templates
        with open(self.templates_file, 'r') as f:
            self.templates = json.load(f)
        
        # Load config
        self.config = self.load_config()
        
        # Campaign log (last 100 posts)
        self.campaign_log = self.load_log()
        
        logger.info(f"Campaign Engine initialized: {len(self.templates['twitter'])} Twitter, {len(self.templates['reddit'])} Reddit, {len(self.templates['discord'])} Discord templates")
    
    def load_config(self):
        """Load campaign configuration"""
        default_config = {
            "twitter_enabled": True,
            "reddit_enabled": True,
            "discord_enabled": True,
            "simulation_mode": os.getenv('CAMPAIGN_SIMULATION_MODE', 'true').lower() == 'true',
            "post_frequency_hours_min": 2,
            "post_frequency_hours_max": 4,
            "link_health_check": True,
            "primary_url": "https://ggloop.io/subscription",
            "fallback_url": "https://ggloop.io"
        }
        
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                loaded_config = json.load(f)
                default_config.update(loaded_config)
        
        return default_config
    
    def load_log(self):
        """Load campaign log"""
        if os.path.exists(self.log_file):
            with open(self.log_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_log(self):
        """Save campaign log (keep last 100 entries)"""
        self.campaign_log = self.campaign_log[-100:]
        with open(self.log_file, 'w') as f:
            json.dump(self.campaign_log, f, indent=2)
    
    def check_link_health(self, url):
        """Verify URL is healthy before posting"""
        if not self.config['link_health_check']:
            return True
        
        try:
            response = requests.head(url, timeout=5, allow_redirects=True)
            is_healthy = 200 <= response.status_code < 400
            logger.info(f"Link health check: {url} - {response.status_code} - {'✅ HEALTHY' if is_healthy else '❌ UNHEALTHY'}")
            return is_healthy
        except Exception as e:
            logger.warning(f"Link health check FAILED: {url} - {e}")
            return False
    
    def select_template(self, platform):
        """Select random template for platform"""
        templates = self.templates.get(platform, [])
        if not templates:
            return None
        return random.choice(templates)
    
    def post_to_twitter(self, template):
        """Post to Twitter (or simulate)"""
        content = template['content']
        
        if self.config['simulation_mode']:
            logger.info(f"[SIMULATION] Twitter post: {content[:50]}...")
            return {
                'platform': 'twitter',
                'template_id': template['id'],
                'content': content,
                'status': 'simulated',
                'timestamp': datetime.now().isoformat()
            }
        
        # Real Twitter posting (requires env vars)
        try:
            import tweepy
            
            # Get credentials from env
            api_key = os.getenv('TWITTER_API_KEY')
            api_secret = os.getenv('TWITTER_API_SECRET')
            access_token = os.getenv('TWITTER_ACCESS_TOKEN')
            access_secret = os.getenv('TWITTER_ACCESS_SECRET')
            
            if not all([api_key, api_secret, access_token, access_secret]):
                logger.warning("Twitter credentials missing, falling back to simulation")
                return self.post_to_twitter_simulation(template)
            
            # Authenticate
            auth = tweepy.OAuthHandler(api_key, api_secret)
            auth.set_access_token(access_token, access_secret)
            api = tweepy.API(auth)
            
            # Post tweet
            tweet = api.update_status(content)
            logger.info(f"✅ Posted to Twitter: {tweet.id}")
            
            return {
                'platform': 'twitter',
                'template_id': template['id'],
                'content': content,
                'status': 'posted',
                'tweet_id': tweet.id,
                'timestamp': datetime.now().isoformat()
            }
            
        except ImportError:
            logger.warning("tweepy not installed, using simulation mode")
            return self.post_to_twitter_simulation(template)
        except Exception as e:
            logger.error(f"Twitter posting failed: {e}")
            return {
                'platform': 'twitter',
                'template_id': template['id'],
                'content': content,
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def post_to_twitter_simulation(self, template):
        """Simulate Twitter post"""
        content = template['content']
        logger.info(f"[SIMULATION] Twitter post: {content[:50]}...")
        return {
            'platform': 'twitter',
            'template_id': template['id'],
            'content': content,
            'status': 'simulated',
            'timestamp': datetime.now().isoformat()
        }
    
    def post_to_reddit(self, template):
        """Post to Reddit (or simulate)"""
        title = template.get('title', '')
        body = template.get('body', '')
        
        if self.config['simulation_mode']:
            logger.info(f"[SIMULATION] Reddit post: {title}")
            return {
                'platform': 'reddit',
                'template_id': template['id'],
                'title': title,
                'body': body[:100] + '...',
                'status': 'simulated',
                'timestamp': datetime.now().isoformat()
            }
        
        # Real Reddit posting (requires env vars)
        try:
            import praw
            
            # Get credentials from env
            client_id = os.getenv('REDDIT_CLIENT_ID')
            client_secret = os.getenv('REDDIT_CLIENT_SECRET')
            username = os.getenv('REDDIT_USERNAME')
            password = os.getenv('REDDIT_PASSWORD')
            
            if not all([client_id, client_secret, username, password]):
                logger.warning("Reddit credentials missing, falling back to simulation")
                return self.post_to_reddit_simulation(template)
            
            # Authenticate
            reddit = praw.Reddit(
                client_id=client_id,
                client_secret=client_secret,
                username=username,
                password=password,
                user_agent='GG LOOP Bot 1.0'
            )
            
            # Post to first listed subreddit
            subreddit_name = template.get('subreddits', ['test'])[0]
            subreddit = reddit.subreddit(subreddit_name)
            submission = subreddit.submit(title, selftext=body)
            
            logger.info(f"✅ Posted to Reddit r/{subreddit_name}: {submission.id}")
            
            return {
                'platform': 'reddit',
                'template_id': template['id'],
                'title': title,
                'body': body[:100] + '...',
                'subreddit': subreddit_name,
                'status': 'posted',
                'submission_id': submission.id,
                'timestamp': datetime.now().isoformat()
            }
            
        except ImportError:
            logger.warning("praw not installed, using simulation mode")
            return self.post_to_reddit_simulation(template)
        except Exception as e:
            logger.error(f"Reddit posting failed: {e}")
            return {
                'platform': 'reddit',
                'template_id': template['id'],
                'title': title,
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def post_to_reddit_simulation(self, template):
        """Simulate Reddit post"""
        title = template.get('title', '')
        logger.info(f"[SIMULATION] Reddit post: {title}")
        return {
            'platform': 'reddit',
            'template_id': template['id'],
            'title': title,
            'status': 'simulated',
            'timestamp': datetime.now().isoformat()
        }
    
    def post_to_discord(self, template):
        """Post to Discord via webhook"""
        content = template['content']
        webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
        
        if self.config['simulation_mode']:
            logger.info(f"[SIMULATION] Discord post: {content[:50]}...")
            return {
                'platform': 'discord',
                'template_id': template['id'],
                'content': content[:100] + '...',
                'status': 'simulated',
                'timestamp': datetime.now().isoformat()
            }
        
        if not webhook_url:
            logger.warning("Discord webhook URL missing, using simulation")
            return self.post_to_discord_simulation(template)
        
        try:
            payload = {
                'content': content,
                'username': template.get('webhook_name', 'GG LOOP Bot')
            }
            
            response = requests.post(webhook_url, json=payload)
            
            if response.status_code in [200, 204]:
                logger.info(f"✅ Posted to Discord")
                return {
                    'platform': 'discord',
                    'template_id': template['id'],
                    'content': content,
                    'status': 'posted',
                    'timestamp': datetime.now().isoformat()
                }
            else:
                logger.error(f"Discord posting failed: {response.status_code}")
                return {
                    'platform': 'discord',
                    'template_id': template['id'],
                    'content': content,
                    'status': 'failed',
                    'error': f"HTTP {response.status_code}",
                    'timestamp': datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Discord posting failed: {e}")
            return {
                'platform': 'discord',
                'template_id': template['id'],
                'content': content,
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def post_to_discord_simulation(self, template):
        """Simulate Discord post"""
        content = template['content']
        logger.info(f"[SIMULATION] Discord post: {content[:50]}...")
        return {
            'platform': 'discord',
            'template_id': template['id'],
            'content': content[:100] + '...',
            'status': 'simulated',
            'timestamp': datetime.now().isoformat()
        }
    
    def execute_campaign(self):
        """Execute one campaign cycle"""
        # Select platform (weighted: Twitter 60%, Reddit 20%, Discord 20%)
        enabled_platforms = []
        if self.config['twitter_enabled']:
            enabled_platforms.extend(['twitter'] * 6)
        if self.config['reddit_enabled']:
            enabled_platforms.extend(['reddit'] * 2)
        if self.config['discord_enabled']:
            enabled_platforms.extend(['discord'] * 2)
        
        if not enabled_platforms:
            logger.warning("No platforms enabled")
            return None
        
        platform = random.choice(enabled_platforms)
        
        # Select template
        template = self.select_template(platform)
        if not template:
            logger.warning(f"No templates for {platform}")
            return None
        
        # Check link health
        url = self.config['primary_url']
        if not self.check_link_health(url):
            logger.warning(f"Primary URL unhealthy, using fallback")
            url = self.config['fallback_url']
            if not self.check_link_health(url):
                logger.error("Both primary and fallback URLs unhealthy, skipping post")
                return {
                    'platform': platform,
                    'template_id': template.get('id', 'unknown'),
                    'status': 'blocked',
                    'reason': 'link_health_failed',
                    'timestamp': datetime.now().isoformat()
                }
        
        # Execute post
        if platform == 'twitter':
            result = self.post_to_twitter(template)
        elif platform == 'reddit':
            result = self.post_to_reddit(template)
        elif platform == 'discord':
            result = self.post_to_discord(template)
        else:
            result = None
        
        # Log result
        if result:
            self.campaign_log.append(result)
            self.save_log()
        
        return result
    
    def run_campaign_loop(self):
        """Main campaign loop (runs in background thread)"""
        logger.info("🚀 Campaign loop started")
        
        while not self.stop_event.is_set():
            try:
                # Execute campaign
                result = self.execute_campaign()
                
                if result:
                    logger.info(f"Campaign executed: {result['platform']} - {result['status']}")
                
                # Calculate next run time (randomized interval)
                min_hours = self.config['post_frequency_hours_min']
                max_hours = self.config['post_frequency_hours_max']
                next_run_hours = random.uniform(min_hours, max_hours)
                next_run_seconds = next_run_hours * 3600
                
                logger.info(f"Next campaign in {next_run_hours:.1f} hours")
                
                # Sleep until next run (or stop event)
                self.stop_event.wait(next_run_seconds)
                
            except Exception as e:
                logger.error(f"Campaign loop error: {e}")
                # Wait 5 minutes before retrying
                self.stop_event.wait(300)
        
        logger.info("Campaign loop stopped")
    
    def start(self):
        """Start campaign engine in background thread"""
        self.campaign_thread = Thread(target=self.run_campaign_loop, daemon=True)
        self.campaign_thread.start()
        logger.info("Campaign engine started")
    
    def stop(self):
        """Stop campaign engine"""
        self.stop_event.set()
        if hasattr(self, 'campaign_thread'):
            self.campaign_thread.join(timeout=5)
        logger.info("Campaign engine stopped")
    
    def get_status(self):
        """Get campaign engine status"""
        return {
            'running': not self.stop_event.is_set(),
            'config': self.config,
            'total_campaigns': len(self.campaign_log),
            'recent_campaigns': self.campaign_log[-10:],
            'templates_loaded': {
                'twitter': len(self.templates.get('twitter', [])),
                'reddit': len(self.templates.get('reddit', [])),
                'discord': len(self.templates.get('discord', []))
            }
        }
