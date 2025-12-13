#!/usr/bin/env python3
"""
Automated PayPal subscription plan creator
Creates all 6 subscription plans programmatically
"""

import requests
import json
import base64
import os
from datetime import datetime

# PayPal API credentials (set these as environment variables)
PAYPAL_CLIENT_ID = os.getenv('PAYPAL_CLIENT_ID', 'YOUR_CLIENT_ID_HERE')
PAYPAL_SECRET = os.getenv('PAYPAL_SECRET', 'YOUR_SECRET_HERE')
PAYPAL_MODE = os.getenv('PAYPAL_MODE', 'sandbox')  # 'sandbox' or 'live'

BASE_URL = f"https://api-m.{PAYPAL_MODE}.paypal.com"

def get_access_token():
    """Get PayPal OAuth access token"""
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_SECRET}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    
    response = requests.post(f"{BASE_URL}/v1/oauth2/token", headers=headers, data=data)
    response.raise_for_status()
    return response.json()["access_token"]

def create_product(access_token, name, description):
    """Create a PayPal product (required before creating plans)"""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "name": name,
        "description": description,
        "type": "SERVICE",
        "category": "SOFTWARE"
    }
    
    response = requests.post(f"{BASE_URL}/v1/catalogs/products", headers=headers, json=data)
    response.raise_for_status()
    return response.json()["id"]

def create_subscription_plan(access_token, product_id, name, price, description, features):
    """Create a PayPal subscription plan"""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "product_id": product_id,
        "name": name,
        "description": description,
        "billing_cycles": [
            {
                "frequency": {
                    "interval_unit": "MONTH",
                    "interval_count": 1
                },
                "tenure_type": "REGULAR",
                "sequence": 1,
                "total_cycles": 0,  # 0 = infinite
                "pricing_scheme": {
                    "fixed_price": {
                        "value": str(price),
                        "currency_code": "USD"
                    }
                }
            }
        ],
        "payment_preferences": {
            "auto_bill_outstanding": True,
            "setup_fee": {
                "value": "0",
                "currency_code": "USD"
            },
            "setup_fee_failure_action": "CONTINUE",
            "payment_failure_threshold": 3
        }
    }
    
    response = requests.post(f"{BASE_URL}/v1/billing/plans", headers=headers, json=data)
    response.raise_for_status()
    plan = response.json()
    
    # Activate the plan
    activate_url = f"{BASE_URL}/v1/billing/plans/{plan['id']}/activate"
    requests.post(activate_url, headers=headers)
    
    return plan["id"]

def main():
    """Create all subscription plans automatically"""
    
    print("🚀 PayPal Subscription Automation")
    print("=" * 50)
    
    if PAYPAL_CLIENT_ID == 'YOUR_CLIENT_ID_HERE':
        print("⚠️  PayPal credentials not set!")
        print("\nSet environment variables:")
        print("  export PAYPAL_CLIENT_ID='your_client_id'")
        print("  export PAYPAL_SECRET='your_secret'")
        print("  export PAYPAL_MODE='sandbox'  # or 'live'")
        print("\nGet credentials: https://developer.paypal.com/dashboard/applications")
        return
    
    try:
        # Get access token
        print("\n🔐 Authenticating with PayPal...")
        access_token = get_access_token()
        print("✓ Authenticated")
        
        # Plans to create
        plans = [
            {
                "product_name": "Options Hunter Basic",
                "plan_name": "Options Hunter - Basic Plan",
                "price": 29,
                "description": "10 RSI scans per day, real-time options data, paper trading access, email alerts",
                "key": "options_hunter_basic"
            },
            {
                "product_name": "Options Hunter Pro",
                "plan_name": "Options Hunter - Pro Plan",
                "price": 79,
                "description": "Unlimited scans, SMS alerts, priority support",
                "key": "options_hunter_pro"
            },
            {
                "product_name": "Options Hunter Elite",
                "plan_name": "Options Hunter - Elite Plan",
                "price": 149,
                "description": "AI auto-execution, unlimited SMS, 24/7 support, custom strategies",
                "key": "options_hunter_elite"
            },
            {
                "product_name": "GG Loop Basic",
                "plan_name": "GG Loop - Basic Plan",
                "price": 5,
                "description": "Match tracking, points system, basic rewards",
                "key": "gg_loop_basic"
            },
            {
                "product_name": "GG Loop Pro",
                "plan_name": "GG Loop - Pro Plan",
                "price": 12,
                "description": "Match tracking, points system, premium rewards, priority support",
                "key": "gg_loop_pro"
            },
            {
                "product_name": "GG Loop Elite",
                "plan_name": "GG Loop - Elite Plan",
                "price": 25,
                "description": "Match tracking, elite rewards, custom tournaments, 24/7 support",
                "key": "gg_loop_elite"
            }
        ]
        
        results = {}
        
        for plan_config in plans:
            print(f"\n📦 Creating product: {plan_config['product_name']}...")
            product_id = create_product(
                access_token,
                plan_config['product_name'],
                plan_config['description']
            )
            print(f"✓ Product ID: {product_id}")
            
            print(f"💳 Creating subscription plan: {plan_config['plan_name']}...")
            plan_id = create_subscription_plan(
                access_token,
                product_id,
                plan_config['plan_name'],
                plan_config['price'],
                plan_config['description'],
                []
            )
            print(f"✓ Plan ID: {plan_id}")
            
            results[plan_config['key']] = {
                "product_id": product_id,
                "plan_id": plan_id,
                "subscribe_url": f"https://www.paypal.com/webapps/billing/plans/subscribe?plan_id={plan_id}"
            }
        
        # Save results
        output_file = "paypal-subscription-links.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print("\n" + "=" * 50)
        print("✅ ALL PLANS CREATED SUCCESSFULLY!")
        print(f"📄 Results saved to: {output_file}")
        print("\n🔗 Subscription URLs:")
        for key, data in results.items():
            print(f"  {key}: {data['subscribe_url']}")
        
        print("\n📋 Next steps:")
        print("  1. Update pricing.html with these plan IDs")
        print("  2. Test subscriptions in sandbox mode")
        print("  3. Switch to live mode when ready")
        print("  4. Set PAYPAL_MODE='live' and re-run")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    main()
