// Check what tables currently exist in the database
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

async function checkExistingTables() {
  console.log('🔍 Checking Existing Database Tables...\n');

  const envVars = loadEnvVars();
  if (!envVars) {
    process.exit(1);
  }

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // List of tables we expect to exist
  const expectedTables = [
    'profiles',
    'users', // legacy name
    'career_roadmaps',
    'quiz_results', 
    'colleges',
    'saved_colleges',
    'activities',
    'user_activities', // legacy table
    'job_applications',
    'user_resumes',
    'job_matches',
    'outreach_drafts',
    'user_achievements',
    'user_skills',
    'user_subscriptions',
    'payment_history'
  ];

  console.log('📊 Testing table existence...\n');

  const existingTables = [];
  const missingTables = [];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          console.log(`❌ ${tableName} - Table does not exist`);
          missingTables.push(tableName);
        } else {
          console.log(`⚠️  ${tableName} - Table exists but query failed: ${error.message}`);
          existingTables.push(tableName);
        }
      } else {
        console.log(`✅ ${tableName} - Table exists and accessible`);
        existingTables.push(tableName);
      }
    } catch (err) {
      console.log(`❌ ${tableName} - Error: ${err.message}`);
      missingTables.push(tableName);
    }
  }

  // Check specific column names in career_roadmaps if it exists
  if (existingTables.includes('career_roadmaps')) {
    console.log('\n🔍 Checking career_roadmaps column structure...');
    try {
      // Try to select with user_id (correct)
      const { data: userIdData, error: userIdError } = await supabase
        .from('career_roadmaps')
        .select('user_id')
        .limit(1);
      
      if (!userIdError) {
        console.log('✅ career_roadmaps has user_id column (correct)');
      }
      
      // Try to select with userId (incorrect)
      const { data: userIdCamelData, error: userIdCamelError } = await supabase
        .from('career_roadmaps')
        .select('userId')
        .limit(1);
      
      if (!userIdCamelError) {
        console.log('⚠️  career_roadmaps has userId column (needs migration)');
      } else if (userIdCamelError.message.includes('does not exist')) {
        console.log('✅ career_roadmaps does NOT have userId column (good)');
      }
    } catch (err) {
      console.log('⚠️  Could not check column structure:', err.message);
    }
  }

  console.log('\n========================================================================');
  console.log('📊 DATABASE STATUS SUMMARY:');
  console.log('========================================================================');
  console.log(`✅ Existing tables (${existingTables.length}):`);
  existingTables.forEach(table => console.log(`   • ${table}`));
  
  if (missingTables.length > 0) {
    console.log(`\n❌ Missing tables (${missingTables.length}):`);
    missingTables.forEach(table => console.log(`   • ${table}`));
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('Run the complete schema setup:');
    console.log('1. Copy and paste: corrected-complete-database-schema.sql');
    console.log('2. This will create all missing tables');
  } else {
    console.log('\n🎉 All expected tables exist!');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check if your application is working at http://localhost:3000');
    console.log('2. Look for console errors in the browser');
    console.log('3. If you see column naming issues, run the migration script');
  }
  console.log('========================================================================');
}

checkExistingTables().catch(console.error);