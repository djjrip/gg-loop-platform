#!/bin/bash

# AWS MIGRATION - ONE COMMAND DEPLOYMENT
# Replaces Railway with AWS Amplify + EventBridge + CloudWatch
# Run: npm run deploy:aws

set -e  # Exit on any error

echo "🚀 GG LOOP - AWS MIGRATION DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

echo "✅ AWS CLI found"

# Check AWS credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not set"
    echo "Set environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your_key"
    echo "  export AWS_SECRET_ACCESS_KEY=your_secret"
    exit 1
fi

echo "✅ AWS credentials configured"
echo ""

# Set variables
APP_NAME="gg-loop-platform"
REGION="us-east-1"
GITHUB_REPO="https://github.com/djjrip/gg-loop-platform"
GITHUB_BRANCH="main"

echo "📋 Configuration:"
echo "   App Name: $APP_NAME"
echo "   Region: $REGION"
echo "   Repo: $GITHUB_REPO"
echo "   Branch: $GITHUB_BRANCH"
echo ""

# Step 1: Create Amplify App
echo "🏗️  Step 1: Creating AWS Amplify app..."
APP_ID=$(aws amplify create-app \
    --name "$APP_NAME" \
    --repository "$GITHUB_REPO" \
    --platform WEB_COMPUTE \
    --region "$REGION" \
    --query 'app.appId' \
    --output text 2>/dev/null || echo "")

if [ -z "$APP_ID" ]; then
    # App might already exist, try to get it
    APP_ID=$(aws amplify list-apps --region "$REGION" --query "apps[?name=='$APP_NAME'].appId" --output text)
    if [ -z "$APP_ID" ]; then
        echo "❌ Failed to create or find Amplify app"
        exit 1
    fi
    echo "✅ Found existing app: $APP_ID"
else
    echo "✅ Created Amplify app: $APP_ID"
fi
echo ""

# Step 2: Connect GitHub repository
echo "🔗 Step 2: Connecting GitHub repository..."
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   1. Go to: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo "   2. Click 'Connect branch'"
echo "   3. Authorize GitHub and select: djjrip/gg-loop-platform"
echo "   4. Select branch: main"
echo "   5. Amplify will auto-detect your build settings from amplify.yml"
echo ""
read -p "Press Enter after connecting GitHub..."
echo ""

# Step 3: Set environment variables
echo "⚙️  Step 3: Setting environment variables..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "Create .env with your Railway environment variables"
    exit 1
fi

# Read .env and set in Amplify
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove quotes from value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    echo "Setting: $key"
    aws amplify update-app \
        --app-id "$APP_ID" \
        --region "$REGION" \
        --environment-variables "$key=$value" \
        >/dev/null 2>&1 || true
done < .env

echo "✅ Environment variables configured"
echo ""

# Step 4: Configure custom domain
echo "🌐 Step 4: Configuring custom domain (ggloop.io)..."
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   1. Go to: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID/settings/domain"
echo "   2. Click 'Add domain'"
echo "   3. Enter: ggloop.io"
echo "   4. Amplify will provide DNS records (CNAME/ANAME)"
echo "   5. Add these records to Cloudflare (see MIGRATE_TO_AWS.md)"
echo ""
read -p "Press Enter after noting DNS records..."
echo ""

# Step 5: Trigger first deployment
echo "🚀 Step 5: Triggering deployment..."
BRANCH_NAME="main"

# Start build
aws amplify start-job \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH_NAME" \
    --job-type RELEASE \
    --region "$REGION" \
    >/dev/null 2>&1 || true

echo "✅ Deployment started"
echo ""
echo "📊 Monitor deployment:"
echo "   https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo ""

# Step 6: Setup EventBridge for autonomous systems
echo "⏰ Step 6: Setting up EventBridge schedules..."
bash scripts/setup-eventbridge.sh "$APP_ID" "$REGION"
echo ""

# Step 7: Setup CloudWatch monitoring
echo "📊 Step 7: Setting up CloudWatch monitoring..."

# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
    --dashboard-name "$APP_NAME-dashboard" \
    --dashboard-body file://scripts/cloudwatch-dashboard.json \
    --region "$REGION" \
    >/dev/null 2>&1 || true

echo "✅ CloudWatch dashboard created"
echo "   View at: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=$APP_NAME-dashboard"
echo ""

# Step 8: Setup alarms
echo "🚨 Setting up CloudWatch alarms..."

# Create SNS topic for alerts
TOPIC_ARN=$(aws sns create-topic \
    --name "$APP_NAME-alerts" \
    --region "$REGION" \
    --query 'TopicArn' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$TOPIC_ARN" ]; then
    echo "✅ SNS topic created: $TOPIC_ARN"
    echo "⚠️  Subscribe to alerts:"
    echo "   aws sns subscribe --topic-arn $TOPIC_ARN --protocol email --notification-endpoint your@email.com --region $REGION"
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AWS DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Wait for Amplify build to complete (~5-10 minutes)"
echo "   Monitor: https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo ""
echo "2. Test temporary AWS URL:"
echo "   Amplify will provide a *.amplifyapp.com URL"
echo "   Test all features before DNS migration"
echo ""
echo "3. Update DNS in Cloudflare:"
echo "   See MIGRATE_TO_AWS.md for exact DNS records"
echo "   Point ggloop.io to Amplify"
echo ""
echo "4. Verify production:"
echo "   https://ggloop.io should load from AWS"
echo "   https://ggloop.io/dev-console should work"
echo "   Check CloudWatch for metrics"
echo ""
echo "5. Delete Railway project:"
echo "   Once verified, delete Railway to stop billing"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "COST ESTIMATE:"
echo "   AWS Amplify: ~$12/month"
echo "   EventBridge: Free (under 1M invocations)"
echo "   CloudWatch: ~$3/month"
echo "   Total: ~$15/month (vs Railway $20/month)"
echo "   Savings: $5/month ($60/year)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
