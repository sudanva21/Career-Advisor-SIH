/**
 * Free AI Services - Replaces OpenAI/Gemini with free alternatives
 * Supports: Hugging Face, Cohere (free tier), Ollama (local)
 */

import { getValidatedConfig } from './env-validation'
import { CohereClient } from 'cohere-ai'
import { HfInference } from '@huggingface/inference'

function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        throw new Error('Failed to parse extracted JSON');
      }
    }
    throw new Error('No valid JSON found in response');
  }
}

export type AIProvider = 'groq' | 'huggingface' | 'cohere' | 'ollama'

export interface AIResponse {
  content: string
  provider: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
  confidence?: number
  error?: string
}

export interface AIOptions {
  provider?: AIProvider
  maxTokens?: number
  temperature?: number
  model?: string
}

export interface JobMatchResult {
  matchScore: number
  matchingSkills: string[]
  missingSkills: string[]
  recommendations: string[]
  improvementAreas: string[]
  coverLetterSuggestions: string[]
}

/**
 * Free AI Service using Hugging Face, Cohere, and Ollama
 */
export class FreeAIService {
  private static instance: FreeAIService
  private config = getValidatedConfig()
  private cohereClient?: CohereClient
  private hfClient?: HfInference

  static getInstance(): FreeAIService {
    if (!FreeAIService.instance) {
      FreeAIService.instance = new FreeAIService()
    }
    return FreeAIService.instance
  }

  constructor() {
    // Initialize Hugging Face client if API key is available
    if (this.config.ai.huggingfaceKey) {
      this.hfClient = new HfInference(this.config.ai.huggingfaceKey)
    }
    
    // Initialize Cohere client if API key is available
    if (this.config.ai.cohereKey) {
      this.cohereClient = new CohereClient({
        token: this.config.ai.cohereKey,
      })
    }
  }

  /**
   * Generate AI response using the Grok API
   */
  async generateResponse(
    prompt: string,
    options: AIOptions = {}
  ): Promise<AIResponse> {
    const {
      maxTokens = 2000,
      temperature = 0.7,
      model = 'llama-3.1-8b-instant' // Using Groq's fast Llama model
    } = options

    const groqApiKey = this.config.ai.groqKey

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not configured in the environment variables')
    }

