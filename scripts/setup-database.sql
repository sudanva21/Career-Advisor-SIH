-- Career Advisor Platform Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS roadmaps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  "firstName" VARCHAR(255),
  "lastName" VARCHAR(255),
  password VARCHAR(255),
  "customerId" VARCHAR(255),
  "subscriptionTier" VARCHAR(50) DEFAULT 'free',
  "subscriptionStatus" VARCHAR(50) DEFAULT 'inactive',
  "subscriptionId" VARCHAR(255),
  "subscriptionStarted" TIMESTAMP,
  "subscriptionExpires" TIMESTAMP,
  "paymentProvider" VARCHAR(50),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roadmaps table
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "targetRole" VARCHAR(255),
  "experienceLevel" VARCHAR(50),
  "timeCommitment" VARCHAR(50),
  "currentSkills" TEXT[],
  "targetSkills" TEXT[],
  milestones JSONB,
  resources JSONB,
  progress INTEGER DEFAULT 0,
  "isCompleted" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roadmaps_user_id ON roadmaps("userId");
CREATE INDEX idx_roadmaps_created_at ON roadmaps("createdAt");

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid()::text = id::text);

-- Roadmaps can only be accessed by their owner
CREATE POLICY "Users can view own roadmaps" ON roadmaps
    FOR ALL USING (auth.uid()::text = "userId"::text);

-- Insert sample data (optional)
-- This creates a test user and roadmap for development
INSERT INTO users (email, "firstName", "lastName", "subscriptionTier") 
VALUES 
  ('test@example.com', 'Test', 'User', 'basic'),
  ('demo@example.com', 'Demo', 'User', 'premium');

INSERT INTO roadmaps ("userId", title, description, "targetRole", "experienceLevel", "timeCommitment", milestones, progress)
SELECT 
  id,
  'Full Stack Developer Roadmap',
  'Comprehensive roadmap to become a full stack developer',
  'Full Stack Developer',
  'beginner',
  '10-15 hours/week',
  '[
    {
      "id": "1",
      "title": "Frontend Basics",
      "description": "Learn HTML, CSS, and JavaScript",
      "completed": false,
      "skills": ["HTML", "CSS", "JavaScript"]
    },
    {
      "id": "2", 
      "title": "React Development",
      "description": "Master React framework",
      "completed": false,
      "skills": ["React", "JSX", "Components"]
    }
  ]'::jsonb,
  25
FROM users 
WHERE email = 'test@example.com'
LIMIT 1;