#!/usr/bin/env node

/**
 * Test script for Free AI Services Integration
 * Tests Hugging Face and Cohere API integrations
 */

import { FreeAIService } from '../lib/free-ai-services'
import { PDFParser } from '../lib/pdf-parser'
import * as fs from 'fs'
import * as path from 'path'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testAIServices() {
  log('cyan', '🤖 Testing Free AI Services Integration')
  log('blue', '=' .repeat(50))
  
  try {
    const aiService = FreeAIService.getInstance()
    
    // Test 1: Basic text generation
    log('yellow', '\n📝 Test 1: Basic Text Generation')
    try {
      const response = await aiService.generateResponse('What is machine learning?', {
        maxTokens: 100,
        temperature: 0.7
      })
      log('green', `✅ Success: ${response.content.substring(0, 100)}...`)
      log('blue', `📊 Provider: ${response.provider}, Confidence: ${response.confidence}`)
    } catch (error) {
      log('red', `❌ Failed: ${(error as Error).message}`)
    }

    // Test 2: Career Quiz Analysis
    log('yellow', '\n🧠 Test 2: Quiz Analysis')
    try {
      const testQuestions = [
        { id: '1', question: 'What type of work environment do you prefer?', type: 'choice' },
        { id: '2', question: 'Which skills interest you most?', type: 'choice' }
      ]
      const testAnswers = [
        { questionId: '1', answer: 'Creative and collaborative' },
        { questionId: '2', answer: 'Programming and technology' }
      ]
      
      const analysis = await aiService.analyzeQuiz(testQuestions, testAnswers)
      log('green', `✅ Career Path: ${analysis.careerPath}`)
      log('green', `✅ Confidence Score: ${analysis.score}%`)
      log('green', `✅ Skills: ${analysis.skills.join(', ')}`)
    } catch (error) {
      log('red', `❌ Failed: ${(error as Error).message}`)
    }

    // Test 3: Roadmap Generation
    log('yellow', '\n🗺️  Test 3: Roadmap Generation')
    try {
      const roadmap = await aiService.generateRoadmap('Become a full-stack developer', {
        currentLevel: 'beginner',
        timeframe: 12,
        interests: ['web development', 'databases'],
        skills: ['HTML', 'CSS'],
        learningStyle: 'hands-on',
        budget: 'free'
      })
      log('green', `✅ Roadmap: ${roadmap.title}`)
      log('green', `✅ Phases: ${roadmap.phases.length}`)
      log('green', `✅ Description: ${roadmap.description.substring(0, 100)}...`)
    } catch (error) {
      log('red', `❌ Failed: ${(error as Error).message}`)
    }

    // Test 4: Resume Parsing (mock data)
    log('yellow', '\n📄 Test 4: Resume Parsing')
    try {
      const mockResumeText = `
        John Doe
        Software Engineer
        
        Experience:
        - Software Developer at TechCorp (2020-2023)
        - Junior Developer at StartupXYZ (2018-2020)
        
        Skills: JavaScript, React, Node.js, Python, SQL
        
        Education:
        Bachelor of Computer Science, Tech University (2018)
      `
      
      const analysis = await aiService.parseResume(mockResumeText)
      log('green', `✅ Personal Info: ${analysis.personalInfo.name || 'Extracted'}`)
      log('green', `✅ Experience: ${analysis.experience.length} positions`)
      log('green', `✅ Skills: ${analysis.skills.technical.join(', ')}`)
      log('green', `✅ Total Experience: ${analysis.summary.totalExperience}`)
    } catch (error) {
      log('red', `❌ Failed: ${(error as Error).message}`)
    }

    // Test 5: Job Matching
    log('yellow', '\n💼 Test 5: Job Matching')
    try {
      const mockResume = 'Software engineer with 3 years experience in React, Node.js, and Python'
      const mockJobDescription = 'We are looking for a Full Stack Developer with React and Node.js experience'
      
      const match = await aiService.matchResumeToJob(mockResume, mockJobDescription)
      log('green', `✅ Match Score: ${match.matchScore}%`)
      log('green', `✅ Matching Skills: ${match.matchingSkills.join(', ')}`)
      log('green', `✅ Missing Skills: ${match.missingSkills.join(', ')}`)
    } catch (error) {
      log('red', `❌ Failed: ${(error as Error).message}`)
    }

  } catch (error) {
    log('red', `❌ Critical Error: ${(error as Error).message}`)
  }
}

