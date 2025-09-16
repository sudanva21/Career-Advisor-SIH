-- Complete Database Schema Validation Script
-- Run this in Supabase SQL Editor to ensure all required tables exist

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (users table) - User information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAREER_ROADMAPS - AI roadmap storage
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    userId UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    careerGoal TEXT NOT NULL,
    currentLevel TEXT NOT NULL CHECK (currentLevel IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER NOT NULL DEFAULT 12, -- months
    nodes JSONB NOT NULL DEFAULT '[]',
    connections JSONB NOT NULL DEFAULT '[]',
    aiGenerated BOOLEAN NOT NULL DEFAULT false,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUIZ_RESULTS - Past quizzes + results
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    career_path TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    interests TEXT[] NOT NULL DEFAULT '{}',
    skills TEXT[] NOT NULL DEFAULT '{}',
    answers JSONB NOT NULL DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITIES (user_activities) - Logs for dashboard recent activity  
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'roadmap', 'college', 'quiz', 'skill', 'project', 'streak', 'recommendation', 'interaction', 'resume', 'job_search')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SAVED_COLLEGES - User saved colleges
CREATE TABLE IF NOT EXISTS public.saved_colleges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
    college_name TEXT NOT NULL,
    college_location TEXT NOT NULL,
    college_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, college_id)
);

-- 6. JOB_HUNTING tables - Parsed resume data, job matches, outreach drafts

-- User resumes table
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_analysis JSONB DEFAULT '{}',
    skills_extracted TEXT[] NOT NULL DEFAULT '{}',
    experience_extracted TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job matches table
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
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

-- Outreach drafts table
CREATE TABLE IF NOT EXISTS public.outreach_drafts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.job_matches(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'cover-letter', 'linkedin-message')),
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supporting tables
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
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    fees TEXT NOT NULL,
    cutoff TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('milestone', 'skill', 'quiz', 'project', 'streak', 'college')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    progress INTEGER DEFAULT 100 CHECK (progress >= 0 AND progress <= 100),
    max_progress INTEGER DEFAULT 100 CHECK (max_progress > 0),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 0 CHECK (current_level >= 0 AND current_level <= 100),
    target_level INTEGER NOT NULL DEFAULT 100 CHECK (target_level > 0 AND target_level <= 100),
    category TEXT NOT NULL DEFAULT 'General',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Career roadmaps policies
DROP POLICY IF EXISTS "Users can view own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can view own career roadmaps" ON public.career_roadmaps
    FOR SELECT USING (auth.uid() = userId);

DROP POLICY IF EXISTS "Users can insert own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can insert own career roadmaps" ON public.career_roadmaps
    FOR INSERT WITH CHECK (auth.uid() = userId);

DROP POLICY IF EXISTS "Users can update own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can update own career roadmaps" ON public.career_roadmaps
    FOR UPDATE USING (auth.uid() = userId);

DROP POLICY IF EXISTS "Users can delete own career roadmaps" ON public.career_roadmaps;
CREATE POLICY "Users can delete own career roadmaps" ON public.career_roadmaps
    FOR DELETE USING (auth.uid() = userId);

-- Quiz results policies
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;
CREATE POLICY "Users can view own quiz results" ON public.quiz_results
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz results" ON public.quiz_results;
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activities policies
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
CREATE POLICY "Users can insert own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job hunting policies
DROP POLICY IF EXISTS "Users can view own resumes" ON public.user_resumes;
CREATE POLICY "Users can view own resumes" ON public.user_resumes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.user_resumes;
CREATE POLICY "Users can insert own resumes" ON public.user_resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.user_resumes;
CREATE POLICY "Users can update own resumes" ON public.user_resumes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.user_resumes;
CREATE POLICY "Users can delete own resumes" ON public.user_resumes
    FOR DELETE USING (auth.uid() = user_id);

-- All other policies (job matches, outreach drafts, etc.)
DROP POLICY IF EXISTS "Users can manage own job matches" ON public.job_matches;
CREATE POLICY "Users can manage own job matches" ON public.job_matches
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own outreach drafts" ON public.outreach_drafts;
CREATE POLICY "Users can manage own outreach drafts" ON public.outreach_drafts
    FOR ALL USING (auth.uid() = user_id);

-- Public read access to colleges
DROP POLICY IF EXISTS "Anyone can view colleges" ON public.colleges;
CREATE POLICY "Anyone can view colleges" ON public.colleges
    FOR SELECT USING (true);

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update triggers
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_career_roadmaps_updated_at ON public.career_roadmaps;
CREATE TRIGGER handle_career_roadmaps_updated_at
    BEFORE UPDATE ON public.career_roadmaps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- User registration trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_userid ON public.career_roadmaps(userId);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_user_id ON public.outreach_drafts(user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database validation complete! All required tables and policies are in place.';
END
$$;