-- Job Hunting Feature Database Schema
-- Add these tables to your Supabase database

-- User resumes table for storing uploaded resumes and AI analysis
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

-- Job matches table for storing job search results
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

-- Outreach drafts table for storing AI-generated emails and cover letters
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

-- Row Level Security for job hunting tables
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_drafts ENABLE ROW LEVEL SECURITY;

-- Policies for user_resumes
CREATE POLICY "Users can view own resumes" ON public.user_resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.user_resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.user_resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.user_resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for job_matches
CREATE POLICY "Users can view own job matches" ON public.job_matches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job matches" ON public.job_matches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job matches" ON public.job_matches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job matches" ON public.job_matches
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for outreach_drafts
CREATE POLICY "Users can view own outreach drafts" ON public.outreach_drafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outreach drafts" ON public.outreach_drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outreach drafts" ON public.outreach_drafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outreach drafts" ON public.outreach_drafts
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_match_score ON public.job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_user_id ON public.outreach_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_job_id ON public.outreach_drafts(job_id);

-- Triggers for updated_at
CREATE TRIGGER handle_user_resumes_updated_at
    BEFORE UPDATE ON public.user_resumes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_job_matches_updated_at
    BEFORE UPDATE ON public.job_matches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_outreach_drafts_updated_at
    BEFORE UPDATE ON public.outreach_drafts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.user_resumes TO anon, authenticated;
GRANT ALL ON public.job_matches TO anon, authenticated;
GRANT ALL ON public.outreach_drafts TO anon, authenticated;