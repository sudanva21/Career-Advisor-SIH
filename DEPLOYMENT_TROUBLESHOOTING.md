# Deployment Troubleshooting Guide

## Common Supabase Configuration Errors

### Error: "supabaseUrl is required"

This error occurs when the Supabase environment variables are not properly configured in your deployment environment.

#### Root Causes:
1. Missing environment variables in Vercel dashboard
2. Incorrect environment variable names
3. Environment variables not set for the correct environment (production/preview)

#### Solutions:

### 1. Verify Environment Variables Locally

First, check if your local environment is working:

```bash
npm run check:env
```

This will verify that all required environment variables are present and correctly formatted.

### 2. Set Up Vercel Environment Variables

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Run the setup script to get the exact commands
npm run setup:vercel

# Follow the generated commands to set each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter your Supabase anon key when prompted

# Continue for all required variables...
```

**Option B: Using Vercel Dashboard**
1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `DATABASE_URL` | `postgresql://postgres:password@...` | Production, Preview, Development |
| `JWT_SECRET` | Your JWT secret | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production, Preview, Development |
| `HUGGINGFACE_API_KEY` | Your HuggingFace API key | Production, Preview, Development |
| `COHERE_API_KEY` | Your Cohere API key | Production, Preview, Development |
| `DEFAULT_AI_PROVIDER` | `huggingface` | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Production, Preview, Development |

### 3. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Redeploy After Setting Variables

After setting environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or push a new commit to trigger automatic deployment.

## Additional Troubleshooting

### Build Fails with Environment Check

If the build fails during the environment check:

1. **Check the build logs** in Vercel dashboard
2. **Verify variable names** match exactly (case-sensitive)
3. **Ensure variables are set for the correct environment** (production, preview, development)

### API Routes Still Failing

If API routes continue to fail:

1. **Check function logs** in Vercel dashboard
2. **Verify Supabase project is active** and not paused
3. **Test Supabase connection** directly from your local environment

### Local vs Production Differences

Common differences between local and production environments:

| Issue | Local | Production |
|-------|--------|------------|
| Environment file | `.env.local` | Vercel environment variables |
| Database | Local PostgreSQL/SQLite | Supabase PostgreSQL |
| Domain | `localhost:3000` | `your-app.vercel.app` |
| HTTPS | Optional | Required for Supabase |

## Verification Steps

After deployment, verify everything works:

1. **Test Supabase connection**: Visit `/api/achievements`
2. **Check authentication**: Try logging in
3. **Test API routes**: Check browser network tab for errors
4. **Monitor function logs**: Check Vercel dashboard for runtime errors

## Need More Help?

1. **Check the server logs** in Vercel dashboard
2. **Run environment check locally**: `npm run check:env`
3. **Verify Supabase project settings** in Supabase dashboard
4. **Test API endpoints** directly with tools like Postman

## Quick Fix Commands

```bash
# Check environment variables
npm run check:env

# Set up Vercel environment variables
npm run setup:vercel

# Force redeploy
vercel --prod --force

# Check build locally
npm run build
```