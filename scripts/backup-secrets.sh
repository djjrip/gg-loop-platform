#!/bin/bash
# GG Loop Secrets Documentation Script
# This creates a template for you to manually record your secrets
# DO NOT commit the completed file to Git!

SECRETS_FILE="backups/SECRETS-TEMPLATE-$(date +%Y%m%d).txt"

cat > "$SECRETS_FILE" << 'EOF'
# GG LOOP SECRETS BACKUP
# ⚠️  IMPORTANT: Keep this file SAFE and PRIVATE!
# ⚠️  DO NOT commit this to Git or share publicly!

## PayPal Credentials
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASIC_PLAN_ID=P-6A485619U8349492UNEK4RRA
PAYPAL_PRO_PLAN_ID=P-7PE45456B7870481SNEK4TRY
PAYPAL_ELITE_PLAN_ID=P-369148416D044494CNEK4UDQ

## Stripe Credentials
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLIC_KEY=
STRIPE_BASIC_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_ELITE_PRICE_ID=

## Riot Games API
RIOT_API_KEY=

## OAuth Providers
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

## Tango Card (Reward Fulfillment)
TANGO_CARD_PLATFORM_NAME=
TANGO_CARD_PLATFORM_KEY=
TANGO_CARD_API_URL=

## Application Settings
SESSION_SECRET=
BASE_URL=
ADMIN_EMAILS=jaysonquindao@ggloop.io

## Database (auto-populated, but good to document)
DATABASE_URL=(automatically managed by Replit)

## Object Storage
DEFAULT_OBJECT_STORAGE_BUCKET_ID=(automatically managed by Replit)

---
BACKUP DATE: $(date)
BACKED UP BY: Jayson Quindao
EOF

echo "✅ Secrets template created: $SECRETS_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Open $SECRETS_FILE"
echo "   2. Fill in your actual secret values (from Replit Secrets)"
echo "   3. Save it somewhere VERY secure (password manager, encrypted drive)"
echo "   4. DELETE the file from this directory after saving elsewhere"
echo ""
echo "⚠️  NEVER commit this file to Git!"
