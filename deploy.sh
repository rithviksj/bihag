#!/bin/bash

echo "🚀 Deploying Bihag v2.0 to Production..."
echo ""

# Temporarily disable SSL verification for corporate networks
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Check if logged in
if ! vercel whoami &>/dev/null; then
  echo "📝 Please login to Vercel (browser will open)..."
  vercel login
fi

echo ""
echo "🏗️  Building and deploying to production..."
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🌍 Your site is now live!"
echo ""
echo "Next steps:"
echo "1. Visit your production URL (shown above)"
echo "2. Test the app"
echo "3. Share with the world! 🎉"
