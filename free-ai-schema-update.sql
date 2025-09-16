-- ========================================================================
-- FREE AI SERVICES DATABASE SCHEMA UPDATE
-- ========================================================================
-- This script adds the necessary tables for free AI features
-- Run this in your Supabase SQL Editor after the main schema

-- ========================================================================
-- FREE AI FEATURES TABLES
-- ========================================================================

-- 1. RESUME_ANALYSES TABLE
-- Stores AI-generated resume analyses using free AI models
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resume_text TEXT NOT NULL,
    analysis_result JSONB NOT NULL DEFAULT '{}', -- AI analysis from Hugging Face/Cohere
    file_name TEXT,
    file_size INTEGER,
    ai_provider TEXT NOT NULL DEFAULT 'huggingface' CHECK (ai_provider IN ('huggingface', 'cohere', 'ollama')),
    confidence_score DECIMAL(3,2) DEFAULT 0.80 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENHANCED JOB_MATCHES TABLE (if not exists from main schema)
-- Stores job matching results with AI analysis
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    job_description TEXT NOT NULL,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    matching_skills TEXT[] NOT NULL DEFAULT '{}',
    missing_skills TEXT[] NOT NULL DEFAULT '{}',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    cover_letter TEXT,
    networking_email TEXT,
    ai_provider TEXT NOT NULL DEFAULT 'huggingface' CHECK (ai_provider IN ('huggingface', 'cohere', 'ollama')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAT_CONVERSATIONS TABLE
-- Stores chat interactions with free AI models
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used TEXT NOT NULL DEFAULT 'free-ai-model',
    provider_used TEXT NOT NULL DEFAULT 'huggingface' CHECK (provider_used IN ('huggingface', 'cohere', 'ollama', 'system-fallback')),
    usage_tokens INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.80 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER_ACTIVITIES TABLE (enhanced for AI features)
-- Enhanced activities table to track AI-related activities
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'roadmap', 'quiz', 'resume', 'job_match', 'chat', 'achievement', 
        'skill_update', 'college_saved', 'ai_analysis', 'ai_generation'
    )),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}', -- stores extra data like AI provider, confidence, etc.
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI_USAGE_ANALYTICS TABLE
-- Track AI provider usage for monitoring and optimization
CREATE TABLE IF NOT EXISTS public.ai_usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('huggingface', 'cohere', 'ollama', 'system-fallback')),
    feature TEXT NOT NULL CHECK (feature IN ('chat', 'resume_analysis', 'roadmap_generation', 'quiz_analysis', 'job_matching')),
    tokens_used INTEGER DEFAULT 0,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) SETUP FOR NEW TABLES
-- ========================================================================

-- Enable RLS on all new tables
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Update job_matches RLS if it wasn't enabled
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- RLS POLICIES FOR NEW TABLES
-- ========================================================================

-- Resume analyses policies
DROP POLICY IF EXISTS "Users can view own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can view own resume analyses" ON public.resume_analyses
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can insert own resume analyses" ON public.resume_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can update own resume analyses" ON public.resume_analyses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can delete own resume analyses" ON public.resume_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Job matches policies
DROP POLICY IF EXISTS "Users can view own job matches" ON public.job_matches;
CREATE POLICY "Users can view own job matches" ON public.job_matches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own job matches" ON public.job_matches;
CREATE POLICY "Users can insert own job matches" ON public.job_matches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own job matches" ON public.job_matches;
CREATE POLICY "Users can update own job matches" ON public.job_matches
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own job matches" ON public.job_matches;
CREATE POLICY "Users can delete own job matches" ON public.job_matches
    FOR DELETE USING (auth.uid() = user_id);

-- Chat conversations policies
DROP POLICY IF EXISTS "Users can view own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own chat conversations" ON public.chat_conversations
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can insert own chat conversations" ON public.chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- User activities policies  
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
CREATE POLICY "Users can insert own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI usage analytics policies (users can only view their own data)
DROP POLICY IF EXISTS "Users can view own AI analytics" ON public.ai_usage_analytics;
CREATE POLICY "Users can view own AI analytics" ON public.ai_usage_analytics
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service can insert AI analytics" ON public.ai_usage_analytics;
CREATE POLICY "Service can insert AI analytics" ON public.ai_usage_analytics
    FOR INSERT WITH CHECK (true); -- Allow service to insert analytics

-- ========================================================================
-- INDEXES FOR PERFORMANCE
-- ========================================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON public.resume_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_match_score ON public.job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_created_at ON public.job_matches(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_provider ON public.ai_usage_analytics(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_feature ON public.ai_usage_analytics(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_created_at ON public.ai_usage_analytics(created_at DESC);

-- ========================================================================
-- FUNCTIONS FOR AI FEATURES
-- ========================================================================

-- Function to track AI usage
CREATE OR REPLACE FUNCTION track_ai_usage(
    p_user_id UUID,
    p_provider TEXT,
    p_feature TEXT,
    p_tokens_used INTEGER DEFAULT 0,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    usage_id UUID;
BEGIN
    INSERT INTO public.ai_usage_analytics (
        user_id, provider, feature, tokens_used, success, error_message, response_time_ms
    ) VALUES (
        p_user_id, p_provider, p_feature, p_tokens_used, p_success, p_error_message, p_response_time_ms
    ) RETURNING id INTO usage_id;
    
    RETURN usage_id;
END;
$$;

-- Function to get user's recent AI activities
CREATE OR REPLACE FUNCTION get_user_ai_activities(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    activity_id UUID,
    activity_type TEXT,
    title TEXT,
    description TEXT,
    ai_generated BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.type,
        ua.title,
        ua.description,
        ua.ai_generated,
        ua.created_at
    FROM public.user_activities ua
    WHERE ua.user_id = p_user_id
    ORDER BY ua.created_at DESC
    LIMIT p_limit;
END;
$$;

-- ========================================================================
-- SAMPLE DATA FOR TESTING
-- ========================================================================

-- Insert sample AI usage data (for testing purposes)
-- This will help test the analytics and monitoring features

-- Note: This sample data will only be visible to the user who created it
-- due to RLS policies

-- Sample function to create test data for development
CREATE OR REPLACE FUNCTION create_sample_ai_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function can be called to create sample data for testing
    -- Only works if user is authenticated
    
    IF auth.uid() IS NULL THEN
        RETURN 'Error: Must be authenticated to create sample data';
    END IF;
    
    -- Insert sample activity
    INSERT INTO public.user_activities (user_id, type, title, description, ai_generated)
    VALUES (
        auth.uid(),
        'ai_analysis',
        'Resume Analyzed with Free AI',
        'Resume analyzed using Hugging Face models',
        true
    );
    
    RETURN 'Sample AI data created successfully';
END;
$$;

-- ========================================================================
-- COMPLETION MESSAGE
-- ========================================================================

-- Add a comment to indicate successful completion
COMMENT ON TABLE public.resume_analyses IS 'Free AI resume analysis results from Hugging Face, Cohere, and Ollama';
COMMENT ON TABLE public.job_matches IS 'AI-powered job matching with free models';
COMMENT ON TABLE public.chat_conversations IS 'Chat interactions with free AI providers';
COMMENT ON TABLE public.user_activities IS 'Enhanced activity tracking including AI-generated content';
COMMENT ON TABLE public.ai_usage_analytics IS 'Analytics for monitoring free AI provider usage and performance';

-- Success message
SELECT 'Free AI schema setup completed successfully! 🤖✅' as setup_status;