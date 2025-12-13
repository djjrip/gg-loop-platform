#!/bin/bash

echo "🚀 Deploying Options Hunter to the web..."
echo ""
echo "📦 Installing Netlify CLI..."
npm install -g netlify-cli

echo ""
echo "🌐 Deploying your app..."
netlify deploy --prod --dir=. --site-name=options-hunter-pro

echo ""
echo "✅ Done! Your app is now live at a permanent URL."
echo "Copy the URL above and save it!"