async function testPDFParser() {
  log('cyan', '\n📋 Testing PDF Parser')
  log('blue', '=' .repeat(30))
  
  // Test PDF validation
  log('yellow', '\n📝 Test: PDF Validation')
  
  // Mock File object for testing
  const mockPDFFile = {
    name: 'test-resume.pdf',
    type: 'application/pdf',
    size: 50000, // 50KB
    arrayBuffer: async () => Buffer.from('Mock PDF content').buffer
  } as File

  const mockInvalidFile = {
    name: 'test.txt',
    type: 'text/plain',
    size: 1000,
    arrayBuffer: async () => Buffer.from('Mock text').buffer
  } as File

  // Test valid PDF
  const validResult = PDFParser.validatePDFFile(mockPDFFile)
  if (validResult.valid) {
    log('green', '✅ PDF validation passed')
  } else {
    log('red', `❌ PDF validation failed: ${validResult.error}`)
  }

  // Test invalid file
  const invalidResult = PDFParser.validatePDFFile(mockInvalidFile)
  if (!invalidResult.valid) {
    log('green', '✅ Invalid file properly rejected')
  } else {
    log('red', '❌ Invalid file was accepted')
  }

  // Test text cleaning
  log('yellow', '\n🧹 Test: Text Cleaning')
  const messyText = '   John    Doe\n\n\nSoftware Engineer\r\n\r\nExperience:\t\t\tTechCorp   '
  const cleanedText = PDFParser.cleanText(messyText)
  log('green', `✅ Cleaned text: "${cleanedText}"`)

  // Test contact info extraction
  log('yellow', '\n📞 Test: Contact Info Extraction')
  const resumeWithContact = `
    John Doe
    john.doe@email.com
    (555) 123-4567
    linkedin.com/in/johndoe
    github.com/johndoe
  `
  const contactInfo = PDFParser.extractContactInfo(resumeWithContact)
  log('green', `✅ Email: ${contactInfo.email}`)
  log('green', `✅ Phone: ${contactInfo.phone}`)
  log('green', `✅ LinkedIn: ${contactInfo.linkedin}`)
  log('green', `✅ GitHub: ${contactInfo.github}`)
}

async function testAPIConfiguration() {
  log('cyan', '\n⚙️  Testing API Configuration')
  log('blue', '=' .repeat(35))
  
  // Check environment variables
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY
  const cohereKey = process.env.COHERE_API_KEY
  const ollamaUrl = process.env.OLLAMA_BASE_URL
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER

  log('yellow', '\n🔑 Environment Variables:')
  log(huggingfaceKey ? 'green' : 'red', `Hugging Face: ${huggingfaceKey ? '✅ Set' : '❌ Not set'}`)
  log(cohereKey ? 'green' : 'red', `Cohere: ${cohereKey ? '✅ Set' : '❌ Not set'}`)
  log(ollamaUrl ? 'green' : 'yellow', `Ollama: ${ollamaUrl ? '✅ Set' : '⚠️ Not set (optional)'}`)
  log('blue', `Default Provider: ${defaultProvider || 'huggingface'}`)

  if (!huggingfaceKey && !cohereKey && !ollamaUrl) {
    log('red', '❌ No AI providers configured! Set at least one API key.')
    return false
  } else {
    log('green', '✅ At least one AI provider is configured')
    return true
  }
}

async function runTests() {
  console.clear()
  log('magenta', '🚀 Free AI Services Test Suite')
  log('magenta', '=' .repeat(40))
  
  const startTime = Date.now()
  
  // Test API configuration first
  const configOK = await testAPIConfiguration()
  
  if (!configOK) {
    log('red', '\n❌ Configuration check failed. Please set up your API keys in .env.local')
    log('yellow', '\nRequired keys:')
    log('yellow', '- HUGGINGFACE_API_KEY (get from: https://huggingface.co/settings/tokens)')
    log('yellow', '- COHERE_API_KEY (get from: https://cohere.ai/)')
    log('yellow', '- OLLAMA_BASE_URL (optional, for local models: http://localhost:11434)')
    return
  }

  // Run PDF parser tests (no API required)
  await testPDFParser()
  
  // Run AI service tests (requires API keys)
  await testAIServices()

  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000
  
  log('magenta', `\n🏁 Tests completed in ${duration.toFixed(2)}s`)
  
  // Recommendations
  log('cyan', '\n💡 Recommendations:')
  log('blue', '1. If tests failed, check your API keys in .env.local')
  log('blue', '2. Hugging Face free tier: 30,000 requests/month')
  log('blue', '3. Cohere free tier: 1,000 requests/month')
  log('blue', '4. For development, consider setting up Ollama locally')
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error)
}

export { testAIServices, testPDFParser, testAPIConfiguration }