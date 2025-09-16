// Subscription Tiers Configuration
export interface SubscriptionTier {
  id: string
  name: string
  price: {
    monthly: number
    quarterly: number
    annual?: number
  }
  currency: string
  features: string[]
  limits: {
    chatMessages?: number
    roadmaps?: number
    aiModels?: string[]
    supportLevel?: string
  }
  popular?: boolean
  color: string
  description: string
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: {
      monthly: 9.99,
      quarterly: 24.99
    },
    currency: 'USD',
    description: 'Perfect for students and beginners starting their career journey',
    features: [
      'AI Career Chatbot with Personalized Guidance',
      'Basic Career Assessment Quiz',
      'College Database Access',
      'Learning Resource Recommendations',
      'Progress Tracking Dashboard',
      'Community Forum Access',
      'Email Support'
    ],
    limits: {
      chatMessages: 100, // per month
      roadmaps: 1,
      aiModels: ['basic-gpt'],
      supportLevel: 'email'
    },
    color: 'from-blue-500 to-cyan-500',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium Plan', 
    price: {
      monthly: 19.99,
      quarterly: 49.99
    },
    currency: 'USD',
    description: 'Ideal for professionals who want structured AI-powered career roadmaps',
    features: [
      'Everything in Basic Plan',
      'AI Roadmap Generator (Fully Functional)',
      'Advanced Career Assessment with Skills Gap Analysis',
      'Unlimited Roadmap Creation & Customization',
      'Industry-Specific Learning Paths',
      '3D Interactive Skill Tree Visualization',
      'Priority Email Support',
      'Downloadable Career Reports',
      'Integration with LinkedIn & GitHub'
    ],
    limits: {
      chatMessages: 500, // per month
      roadmaps: -1, // unlimited
      aiModels: ['basic-gpt', 'advanced-gpt'],
      supportLevel: 'priority'
    },
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    price: {
      monthly: 39.99,
      quarterly: 99.99
    },
    currency: 'USD',
    description: 'For power users and enterprises requiring premium AI models and advanced features',
    features: [
      'Everything in Premium Plan',
      'Access to Multiple AI Models (ChatGPT-5 & Gemini Pro)',
      'Optional Brock AI Assistant (Specialized Career Coach)',
      'Advanced Analytics & Performance Metrics',
      'White-label Career Portal for Organizations',
      'Custom Roadmap Templates',
      'API Access for Integrations',
      '24/7 Priority Chat Support',
      'Weekly 1-on-1 Career Mentoring Sessions',
      'Resume & Portfolio Review',
      'Interview Preparation with AI Mock Interviews',
      'Salary Negotiation Guidance',
      '3-Month Validity (Auto-renewal)'
    ],
    limits: {
      chatMessages: -1, // unlimited
      roadmaps: -1, // unlimited
      aiModels: ['chatgpt-5', 'gemini-pro', 'brock-ai'],
      supportLevel: '24x7'
    },
    color: 'from-yellow-400 via-orange-500 to-red-500',
    popular: false
  }
]

export const FREE_TIER: SubscriptionTier = {
  id: 'free',
  name: 'Free Trial',
  price: {
    monthly: 0,
    quarterly: 0
  },
  currency: 'USD',
  description: 'Try our platform with limited access',
  features: [
    'Limited AI Career Chatbot (10 messages/day)',
    'Basic Career Assessment Quiz',
    'View College Database (Limited)',
    'Sample Learning Resources',
    'Basic Dashboard'
  ],
  limits: {
    chatMessages: 10, // per day
    roadmaps: 0,
    aiModels: ['basic-gpt-limited'],
    supportLevel: 'community'
  },
  color: 'from-gray-500 to-gray-600',
  popular: false
}

// Business Strategy - Pricing Rationale
export const PRICING_STRATEGY = {
  marketAnalysis: {
    competitors: [
      { name: 'Coursera Plus', price: 59, priceText: '$59/month', features: 'Course access only' },
      { name: 'LinkedIn Learning', price: 29.99, priceText: '$29.99/month', features: 'Course library' },
      { name: 'Pluralsight', price: 29, priceText: '$29/month', features: 'Tech skill courses' },
      { name: 'MasterClass', price: 15, priceText: '$15/month', features: 'General learning' },
      { name: 'Pathstream', price: 39, priceText: '$39/month', features: 'Career-focused programs' }
    ],
    positioning: 'AI-first career advisor with personalized roadmaps - unique value proposition',
    priceAdvantage: 'Competitive pricing with superior AI integration'
  },
  conversionStrategy: {
    freeToBasic: {
      triggerPoint: '10 chat messages limit reached',
      incentive: 'Unlimited chat + roadmap creation',
      expectedRate: 0.15 // 15% conversion rate
    },
    basicToPremium: {
      triggerPoint: 'After creating first roadmap',
      incentive: 'Unlimited roadmaps + advanced AI models',
      expectedRate: 0.25 // 25% upgrade rate
    },
    premiumToElite: {
      triggerPoint: 'Heavy usage + enterprise needs',
      incentive: 'ChatGPT-5 + Gemini Pro + personal mentoring',
      expectedRate: 0.10 // 10% upgrade rate
    }
  },
  revenueProjections: {
    year1: {
      users: {
        free: 10000,
        basic: 1500,   // 15% of free users
        premium: 375,   // 25% of basic users  
        elite: 38      // 10% of premium users
      },
      monthlyRevenue: 
        (1500 * 9.99) +    // Basic: $14,985
        (375 * 19.99) +    // Premium: $7,496
        (38 * 39.99),      // Elite: $1,520
      totalMonthly: 24001, // ~$24K/month
      annualRevenue: 288012 // ~$288K/year
    },
    year2: {
      users: {
        free: 25000,
        basic: 3750,
        premium: 938, 
        elite: 94
      },
      annualRevenue: 720030 // ~$720K/year
    }
  },
  profitMargins: {
    aiApiCosts: 0.15, // 15% of revenue for AI API calls
    infrastructure: 0.08, // 8% for hosting/database
    support: 0.05, // 5% for customer support
    development: 0.25, // 25% for ongoing development
    marketing: 0.20, // 20% for customer acquisition
    profit: 0.27 // 27% net profit margin
  }
}

export function getSubscriptionTier(tierId: string): SubscriptionTier | null {
  if (tierId === 'free') return FREE_TIER
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId) || null
}

export function calculatePrice(tierId: string, billing: 'monthly' | 'quarterly'): number {
  const tier = getSubscriptionTier(tierId)
  return tier ? tier.price[billing] : 0
}

export function getTierFeatures(tierId: string): string[] {
  const tier = getSubscriptionTier(tierId)
  return tier ? tier.features : []
}

export function canAccessFeature(userTier: string, feature: string): boolean {
  const tier = getSubscriptionTier(userTier)
  if (!tier) return false
  
  const featureMap: Record<string, string[]> = {
    'chatbot': ['basic', 'premium', 'elite'],
    'roadmap-generator': ['premium', 'elite'],
    'chatgpt-5': ['elite'],
    'gemini-pro': ['elite'],
    'brock-ai': ['elite'],
    'unlimited-chat': ['premium', 'elite'],
    'unlimited-roadmaps': ['premium', 'elite']
  }
  
  return featureMap[feature]?.includes(userTier) || false
}