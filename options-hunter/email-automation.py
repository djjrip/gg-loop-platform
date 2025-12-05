#!/usr/bin/env python3
"""
Email automation system for Options Hunter waitlist
Sends drip campaign via Mailgun or SendGrid
"""

import os
import time
import json
from datetime import datetime, timedelta

# Email service config (set via environment variables)
EMAIL_PROVIDER = os.getenv('EMAIL_PROVIDER', 'mailgun')  # 'mailgun' or 'sendgrid'
EMAIL_API_KEY = os.getenv('EMAIL_API_KEY', '')
EMAIL_DOMAIN = os.getenv('EMAIL_DOMAIN', 'mg.optionshunter.io')
FROM_EMAIL = os.getenv('FROM_EMAIL', 'team@optionshunter.io')

# Email sequence timing (days after signup)
SEQUENCE = [
    {"file": "01-welcome.md", "delay_days": 0, "subject": "Welcome to Options Hunter - Your Trading Edge Starts Now"},
    {"file": "02-proof.md", "delay_days": 2, "subject": "📊 Our bot made 3 profitable trades this week (proof inside)"},
    {"file": "03-testimonial.md", "delay_days": 5, "subject": '"This saved me $2,400 in losses" - Jason T., Pro User'},
    {"file": "04-urgency.md", "delay_days": 7, "subject": "⏰ Your scan limit resets tomorrow (here's what you might be missing)"},
    {"file": "05-final-offer.md", "delay_days": 9, "subject": "Last call: Your $50 discount expires tonight at midnight"}
]

def load_email_template(filename):
    """Load email content from markdown file"""
    path = os.path.join(os.path.dirname(__file__), 'email-sequences', filename)
    with open(path, 'r') as f:
        content = f.read()
        # Extract subject and body
        lines = content.split('\n')
        subject = lines[1].replace('**Subject:**', '').strip()
        body = '\n'.join(lines[3:])  # Skip header
        return subject, body

def send_email_mailgun(to_email, subject, body):
    """Send email via Mailgun"""
    import requests
    
    response = requests.post(
        f"https://api.mailgun.net/v3/{EMAIL_DOMAIN}/messages",
        auth=("api", EMAIL_API_KEY),
        data={
            "from": f"Options Hunter <{FROM_EMAIL}>",
            "to": to_email,
            "subject": subject,
            "text": body,
            "html": markdown_to_html(body)
        }
    )
    return response.status_code == 200

def send_email_sendgrid(to_email, subject, body):
    """Send email via SendGrid"""
    import requests
    
    headers = {
        "Authorization": f"Bearer {EMAIL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": FROM_EMAIL, "name": "Options Hunter"},
        "subject": subject,
        "content": [
            {"type": "text/plain", "value": body},
            {"type": "text/html", "value": markdown_to_html(body)}
        ]
    }
    
    response = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers=headers,
        json=data
    )
    return response.status_code == 202

def markdown_to_html(md_text):
    """Basic markdown to HTML conversion"""
    html = md_text
    # Bold
    html = html.replace('**', '<strong>').replace('**', '</strong>')
    # Links
    import re
    html = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', html)
    # Line breaks
    html = html.replace('\n\n', '<br><br>')
    return f"<html><body>{html}</body></html>"

def get_users_needing_emails():
    """
    Get users who need to receive next email in sequence
    In production, this would query your database
    """
    # Placeholder - integrate with actual user database
    waitlist_file = os.path.join(os.path.dirname(__file__), 'waitlist.json')
    if not os.path.exists(waitlist_file):
        return []
    
    with open(waitlist_file, 'r') as f:
        users = json.load(f)
    
    users_to_email = []
    now = datetime.now()
    
    for user in users:
        signup_date = datetime.fromisoformat(user.get('signup_date', now.isoformat()))
        emails_sent = user.get('emails_sent', [])
        
        for i, email_config in enumerate(SEQUENCE):
            if i in emails_sent:
                continue  # Already sent this email
            
            send_date = signup_date + timedelta(days=email_config['delay_days'])
            if now >= send_date:
                users_to_email.append({
                    'email': user['email'],
                    'sequence_index': i,
                    'user_id': user.get('id')
                })
                break  # Only send one email per user per run
    
    return users_to_email

def send_sequence_email(user_email, sequence_index):
    """Send specific email from sequence"""
    email_config = SEQUENCE[sequence_index]
    subject, body = load_email_template(email_config['file'])
    
    if EMAIL_PROVIDER == 'mailgun':
        success = send_email_mailgun(user_email, subject, body)
    else:
        success = send_email_sendgrid(user_email, subject, body)
    
    return success

def run_email_automation():
    """Main automation loop"""
    print("📧 Email Automation Starting...")
    
    if not EMAIL_API_KEY:
        print("⚠️  EMAIL_API_KEY not set. Set environment variable to enable emails.")
        print("\nTo set up:")
        print("  1. Mailgun: Get API key from mailgun.com")
        print("  2. SendGrid: Get API key from sendgrid.com")
        print("  3. Set: export EMAIL_API_KEY='your_key_here'")
        print("  4. Set: export EMAIL_PROVIDER='mailgun'  # or 'sendgrid'")
        return
    
    users = get_users_needing_emails()
    
    if not users:
        print("✓ No emails to send")
        return
    
    print(f"📨 Sending {len(users)} emails...")
    
    for user_data in users:
        try:
            success = send_sequence_email(user_data['email'], user_data['sequence_index'])
            if success:
                print(f"✓ Sent email {user_data['sequence_index'] + 1} to {user_data['email']}")
                # Mark email as sent (in production, update database)
            else:
                print(f"✗ Failed to send to {user_data['email']}")
        except Exception as e:
            print(f"✗ Error sending to {user_data['email']}: {e}")
        
        time.sleep(1)  # Rate limiting
    
    print("✅ Email automation complete")

if __name__ == "__main__":
    run_email_automation()
