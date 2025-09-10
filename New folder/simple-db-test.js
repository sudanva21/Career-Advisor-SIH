// Simple test to validate database schema issues
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
function loadEnvVars() {
  const envPath = path.join(__dirname, '.env.local');
  const envVars = {};
  
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error.message);
    return null;
  }
  
  return envVars;
}

async function testSchemaIssues() {
  console.log('🔍 Testing Database Schema Issues...\n');

  const envVars = loadEnvVars();
  if (!envVars) {
    process.exit(1);
  }

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables in .env.local');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log('   Supabase URL:', supabaseUrl);
  console.log('   API Key:', supabaseKey.substring(0, 20) + '...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test the exact query that's causing issues in the dashboard API
  console.log('📊 Testing Dashboard API Query (career_roadmaps)...');
  try {
    const { data, error } = await supabase
      .from('career_roadmaps')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Query failed with error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      
      if (error.message.includes('user_id') || error.message.includes('userId')) {
        console.log('\n🎯 CONFIRMED: This is the column naming issue!');
        console.log('   The API expects user_id but the table has userId');
        console.log('   Solution: Run the migration script fix-column-naming-migration.sql');
      }
    } else {
      console.log('✅ career_roadmaps query successful!');
      console.log('   Tables are properly configured.');
    }
  } catch (err) {
    console.error('❌ Network or connection error:', err.message);
  }

  // Test other tables that should work
  console.log('\n📊 Testing Other Tables...');
  
  const testTables = ['quiz_results', 'colleges', 'activities'];
  
  for (const tableName of testTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${tableName} query failed:`, error.message);
      } else {
        console.log(`✅ ${tableName} query successful`);
      }
    } catch (err) {
      console.error(`❌ ${tableName} test error:`, err.message);
    }
  }

  console.log('\n========================================================================');
  console.log('🎯 NEXT STEPS:');
  console.log('1. If you saw column naming errors above:');
  console.log('   - Open Supabase SQL Editor');
  console.log('   - Run: fix-column-naming-migration.sql');
  console.log('2. If no errors:');
  console.log('   - Your schema is already correct!');
  console.log('   - Test the actual application at http://localhost:3000');
  console.log('========================================================================');
}

testSchemaIssues().catch(console.error);