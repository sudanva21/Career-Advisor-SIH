#!/usr/bin/env node

/**
 * Database Setup Checker
 * This script checks if all required tables exist in the Supabase database
 * and creates them if they're missing.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables manually from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    return {}
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
    }
  })
  
  return env
}

const env = loadEnvFile()

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please check your .env.local file for:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const REQUIRED_TABLES = [
  'users',
  'quiz_results', 
  'saved_colleges',
  'career_roadmaps',
  'user_activities',
  'user_achievements', 
  'user_skills',
  'colleges'
]

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return { exists: false, error: error.message }
      }
      return { exists: false, error: error.message }
    }
    
    return { exists: true, count: data }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}

async function createMissingTables() {
  console.log('📊 Checking database setup...\n')
  
  const results = []
  let missingTables = []
  
  for (const table of REQUIRED_TABLES) {
    const result = await checkTableExists(table)
    results.push({ table, ...result })
    
    if (!result.exists) {
      missingTables.push(table)
    }
    
    const status = result.exists ? '✅' : '❌'
    const message = result.exists ? 'EXISTS' : `MISSING: ${result.error}`
    console.log(`${status} ${table}: ${message}`)
  }
  
  console.log(`\n📈 Summary: ${results.filter(r => r.exists).length}/${REQUIRED_TABLES.length} tables exist`)
  
  if (missingTables.length > 0) {
    console.log(`\n❌ Missing tables: ${missingTables.join(', ')}`)
    console.log('\n🔧 To fix this, run the SQL schema in your Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of supabase-schema.sql')
    console.log('4. Execute the script')
    
    // Try to run the schema automatically if service role key is available
    try {
      const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql')
      if (fs.existsSync(schemaPath)) {
        console.log('\n🚀 Attempting to create tables automatically...')
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        // Split schema into individual statements and execute them
        const statements = schema
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))
        
        for (const statement of statements) {
          if (statement.includes('CREATE TABLE') || statement.includes('CREATE POLICY') || statement.includes('INSERT INTO')) {
            try {
              const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
              if (error && !error.message.includes('already exists')) {
                console.warn(`⚠️  Warning: ${error.message}`)
              }
            } catch (err) {
              // Ignore errors for already existing objects
              if (!err.message.includes('already exists')) {
                console.warn(`⚠️  Warning: ${err.message}`)
              }
            }
          }
        }
        
        console.log('✅ Schema execution completed')
        
        // Re-check tables
        console.log('\n🔍 Re-checking tables...')
        for (const table of missingTables) {
          const result = await checkTableExists(table)
          const status = result.exists ? '✅' : '❌'
          console.log(`${status} ${table}: ${result.exists ? 'CREATED' : 'STILL MISSING'}`)
        }
        
      }
    } catch (error) {
      console.log(`\n⚠️  Automatic setup failed: ${error.message}`)
      console.log('Please run the schema manually in Supabase SQL Editor')
    }
  } else {
    console.log('\n✅ All required tables exist! Database is properly configured.')
  }
  
  return results
}

async function main() {
  try {
    await createMissingTables()
  } catch (error) {
    console.error('💥 Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { checkTableExists, createMissingTables }