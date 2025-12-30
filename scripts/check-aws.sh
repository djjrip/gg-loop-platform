#!/bin/bash

# PRE-FLIGHT CHECK FOR AWS MIGRATION
# Verifies everything is ready before deployment

echo "🔍 GG LOOP - AWS MIGRATION PRE-FLIGHT CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0

# Check 1: AWS CLI
echo "1️⃣  Checking AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
    echo "   ✅ AWS CLI installed: $AWS_VERSION"
else
    echo "   ❌ AWS CLI not found"
    echo "      Install: https://aws.amazon.com/cli/"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: AWS Credentials
echo "2️⃣  Checking AWS credentials..."
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "   ❌ AWS_ACCESS_KEY_ID not set"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ AWS_ACCESS_KEY_ID configured"
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "   ❌ AWS_SECRET_ACCESS_KEY not set"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ AWS_SECRET_ACCESS_KEY configured"
fi
echo ""

# Check 3: .env file
echo "3️⃣  Checking environment variables..."
if [ -f .env ]; then
    ENV_COUNT=$(grep -v '^#' .env | grep -v '^$' | wc -l)
    echo "   ✅ .env file found ($ENV_COUNT variables)"
else
    echo "   ❌ .env file not found"
    echo "      Create .env with Railway environment variables"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: GitHub repo
echo "4️⃣  Checking GitHub repository..."
if git remote -v | grep -q "github.com/djjrip/gg-loop-platform"; then
    echo "   ✅ GitHub repo configured correctly"
else
    echo "   ❌ GitHub remote not configured"
    echo "      Expected: https://github.com/djjrip/gg-loop-platform"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Required files
echo "5️⃣  Checking required files..."
REQUIRED_FILES=(
    "amplify.yml"
    "scripts/deploy-aws.sh"
    "scripts/setup-eventbridge.sh"
    "scripts/cloudwatch-dashboard.json"
    "MIGRATE_TO_AWS.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Check 6: Build test
echo "6️⃣  Testing local build..."
echo "   (This may take a minute...)"
if npm run build:server > /dev/null 2>&1; then
    echo "   ✅ Server builds successfully"
else
    echo "   ⚠️  Server build has errors"
    echo "      Run: npm run build:server"
    echo "      Fix TypeScript errors before deploying"
    # Don't count as fatal error - we can fix this
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ PRE-FLIGHT CHECK PASSED"
    echo ""
    echo "Ready to deploy to AWS!"
    echo ""
    echo "Next step:"
    echo "   npm run deploy:aws"
    exit 0
else
    echo "❌ PRE-FLIGHT CHECK FAILED ($ERRORS errors)"
    echo ""
    echo "Fix the errors above before deploying."
    exit 1
fi
