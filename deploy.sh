#!/bin/bash

# Metro App Deployment Script
echo "🚇 Hyderabad Metro App Deployment Script"
echo "========================================="

# Set PATH to include npm global binaries
export PATH=$PATH:/usr/local/bin:/home/ubuntu/.npm-global/bin

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

echo "📦 Building the application..."
npm run build

echo "🚀 Deploying to Vercel..."
echo "Note: You'll need to login to Vercel first with 'vercel login'"
echo "Then run: vercel --prod"

echo ""
echo "🌐 Custom Domain Setup:"
echo "After deployment, add custom domain metroapp.in:"
echo "vercel domains add metroapp.in"
echo "vercel alias <deployment-url> metroapp.in"

echo ""
echo "📋 Environment Variables to set in Vercel:"
echo "- DATABASE_URL"
echo "- NEXT_PUBLIC_FIREBASE_API_KEY"
echo "- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "- NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "- NEXT_PUBLIC_FIREBASE_APP_ID"
echo "- NEXT_PUBLIC_RAZORPAY_KEY_ID"
echo "- RAZORPAY_KEY_SECRET"
echo "- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"

echo ""
echo "✅ Deployment script ready!"
echo "Run 'vercel login' first, then 'vercel --prod' to deploy"
