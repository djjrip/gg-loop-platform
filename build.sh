#!/bin/bash
# Railway build script to ensure VITE_ variables are available
echo "🔧 Exposing VITE_ environment variables for build..."
export VITE_PAYPAL_CLIENT_ID="$VITE_PAYPAL_CLIENT_ID"
echo "✅ VITE_PAYPAL_CLIENT_ID set for build"
npm run build
