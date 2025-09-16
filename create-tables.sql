-- Career roadmaps table
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  career_goal TEXT,
  current_level TEXT,
  duration INTEGER,
  nodes JSONB,
  connections JSONB,
  ai_generated BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for career_roadmaps
CREATE POLICY "Users can view their own roadmaps" ON career_roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps" ON career_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" ON career_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" ON career_roadmaps
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for activities
CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_id ON career_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_created_at ON career_roadmaps(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);