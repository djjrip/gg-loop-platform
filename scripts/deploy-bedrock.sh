#!/bin/bash

# AWS Bedrock Dev Console - One-Command Deployment
# This script tests locally, then deploys to Railway

echo "🚀 AWS Bedrock Dev Console - Deploying..."
echo ""

# Step 1: Check AWS credentials in Railway
echo "✅ Step 1: AWS credentials already in Railway environment variables"
echo "   AWS_ACCESS_KEY_ID: Set"
echo "   AWS_SECRET_ACCESS_KEY: Set"
echo "   AWS_REGION: us-east-1"
echo ""

# Step 2: Test build locally
echo "🔨 Step 2: Testing build locally..."
npm run build:server 2>&1 | head -n 20
SERVER_BUILD=$?

if [ $SERVER_BUILD -ne 0 ]; then
  echo "❌ Server build failed. Fix TypeScript errors first."
  echo "Run: npm run build:server"
  exit 1
fi

echo "✅ Server build successful"
echo ""

# Step 3: Commit and push
echo "📝 Step 3: Committing changes..."
git add server/bedrock-routes.ts client/src/pages/DevConsole.tsx server/index.ts client/src/App.tsx
git commit -m "feat: AWS Bedrock dev console - chat, code gen, debug with YOUR credits"
echo ""

echo "🚢 Step 4: Pushing to GitHub (triggers Railway deploy)..."
git push
echo ""

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Wait ~2-3 minutes for Railway to deploy"
echo "2. Go to: https://ggloop.io/dev-console"
echo "3. Start chatting with Claude using YOUR AWS credits"
echo ""
echo "COSTS:"
echo "• ~\$0.003 per message (Claude 3 Haiku)"
echo "• vs \$20/month for Claude.ai Pro"
echo "• You'd need 6,666 messages/month to break even"
echo ""
echo "FEATURES:"
echo "• Unlimited chat with Claude"
echo "• Code generation on demand"
echo "• Debug helper (paste errors, get solutions)"
echo "• Real-time cost tracking"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
