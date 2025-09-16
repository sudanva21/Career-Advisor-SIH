# Deployment Guide for Vercel

## Prerequisites

1. **Supabase Project**: Create a Supabase project at https://supabase.com
2. **Vercel Account**: Sign up at https://vercel.com
3. **AI Provider API Key**: Get a free API key from Hugging Face or Cohere

## Environment Variables Setup

In your Vercel dashboard, add these environment variables:

### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
HUGGINGFACE_API_KEY=your_huggingface_api_key
DEFAULT_AI_PROVIDER=huggingface
```

### Optional Variables

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Deployment Steps

1. **Connect Repository**: 
   - Push your code to GitHub
   - Connect your GitHub repository to Vercel

2. **Configure Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add all required variables listed above

3. **Database Setup**:
   - Run the Prisma migration in your Supabase SQL editor
   - The schema is in `prisma/schema.prisma`

4. **Deploy**:
   - Vercel will automatically deploy when you push to the main branch
   - Check the deployment logs for any issues

## Database Schema Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  "firstName" VARCHAR(255),
  "lastName" VARCHAR(255),
  password VARCHAR(255),
  "customerId" VARCHAR(255),
  "subscriptionTier" VARCHAR(50) DEFAULT 'free',
  "subscriptionStatus" VARCHAR(50) DEFAULT 'inactive',
  "subscriptionId" VARCHAR(255),
  "subscriptionStarted" TIMESTAMP,
  "subscriptionExpires" TIMESTAMP,
  "paymentProvider" VARCHAR(50),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roadmaps table
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "targetRole" VARCHAR(255),
  "experienceLevel" VARCHAR(50),
  "timeCommitment" VARCHAR(50),
  "currentSkills" TEXT[],
  "targetSkills" TEXT[],
  milestones JSONB,
  resources JSONB,
  progress INTEGER DEFAULT 0,
  "isCompleted" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roadmaps_user_id ON roadmaps("userId");
CREATE INDEX idx_roadmaps_created_at ON roadmaps("createdAt");
```

## Post-Deployment Verification

1. **Test Authentication**: Try signing up and signing in
2. **Test AI Features**: Create a roadmap or take a quiz
3. **Test Database**: Check if user data is being saved
4. **Check Logs**: Monitor Vercel function logs for errors

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check TypeScript errors in build logs
2. **Database Connection**: Verify DATABASE_URL format
3. **API Errors**: Check environment variables are set correctly
4. **CORS Issues**: Verify domain settings in Supabase

### Performance Optimization:

1. The app uses static generation where possible
2. API routes are optimized for Vercel's serverless functions
3. Images are optimized using Next.js Image component

## Features Status

✅ **Working Features:**
- User authentication (Supabase Auth)
- AI-powered career roadmaps
- Interactive quizzes
- College finder
- Job hunting tools
- Resume analysis
- Dashboard and analytics

⚠️ **Temporarily Disabled:**
- Razorpay payments (can be enabled by configuring API keys)
- Some advanced 3D features (performance optimization)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check Supabase project status
4. Review API quotas for AI providers