-- ========================================================================
-- FIXED FINAL COMPLETE DATABASE SCHEMA FOR CAREER ADVISOR PLATFORM
-- ========================================================================
-- This version handles existing triggers and policies gracefully
-- Run this entire file in Supabase SQL Editor to create everything at once

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- CORE USER TABLES
-- ========================================================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- CAREER & LEARNING TABLES
-- ========================================================================

-- 2. CAREER_ROADMAPS TABLE
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    career_goal TEXT NOT NULL,
    current_level TEXT NOT NULL CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER NOT NULL DEFAULT 12, -- months
    content JSONB NOT NULL DEFAULT '{}', -- stores AI-generated roadmap steps
    nodes JSONB NOT NULL DEFAULT '[]',
    connections JSONB NOT NULL DEFAULT '[]',
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUIZ_RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    career_path TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    interests TEXT[] NOT NULL DEFAULT '{}',
    skills TEXT[] NOT NULL DEFAULT '{}',
    answers JSONB NOT NULL DEFAULT '{}', -- stores quiz answers
    recommendations JSONB DEFAULT '{}', -- AI recommendations  
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- COLLEGE SYSTEM TABLES
-- ========================================================================

-- 4. COLLEGES TABLE - Master database with comprehensive info
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Government', 'Private', 'Deemed')),
    established INTEGER NOT NULL CHECK (established > 1800),
    website TEXT,
    courses TEXT[] NOT NULL DEFAULT '{}',
    ranking INTEGER,
    fees INTEGER, -- fees in rupees
    rating DECIMAL(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    cutoff TEXT NOT NULL DEFAULT 'Not Available',
    details JSONB DEFAULT '{}', -- additional college information
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SAVED_COLLEGES TABLE - User's bookmarked colleges
CREATE TABLE IF NOT EXISTS public.saved_colleges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
    college_name TEXT NOT NULL,
    college_location TEXT NOT NULL,
    college_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, college_id)
);

-- ========================================================================
-- JOB HUNTING SYSTEM TABLES
-- ========================================================================

-- 6. JOB_APPLICATIONS TABLE - AI Job Hunter feature
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    resume_url TEXT, -- URL to uploaded resume
    resume_content TEXT,
    analysis JSONB DEFAULT '{}', -- AI resume analysis result
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'interviewing', 'rejected', 'offered', 'accepted')),
    applied_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User resumes table for storing uploaded resumes
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_analysis JSONB DEFAULT '{}',
    skills_extracted TEXT[] NOT NULL DEFAULT '{}',
    experience_extracted TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job matches table for AI job matching
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    job_data JSONB NOT NULL DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'applied', 'rejected', 'interviewing', 'offered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outreach drafts table for AI-generated emails and cover letters
CREATE TABLE IF NOT EXISTS public.outreach_drafts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.job_matches(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'cover-letter', 'linkedin-message')),
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ACTIVITY & ACHIEVEMENT SYSTEM
-- ========================================================================

-- 7. ACTIVITIES TABLE - Tracks all user activities for dashboard
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('roadmap_generated', 'quiz_completed', 'job_applied', 'college_saved', 'achievement_unlocked', 'skill_updated', 'resume_uploaded')),
    title TEXT NOT NULL,
    description TEXT,
    details JSONB DEFAULT '{}', -- stores extra metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy table - keeping for backward compatibility during migration
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'roadmap', 'college', 'quiz', 'skill', 'project', 'streak', 'recommendation', 'interaction', 'resume', 'job_search')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table for gamification
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('milestone', 'skill', 'quiz', 'project', 'streak', 'college')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon TEXT NOT NULL DEFAULT '🏆',
    category TEXT NOT NULL DEFAULT 'General',
    progress INTEGER DEFAULT 100 CHECK (progress >= 0 AND progress <= 100),
    max_progress INTEGER DEFAULT 100 CHECK (max_progress > 0),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- User skills tracking for progress monitoring
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 0 CHECK (current_level >= 0 AND current_level <= 100),
    target_level INTEGER NOT NULL DEFAULT 100 CHECK (target_level > 0 AND target_level <= 100),
    category TEXT NOT NULL DEFAULT 'General',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- ========================================================================
