#!/bin/bash

# EMERGENCY DEPLOYMENT SCRIPT
# Deploys to Vercel when Railway fails

echo "🚨 EMERGENCY DEPLOYMENT TO VERCEL"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo "Check: https://gg-loop-platform.vercel.app"
