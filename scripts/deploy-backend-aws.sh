#!/bin/bash
# DEPLOY BACKEND TO AWS APP RUNNER
# Run: bash scripts/deploy-backend-aws.sh

# PREREQUISITE: Valid AWS Credentials
# If you get "InvalidSignatureException" or "InvalidClientTokenId", run:
#   aws configure
#   (Enter your Access Key and Secret Key)

echo "🚀 GG LOOP - BACKEND DEPLOYMENT (App Runner)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found."
    exit 1
fi

# 2. Check Service Existence
SERVICE_NAME="gg-loop-backend"
REGION="us-east-1"

echo "🔍 Checking for existing service: $SERVICE_NAME..."
# Error handling for invalid credentials
SERVICE_ARN=$(aws apprunner list-services --region $REGION --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text 2>&1)

if [[ $SERVICE_ARN == *"InvalidSignatureException"* ]] || [[ $SERVICE_ARN == *"InvalidClientTokenId"* ]]; then
    echo "❌ AWS Credentials Invalid or Expired."
    echo "   Please run 'aws configure' to set up valid keys."
    exit 1
fi

if [ ! -z "$SERVICE_ARN" ] && [[ $SERVICE_ARN != *"An error occurred"* ]]; then
    echo "✅ Found existing service: $SERVICE_ARN"
    echo "   Triggering manual deployment..."
    aws apprunner start-deployment --service-arn $SERVICE_ARN --region $REGION
else
    echo "⚡ Creating NEW App Runner service..."
    echo "   Please use the AWS Console to create the service for the first time:"
    echo "   https://console.aws.amazon.com/apprunner/home?region=$REGION"
    echo "   Repo: djjrip/gg-loop-platform"
    echo "   Env Vars: Copy from .env"
fi