-- SUBSCRIPTION & PAYMENT SYSTEM
-- ========================================================================

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    razorpay_subscription_id TEXT,
    plan_id TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history table
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'razorpay')),
    payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ========================================================================

-- Enable RLS on all user-specific tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- RLS POLICIES (Drop existing first, then recreate)
-- ========================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Career roadmaps policies
DROP POLICY IF EXISTS "Users can view own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can view own career roadmaps" ON public.career_roadmaps
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can insert own career roadmaps" ON public.career_roadmaps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can update own career roadmaps" ON public.career_roadmaps
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can delete own career roadmaps" ON public.career_roadmaps
    FOR DELETE USING (auth.uid() = user_id);

-- Quiz results policies
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;
CREATE POLICY "Users can view own quiz results" ON public.quiz_results
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz results" ON public.quiz_results;
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz results" ON public.quiz_results;
CREATE POLICY "Users can update own quiz results" ON public.quiz_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Colleges policies (public read access)
DROP POLICY IF EXISTS "Anyone can view colleges" ON public.colleges;
CREATE POLICY "Anyone can view colleges" ON public.colleges
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage colleges" ON public.colleges;
CREATE POLICY "Admins can manage colleges" ON public.colleges
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Saved colleges policies
DROP POLICY IF EXISTS "Users can view own saved colleges" ON public.saved_colleges;
CREATE POLICY "Users can view own saved colleges" ON public.saved_colleges
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved colleges" ON public.saved_colleges;
CREATE POLICY "Users can insert own saved colleges" ON public.saved_colleges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved colleges" ON public.saved_colleges;
CREATE POLICY "Users can delete own saved colleges" ON public.saved_colleges
    FOR DELETE USING (auth.uid() = user_id);

-- Activities policies (both tables)
DROP POLICY IF EXISTS "Users can view own activities" ON public.activities;
CREATE POLICY "Users can view own activities" ON public.activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON public.activities;
CREATE POLICY "Users can insert own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own user_activities" ON public.user_activities;
CREATE POLICY "Users can view own user_activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_activities" ON public.user_activities;
CREATE POLICY "Users can insert own user_activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job system policies
DROP POLICY IF EXISTS "Users can manage own job applications" ON public.job_applications;
CREATE POLICY "Users can manage own job applications" ON public.job_applications
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own resumes" ON public.user_resumes;
CREATE POLICY "Users can manage own resumes" ON public.user_resumes
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own job matches" ON public.job_matches;
CREATE POLICY "Users can manage own job matches" ON public.job_matches
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own outreach drafts" ON public.outreach_drafts;
CREATE POLICY "Users can manage own outreach drafts" ON public.outreach_drafts
    FOR ALL USING (auth.uid() = user_id);

-- User progress policies
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.user_achievements;
CREATE POLICY "Users can manage own achievements" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own skills" ON public.user_skills;
CREATE POLICY "Users can manage own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- Subscription policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own payment history" ON public.payment_history;
CREATE POLICY "Users can manage own payment history" ON public.payment_history
    FOR ALL USING (auth.uid() = user_id);

-- ========================================================================
-- FUNCTIONS & TRIGGERS (Drop existing first)
-- ========================================================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables (drop first)
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_career_roadmaps_updated_at ON public.career_roadmaps;
CREATE TRIGGER handle_career_roadmaps_updated_at
    BEFORE UPDATE ON public.career_roadmaps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_colleges_updated_at ON public.colleges;
CREATE TRIGGER handle_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER handle_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_resumes_updated_at ON public.user_resumes;
CREATE TRIGGER handle_user_resumes_updated_at
    BEFORE UPDATE ON public.user_resumes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_job_matches_updated_at ON public.job_matches;
CREATE TRIGGER handle_job_matches_updated_at
    BEFORE UPDATE ON public.job_matches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_outreach_drafts_updated_at ON public.outreach_drafts;
CREATE TRIGGER handle_outreach_drafts_updated_at
    BEFORE UPDATE ON public.outreach_drafts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER handle_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 
                 CONCAT(
                     COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                     ' ',
                     COALESCE(NEW.raw_user_meta_data->>'last_name', '')
                 )
                )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================
