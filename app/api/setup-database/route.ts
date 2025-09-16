import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Setting up database tables...')

    // Create career_roadmaps table using raw SQL
    const createRoadmapsTable = `
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
    `

    // Create activities table
    const createActivitiesTable = `
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Enable RLS
    const enableRLS = `
      ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
      ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    `

    // Create policies
    const createPolicies = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_roadmaps' AND policyname = 'Users can manage own roadmaps') THEN
          CREATE POLICY "Users can manage own roadmaps" ON career_roadmaps
            FOR ALL USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Users can manage own activities') THEN
          CREATE POLICY "Users can manage own activities" ON activities
            FOR ALL USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `

    // Execute the SQL commands
    const sqlCommands = [
      createRoadmapsTable,
      createActivitiesTable,
      enableRLS,
      createPolicies
    ]

    for (const sql of sqlCommands) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql })
      if (error) {
        console.error('❌ SQL execution failed:', error)
        // Continue with next command even if one fails
      }
    }

    // Test if tables were created by trying to select from them
    const { data: roadmapsTest, error: roadmapsError } = await supabaseAdmin
      .from('career_roadmaps')
      .select('id')
      .limit(1)

    const { data: activitiesTest, error: activitiesError } = await supabaseAdmin
      .from('activities')
      .select('id')
      .limit(1)

    const results = {
      career_roadmaps: roadmapsError ? { error: roadmapsError.message } : { success: true },
      activities: activitiesError ? { error: activitiesError.message } : { success: true }
    }

    console.log('✅ Database setup completed:', results)

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      tables: results
    })

  } catch (error: any) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json({
      error: 'Failed to setup database',
      details: error.message
    }, { status: 500 })
  }
}