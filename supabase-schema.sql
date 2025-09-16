-- Career Advisor Platform Database Schema
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    career_path TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    interests TEXT[] NOT NULL DEFAULT '{}',
    skills TEXT[] NOT NULL DEFAULT '{}',
    answers JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colleges table
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

-- Saved colleges table
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

-- Career roadmaps table
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

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Quiz results policies
CREATE POLICY "Users can view own quiz results" ON public.quiz_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON public.quiz_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz results" ON public.quiz_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Saved colleges policies
CREATE POLICY "Users can view own saved colleges" ON public.saved_colleges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved colleges" ON public.saved_colleges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved colleges" ON public.saved_colleges
    FOR DELETE USING (auth.uid() = user_id);

-- Career roadmaps policies
CREATE POLICY "Users can view own career roadmaps" ON public.career_roadmaps
    FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "Users can insert own career roadmaps" ON public.career_roadmaps
    FOR INSERT WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update own career roadmaps" ON public.career_roadmaps
    FOR UPDATE USING (auth.uid() = userId);

CREATE POLICY "Users can delete own career roadmaps" ON public.career_roadmaps
    FOR DELETE USING (auth.uid() = userId);

-- Colleges policies (public read access)
CREATE POLICY "Anyone can view colleges" ON public.colleges
    FOR SELECT USING (true);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_career_roadmaps_updated_at
    BEFORE UPDATE ON public.career_roadmaps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample colleges data
INSERT INTO public.colleges (name, location, state, city, type, established, website, courses, rating, fees, cutoff, latitude, longitude) VALUES
('Indian Institute of Technology Delhi', 'Hauz Khas, New Delhi', 'Delhi', 'New Delhi', 'Government', 1961, 'https://home.iitd.ac.in', ARRAY['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'], 4.8, '₹2.5L - 3L', 'JEE Rank 1-500', 28.5449, 77.1928),
('Birla Institute of Technology and Science', 'Pilani, Rajasthan', 'Rajasthan', 'Pilani', 'Private', 1964, 'https://www.bits-pilani.ac.in', ARRAY['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'], 4.6, '₹4L - 5L', 'BITSAT 350+', 28.3670, 75.5886),
('Delhi Technological University', 'Shahbad Daulatpur, Delhi', 'Delhi', 'New Delhi', 'Government', 1941, 'http://www.dtu.ac.in', ARRAY['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'], 4.4, '₹1.5L - 2L', 'JEE Rank 3000-8000', 28.7501, 77.1177),
('Manipal Institute of Technology', 'Manipal, Karnataka', 'Karnataka', 'Manipal', 'Private', 1957, 'https://manipal.edu', ARRAY['Computer Science', 'Information Technology', 'Mechanical', 'Aeronautical', 'Biomedical'], 4.3, '₹3.5L - 4.5L', 'MET Rank 1-5000', 13.3475, 74.7869),
('Vellore Institute of Technology', 'Vellore, Tamil Nadu', 'Tamil Nadu', 'Vellore', 'Private', 1984, 'https://vit.ac.in', ARRAY['Computer Science', 'Electronics', 'Biotechnology', 'Chemical', 'Mechanical'], 4.2, '₹2L - 3L', 'VITEEE Rank 1-10000', 12.9716, 79.1588),
('National Institute of Technology Trichy', 'Tiruchirappalli, Tamil Nadu', 'Tamil Nadu', 'Tiruchirappalli', 'Government', 1964, 'https://www.nitt.edu', ARRAY['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'], 4.7, '₹1.5L - 2L', 'JEE Rank 800-3000', 10.7596, 78.8149);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON public.quiz_results(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_colleges_user_id ON public.saved_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_userid ON public.career_roadmaps(userId);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_created_at ON public.career_roadmaps(created_at);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON public.colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_rating ON public.colleges(rating);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.quiz_results TO anon, authenticated;
GRANT ALL ON public.saved_colleges TO anon, authenticated;
GRANT ALL ON public.career_roadmaps TO anon, authenticated;
GRANT SELECT ON public.colleges TO anon, authenticated;

-- User activities table for tracking all user actions
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'roadmap', 'college', 'quiz', 'skill', 'project', 'streak', 'recommendation', 'interaction')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table for tracking user achievements
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

-- User skills table for tracking skill progress
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

-- Row Level Security for new tables
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Policies for user_activities
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_skills
CREATE POLICY "Users can view own skills" ON public.user_skills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON public.user_skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON public.user_skills
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);

-- Grant permissions
GRANT ALL ON public.user_activities TO anon, authenticated;
GRANT ALL ON public.user_achievements TO anon, authenticated;
GRANT ALL ON public.user_skills TO anon, authenticated;

-- Create a function to handle user registration
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

-- Trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();