-- Create activities table with proper schema for logging user actions
-- This table will store all user activities like roadmap generation, quiz completion, etc.

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS activities;

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('roadmap_generated', 'quiz_completed', 'job_analyzed', 'skill_updated', 'college_saved', 'achievement_unlocked')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their activities" ON activities;
DROP POLICY IF EXISTS "Users can insert their activities" ON activities;
DROP POLICY IF EXISTS "Users can update their activities" ON activities;

-- Policy: allow users to read only their own activities
CREATE POLICY "Users can view their activities"
ON activities FOR SELECT
USING (auth.uid() = user_id);

-- Policy: allow users to insert their own activities
CREATE POLICY "Users can insert their activities"
ON activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: allow users to update their own activities (for metadata updates)
CREATE POLICY "Users can update their activities"
ON activities FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_type_idx ON activities(type);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS activities_updated_at_trigger ON activities;
CREATE TRIGGER activities_updated_at_trigger
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();

-- Insert sample activities for demo user (optional)
-- These will be visible in the dashboard for testing
INSERT INTO activities (user_id, type, title, description, details) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::uuid, -- demo user ID
    'achievement',
    'Welcome to Career Advisor!',
    'Started your career discovery journey',
    '{"achievement_type": "onboarding", "points": 10}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'college',
    'Explore Colleges',
    'Check out top engineering colleges across India',
    '{"action": "browse_colleges", "section": "engineering"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'quiz',
    'Take Career Quiz',
    'Discover your ideal career path with AI-powered assessment',
    '{"action": "quiz_prompt", "quiz_type": "career_assessment"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;