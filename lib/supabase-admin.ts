import { createClient } from '@supabase/supabase-js'

let _supabaseAdmin: any = null
let _initialized = false

// Lazy initialization function for Supabase admin client
function initializeSupabaseAdmin() {
  if (_initialized) {
    return _supabaseAdmin
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    _supabaseAdmin = null
  } else if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
    _supabaseAdmin = null
  } else {
    // Create a Supabase client with service role key for admin operations
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  _initialized = true
  return _supabaseAdmin
}

// Export a getter function instead of direct client
export const getSupabaseAdmin = () => initializeSupabaseAdmin()

// For backward compatibility, export as supabaseAdmin
export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    const client = initializeSupabaseAdmin()
    return client ? client[prop] : undefined
  }
})

// Database table operations with proper error handling
export const dbOperations = {
  // Users
  async createUser(userData: any) {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available - missing environment variables')
    }
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return data
  },

  // Quiz Results
  async getQuizResults(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to get quiz results: ${error.message}`)
    return data || []
  },

  async createQuizResult(resultData: any) {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .insert(resultData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create quiz result: ${error.message}`)
    return data
  },

  // Skill Assessments
  async getSkillAssessments(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('skill_assessments')
      .select('*')
      .eq('userId', userId)
      .order('score', { ascending: false })
    
    if (error) throw new Error(`Failed to get skills: ${error.message}`)
    return data || []
  },

  async createSkillAssessment(skillData: any) {
    const { data, error } = await supabaseAdmin
      .from('skill_assessments')
      .insert(skillData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create skill: ${error.message}`)
    return data
  },

  // Achievements
  async getAchievements(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('userId', userId)
      .order('unlockedAt', { ascending: false })
    
    if (error) throw new Error(`Failed to get achievements: ${error.message}`)
    return data || []
  },

  async createAchievement(achievementData: any) {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .insert(achievementData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create achievement: ${error.message}`)
    return data
  },

  // Saved Colleges count
  async getSavedCollegesCount(userId: string) {
    const { count, error } = await supabaseAdmin
      .from('saved_colleges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (error) throw new Error(`Failed to get saved colleges count: ${error.message}`)
    return count || 0
  },

  // Career Roadmaps
  async getCareerRoadmaps(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('career_roadmaps')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to get roadmaps: ${error.message}`)
    return data || []
  }
}