-- PERFORMANCE INDEXES (Create if not exists)
-- ========================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_id ON public.career_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_created_at ON public.career_roadmaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON public.quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_colleges_user_id ON public.saved_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_match_score ON public.job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_user_id ON public.outreach_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON public.colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_rating ON public.colleges(rating DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_content ON public.career_roadmaps USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_quiz_results_answers ON public.quiz_results USING GIN (answers);
CREATE INDEX IF NOT EXISTS idx_activities_details ON public.activities USING GIN (details);
CREATE INDEX IF NOT EXISTS idx_user_activities_metadata ON public.user_activities USING GIN (metadata);

-- ========================================================================
-- SAMPLE DATA INSERTION
-- ========================================================================

-- Insert sample colleges data (only if they don't already exist)
INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude, ranking) 
SELECT 'Indian Institute of Technology Delhi', 'Hauz Khas, New Delhi', 'Delhi', 'New Delhi', 'Government', 1961, 'https://home.iitd.ac.in', ARRAY['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'], 4.8, 250000, 'JEE Rank 1-500', 28.5449, 77.1928, 2
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'Indian Institute of Technology Delhi');

INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude, ranking) 
SELECT 'Birla Institute of Technology and Science', 'Pilani, Rajasthan', 'Rajasthan', 'Pilani', 'Private', 1964, 'https://www.bits-pilani.ac.in', ARRAY['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'], 4.6, 450000, 'BITSAT 350+', 28.3670, 75.5886, 25
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'Birla Institute of Technology and Science');

INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude, ranking) 
SELECT 'Delhi Technological University', 'Shahbad Daulatpur, Delhi', 'Delhi', 'New Delhi', 'Government', 1941, 'http://www.dtu.ac.in', ARRAY['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'], 4.4, 175000, 'JEE Rank 3000-8000', 28.7501, 77.1177, 45
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'Delhi Technological University');

INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude, ranking) 
SELECT 'Manipal Institute of Technology', 'Manipal, Karnataka', 'Karnataka', 'Manipal', 'Private', 1957, 'https://manipal.edu', ARRAY['Computer Science', 'Information Technology', 'Mechanical', 'Aeronautical', 'Biomedical'], 4.3, 400000, 'MET Rank 1-5000', 13.3475, 74.7869, 55
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'Manipal Institute of Technology');

INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude, ranking) 
SELECT 'Vellore Institute of Technology', 'Vellore, Tamil Nadu', 'Tamil Nadu', 'Vellore', 'Private', 1984, 'https://vit.ac.in', ARRAY['Computer Science', 'Electronics', 'Biotechnology', 'Chemical', 'Mechanical'], 4.2, 275000, 'VITEEE Rank 1-10000', 12.9716, 79.1588, 38
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'Vellore Institute of Technology');

INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude, ranking) 
SELECT 'National Institute of Technology Trichy', 'Tiruchirappalli, Tamil Nadu', 'Tamil Nadu', 'Tiruchirappalli', 'Government', 1964, 'https://www.nitt.edu', ARRAY['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'], 4.7, 175000, 'JEE Rank 800-3000', 10.7596, 78.8149, 8
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'National Institute of Technology Trichy');

-- ========================================================================
-- PERMISSIONS & GRANTS
-- ========================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Specific grants for specific tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.career_roadmaps TO authenticated;
GRANT ALL ON public.quiz_results TO authenticated;
GRANT ALL ON public.saved_colleges TO authenticated;
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.user_activities TO authenticated;
GRANT ALL ON public.job_applications TO authenticated;
GRANT ALL ON public.user_resumes TO authenticated;
GRANT ALL ON public.job_matches TO authenticated;
GRANT ALL ON public.outreach_drafts TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_skills TO authenticated;
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.payment_history TO authenticated;
GRANT SELECT ON public.colleges TO anon, authenticated;

-- ========================================================================
-- COMPLETION MESSAGE
-- ========================================================================

SELECT '🎉 DATABASE SCHEMA CREATED SUCCESSFULLY!' as status,
       'All tables, RLS policies, indexes, and sample data have been set up.' as message,
       'Your Career Advisor Platform is ready to use!' as next_step;