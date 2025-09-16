#!/bin/bash

# Vercel Environment Variables Setup Script
# This script sets up all required environment variables for deployment

echo "Setting up Vercel environment variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Core Supabase Configuration
echo "Setting Supabase configuration..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://gyudwjzjztbgdjwdafxg.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dWR3anpqenRiZ2Rqd2RhZnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDMwOTUsImV4cCI6MjA3MjgxOTA5NX0._FSVzxUBEoykp0LYKs8767X9mHXboP6LK7j6N1QMuT0"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dWR3anpqenRiZ2Rqd2RhZnhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI0MzA5NSwiZXhwIjoyMDcyODE5MDk1fQ.sPPX_CLWTR6OeU_sj8geMMLPE4UrlgLoto_sdVc_bsc"

# Database Configuration
echo "Setting database configuration..."
vercel env add DATABASE_URL production <<< "postgresql://postgres:Akash%401234@db.tyymopgkofdscyyghvyp.supabase.co:5432/postgres"

# App Configuration
echo "Setting app configuration..."
vercel env add NODE_ENV production <<< "production"
vercel env add JWT_SECRET production <<< "\$2a\$10\$Dx4r3dUCFfZk8/dmA4zbF/bmE+NvG49idyzwVQ/5ZdhMQwb/LH0bE/f4ljyHbvK+vMaqgvN0HjyxameL66ToIdtEbg=="

# AI Providers
echo "Setting AI provider configuration..."
vercel env add HUGGINGFACE_API_KEY production <<< "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"
vercel env add COHERE_API_KEY production <<< "9G8lEb3bftStUoB3JHShHYA1Ija6RXP8vNsOssh3"
vercel env add DEFAULT_AI_PROVIDER production <<< "huggingface"

# Google Maps (Optional)
echo "Setting Google Maps configuration..."
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production <<< "AIzaSyDe9PcYT1EB2-p4uumsQ4hx2jOVM61Hrow"

# Get the deployment URL and set NEXT_PUBLIC_APP_URL
echo ""
echo "Please manually set NEXT_PUBLIC_APP_URL after deployment:"
echo "vercel env add NEXT_PUBLIC_APP_URL production"
echo "Enter your Vercel app URL (e.g., https://your-app.vercel.app)"

echo ""
echo "Environment variables setup complete!"
echo "Run 'vercel --prod' to deploy with these variables."

echo ""
echo "To verify your environment variables:"
echo "vercel env ls"