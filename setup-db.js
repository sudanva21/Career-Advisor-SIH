const { Client } = require('pg');
const fs = require('fs');

async function run() {
  console.log('Reading UNIVERSAL_FINAL_SCHEMA.sql...');
  const sql = fs.readFileSync('UNIVERSAL_FINAL_SCHEMA.sql', 'utf8');

  // The user's new project ID based on their NEXT_PUBLIC_SUPABASE_URL
  const projectId = 'lflntruxbcsssbgendww';
  // Try the session pooler URL (IPv4 forced, port 6543)
  const poolerUrl = `postgresql://postgres.${projectId}:Akash%401234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`;
  
  // Also checking the legacy DB URL in case it works
  const legacyDirectUrl = `postgresql://postgres:Akash%401234@db.${projectId}.supabase.co:5432/postgres?sslmode=require`;

  let client = new Client({ 
    connectionString: poolerUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log(`Trying to connect via IPv4 Pooler to ${projectId}...`);
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('⏳ Executing schema creation... This may take a moment.');
    await client.query(sql);
    console.log('🎉 SCHEMA EXECUTED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Connection failed via pooler. Error:', err.message);
    
    console.log('\nTrying direct connection to checking if fallback works...');
    client = new Client({ 
      connectionString: legacyDirectUrl,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log('✅ Connected via direct connection!');
      await client.query(sql);
      console.log('🎉 SCHEMA EXECUTED SUCCESSFULLY!');
    } catch (e2) {
      console.error('❌ Direct connection also failed. Is the database paused, or is the password wrong?', e2.message);
    }
  } finally {
    await client.end().catch(() => {});
  }
}

run();
