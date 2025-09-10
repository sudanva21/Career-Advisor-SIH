-- Step 6: Database Fix - Activities Logging Schema Update
-- Add SQL to ensure proper schema for activities table

-- Update activities table to support the new activity types
ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_type_check;
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_type_check 
CHECK (type IN ('roadmap_generated','quiz_completed','job_analyzed','achievement','roadmap','college','skill','project','streak','recommendation','interaction'));

-- Add details column if it doesn't exist (matching requirements)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activities' AND column_name='details') THEN
        ALTER TABLE public.user_activities ADD COLUMN details JSONB DEFAULT '{}';
    END IF;
END $$;

-- Rename metadata to details if needed (to match requirements exactly)
-- Note: Using details as the standardized column name

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_details ON public.user_activities USING GIN (details);

-- Create activities table as described in requirements if doesn't exist
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('roadmap_generated','quiz_completed','job_analyzed')),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to read only their own activities
DROP POLICY IF EXISTS "Users can view their activities" ON public.activities;
CREATE POLICY "Users can view their activities"
ON public.activities FOR SELECT
USING (auth.uid() = user_id);

-- Policy: allow users to insert their own activities
DROP POLICY IF EXISTS "Users can insert their activities" ON public.activities;
CREATE POLICY "Users can insert their activities"
ON public.activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.activities TO anon, authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_details ON public.activities USING GIN (details);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Activities table schema updated successfully!';
END
$$;