    try {
      console.log(`🤖 Sending request to Groq API using model: ${model}`)
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert career counselor and technical advisor. Provide detailed, incredibly accurate JSON responses. If a specific format is requested, strictly adhere to it without any markdown conversational padding outside of the JSON block.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: model,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      return {
        content,
        provider: 'groq',
        usage: data.usage || {
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0
        }
      };

    } catch (error: any) {
      console.error('❌ Groq API generation error:', error)
      return this.generateFallbackResponse(prompt)
    }
  }

  /**
   * Generate response using Hugging Face Inference API with specific models
   */
  private async generateWithHuggingFace(
    prompt: string,
    options: { maxTokens?: number; temperature?: number; model?: string }
  ): Promise<AIResponse> {
    if (!this.hfClient) {
      throw new Error('Hugging Face client not initialized')
    }

    // Use specific models based on the task
    let model = options.model || 'facebook/bart-large-cnn' // Default to text generation
    
    try {
      let result: any
      
      // Use different models for different tasks
      if (model.includes('bart') || model.includes('t5')) {
        // Text generation for roadmaps
        result = await this.hfClient.textGeneration({
          model: model,
          inputs: prompt,
          parameters: {
            max_new_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
            do_sample: true,
            return_full_text: false,
          }
        })
      } else if (model.includes('bert') || model.includes('deberta')) {
        // Classification/analysis for quizzes - use text generation instead
        result = await this.hfClient.textGeneration({
          model: 'facebook/bart-large-cnn', // Fallback to text generation
          inputs: prompt,
          parameters: {
            max_new_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
            do_sample: true,
            return_full_text: false,
          }
        })
      } else if (model.includes('roberta')) {
        // Q&A for resume parsing
        result = await this.hfClient.questionAnswering({
          model: 'deepset/roberta-base-squad2',
          inputs: {
            question: 'What are the key skills and experience mentioned in this resume?',
            context: prompt
          }
        })
        
        // Convert Q&A result to text format
        result = { generated_text: `Answer: ${result.answer}` }
      } else {
        // Default text generation
        result = await this.hfClient.textGeneration({
          model: 'facebook/bart-large-cnn',
          inputs: prompt,
          parameters: {
            max_new_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
            do_sample: true,
            return_full_text: false,
          }
        })
      }

      let content: string
      if (result.generated_text) {
        content = result.generated_text.trim()
      } else if (typeof result === 'string') {
        content = result.trim()
      } else {
        throw new Error('Invalid response format from Hugging Face')
      }

      return {
        content,
        provider: 'huggingface',
        confidence: 0.85,
        usage: {
          input_tokens: Math.ceil(prompt.length / 4),
          output_tokens: Math.ceil(content.length / 4),
          total_tokens: Math.ceil((prompt.length + content.length) / 4)
        }
      }
    } catch (error: any) {
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        throw new Error('Hugging Face API rate limit exceeded. Please try again later.')
      }
      throw new Error(`Hugging Face API error: ${error.message}`)
    }
  }

  /**
   * Generate response using Cohere (free tier)
   */
  private async generateWithCohere(
    prompt: string,
    options: { maxTokens?: number; temperature?: number; model?: string }
  ): Promise<AIResponse> {
    if (!this.cohereClient) {
      throw new Error('Cohere client not initialized')
    }

    const model = options.model || 'command-light' // Free model from Cohere

    const response = await this.cohereClient.generate({
      model,
      prompt,
      maxTokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      k: 0,
      stopSequences: [],
      returnLikelihoods: 'NONE'
    })

    if (!response.generations || response.generations.length === 0) {
      throw new Error('No response from Cohere')
    }

    const content = response.generations[0].text.trim()

    return {
      content,
      provider: 'cohere',
      confidence: 0.9,
      usage: {
        input_tokens: Math.ceil(prompt.length / 4),
        output_tokens: Math.ceil(content.length / 4),
        total_tokens: Math.ceil((prompt.length + content.length) / 4)
      }
    }
  }

  /**
   * Generate response using Ollama (local models)
   */
  private async generateWithOllama(
    prompt: string,
    options: { maxTokens?: number; temperature?: number; model?: string }
  ): Promise<AIResponse> {
    if (!this.config.ai.ollamaBaseUrl) {
      throw new Error('Ollama base URL not configured')
    }

    const model = options.model || 'llama3.2:1b' // Lightweight Llama model
    const url = `${this.config.ai.ollamaBaseUrl}/api/generate`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          num_predict: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 404) {
        throw new Error(`Ollama model '${model}' not found. Please pull the model first: ollama pull ${model}`)
      }
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.response) {
      throw new Error('Invalid response format from Ollama')
    }

    const content = result.response.trim()

    return {
      content,
      provider: 'ollama',
      confidence: 0.95, // Local models have high confidence
      usage: {
        input_tokens: Math.ceil(prompt.length / 4),
        output_tokens: Math.ceil(content.length / 4),
        total_tokens: Math.ceil((prompt.length + content.length) / 4)
      }
    }
  }

  /**
   * Parse resume using free AI models
   */
  async parseResume(resumeText: string, options: AIOptions = {}): Promise<{
    personalInfo: any
    experience: any[]
    education: any[]
    skills: any
    projects: any[]
    summary: any
    recommendations: any
  }> {
    const prompt = `Analyze this resume and extract structured information. Return a comprehensive analysis in JSON format:

Resume Text:
${resumeText}

Please provide analysis in this exact JSON structure:
{
  "personalInfo": {
    "name": "Full name",
    "email": "Email address", 
    "phone": "Phone number",
    "linkedin": "LinkedIn profile",
    "location": "Location if mentioned"
  },
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Duration (e.g., 2020-2023)",
      "description": "Job description",
      "achievements": ["Key achievements"],
      "technologies": ["Technologies used"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "School/University", 
      "year": "Graduation year",
      "gpa": "GPA if mentioned",
      "details": "Additional details"
    }
  ],
  "skills": {
    "technical": ["List of technical skills"],
    "soft": ["List of soft skills inferred from experience"],
    "tools": ["Tools and technologies"],
    "languages": ["Programming languages"]
  },
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["Technologies used"],
      "year": "Year if mentioned"
    }
  ],
  "summary": {
    "totalExperience": "X years",
    "seniorityLevel": "junior/mid/senior",
    "primaryRole": "Main role/specialization",
    "keyStrengths": ["Top 5 strengths"],
    "careerFocus": "Career focus area",
    "salaryRange": "Estimated salary range based on experience"
  },
  "recommendations": {
    "improvementAreas": ["Areas to improve"],
    "missingSkills": ["Skills that would enhance profile"],
    "careerAdvice": ["Career advancement suggestions"],
    "jobSearchTips": ["Specific job search recommendations"]
  }
}

Provide detailed, accurate analysis. Return ONLY valid JSON, no additional text.`

    // Use Grok for resume parsing (highly capable of structuring JSON)
    const response = await this.generateResponse(prompt, {
      ...options,
      maxTokens: 3000
    })

    const analysisData = extractJSON(response.content)
    return analysisData
  }

  /**
   * Analyze quiz answers using free AI
   */
  async analyzeQuiz(questions: any[], answers: any[], options: AIOptions = {}): Promise<{
    careerPath: string
    score: number
    interests: string[]
    skills: string[]
    description: string
    relatedCareers: string[]
    averageSalary: string
    growthProspect: string
    personalityMatch: string
    recommendedSkills: string[]
    industryInsights: string
    nextSteps: string[]
    analyzed_at: string
    ai_generated: boolean
  }> {
    const prompt = `Analyze these career quiz answers and provide detailed career recommendations.

Questions and Answers:
${JSON.stringify({ questions, answers }, null, 2)}

Provide a comprehensive analysis in the following JSON format:
{
  "careerPath": "Primary career recommendation",
  "score": number (0-100 confidence score),
  "interests": ["interest1", "interest2", "interest3"],
  "skills": ["skill1", "skill2", "skill3"],
  "description": "2-3 sentence description of the recommended career path",
  "relatedCareers": ["career1", "career2", "career3"],
  "averageSalary": "Salary range in appropriate currency",
  "growthProspect": "High/Medium/Low with brief explanation",
  "personalityMatch": "Brief personality assessment",
  "recommendedSkills": ["skill1", "skill2", "skill3"],
  "industryInsights": "Brief industry overview and trends",
  "nextSteps": ["step1", "step2", "step3"]
}

Base recommendations on actual market trends, salary data, and career prospects.
Be specific and actionable. Return ONLY valid JSON, no additional text or markdown.`

    // Use Grok for detailed career path analysis
    const response = await this.generateResponse(prompt, {
      ...options,
      maxTokens: 2500
    })

    const analysis = extractJSON(response.content)

    return {
      careerPath: analysis.careerPath || 'General Career Path',
      score: Math.min(100, Math.max(0, analysis.score || 75)),
      interests: Array.isArray(analysis.interests) ? analysis.interests : [],
      skills: Array.isArray(analysis.skills) ? analysis.skills : [],
      description: analysis.description || 'Career path analysis completed.',
      relatedCareers: Array.isArray(analysis.relatedCareers) ? analysis.relatedCareers : [],
      averageSalary: analysis.averageSalary || 'Varies by location and experience',
      growthProspect: analysis.growthProspect || 'Medium growth potential',
      personalityMatch: analysis.personalityMatch || 'Good personality match',
      recommendedSkills: Array.isArray(analysis.recommendedSkills) ? analysis.recommendedSkills : [],
      industryInsights: analysis.industryInsights || 'Growing industry with opportunities',
      nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
      analyzed_at: new Date().toISOString(),
      ai_generated: true
    }
  }

  /**
   * Generate career roadmap using free AI
   */
  async generateRoadmap(
    careerGoal: string,
    userProfile: {
      currentLevel: string
      timeframe: number
      interests?: string[]
      skills?: string[]
      learningStyle?: string
      budget?: string
    },
    options: AIOptions = {}
  ): Promise<any> {
    const prompt = `Create a detailed career roadmap for someone wanting to achieve this goal: "${careerGoal}"

Profile:
- Current Level: ${userProfile.currentLevel}
- Timeframe: ${userProfile.timeframe} months
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Current Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Learning Style: ${userProfile.learningStyle}
- Budget: ${userProfile.budget}

Generate a comprehensive roadmap with the following JSON structure. Each milestone should have meaningful progress tracking and rich resource information:
{
  "title": "Catchy roadmap title",
  "description": "Brief description of the career path",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase name",
      "duration": "months for this phase",
      "description": "What will be accomplished",
      "completed": false,
      "progress": 0,
      "milestones": [
        {
          "id": "milestone-1",
          "title": "Milestone name",
          "description": "Specific goal with details",
          "completed": false,
          "progress": 0,
          "skills": ["skill1", "skill2", "skill3"],
          "resources": [
            {
              "type": "course/book/project/certification/tutorial/workshop",
              "name": "Specific resource name", 
              "url": "https://example.com or 'Self-study'",
              "cost": "Free/Paid/$XX",
              "duration": "X weeks/hours"
            }
          ],
          "deliverables": ["specific deliverable 1", "specific deliverable 2", "portfolio project"]
        }
      ]
    }
  ],
  "recommendations": {
    "colleges": [
      {
        "name": "Specific College/University name",
        "location": "City, State/Country",
        "program": "Exact program name",
        "why": "Detailed explanation why this is recommended",
        "type": "Public/Private/Community"
      }
    ],
    "certifications": ["cert1", "cert2", "cert3"],
    "networking": ["specific networking opportunity 1", "linkedin groups", "professional associations"],
    "portfolio": ["portfolio project 1", "portfolio project 2", "capstone project"]
  },
  "timeline": {
    "short_term": "Specific 1-3 month goals",
    "medium_term": "Specific 6-12 month goals", 
    "long_term": "Specific 12+ month goals"
  }
}

IMPORTANT: Make it specific, actionable, and realistic for ${userProfile.timeframe} months.
Include 4-6 phases with 3-5 milestones each for a rich roadmap.
Each milestone should have 4-8 skills, 3-6 resources, and 2-4 deliverables.
Recommend 4-6 relevant colleges/universities with real names.
Use realistic resource names, URLs, and costs.
Return ONLY valid JSON, no additional text or markdown.`

    try {
      // Use facebook/bart-large-cnn for text generation (roadmaps)
      const response = await this.generateResponse(prompt, {
        ...options,
        maxTokens: 3000
      })

      const roadmapData = extractJSON(response.content)
      return roadmapData
    } catch (error) {
      console.error('❌ Roadmap generation error:', error)
      throw error;
    }
  }

  /**
   * Get available AI providers based on configuration
   */
  private getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = []
    
    if (this.config.ai.groqKey) {
      providers.push('groq')
    }
    if (this.config.ai.huggingfaceKey) {
      providers.push('huggingface')
    }
    if (this.config.ai.cohereKey) {
      providers.push('cohere')  
    }
    if (this.config.ai.ollamaBaseUrl) {
      providers.push('ollama')
    }

    return providers
  }

  /**
   * Generate intelligent fallback response when all AI providers fail
   */
  private generateFallbackResponse(prompt: string): AIResponse {
    const lowerPrompt = prompt.toLowerCase()
    
    let content = "I'm here to help with your career and education questions! "
    
    if (lowerPrompt.includes('career') || lowerPrompt.includes('job')) {
      content += "Based on current industry trends, here are some popular career paths to consider: Software Development, Data Science, UX/UI Design, Digital Marketing, and Cybersecurity. Each offers good growth potential."
    } else if (lowerPrompt.includes('college') || lowerPrompt.includes('university')) {
      content += "College selection is important! Consider factors like program strength, location, cost, campus culture, and career services. Research schools that excel in your field of interest."
    } else if (lowerPrompt.includes('skill') || lowerPrompt.includes('learn')) {
      content += "Skill development is key to career success! Focus on both technical skills relevant to your field and soft skills like communication and problem-solving."
    } else if (lowerPrompt.includes('roadmap') || lowerPrompt.includes('plan')) {
      content += "Creating a career roadmap involves setting clear goals, identifying required skills, and planning learning milestones. Start with short-term achievable goals and build momentum."
    } else {
      content += "Due to current AI service limitations, I'm providing general guidance. Feel free to ask specific questions about careers, education, skills, or learning paths."
    }

    return {
      content,
      provider: 'fallback',
      confidence: 0.6,
      error: 'AI services temporarily unavailable'
    }
  }

  /**
   * Match resume against job description using semantic similarity
   */
  async matchResumeToJob(resumeText: string, jobDescription: string, options: AIOptions = {}): Promise<JobMatchResult> {
    const prompt = `Compare this resume against the job description and provide a detailed match analysis:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze the match and return JSON in this format:
{
  "matchScore": number (0-100),
  "matchingSkills": ["skills from resume that match job"],
  "missingSkills": ["required skills not found in resume"],
  "recommendations": ["specific recommendations to improve match"],
  "improvementAreas": ["areas to focus development on"],
  "coverLetterSuggestions": ["suggestions for cover letter content"]
}

Return ONLY valid JSON, no additional text.`

    try {
      const response = await this.generateResponse(prompt, options)
      return extractJSON(response.content)
    } catch (error) {
      console.error('❌ Resume matching error:', error)
      throw error;
    }
  }
}


export default FreeAIService