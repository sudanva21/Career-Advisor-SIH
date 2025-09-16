#!/usr/bin/env node
/**
 * Vercel Environment Variables Setup Script
 * This script helps set up all required environment variables for Vercel deployment
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🚀 Vercel Environment Variables Setup\n');

if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found!');
  console.error('   Please create .env.local from .env.example and fill in your values.');
  process.exit(1);
}

// Parse .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      envVars[key] = value;
    }
  }
});

// Required environment variables for Vercel
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'HUGGINGFACE_API_KEY',
  'COHERE_API_KEY',
  'DEFAULT_AI_PROVIDER',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
];

console.log('📋 Checking required environment variables:');
const missingVars = [];
const presentVars = [];

requiredVars.forEach(varName => {
  if (envVars[varName] && envVars[varName] !== 'your_key_here' && envVars[varName] !== '') {
    presentVars.push(varName);
    console.log(`✅ ${varName}`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName} - missing or placeholder value`);
  }
});

if (missingVars.length > 0) {
  console.log('\n⚠️  Please fill in the missing environment variables in .env.local');
  console.log('   Required variables:', missingVars.join(', '));
  console.log('\n   Example values can be found in .env.example');
  process.exit(1);
}

console.log('\n✅ All required environment variables are present!');
console.log('\n🔧 Generating Vercel CLI commands...\n');

// Update NEXT_PUBLIC_APP_URL for production
const productionVars = { ...envVars };
if (productionVars.NEXT_PUBLIC_APP_URL.includes('localhost')) {
  console.log('⚠️  Warning: NEXT_PUBLIC_APP_URL is set to localhost.');
  console.log('   You should update this to your Vercel domain after deployment.');
  console.log('   Example: https://your-app.vercel.app\n');
}

// Generate Vercel environment variable commands
console.log('📝 Run these commands to set up environment variables in Vercel:');
console.log('   (Make sure you have Vercel CLI installed: npm i -g vercel)\n');

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    const value = envVars[varName].replace(/"/g, '\\"');
    console.log(`vercel env add ${varName} production`);
    console.log(`# Enter: ${value}`);
    console.log();
  }
});

console.log('🔍 Alternative: Set environment variables via Vercel Dashboard:');
console.log('   1. Go to your project settings on vercel.com');
console.log('   2. Navigate to Environment Variables');
console.log('   3. Add the following variables:');
console.log();

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`   ${varName} = ${envVars[varName]}`);
  }
});

console.log('\n🚀 After setting environment variables, redeploy your project:');
console.log('   vercel --prod');
console.log('\n✅ Setup complete! Your app should work on Vercel after setting these variables.');