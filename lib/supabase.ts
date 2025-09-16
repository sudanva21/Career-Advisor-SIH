import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL')
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Client-side Supabase client (singleton)
export const supabase = (() => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
      console.log('✅ Supabase client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error)
      throw error
    }
  }
  return supabaseInstance
})()

// Client component client (for use in client components)
export const createSupabaseClient = () => createClientComponentClient()

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'premium'
          subscription_status: 'active' | 'cancelled' | 'expired'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'premium'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'premium'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          career_path: string
          score: number
          interests: string[]
          skills: string[]
          answers: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          career_path: string
          score: number
          interests: string[]
          skills: string[]
          answers: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          career_path?: string
          score?: number
          interests?: string[]
          skills?: string[]
          answers?: any
        }
      }
      saved_colleges: {
        Row: {
          id: string
          user_id: string
          college_id: string
          college_name: string
          college_location: string
          college_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          college_name: string
          college_location: string
          college_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          college_name?: string
          college_location?: string
          college_type?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          location: string
          state: string
          city: string
          type: string
          established: number
          website: string | null
          courses: string[]
          rating: number
          fees: string
          cutoff: string
          latitude: number
          longitude: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          state: string
          city: string
          type: string
          established: number
          website?: string | null
          courses: string[]
          rating: number
          fees: string
          cutoff: string
          latitude: number
          longitude: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          state?: string
          city?: string
          type?: string
          established?: number
          website?: string | null
          courses?: string[]
          rating?: number
          fees?: string
          cutoff?: string
          latitude?: number
          longitude?: number
          updated_at?: string
        }
      }
      career_roadmaps: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          career_goal: string
          current_level: string
          duration: number
          content: any
          nodes: any
          connections: any
          ai_generated: boolean
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          career_goal: string
          current_level: string
          duration?: number
          content?: any
          nodes?: any
          connections?: any
          ai_generated?: boolean
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          career_goal?: string
          current_level?: string
          duration?: number
          content?: any
          nodes?: any
          connections?: any
          ai_generated?: boolean
          progress?: number
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']