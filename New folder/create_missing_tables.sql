-- =================================================================
-- Missing Tables for Enhanced Dashboard Functionality
-- Execute this SQL in your Supabase SQL Editor
-- =================================================================

-- 1. ROADMAP_PROGRESS TABLE
-- Tracks individual step/milestone completion within roadmaps
CREATE TABLE public.roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id UUID NOT NULL REFERENCES public.career_roadmaps(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL, -- References step ID within roadmap JSON
    step_title TEXT NOT NULL,
    step_type TEXT NOT NULL DEFAULT 'skill', -- 'skill', 'project', 'milestone', 'course'
    status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, roadmap_id, step_id)
);

-- Indexes for performance
CREATE INDEX idx_roadmap_progress_user_roadmap ON public.roadmap_progress(user_id, roadmap_id);
CREATE INDEX idx_roadmap_progress_status ON public.roadmap_progress(status);
CREATE INDEX idx_roadmap_progress_completed ON public.roadmap_progress(completed_at) WHERE completed_at IS NOT NULL;

-- 2. USER_STATS TABLE  
-- Caches computed user statistics for dashboard performance
CREATE TABLE public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Quiz Statistics
    completed_quizzes INTEGER DEFAULT 0,
    avg_quiz_score DECIMAL(5,2) DEFAULT 0,
    last_quiz_date TIMESTAMP WITH TIME ZONE,
    
    -- Skill Statistics
    skills_tracked INTEGER DEFAULT 0,
    avg_skill_level DECIMAL(5,2) DEFAULT 0,
    skills_completed INTEGER DEFAULT 0,
    skills_in_progress INTEGER DEFAULT 0,
    
    -- Roadmap Statistics
    active_roadmaps INTEGER DEFAULT 0,
    completed_roadmaps INTEGER DEFAULT 0,
    roadmap_completion_rate DECIMAL(5,2) DEFAULT 0,
    total_roadmap_steps INTEGER DEFAULT 0,
    completed_roadmap_steps INTEGER DEFAULT 0,
    
    -- Achievement Statistics
    achievements_unlocked INTEGER DEFAULT 0,
    achievement_points INTEGER DEFAULT 0,
    
    -- Activity Statistics
    saved_colleges INTEGER DEFAULT 0,
    weekly_activity_score DECIMAL(5,2) DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    
    -- Engagement Metrics
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Computed Fields (JSON for flexibility)
    top_skills JSONB DEFAULT '[]', -- Top skills with progress
    weekly_progress JSONB DEFAULT '[]', -- Progress data for charts
    career_recommendations JSONB DEFAULT '[]', -- Cached AI recommendations
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_stats_last_computed ON public.user_stats(last_computed_at);

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Roadmap Progress Policies
CREATE POLICY "Users can view own roadmap progress" ON public.roadmap_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap progress" ON public.roadmap_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap progress" ON public.roadmap_progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap progress" ON public.roadmap_progress
    FOR DELETE USING (auth.uid() = user_id);

-- User Stats Policies
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_roadmap_progress_updated_at BEFORE UPDATE ON public.roadmap_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- FUNCTIONS FOR COMPUTING STATISTICS
-- =================================================================

-- Function to refresh user stats (call this periodically or after major updates)
CREATE OR REPLACE FUNCTION refresh_user_stats(target_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_stats (user_id, completed_quizzes, skills_tracked, achievements_unlocked, saved_colleges, total_activities)
    VALUES (
        target_user_id,
        (SELECT COUNT(*) FROM quiz_results WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM user_skills WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM saved_colleges WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM user_activities WHERE user_id = target_user_id)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        completed_quizzes = EXCLUDED.completed_quizzes,
        skills_tracked = EXCLUDED.skills_tracked,
        achievements_unlocked = EXCLUDED.achievements_unlocked,
        saved_colleges = EXCLUDED.saved_colleges,
        total_activities = EXCLUDED.total_activities,
        last_computed_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- =================================================================

-- This will be executed after user authentication is set up
-- You can run this manually for testing with a real user_id

/*
-- Example: Insert sample roadmap progress for testing
-- Replace 'YOUR_USER_ID_HERE' with actual user UUID

INSERT INTO public.roadmap_progress (user_id, roadmap_id, step_id, step_title, step_type, status, progress_percentage) 
VALUES 
    ('YOUR_USER_ID_HERE', (SELECT id FROM career_roadmaps LIMIT 1), 'step_1', 'Learn JavaScript Basics', 'skill', 'completed', 100),
    ('YOUR_USER_ID_HERE', (SELECT id FROM career_roadmaps LIMIT 1), 'step_2', 'Build First Project', 'project', 'in_progress', 60),
    ('YOUR_USER_ID_HERE', (SELECT id FROM career_roadmaps LIMIT 1), 'step_3', 'Master React Framework', 'skill', 'not_started', 0);

-- Example: Initialize user stats
SELECT refresh_user_stats('YOUR_USER_ID_HERE');
*/

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Run these to verify tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('roadmap_progress', 'user_stats');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'roadmap_progress';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_stats';