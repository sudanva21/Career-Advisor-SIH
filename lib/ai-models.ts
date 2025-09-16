import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const genAI = process.env.GOOGLE_AI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null

export interface AIModelConfig {
  id: string
  name: string
  provider: 'openai' | 'google' | 'brock'
  model: string
  tier: string[]
  maxTokens: number
  features: string[]
  description: string
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'basic-gpt',
    name: 'Basic GPT',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    tier: ['free', 'basic', 'premium', 'elite'],
    maxTokens: 500,
    features: ['General career advice', 'Basic Q&A', 'Simple recommendations'],
    description: 'Standard AI assistant for basic career guidance'
  },
  {
    id: 'advanced-gpt',
    name: 'Advanced GPT',
    provider: 'openai', 
    model: 'gpt-4',
    tier: ['premium', 'elite'],
    maxTokens: 1000,
    features: ['Advanced career analysis', 'Industry insights', 'Skill gap analysis'],
    description: 'Enhanced AI with deeper career knowledge and analysis'
  },
  {
    id: 'chatgpt-5',
    name: 'ChatGPT-5',
    provider: 'openai',
    model: 'gpt-4-turbo-preview', // Using latest available model as placeholder
    tier: ['elite'],
    maxTokens: 2000,
    features: ['Cutting-edge career intelligence', 'Personalized roadmaps', 'Industry predictions'],
    description: 'Next-generation AI with advanced reasoning and career expertise'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    model: 'gemini-pro',
    tier: ['elite'],
    maxTokens: 1500,
    features: ['Multi-modal analysis', 'Advanced reasoning', 'Complex problem solving'],
    description: 'Google\'s advanced AI model with superior analytical capabilities'
  },
  {
    id: 'brock-ai',
    name: 'Brock AI Career Coach',
    provider: 'brock',
    model: 'brock-career-v1',
    tier: ['elite'],
    maxTokens: 2000,
    features: ['Specialized career coaching', '1-on-1 mentoring', 'Interview prep', 'Salary negotiation'],
    description: 'Specialized AI career coach with deep domain expertise'
  }
]

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface AIResponse {
  response: string
  model: string
  usage: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  confidence?: number
}

export class AIModelService {
  
  static getAvailableModels(userTier: string): AIModelConfig[] {
    return AI_MODELS.filter(model => model.tier.includes(userTier))
  }

  static getModelConfig(modelId: string): AIModelConfig | null {
    return AI_MODELS.find(model => model.id === modelId) || null
  }

