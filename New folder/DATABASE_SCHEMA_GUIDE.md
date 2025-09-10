# 🗄️ Complete Database Schema Guide

This guide explains the complete database schema created for the Career Advisor Platform.

## 🚀 Quick Setup

1. **Run the schema creation script in Supabase SQL Editor:**
   ```sql
   -- Copy and paste the content of complete-database-schema.sql
   ```

2. **Verify everything works:**
   ```sql
   -- Copy and paste the content of verify-database-schema.sql
   ```

## 📋 Essential Tables Overview

### 🧑‍💼 User Management Tables

#### `profiles`
- **Purpose**: Extends Supabase auth.users with additional profile information
- **Key Fields**: 
  - `id` (UUID, references auth.users)
  - `full_name` (TEXT)
  - `email` (TEXT, unique)
  - `subscription_tier` ('free', 'pro', 'premium')

#### `user_subscriptions`
- **Purpose**: Tracks user subscription status and payment details
- **Key Fields**: Stripe/Razorpay integration fields, plan status

#### `payment_history`
- **Purpose**: Audit trail of all payments
- **Key Fields**: Amount, currency, status, payment method

---

### 🛤️ Career Planning Tables

#### `career_roadmaps`
- **Purpose**: Stores AI-generated career roadmaps
- **Key Fields**:
  - `content` (JSONB) - **stores AI-generated roadmap steps**
  - `nodes` (JSONB) - roadmap visualization nodes
  - `connections` (JSONB) - node relationships
  - `progress` (INTEGER) - completion percentage

#### `quiz_results`  
- **Purpose**: Stores quiz answers and AI recommendations
- **Key Fields**:
  - `answers` (JSONB) - **stores quiz answers**
  - `recommendations` (JSONB) - **AI recommendations**
  - `score`, `interests`, `skills` arrays

---

### 🎓 College System Tables

#### `colleges`
- **Purpose**: Master database of all colleges
- **Key Fields**:
  - `ranking` (INTEGER)
  - `fees` (INTEGER) - fees in rupees  
  - `details` (JSONB) - additional college information
  - `latitude`, `longitude` - for map integration

#### `saved_colleges`
- **Purpose**: User's bookmarked colleges
- **Key Fields**: Links users to specific colleges with metadata

---

### 💼 Job Hunting Tables

#### `job_applications`
- **Purpose**: AI Job Hunter feature - tracks applications
- **Key Fields**:
  - `resume_url` (TEXT)
  - `analysis` (JSONB) - **AI resume analysis result**
  - `status` - application progress

#### `user_resumes`
- **Purpose**: Stores uploaded resumes with AI analysis
- **Key Fields**: Content, extracted skills/experience

#### `job_matches`
- **Purpose**: AI-powered job matching results
- **Key Fields**: Match score, job data, application status

#### `outreach_drafts`
- **Purpose**: AI-generated emails and cover letters
- **Key Fields**: Content templates for different outreach types

---

### 📊 Activity & Achievement System

#### `activities` 
- **Purpose**: Tracks all user activities for dashboard
- **Key Fields**:
  - `type` - CHECK constraint: 'roadmap_generated', 'quiz_completed', 'job_applied', etc.
  - `details` (JSONB) - **stores extra metadata**

#### `user_achievements`
- **Purpose**: Gamification - user accomplishments
- **Key Fields**: Achievement types, rarity levels, progress tracking

#### `user_skills`
- **Purpose**: Skill progress monitoring
- **Key Fields**: Current vs target levels, categories

## 🔒 Row Level Security (RLS) Policies

**All user-specific tables enforce**: `auth.uid() = user_id`

**Public access tables**:
- `colleges` - Anyone can read (for search/browse)

**Admin access**:
- College management requires admin role

## ⚡ Performance Features

### Indexes Created
- `user_id` columns (fast user data queries)
- `created_at` DESC (recent activity queries) 
- `match_score` DESC (job matching)
- GIN indexes on JSONB columns (fast JSON queries)

### Automatic Features
- **Auto profile creation** - New users get profile row automatically
- **Auto timestamps** - `updated_at` fields auto-update
- **Foreign key cascades** - Clean data deletion

## 🎯 API Integration Points

### Dashboard API (`/api/dashboard`)
Queries these tables:
- `activities` + `user_activities` (recent activity)
- `quiz_results` (completed assessments)
- `saved_colleges` (bookmarked schools)
- `user_skills` (progress tracking)
- `career_roadmaps` (roadmap preview)

### Quiz API (`/api/quiz/*`)
- **Reads**: Previous results from `quiz_results`
- **Writes**: New results with `answers` and `recommendations` JSONB

### Job Hunting API (`/api/job-hunting/*`)
- **Resume parsing**: Stores in `user_resumes` with AI analysis
- **Job matching**: Creates entries in `job_matches`
- **Outreach**: Generates content in `outreach_drafts`

### College API (`/api/colleges/*`)
- **Search**: Queries `colleges` with filters
- **Save**: Creates entries in `saved_colleges`

## 🚨 Migration Notes

### From Mock Data
- **Before**: APIs returned hardcoded JSON responses
- **After**: All data comes from database with proper relationships

### Backward Compatibility
- API response formats remain the same
- Column names match existing code expectations
- JSONB fields preserve complex data structures

## 🛠️ Development Tips

### Adding New Activity Types
Update the CHECK constraint:
```sql
ALTER TABLE activities DROP CONSTRAINT activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check 
  CHECK (type IN (...existing_types..., 'new_type'));
```

### Adding New College Data
```sql
INSERT INTO colleges (name, location, state, city, type, ...)
VALUES (...);
```

### Querying JSONB Fields
```sql
-- Extract from content JSONB
SELECT content->>'field_name' FROM career_roadmaps;

-- Search in JSONB
SELECT * FROM quiz_results 
WHERE answers @> '{"question_1": "answer"}';
```

## ✅ Acceptance Criteria Met

- ✅ **profiles** table with proper auth.users reference
- ✅ **career_roadmaps** with `content` JSONB for AI steps
- ✅ **quiz_results** with `answers` and `recommendations` JSONB
- ✅ **colleges** with `ranking`, `fees`, `details` fields
- ✅ **saved_colleges** with user relationships
- ✅ **activities** with proper type constraints and `details` JSONB
- ✅ **job_applications** with `resume_url` and `analysis` JSONB
- ✅ **RLS policies** enforcing `user_id = auth.uid()`
- ✅ **Performance indexes** on critical query paths
- ✅ **Sample data** populated for immediate testing
- ✅ **No more mock data fallbacks needed**

## 🎉 Result

Your Supabase database now has a complete schema that supports:
- AI-powered roadmap generation and storage
- Comprehensive quiz system with recommendations  
- College search and bookmarking
- Job hunting with resume analysis
- Activity tracking and achievements
- Real-time dashboard data
- Subscription management

**The platform is ready to use with real-time data!** 🚀