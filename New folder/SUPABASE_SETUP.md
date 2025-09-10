# 🚀 Supabase Backend Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose your organization 
4. Set project details:
   - **Name**: career-advisor-platform
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup (2-3 minutes)

## Step 2: Get Your Project Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOi...` (long string)
   - **Service role key**: `eyJhbGciOi...` (different long string)

## Step 3: Update Environment Variables

1. Open your `.env.local` file
2. Replace the placeholder values with your actual keys:

```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep these as is
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-here
```

## Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase-schema.sql` file
3. Paste it in the SQL Editor
4. Click **Run** to execute the script
5. Verify tables are created in **Database** → **Tables**

You should see these tables:
- ✅ `users`
- ✅ `quiz_results`
- ✅ `saved_colleges`
- ✅ `colleges`

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. **Email Auth**: Should be enabled by default
5. **Auto-confirm users**: Turn ON for development (optional)

### Optional: Enable Social Providers

To enable Google/GitHub login:

1. Go to **Authentication** → **Providers**
2. Enable desired providers (Google, GitHub, etc.)
3. Add their client IDs and secrets
4. Update redirect URLs as needed

## Step 6: Test the Setup

1. Install dependencies:
```bash
npm install
```

2. Start your development server:
```bash
npm run dev
```

3. Go to `http://localhost:3000`
4. Try creating a new account via "Sign Up"
5. Check Supabase dashboard → **Authentication** → **Users** to see new user

## Step 7: Verify Data Flow

1. **Sign Up**: Create test account
2. **Dashboard**: Should show user profile
3. **Quiz**: Take quiz and check if results save to `quiz_results` table
4. **Colleges**: Save a college and check `saved_colleges` table

## 🔧 Troubleshooting

### Common Issues:

**1. "Invalid API key" error**
- Double-check your `.env.local` file
- Make sure there are no extra spaces
- Restart your development server after changing env vars

**2. "RLS policy violation" error**
- Run the schema SQL script again
- Check that RLS policies were created properly

**3. Tables not showing**
- Make sure you ran the complete SQL script
- Check for any SQL errors in the editor

**4. Auth not working**
- Verify Site URL in Authentication settings
- Check redirect URLs match your domain

### View Database Data:

- **Users**: Authentication → Users
- **Tables**: Database → Tables → Select table → "View data"
- **Real-time**: Database → Replication (if you need real-time features)

## 🎯 Production Deployment

When ready for production:

1. **Update Environment Variables**:
   - Set `NEXT_PUBLIC_SITE_URL` to your domain
   - Add production domain to Auth redirect URLs

2. **Database Security**:
   - Review RLS policies
   - Remove auto-confirm users
   - Set up proper backup schedules

3. **Monitoring**:
   - Enable Supabase logging
   - Set up alerts for usage limits
   - Monitor database performance

## 📊 Usage Limits (Free Tier)

- **Database**: 500MB storage
- **Auth**: 50,000 monthly active users
- **Storage**: 1GB file storage
- **Edge Functions**: 500,000 invocations
- **Realtime**: 2 concurrent connections

Upgrade to Pro ($25/month) for higher limits.

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Environment variables updated
- [ ] Database schema deployed
- [ ] Authentication configured
- [ ] Test user account created
- [ ] Dashboard loads user data
- [ ] Quiz results save to database
- [ ] College saving works

**🎉 Your backend is now ready! All authentication and data will be handled by Supabase.**