/**
 * AI Services - Uses Free AI providers instead of OpenAI/Gemini
 * This is a wrapper around FreeAIService for backwards compatibility
 */

import { FreeAIService } from './free-ai-services'

export type AIProvider = 'huggingface' | 'cohere' | 'ollama' | 'auto'

export interface AIResponse {
  content: string
  provider: string
  usage?: any
  confidence?: number
}

export interface AIPromptOptions {
  provider?: AIProvider
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  context?: any
}

/**
 * Enhanced AI service using free AI providers
 */
export class AIService {
  private static instance: AIService
  private freeAIService: FreeAIService

  constructor() {
    this.freeAIService = FreeAIService.getInstance()
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Generate AI response with automatic fallback between providers
   */
  async generateResponse(
    prompt: string, 
    options: AIPromptOptions = {}
  ): Promise<AIResponse> {
    const {
      provider = 'auto',
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt,
      context
    } = options

    // Build enhanced prompt with context
    const enhancedPrompt = this.buildEnhancedPrompt(prompt, systemPrompt, context)

    // Map provider types
    let freeAIProvider: 'huggingface' | 'cohere' | 'ollama' | undefined
    if (provider === 'auto' || provider === 'huggingface') {
      freeAIProvider = 'huggingface'
    } else if (provider === 'cohere') {
      freeAIProvider = 'cohere'  
    } else if (provider === 'ollama') {
      freeAIProvider = 'ollama'
    }

    try {
      const response = await this.freeAIService.generateResponse(enhancedPrompt, {
        provider: freeAIProvider,
        maxTokens,
        temperature
      })

      return {
        content: response.content,
        provider: response.provider,
        usage: response.usage,
        confidence: response.confidence
      }
    } catch (error) {
      console.error('AI generation error:', error)
      // Return intelligent fallback based on prompt type
      return this.generateFallbackResponse(prompt, context)
    }
  }

  /**
   * Analyze career fit using AI
   */
  async analyzeCareerFit(
    userProfile: any,
    careerPath: string,
    options: AIPromptOptions = {}
  ): Promise<{
    matchScore: number
    strengths: string[]
    gaps: string[]
    recommendations: string[]
    reasoning: string
  }> {
    const prompt = `Analyze the career fit for this user profile and career path:

USER PROFILE:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Experience Level: ${userProfile.experience || 'Beginner'}
- Education: ${userProfile.education || 'Not specified'}
- Goals: ${userProfile.goals?.join(', ') || 'Not specified'}

TARGET CAREER: ${careerPath}

Provide a detailed analysis in the following JSON format:
{
  "matchScore": 85,
  "strengths": ["List of user strengths that align with this career"],
  "gaps": ["List of skills/experience gaps to address"],
  "recommendations": ["Specific actionable recommendations"],
  "reasoning": "Detailed explanation of the match score and analysis"
}

Be specific and actionable. Consider current industry trends and requirements.`

    try {
      const response = await this.generateResponse(prompt, {
        ...options,
        systemPrompt: "You are an expert career counselor with deep knowledge of industry requirements and career paths.",
        maxTokens: 1500,
        provider: 'huggingface'
      })

      // Parse JSON response
      const analysis = JSON.parse(response.content)
      return analysis
    } catch (error) {
      console.error('Career fit analysis error:', error)
      return this.generateFallbackCareerAnalysis(userProfile, careerPath)
    }
  }

  /**
   * Generate college recommendations using AI
   */
  async recommendColleges(
    userProfile: any,
    preferences: {
      location?: string[]
      budget?: string
      programType?: string
      size?: string
      specializations?: string[]
    },
    options: AIPromptOptions = {}
  ): Promise<{
    recommendations: Array<{
      name: string
      match: number
      reasons: string[]
      programs: string[]
      pros: string[]
      cons: string[]
    }>
    insights: string[]
  }> {
    const prompt = `Recommend colleges for this student profile:

STUDENT PROFILE:
- Academic Interests: ${userProfile.interests?.join(', ') || 'General'}
- Career Goals: ${userProfile.goals?.join(', ') || 'Undecided'}
- Skills: ${userProfile.skills?.join(', ') || 'Basic'}
- Academic Level: ${userProfile.education || 'High School'}

PREFERENCES:
- Preferred Locations: ${preferences.location?.join(', ') || 'Any'}
- Budget Range: ${preferences.budget || 'Any'}
- Program Type: ${preferences.programType || 'Any'}
- School Size: ${preferences.size || 'Any'}
- Specializations: ${preferences.specializations?.join(', ') || 'None'}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "name": "University Name",
      "match": 95,
      "reasons": ["Why it matches the student"],
      "programs": ["Relevant programs"],
      "pros": ["Advantages"],
      "cons": ["Potential drawbacks"]
    }
  ],
  "insights": ["General insights about college selection"]
}`

    try {
      const response = await this.generateResponse(prompt, {
        ...options,
        systemPrompt: "You are an expert college admissions counselor with comprehensive knowledge of universities worldwide.",
        maxTokens: 2000,
        provider: 'huggingface'
      })

      const analysis = JSON.parse(response.content)
      return analysis
    } catch (error) {
      console.error('College recommendation error:', error)
      return this.generateFallbackCollegeRecommendations(userProfile, preferences)
    }
  }

  /**
   * Analyze skill progress and provide insights
   */
  async analyzeSkillProgress(
    skillData: any[],
    learningGoals: string[],
    options: AIPromptOptions = {}
  ): Promise<{
    overallProgress: number
    insights: string[]
    recommendations: string[]
    nextMilestones: Array<{
      skill: string
      target: string
      timeline: string
      actions: string[]
    }>
    strengths: string[]
    focusAreas: string[]
  }> {
    const prompt = `Analyze this skill progress data and learning goals:

SKILL DATA:
${skillData.map(skill => `- ${skill.name}: ${skill.level}% (Last updated: ${skill.lastUpdated || 'Unknown'})`).join('\n')}

LEARNING GOALS:
${learningGoals.join(', ')}

Provide analysis in JSON format:
{
  "overallProgress": 78,
  "insights": ["Key insights about learning progress"],
  "recommendations": ["Specific recommendations for improvement"],
  "nextMilestones": [
    {
      "skill": "JavaScript",
      "target": "Advanced level (90%)",
      "timeline": "2-3 months",
      "actions": ["Specific action items"]
    }
  ],
  "strengths": ["Areas where student excels"],
  "focusAreas": ["Areas needing attention"]
}`

    try {
      const response = await this.generateResponse(prompt, {
        ...options,
        systemPrompt: "You are an expert learning analyst who understands skill development patterns and effective learning strategies.",
        maxTokens: 1500,
        provider: 'huggingface'
      })

      const analysis = JSON.parse(response.content)
      return analysis
    } catch (error) {
      console.error('Skill progress analysis error:', error)
      return this.generateFallbackSkillAnalysis(skillData, learningGoals)
    }
  }

  private buildEnhancedPrompt(prompt: string, systemPrompt?: string, context?: any): string {
    let enhancedPrompt = ''
    
    if (systemPrompt) {
      enhancedPrompt += `System: ${systemPrompt}\n\n`
    }
    
    if (context) {
      enhancedPrompt += `Context: ${JSON.stringify(context)}\n\n`
    }
    
    enhancedPrompt += `User: ${prompt}`
    
    return enhancedPrompt
  }

  private generateFallbackResponse(prompt: string, context?: any): AIResponse {
    // Intelligent fallback based on prompt analysis
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('career') || lowerPrompt.includes('job')) {
      return {
        content: "I'd be happy to help with career guidance! Based on current industry trends, here are some popular career paths to consider: Software Development, Data Science, UX/UI Design, Digital Marketing, and Cybersecurity. Each offers good growth potential. What specific area interests you most?",
        provider: 'fallback',
        confidence: 0.6
      }
    } else if (lowerPrompt.includes('college') || lowerPrompt.includes('university')) {
      return {
        content: "College selection is an important decision! Consider factors like program strength, location, cost, campus culture, and career services. I'd recommend researching schools that excel in your field of interest and visiting campuses if possible. What field of study are you most interested in?",
        provider: 'fallback',
        confidence: 0.6
      }
    } else if (lowerPrompt.includes('skill') || lowerPrompt.includes('learn')) {
      return {
        content: "Skill development is key to career success! I recommend focusing on both technical skills relevant to your field and soft skills like communication and problem-solving. Set specific learning goals, practice regularly, and build projects to apply what you learn. What skills are you looking to develop?",
        provider: 'fallback',
        confidence: 0.6
      }
    }

    return {
      content: "I'm here to help with your career and education questions! Due to current AI service limitations, I'm providing general guidance. Feel free to ask specific questions about careers, colleges, skills, or learning paths.",
      provider: 'fallback',
      confidence: 0.5
    }
  }