  static async generateResponse(
    modelId: string,
    messages: ChatMessage[],
    userTier: string
  ): Promise<AIResponse> {
    const modelConfig = this.getModelConfig(modelId)
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found`)
    }

    if (!modelConfig.tier.includes(userTier)) {
      throw new Error(`Model ${modelId} not available for ${userTier} tier`)
    }

    switch (modelConfig.provider) {
      case 'openai':
        return await this.generateOpenAI(modelConfig, messages)
      case 'google':
        return await this.generateGemini(modelConfig, messages)
      case 'brock':
        return await this.generateBrockAI(modelConfig, messages)
      default:
        throw new Error(`Provider ${modelConfig.provider} not supported`)
    }
  }

  private static async generateOpenAI(
    config: AIModelConfig,
    messages: ChatMessage[]
  ): Promise<AIResponse> {
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = 
      messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: openaiMessages,
      max_tokens: config.maxTokens,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    return {
      response,
      model: config.model,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
      }
    }
  }

  private static async generateGemini(
    config: AIModelConfig,
    messages: ChatMessage[]
  ): Promise<AIResponse> {
    if (!genAI) {
      throw new Error('Google AI not configured')
    }

    const model = genAI.getGenerativeModel({ model: config.model })
    
    // Convert messages to Gemini format
    let prompt = ''
    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'Human' : msg.role === 'assistant' ? 'Assistant' : 'System'
      prompt += `${role}: ${msg.content}\n\n`
    })
    prompt += 'Assistant:'

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error('No response from Gemini')
    }

    return {
      response: text.trim(),
      model: config.model,
      usage: {
        // Gemini doesn't provide detailed token usage
        total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4)
      }
    }
  }

  private static async generateBrockAI(
    config: AIModelConfig,
    messages: ChatMessage[]
  ): Promise<AIResponse> {
    // Brock AI is a specialized career coaching AI
    // For demo purposes, we'll simulate advanced career coaching responses
    // In production, this would connect to a specialized career AI service
    
    const lastMessage = messages[messages.length - 1]?.content || ''
    
    const brockResponses = {
      interview: `🎯 **BROCK AI CAREER COACH**

Based on your question about interviews, here's my specialized guidance:

**INTERVIEW PREPARATION FRAMEWORK:**
• **STAR Method**: Structure answers using Situation, Task, Action, Result
• **Company Research**: Study their culture, recent news, competitors
• **Questions to Ask**: "What does success look like in this role in 6 months?"

**COMMON MISTAKES TO AVOID:**
• Speaking negatively about previous employers
• Not having specific examples ready
• Failing to research the interviewer on LinkedIn

**YOUR ACTION PLAN:**
1. Practice 5 behavioral questions daily using STAR method
2. Prepare 3 thoughtful questions about the role/company
3. Research the interviewer and find common connections

**CONFIDENCE TIP:** Remember, they already liked your resume enough to interview you. You belong there!

Would you like me to do a mock interview with you? I can simulate real interview conditions with immediate feedback.`,

      salary: `💰 **BROCK AI SALARY NEGOTIATION COACH**

Smart move asking about salary negotiation! Here's my proven strategy:

**RESEARCH PHASE:**
• Use Glassdoor, PayScale, Levels.fyi for market data
• Factor in location, company size, industry
• Add 10-20% to their offer as your counter

**NEGOTIATION FRAMEWORK:**
• "Based on my research and experience, I was expecting a range of $X-Y"
• Always negotiate the full package (salary, benefits, PTO, remote work)
• Get everything in writing before accepting

**POWER MOVES:**
• Never accept the first offer immediately
• Ask for 24-48 hours to consider
• Highlight your unique value proposition

**SCRIPTS I RECOMMEND:**
• "I'm excited about the opportunity. Based on my research, the market rate for this role is typically $X. Can we work together to get closer to that?"

**RED FLAGS:**
• Companies that say "salary is non-negotiable"
• Offers significantly below market rate without explanation

Want me to help you craft a specific negotiation strategy for your situation?`,

      roadmap: `🗺️ **BROCK AI ROADMAP STRATEGIST**

Excellent! Let me create a hyper-personalized career roadmap for you:

**90-DAY ACCELERATION PLAN:**

**Phase 1: Foundation (Days 1-30)**
• Complete skill assessment using industry-standard tools
• Build professional LinkedIn presence with keyword optimization
• Start daily learning routine (30 min/day minimum)

**Phase 2: Growth (Days 31-60)**  
• Begin building portfolio projects showcasing target skills
• Network with 5 professionals in your target field weekly
• Apply to 3 strategic positions per week (quality over quantity)

**Phase 3: Momentum (Days 61-90)**
• Showcase portfolio through LinkedIn posts and articles
• Conduct informational interviews with hiring managers
• Negotiate job offers using advanced techniques

**SUCCESS METRICS:**
• 2-3 portfolio projects completed
• 50+ new professional connections
• 5+ interviews scheduled
• 1 job offer in hand

**WEEKLY CHECK-INS:**
I'll monitor your progress and adjust strategy based on market feedback and your personal performance.

**BONUS:** As your Elite subscriber, you get access to my exclusive career accelerator program with weekly 1-on-1 mentoring sessions.

Ready to start? What's your target role and timeline?`,

      general: `👋 **BROCK AI - YOUR PERSONAL CAREER COACH**

Hi there! I'm Brock, your dedicated AI career coach. Unlike generic AI assistants, I'm specifically trained in career development, salary negotiation, interview mastery, and professional growth strategies.

**What makes me different:**
• **Specialized Training**: 10,000+ hours of career coaching data
• **Real Results**: My strategies have helped thousands land dream jobs
• **Personalized Approach**: Every recommendation is tailored to YOUR situation
• **Industry Insights**: Real-time knowledge of job market trends

**I excel at:**
🎯 Interview preparation & mock interviews
💰 Salary negotiation strategies  
🗺️ Career roadmap development
📈 LinkedIn optimization
🚀 Professional brand building
🎓 Skill development planning

**My Coaching Philosophy:**
"Your career isn't just about finding A job—it's about crafting THE career that aligns with your values, strengths, and aspirations."

As an Elite subscriber, you have unlimited access to my expertise. I'm here to be your accountability partner, strategist, and cheerleader on your career journey.

**What would you like to work on first?** Just ask, and I'll provide actionable, personalized guidance that moves you forward immediately.

Remember: You have unlimited potential. Let's unlock it together! 🚀`
    }

    // Determine response based on content
    let response = brockResponses.general
    if (lastMessage.toLowerCase().includes('interview')) response = brockResponses.interview
    else if (lastMessage.toLowerCase().includes('salary') || lastMessage.toLowerCase().includes('negotiate')) response = brockResponses.salary
    else if (lastMessage.toLowerCase().includes('roadmap') || lastMessage.toLowerCase().includes('plan')) response = brockResponses.roadmap

    return {
      response,
      model: config.model,
      usage: {
        total_tokens: Math.ceil(response.length / 4)
      },
      confidence: 0.95 // Brock AI has high confidence in career advice
    }
  }

  static async getModelRecommendation(userTier: string, query: string): Promise<string> {
    const availableModels = this.getAvailableModels(userTier)
    
    // Simple logic to recommend best model based on query and tier
    if (userTier === 'elite') {
      if (query.toLowerCase().includes('interview') || 
          query.toLowerCase().includes('salary') || 
          query.toLowerCase().includes('coach')) {
        return 'brock-ai'
      }
      if (query.toLowerCase().includes('analysis') || 
          query.toLowerCase().includes('complex')) {
        return 'gemini-pro'
      }
      return 'chatgpt-5'
    }
    
    if (userTier === 'premium') {
      return 'advanced-gpt'
    }
    
    return 'basic-gpt'
  }
}

export default AIModelService