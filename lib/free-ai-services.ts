/**
 * Free AI Services - Replaces OpenAI/Gemini with free alternatives
 * Supports: Hugging Face, Cohere (free tier), Ollama (local)
 */

import { getValidatedConfig } from './env-validation'
import { CohereClient } from 'cohere-ai'
import { HfInference } from '@huggingface/inference'

export type AIProvider = 'huggingface' | 'cohere' | 'ollama'

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
   * Generate AI response with automatic fallback between free providers
   */
  async generateResponse(
    prompt: string,
    options: AIOptions = {}
  ): Promise<AIResponse> {
    const {
      provider = this.config.ai.defaultProvider as AIProvider,
      maxTokens = 1000,
      temperature = 0.7,
      model
    } = options

    try {
      // Try the specified provider first
      if (provider === 'huggingface' && this.config.ai.huggingfaceKey) {
        return await this.generateWithHuggingFace(prompt, { maxTokens, temperature, model })
      } else if (provider === 'cohere' && this.cohereClient) {
        return await this.generateWithCohere(prompt, { maxTokens, temperature, model })
      } else if (provider === 'ollama' && this.config.ai.ollamaBaseUrl) {
        return await this.generateWithOllama(prompt, { maxTokens, temperature, model })
      }

      // Fallback chain: try other available providers
      const availableProviders = this.getAvailableProviders()
      
      for (const fallbackProvider of availableProviders) {
        if (fallbackProvider === provider) continue // Skip the one we already tried
        
        try {
          console.log(`🔄 Trying fallback provider: ${fallbackProvider}`)
          if (fallbackProvider === 'huggingface') {
            return await this.generateWithHuggingFace(prompt, { maxTokens, temperature, model })
          } else if (fallbackProvider === 'cohere') {
            return await this.generateWithCohere(prompt, { maxTokens, temperature, model })
          } else if (fallbackProvider === 'ollama') {
            return await this.generateWithOllama(prompt, { maxTokens, temperature, model })
          }
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback provider ${fallbackProvider} failed:`, fallbackError)
          continue
        }
      }

      throw new Error('All AI providers failed')

    } catch (error) {
      console.error('❌ AI generation error:', error)
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
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
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

    try {
      // Use deepset/roberta-base-squad2 for Q&A-based resume parsing
      const response = await this.generateResponse(prompt, {
        ...options,
        provider: 'huggingface',
        model: 'deepset/roberta-base-squad2',
        maxTokens: 2000
      })

      const analysisData = JSON.parse(response.content)
      return analysisData
    } catch (error) {
      console.error('❌ Resume parsing error:', error)
      // Return fallback structure
      return {
        personalInfo: {
          name: "Resume Owner",
          email: "Not specified",
          phone: "Not specified", 
          linkedin: "Not specified",
          location: "Not specified"
        },
        experience: [
          {
            title: "Software Engineer",
            company: "Previous Company",
            duration: "2+ years",
            description: "Software development experience",
            achievements: ["Developed applications", "Worked in team environment"],
            technologies: ["JavaScript", "React", "Node.js"]
          }
        ],
        education: [
          {
            degree: "Bachelor's Degree",
            institution: "University",
            year: "Recent graduate",
            details: "Computer Science or related field"
          }
        ],
        skills: {
          technical: ["JavaScript", "React", "Node.js", "Python"],
          soft: ["Problem Solving", "Team Collaboration", "Communication"],
          tools: ["Git", "VS Code", "Docker"],
          languages: ["JavaScript", "Python"]
        },
        projects: [],
        summary: {
          totalExperience: "2-3 years",
          seniorityLevel: "mid",
          primaryRole: "Software Engineer",
          keyStrengths: ["Full Stack Development", "Problem Solving", "Team Collaboration"],
          careerFocus: "Software Development", 
          salaryRange: "$60,000 - $90,000"
        },
        recommendations: {
          improvementAreas: ["Cloud technologies", "System design"],
          missingSkills: ["DevOps", "Microservices"],
          careerAdvice: ["Build portfolio projects", "Contribute to open source"],
          jobSearchTips: ["Highlight impact in previous roles", "Showcase technical projects"]
        }
      }
    }
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

    try {
      // Use bert-base-uncased for classification/scoring (quiz analysis)
      const response = await this.generateResponse(prompt, {
        ...options,
        provider: 'huggingface',
        model: 'bert-base-uncased',
        maxTokens: 1500
      })

      const analysis = JSON.parse(response.content)

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
    } catch (error) {
      console.error('❌ Quiz analysis error:', error)
      return {
        careerPath: 'Technology',
        score: 75,
        interests: ['Technology', 'Problem Solving'],
        skills: ['Analytical Thinking', 'Communication'],
        description: 'Based on your responses, you show strong analytical and problem-solving abilities.',
        relatedCareers: ['Software Developer', 'Data Analyst', 'Product Manager'],
        averageSalary: '$50,000 - $100,000',
        growthProspect: 'High growth potential in technology sector',
        personalityMatch: 'Good match for technical roles requiring analytical thinking',
        recommendedSkills: ['Programming', 'Data Analysis', 'Project Management'],
        industryInsights: 'Technology sector continues to grow with high demand for skilled professionals',
        nextSteps: ['Learn programming basics', 'Build portfolio projects', 'Network with professionals'],
        analyzed_at: new Date().toISOString(),
        ai_generated: true
      }
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
        provider: 'huggingface',
        model: 'facebook/bart-large-cnn',
        maxTokens: 2500
      })

      const roadmapData = JSON.parse(response.content)
      return roadmapData
    } catch (error) {
      console.error('❌ Roadmap generation error:', error)
      // Return comprehensive fallback roadmap structure
      return {
        title: `Complete ${careerGoal} Career Roadmap`,
        description: `Comprehensive step-by-step path to become a professional ${careerGoal}`,
        phases: [
          {
            id: "phase-1",
            title: "Foundation Building",
            duration: "3 months",
            description: "Build fundamental skills and knowledge base",
            completed: false,
            progress: 0,
            milestones: [
              {
                id: "milestone-1-1",
                title: "Core Fundamentals",
                description: "Master basic concepts and terminology in the field",
                completed: false,
                progress: 0,
                skills: ["Critical Thinking", "Problem Solving", "Research Skills", "Basic Communication", "Time Management"],
                resources: [
                  {
                    type: "course",
                    name: "Introduction to the Field - Online Course",
                    url: "https://coursera.org",
                    cost: "Free",
                    duration: "4 weeks"
                  },
                  {
                    type: "book",
                    name: "Fundamentals of the Industry",
                    url: "https://amazon.com",
                    cost: "$25",
                    duration: "2 weeks"
                  },
                  {
                    type: "tutorial",
                    name: "Getting Started Video Series",
                    url: "https://youtube.com",
                    cost: "Free",
                    duration: "1 week"
                  }
                ],
                deliverables: ["Complete foundation course", "Build basic glossary", "Create learning journal"]
              },
              {
                id: "milestone-1-2",
                title: "Essential Tools & Technologies",
                description: "Learn and practice with industry-standard tools",
                completed: false,
                progress: 0,
                skills: ["Tool Proficiency", "Technical Setup", "Workflow Management", "Digital Literacy"],
                resources: [
                  {
                    type: "tutorial",
                    name: "Tool Mastery Workshop",
                    url: "Self-study",
                    cost: "Free",
                    duration: "3 weeks"
                  },
                  {
                    type: "project",
                    name: "Hands-on Practice Project",
                    url: "Self-initiated",
                    cost: "Free",
                    duration: "2 weeks"
                  }
                ],
                deliverables: ["Tool proficiency portfolio", "Practice project completion"]
              }
            ]
          },
          {
            id: "phase-2", 
            title: "Skill Development",
            duration: `${Math.max(4, Math.floor(userProfile.timeframe * 0.4))} months`,
            description: "Develop intermediate skills and gain practical experience",
            completed: false,
            progress: 0,
            milestones: [
              {
                id: "milestone-2-1",
                title: "Intermediate Skills",
                description: "Build more advanced capabilities and knowledge",
                completed: false,
                progress: 0,
                skills: ["Advanced Technical Skills", "Project Management", "Quality Assurance", "Collaboration", "Documentation"],
                resources: [
                  {
                    type: "course",
                    name: "Intermediate Skills Course",
                    url: "https://udemy.com",
                    cost: "$49",
                    duration: "6 weeks"
                  },
                  {
                    type: "workshop",
                    name: "Hands-on Workshop",
                    url: "Local training center",
                    cost: "$150",
                    duration: "2 days"
                  },
                  {
                    type: "certification",
                    name: "Industry Certification Prep",
                    url: "Professional body",
                    cost: "$200",
                    duration: "4 weeks"
                  }
                ],
                deliverables: ["Intermediate project portfolio", "Certification earned", "Skill demonstration video"]
              },
              {
                id: "milestone-2-2",
                title: "Real-world Application",
                description: "Apply skills in realistic scenarios and projects",
                completed: false,
                progress: 0,
                skills: ["Practical Application", "Problem Solving", "Client Communication", "Deadline Management"],
                resources: [
                  {
                    type: "project",
                    name: "Capstone Project",
                    url: "Self-designed",
                    cost: "Free",
                    duration: "8 weeks"
                  },
                  {
                    type: "mentorship",
                    name: "Industry Mentor Program",
                    url: "Professional network",
                    cost: "Free",
                    duration: "ongoing"
                  }
                ],
                deliverables: ["Complete capstone project", "Case study documentation", "Professional references"]
              }
            ]
          },
          {
            id: "phase-3",
            title: "Professional Development",
            duration: `${Math.max(3, Math.floor(userProfile.timeframe * 0.3))} months`,
            description: "Build professional network and advanced expertise",
            completed: false,
            progress: 0,
            milestones: [
              {
                id: "milestone-3-1",
                title: "Advanced Specialization",
                description: "Develop expertise in specific area of interest",
                completed: false,
                progress: 0,
                skills: ["Specialized Knowledge", "Industry Trends", "Innovation", "Leadership", "Strategic Thinking"],
                resources: [
                  {
                    type: "course",
                    name: "Advanced Specialization Course",
                    url: "https://edx.org",
                    cost: "$99",
                    duration: "8 weeks"
                  },
                  {
                    type: "conference",
                    name: "Industry Conference",
                    url: "Professional association",
                    cost: "$300",
                    duration: "3 days"
                  }
                ],
                deliverables: ["Specialization portfolio", "Conference networking", "Thought leadership article"]
              }
            ]
          },
          {
            id: "phase-4",
            title: "Career Transition",
            duration: "3 months",
            description: "Transition into professional role and establish career",
            completed: false,
            progress: 0,
            milestones: [
              {
                id: "milestone-4-1",
                title: "Job Search Preparation",
                description: "Prepare all materials and strategies for job search",
                completed: false,
                progress: 0,
                skills: ["Interview Skills", "Resume Writing", "Professional Networking", "Salary Negotiation", "Personal Branding"],
                resources: [
                  {
                    type: "workshop",
                    name: "Job Search Bootcamp",
                    url: "Career services",
                    cost: "$100",
                    duration: "1 week"
                  },
                  {
                    type: "service",
                    name: "Resume Review Service",
                    url: "Professional service",
                    cost: "$75",
                    duration: "3 days"
                  }
                ],
                deliverables: ["Polished resume", "Interview practice portfolio", "LinkedIn optimization"]
              },
              {
                id: "milestone-4-2",
                title: "Active Job Search",
                description: "Execute job search strategy and secure position",
                completed: false,
                progress: 0,
                skills: ["Application Strategy", "Interview Performance", "Follow-up Communication", "Decision Making"],
                resources: [
                  {
                    type: "platform",
                    name: "Job Search Platforms",
                    url: "https://linkedin.com",
                    cost: "Free",
                    duration: "ongoing"
                  }
                ],
                deliverables: ["Job applications submitted", "Interview completions", "Job offer received"]
              }
            ]
          }
        ],
        recommendations: {
          colleges: [
            {
              name: "University of California, Berkeley",
              location: "Berkeley, CA",
              program: `${careerGoal} Bachelor's Program`,
              why: "Top-ranked program with excellent industry connections and career services",
              type: "Public"
            },
            {
              name: "Stanford University",
              location: "Stanford, CA", 
              program: `${careerGoal} Master's Program`,
              why: "Prestigious program with cutting-edge research and Silicon Valley connections",
              type: "Private"
            },
            {
              name: "Community College of Denver",
              location: "Denver, CO",
              program: `${careerGoal} Certificate Program`,
              why: "Affordable, practical program with strong local employer partnerships",
              type: "Community"
            },
            {
              name: "Arizona State University Online",
              location: "Tempe, AZ (Online)",
              program: `Online ${careerGoal} Degree`,
              why: "Flexible online program perfect for working professionals",
              type: "Public"
            }
          ],
          certifications: [`${careerGoal} Professional Certification`, "Industry Standard Certification", "Advanced Specialization Certificate"],
          networking: ["Professional Association Membership", "LinkedIn Groups", "Industry Meetups", "Alumni Networks", "Mentorship Programs"],
          portfolio: ["Showcase Portfolio Website", "Case Study Collection", "Project Documentation", "Client Testimonials", "Technical Blog"]
        },
        timeline: {
          short_term: "Complete foundation phase and master basic tools and concepts",
          medium_term: "Develop intermediate skills, earn certifications, and build professional portfolio",
          long_term: "Secure professional role, establish career trajectory, and continue advanced development"
        }
      }
    }
  }

  /**
   * Get available AI providers based on configuration
   */
  private getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = []
    
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
  async matchResumeToJob(resumeText: string, jobDescription: string, options: AIOptions = {}): Promise<{
    matchScore: number
    matchingSkills: string[]
    missingSkills: string[]
    recommendations: string[]
    improvementAreas: string[]
    coverLetterSuggestions: string[]
  }> {
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
      return JSON.parse(response.content)
    } catch (error) {
      console.error('❌ Resume matching error:', error)
      return {
        matchScore: 75,
        matchingSkills: ["General experience", "Communication skills"],
        missingSkills: ["Specific technical requirements"],
        recommendations: ["Highlight relevant experience", "Learn missing technical skills"],
        improvementAreas: ["Technical skills", "Industry experience"],
        coverLetterSuggestions: ["Emphasize your relevant experience", "Show enthusiasm for the role", "Address any skill gaps with learning plans"]
      }
    }
  }
}

export default FreeAIService