  private generateFallbackCareerAnalysis(userProfile: any, careerPath: string) {
    return {
      matchScore: 75,
      strengths: [
        userProfile.skills?.[0] || "Willingness to learn",
        "Interest in " + careerPath.toLowerCase(),
        userProfile.interests?.[0] || "General aptitude"
      ],
      gaps: [
        "Specific technical skills for " + careerPath,
        "Industry experience",
        "Professional network"
      ],
      recommendations: [
        `Take courses related to ${careerPath}`,
        "Build projects to demonstrate skills",
        "Network with professionals in the field",
        "Consider internships or entry-level positions"
      ],
      reasoning: `Based on your profile, you show good potential for ${careerPath}. Focus on developing relevant skills and gaining practical experience.`
    }
  }

  private generateFallbackCollegeRecommendations(userProfile: any, preferences: any) {
    return {
      recommendations: [
        {
          name: "Local State University",
          match: 80,
          reasons: ["Good general programs", "Affordable tuition", "Strong alumni network"],
          programs: ["Business", "Engineering", "Computer Science", "Liberal Arts"],
          pros: ["Lower cost", "Local connections", "Diverse programs"],
          cons: ["May lack specialized programs", "Limited prestige"]
        },
        {
          name: "Community College",
          match: 75,
          reasons: ["Affordable starting point", "Transfer opportunities", "Flexible scheduling"],
          programs: ["Associate degrees", "Transfer programs", "Career training"],
          pros: ["Very affordable", "Small class sizes", "Transfer pathways"],
          cons: ["Limited research opportunities", "2-year programs only"]
        }
      ],
      insights: [
        "Consider your career goals when selecting programs",
        "Balance cost with program quality and fit",
        "Look into financial aid and scholarship opportunities",
        "Visit campuses and talk to current students"
      ]
    }
  }

  private generateFallbackSkillAnalysis(skillData: any[], learningGoals: string[]) {
    const avgProgress = skillData.length > 0 
      ? skillData.reduce((sum, skill) => sum + (skill.level || 0), 0) / skillData.length 
      : 50

    return {
      overallProgress: Math.round(avgProgress),
      insights: [
        "Consistent practice leads to steady improvement",
        "Focus on one skill at a time for better results",
        "Apply skills in real projects to reinforce learning"
      ],
      recommendations: [
        "Set specific, measurable learning goals",
        "Practice regularly with hands-on projects",
        "Seek feedback from peers or mentors",
        "Document your progress to stay motivated"
      ],
      nextMilestones: learningGoals.slice(0, 3).map((goal, index) => ({
        skill: goal,
        target: "Proficiency level (80%+)",
        timeline: `${2 + index} months`,
        actions: [
          "Complete relevant courses or tutorials",
          "Build projects using this skill", 
          "Practice regularly with real-world scenarios"
        ]
      })),
      strengths: skillData
        .filter(skill => skill.level >= 70)
        .map(skill => skill.name)
        .slice(0, 3),
      focusAreas: skillData
        .filter(skill => skill.level < 50)
        .map(skill => skill.name)
        .slice(0, 3)
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()