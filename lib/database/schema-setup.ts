/**
 * Database Schema Setup Utilities
 * Handles missing table scenarios and provides graceful fallbacks
 */

import { createClient } from '@supabase/supabase-js'

const MISSING_TABLE_CODES = ['PGRST205', '42P01', '42501']

export interface TableCheckResult {
  exists: boolean
  error?: string
  code?: string
}

export async function checkTableExists(supabase: any, tableName: string): Promise<TableCheckResult> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      return { 
        exists: false, 
        error: error.message,
        code: error.code 
      }
    }
    
    return { exists: true }
  } catch (err: any) {
    return { 
      exists: false, 
      error: err.message,
      code: err.code 
    }
  }
}

export function isTableMissingError(error: any): boolean {
  if (!error) return false
  return MISSING_TABLE_CODES.includes(error.code) || 
         error.message?.includes('does not exist') ||
         error.message?.includes('Could not find the table')
}

export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T[] | null, error: any }>,
  tableName: string,
  fallbackData: T[] = []
): Promise<{ data: T[], error: any, tableExists: boolean }> {
  try {
    const { data, error } = await queryFn()
    
    if (error && isTableMissingError(error)) {
      console.warn(`⚠️  Table '${tableName}' doesn't exist, using fallback data`)
      return { 
        data: fallbackData, 
        error: null, 
        tableExists: false 
      }
    }
    
    if (error) {
      console.error(`❌ Error querying ${tableName}:`, error)
      return { 
        data: fallbackData, 
        error, 
        tableExists: true 
      }
    }
    
    return { 
      data: data || fallbackData, 
      error: null, 
      tableExists: true 
    }
  } catch (err) {
    console.error(`💥 Exception querying ${tableName}:`, err)
    return { 
      data: fallbackData, 
      error: err, 
      tableExists: false 
    }
  }
}

export const SCHEMA_CHECK_QUERIES = {
  async checkAllTables(supabase: any) {
    const tables = [
      'users', 'quiz_results', 'saved_colleges', 
      'career_roadmaps', 'user_activities', 
      'user_achievements', 'user_skills', 'colleges'
    ]
    
    const results = await Promise.allSettled(
      tables.map(table => checkTableExists(supabase, table))
    )
    
    const tableStatus: Record<string, TableCheckResult> = {}
    tables.forEach((table, index) => {
      const result = results[index]
      tableStatus[table] = result.status === 'fulfilled' 
        ? result.value 
        : { exists: false, error: 'Check failed' }
    })
    
    return tableStatus
  }
}

/**
 * Get demo data for missing tables
 */
export const DEMO_DATA = {
  users: [],
  quiz_results: [],
  saved_colleges: [],
  career_roadmaps: [],
  user_activities: [
    {
      id: 'demo-1',
      user_id: 'demo-user',
      type: 'achievement',
      title: 'Demo Activity',
      description: 'Database not configured, showing demo mode',
      created_at: new Date().toISOString()
    }
  ],
  user_achievements: [],
  user_skills: [],
  colleges: []
} as const

export function getDemoData(tableName: keyof typeof DEMO_DATA) {
  return DEMO_DATA[tableName] || []
}