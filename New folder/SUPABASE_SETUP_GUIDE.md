# Supabase Database Setup Guide

## ⚠️ IMPORTANT: Database Schema Missing

The application is currently running in **demo mode** because the required database tables don't exist in your Supabase project.

## Quick Fix Instructions

### Step 1: Apply Database Schema

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project: `tyymopgkofdscyyghvyp`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Schema Script**
   - Copy the entire contents of `supabase-schema.sql` file
   - Paste it into the SQL editor
   - Click "Run" (or press Ctrl/Cmd + Enter)

### Step 2: Verify Tables Created

After running the schema, you should see these tables in your Supabase project:

✅ **Required Tables:**
- `users` - User profiles  
- `quiz_results` - Quiz completion data
- `saved_colleges` - User's saved colleges
- `career_roadmaps` - AI-generated career paths
- `user_activities` - Activity logging
- `user_achievements` - Achievement tracking
- `user_skills` - Skill progress tracking
- `colleges` - College database

### Step 3: Test the Application

1. **Restart the development server**
   ```bash
   npm run dev
   ```

2. **Check the console logs**
   - You should see "✅ Table exists" messages instead of "❌ Table missing" errors
   - Dashboard statistics should show real data instead of demo values

## Current Configuration ✅

Your Supabase configuration is already set up correctly:
- **Project URL**: `https://tyymopgkofdscyyghvyp.supabase.co`
- **API Keys**: Configured ✅
- **Environment**: Ready ✅

## Troubleshooting

### If Tables Still Don't Exist:

1. **Check Database Permissions**
   - Ensure your service role key is correct
   - Verify RLS (Row Level Security) policies were applied

2. **Manual Table Creation**
   If the automated schema doesn't work, create tables one by one:
   
   ```sql
   -- Start with users table
   CREATE TABLE IF NOT EXISTS public.users (
       id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
       email TEXT NOT NULL UNIQUE,
       first_name TEXT,
       last_name TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Enable Row Level Security**
   ```sql
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own profile" ON public.users
       FOR SELECT USING (auth.uid() = id);
   ```

### If You See Permission Errors:

1. **Check Authentication**
   - Make sure you're signed in to the application
   - Verify your session is active

2. **Verify RLS Policies**
   - Policies must allow users to access their own data
   - Check that `auth.uid()` matches the user_id in queries

## Expected Behavior After Setup

### Dashboard Should Show:
- ✅ Real quiz completion counts
- ✅ Actual saved college numbers  
- ✅ Your skill progress data
- ✅ Achievement unlocks
- ✅ Recent activity feed

### Console Should Show:
```
✅ Dashboard stats calculated: {
  completedQuizzes: 2,
  savedColleges: 5, 
  skillsAcquired: 8,
  achievementsUnlocked: 3
}
```

Instead of all zeros with demo mode warnings.

---

## Need Help?

If you encounter issues:
1. Check the browser console for specific error messages
2. Verify all tables exist in Supabase dashboard
3. Ensure RLS policies are correctly applied
4. Test with a fresh browser session

The application will continue to work in demo mode, but you won't get real data persistence until the database schema is properly applied.