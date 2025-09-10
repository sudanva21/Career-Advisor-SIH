# 🔧 Database Schema Fix Guide

## ⚠️ Problem Identified

The current Supabase schema has **inconsistent column naming** that causes SQL errors:

```sql
ERROR: 42703: column "user_id" does not exist
HINT: Perhaps you meant to reference the column "career_roadmaps.userid".
```

**Root Cause**: Mixed naming conventions
- Some tables use `userId` (camelCase)  
- Other tables use `user_id` (snake_case)
- APIs expect `user_id` but some tables have `userId`

## 🎯 Solution: Column Naming Standardization

### Option 1: Fix Existing Database (RECOMMENDED)
If you already have data in your Supabase database:

```sql
-- Run this in Supabase SQL Editor
-- Copy and paste: fix-column-naming-migration.sql
```

This script will:
- ✅ Rename `userId` → `user_id` in career_roadmaps
- ✅ Rename `careerGoal` → `career_goal`  
- ✅ Rename `currentLevel` → `current_level`
- ✅ Rename `aiGenerated` → `ai_generated`
- ✅ Update all foreign key constraints
- ✅ Update all RLS policies to use `user_id`
- ✅ Recreate indexes with correct names

### Option 2: Fresh Database Setup
If starting from scratch:

```sql
-- Run this in Supabase SQL Editor  
-- Copy and paste: corrected-complete-database-schema.sql
```

This creates everything correctly from the start with consistent `user_id` naming.

## 🧪 Verification

After running the fix, verify it worked:

```sql
-- Copy and paste: test-schema-fix.sql
```

This tests all the queries that were failing and confirms:
- ✅ No more `column "user_id" does not exist` errors
- ✅ Dashboard API queries work
- ✅ RLS policies reference correct columns
- ✅ Indexes exist for performance

## 📊 Fixed Tables

| Table | Old Column | New Column | Status |
|-------|------------|------------|--------|
| `career_roadmaps` | `userId` | `user_id` | ✅ Fixed |
| `career_roadmaps` | `careerGoal` | `career_goal` | ✅ Fixed |
| `career_roadmaps` | `currentLevel` | `current_level` | ✅ Fixed |
| `career_roadmaps` | `aiGenerated` | `ai_generated` | ✅ Fixed |
| `quiz_results` | `user_id` | `user_id` | ✅ Already correct |
| `activities` | `user_id` | `user_id` | ✅ Already correct |
| `saved_colleges` | `user_id` | `user_id` | ✅ Already correct |

## 🔒 RLS Policies Fixed

**Before (BROKEN):**
```sql
CREATE POLICY "Users can view own career roadmaps" ON career_roadmaps
    FOR SELECT USING (auth.uid() = userId);  -- ❌ userId doesn't exist
```

**After (WORKING):**
```sql
CREATE POLICY "Users can view own career roadmaps" ON career_roadmaps
    FOR SELECT USING (auth.uid() = user_id);  -- ✅ user_id exists
```

## 🚀 API Endpoints That Will Work Again

After the fix, these endpoints should work without errors:

### ✅ Dashboard API
```
GET /api/dashboard
```
**Query that was failing:**
```sql
SELECT * FROM career_roadmaps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
```

### ✅ Roadmap API
```
GET /api/roadmap/list
POST /api/roadmap/generate  
```
**Query that was failing:**
```sql
SELECT * FROM career_roadmaps WHERE user_id = ? ORDER BY created_at DESC
```

### ✅ Quiz API
```
GET /api/quiz/past-results
POST /api/quiz/submit
```
**These were working but good to verify:**
```sql
SELECT * FROM quiz_results WHERE user_id = ?
```

### ✅ Job Hunting API
```
GET /api/job-hunting/data
POST /api/job-hunting/parse-resume
```
**Queries using user_id:**
```sql
SELECT * FROM user_resumes WHERE user_id = ?
SELECT * FROM job_applications WHERE user_id = ?
```

## 🎬 Step-by-Step Fix Process

### Step 1: Backup (Optional but Recommended)
```sql
-- Create a backup of important data
CREATE TABLE career_roadmaps_backup AS SELECT * FROM career_roadmaps;
```

### Step 2: Run the Migration
```sql
-- In Supabase SQL Editor, copy and paste the entire content of:
-- fix-column-naming-migration.sql
```

### Step 3: Verify the Fix
```sql
-- In Supabase SQL Editor, copy and paste the entire content of:
-- test-schema-fix.sql
```

### Step 4: Test Your Application
1. Start your dev server: `npm run dev`
2. Open the dashboard: `http://localhost:3000/dashboard`
3. Check browser console - should see "✅ Table exists" messages
4. Test creating a roadmap, taking a quiz, saving colleges

## 🔍 Common Issues & Solutions

### Issue: Migration script fails
**Solution**: Check if you have the right permissions:
```sql
-- Grant permissions if needed
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
```

### Issue: Some policies still reference old columns
**Solution**: Manually update any remaining policies:
```sql
-- Find policies that still reference userId
SELECT * FROM pg_policies WHERE definition LIKE '%userId%';

-- Drop and recreate them with user_id
```

### Issue: Application still shows mock data
**Solution**: Clear browser cache and check environment variables:
```bash
# Restart the dev server
npm run dev
```

## ✅ Success Indicators

You know the fix worked when:
- ✅ No SQL errors in browser console
- ✅ Dashboard loads real data (not mock data)
- ✅ Roadmap generation works and saves to database
- ✅ Quiz results persist between sessions
- ✅ College searches and saves work
- ✅ All API endpoints return real data

## 🎉 End Result

After applying this fix:
- **Consistent naming**: All foreign keys use `user_id`
- **Working APIs**: No more SQL column errors  
- **Better performance**: Proper indexes on correct columns
- **Secure access**: RLS policies work correctly
- **Clean schema**: Snake_case naming throughout

Your application will finally work with the real database instead of falling back to mock data!

---

## 🤝 Need Help?

If you encounter issues:
1. Check the console output when running the migration
2. Verify table structures with: `\d career_roadmaps` in psql
3. Test specific queries manually in SQL Editor
4. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'career_roadmaps';`