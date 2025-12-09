# TWILIO SETUP INSTRUCTIONS

**Add these to your `.env` file:**

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=AC542b2c8baaac2ca6a0e2b02883e948b0
TWILIO_AUTH_TOKEN=97de4e763900b903b789a12d0177c7e3
TWILIO_PHONE_NUMBER=+16282825323
YOUR_PHONE_NUMBER=+14693718556
```

**Also add to Railway environment variables:**
1. Go to Railway dashboard
2. Click on your project
3. Go to "Variables" tab
4. Add each of these variables

**Then the SMS system will send you:**
- Daily reminder 22 hours after API key update
- Critical error alerts
- Revenue milestone notifications
