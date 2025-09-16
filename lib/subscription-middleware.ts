import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SubscriptionManager from './subscription-manager'

export interface FeatureGate {
  feature: string
  requiredTier?: string[]
  usageLimit?: {
    metric: string
    limit: number
    period: 'daily' | 'monthly'
  }
}

/**
 * Middleware to check subscription access for API routes
 */
export async function withSubscriptionCheck(
  request: NextRequest,
  gates: FeatureGate[]
): Promise<NextResponse | null> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    // Allow anonymous access for free features
    if (!session && gates.every(gate => !gate.requiredTier || gate.requiredTier.includes('free'))) {
      return null // Continue
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check each feature gate
    for (const gate of gates) {
      // Check tier access
      if (gate.requiredTier) {
        const accessCheck = await SubscriptionManager.canAccessFeature(userId, gate.feature)
        if (!accessCheck.allowed) {
          return NextResponse.json(
            {
              error: 'Subscription upgrade required',
              code: 'TIER_REQUIRED',
              reason: accessCheck.reason,
              feature: gate.feature,
              requiredTiers: gate.requiredTier,
              upgradeUrl: '/pricing'
            },
            { status: 403 }
          )
        }
      }

      // Check usage limits
      if (gate.usageLimit) {
        const usageCheck = await SubscriptionManager.checkUsageLimit(userId, gate.usageLimit.metric)
        if (!usageCheck.allowed) {
          return NextResponse.json(
            {
              error: 'Usage limit exceeded',
              code: 'USAGE_LIMIT_EXCEEDED',
              reason: usageCheck.reason,
              feature: gate.feature,
              upgradeUrl: '/pricing'
            },
            { status: 429 }
          )
        }
      }
    }

    return null // All checks passed, continue
  } catch (error) {
    console.error('Subscription middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Track feature usage after successful API call
 */
export async function trackFeatureUsage(
  userId: string,
  feature: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Map features to usage metrics
    const featureToMetric: Record<string, string> = {
      'chatbot': 'chat_messages',
      'roadmap-generator': 'roadmaps_created',
      'ai-call': 'ai_calls',
      'premium-feature': 'premium_features_used'
    }

    const metric = featureToMetric[feature]
    if (metric) {
      await SubscriptionManager.trackUsage(userId, metric, 1)
    }

    // Log feature access
    await prisma.featureAccess.create({
      data: {
        userId,
        feature,
        allowed: true,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  } catch (error) {
    console.error('Error tracking feature usage:', error)
  }
}

/**
 * Enhanced API route wrapper with subscription checking
 */
export function withSubscription(gates: FeatureGate[]) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      // Check subscription access
      const blockingResponse = await withSubscriptionCheck(request, gates)
      if (blockingResponse) {
        return blockingResponse
      }

      // Execute the original handler
      const response = await handler(request, ...args)

      // Track usage if request was successful
      if (response.status >= 200 && response.status < 300) {
        try {
          const supabase = createRouteHandlerClient({ cookies })
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            for (const gate of gates) {
              await trackFeatureUsage(session.user.id, gate.feature)
            }
          }
        } catch (error) {
          console.error('Error tracking usage after API call:', error)
        }
      }

      return response
    }
  }
}

// Predefined feature gates for common use cases
export const FEATURE_GATES = {
  CHATBOT_BASIC: {
    feature: 'chatbot',
    requiredTier: ['free', 'basic', 'premium', 'elite'],
    usageLimit: {
      metric: 'chat_message',
      limit: 10,
      period: 'daily' as const
    }
  },
  CHATBOT_UNLIMITED: {
    feature: 'chatbot-unlimited',
    requiredTier: ['premium', 'elite']
  },
  ROADMAP_GENERATOR: {
    feature: 'roadmap-generator',
    requiredTier: ['premium', 'elite'],
    usageLimit: {
      metric: 'roadmap_creation',
      limit: 1,
      period: 'monthly' as const
    }
  },
  CHATGPT_5: {
    feature: 'chatgpt-5',
    requiredTier: ['elite']
  },
  GEMINI_PRO: {
    feature: 'gemini-pro',
    requiredTier: ['elite']
  },
  BROCK_AI: {
    feature: 'brock-ai',
    requiredTier: ['elite']
  },
  ADVANCED_ANALYTICS: {
    feature: 'advanced-analytics',
    requiredTier: ['elite']
  },
  API_ACCESS: {
    feature: 'api-access',
    requiredTier: ['elite']
  }
} as const

export default withSubscription