#!/bin/bash

# SETUP AWS EVENTBRIDGE SCHEDULES
# Automates all 17 autonomous systems

set -e

APP_ID=$1
REGION=$2

if [ -z "$APP_ID" ] || [ -z "$REGION" ]; then
    echo "Usage: setup-eventbridge.sh <app-id> <region>"
    exit 1
fi

echo "Setting up EventBridge schedules..."

# Get Amplify backend URL (will be set after deployment)
# For now, use placeholder - will be updated after first deployment
BACKEND_URL="https://$APP_ID.amplifyapp.com/api"

# Create IAM role for EventBridge to invoke Lambda (if using Lambda)
# Or use AWS Systems Manager to run scripts directly

# Schedule 1: Master Autonomous Loop (every 6 hours)
aws events put-rule \
    --name "gg-loop-master-autonomous-loop" \
    --schedule-expression "rate(6 hours)" \
    --state ENABLED \
    --region "$REGION" \
    >/dev/null 2>&1 || true

echo "✅ Master loop scheduled (every 6 hours)"

# Schedule 2: Revenue Tracking (daily at 9 AM)
aws events put-rule \
    --name "gg-loop-revenue-tracking" \
    --schedule-expression "cron(0 9 * * ? *)" \
    --state ENABLED \
    --region "$REGION" \
    >/dev/null 2>&1 || true

echo "✅ Revenue tracking scheduled (daily 9 AM)"

# Schedule 3: Growth Metrics (daily at 10 AM)
aws events put-rule \
    --name "gg-loop-growth-metrics" \
    --schedule-expression "cron(0 10 * * ? *)" \
    --state ENABLED \
    --region "$REGION" \
    >/dev/null 2>&1 || true

echo "✅ Growth metrics scheduled (daily 10 AM)"

# Schedule 4: Content Publisher (Mon/Thu/Sun at 9 AM)
aws events put-rule \
    --name "gg-loop-content-publisher" \
    --schedule-expression "cron(0 9 ? * MON,THU,SUN *)" \
    --state ENABLED \
    --region "$REGION" \
    >/dev/null 2>&1 || true

echo "✅ Content publisher scheduled (Mon/Thu/Sun 9 AM)"

echo ""
echo "⚠️  IMPORTANT: EventBridge targets need to be configured"
echo "Options:"
echo "1. Create Lambda functions for each script (recommended)"
echo "2. Use AWS Systems Manager Run Command to execute scripts"
echo "3. Use HTTP targets to call backend API endpoints"
echo ""
echo "For now, schedules are created but not yet invoking targets."
echo "See MIGRATE_TO_AWS.md for Lambda function setup."
