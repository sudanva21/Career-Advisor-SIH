import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create career_roadmaps table if it doesn't exist
    const createTableQuery = `
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

    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableQuery 
    })

    if (error) {
      // Try alternative approach with direct SQL execution
      console.log('RPC failed, trying raw query...')
      const { data: queryData, error: queryError } = await supabase
        .from('_placeholder')
        .select('*')
        .limit(0)

      return NextResponse.json({ 
        error: 'Unable to create table. Please create it manually in Supabase SQL Editor:',
        sql: createTableQuery,
        originalError: error.message 
      }, { status: 500 })
    }

    // Create activities table if it doesn't exist
    const createActivitiesQuery = `
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    await supabase.rpc('exec_sql', { sql: createActivitiesQuery })

    return NextResponse.json({ 
      success: true, 
      message: 'Tables created successfully',
      tables: ['career_roadmaps', 'activities']
    })

  } catch (error: any) {
    console.error('❌ Setup error:', error)
    return NextResponse.json({
      error: 'Failed to setup database tables',
      details: error.message
    }, { status: 500 })
  }
}