import { prisma } from './prisma'
import { SUBSCRIPTION_TIERS, FREE_TIER, getSubscriptionTier } from './subscription-tiers'

export interface SubscriptionStatus {
  isActive: boolean
  tier: string
  expiresAt?: Date
  daysRemaining?: number
  features: string[]
  limits: {
    chatMessages?: number
    roadmaps?: number
    aiModels?: string[]
    supportLevel?: string
  }
}

export interface UsageStats {
  chatMessages: {
    used: number
    limit: number
    unlimited: boolean
  }
  roadmapsCreated: {
    used: number
    limit: number
    unlimited: boolean
  }
  aiCalls: {
    used: number
    limit: number
  }
}

export class SubscriptionManager {
  
  static async getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionExpires: true,
          subscriptions: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (!user) {
        return this.getFreeTierStatus()
      }

      const tier = getSubscriptionTier(user.subscriptionTier)
      if (!tier) {
        return this.getFreeTierStatus()
      }

      const isExpired = user.subscriptionExpires && user.subscriptionExpires < new Date()
      const isActive = user.subscriptionStatus === 'active' && !isExpired

      if (!isActive) {
        // Update user to free tier if subscription expired
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: 'free',
            subscriptionStatus: 'expired'
          }
        })
        return this.getFreeTierStatus()
      }

      const daysRemaining = user.subscriptionExpires 
        ? Math.ceil((user.subscriptionExpires.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined

      return {
        isActive: true,
        tier: user.subscriptionTier,
        expiresAt: user.subscriptionExpires || undefined,
        daysRemaining,
        features: tier.features,
        limits: tier.limits
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return this.getFreeTierStatus()
    }
  }

  static getFreeTierStatus(): SubscriptionStatus {
    return {
      isActive: true,
      tier: 'free',
      features: FREE_TIER.features,
      limits: FREE_TIER.limits
    }
  }

  static async canAccessFeature(userId: string, feature: string): Promise<{ allowed: boolean, reason?: string }> {
    const status = await this.getUserSubscriptionStatus(userId)
    
    const featureAccess: Record<string, string[]> = {
      'chatbot-basic': ['free', 'basic', 'premium', 'elite'],
      'chatbot-unlimited': ['premium', 'elite'],
      'roadmap-generator': ['premium', 'elite'],
      'chatgpt-5': ['elite'],
      'gemini-pro': ['elite'],
      'brock-ai': ['elite'],
      'advanced-analytics': ['elite'],
      'priority-support': ['premium', 'elite'],
      '24x7-support': ['elite'],
      'api-access': ['elite']
    }

    if (!featureAccess[feature]) {
      return { allowed: false, reason: 'Unknown feature' }
    }

    if (featureAccess[feature].includes(status.tier)) {
      return { allowed: true }
    }

    return { 
      allowed: false, 
      reason: `Feature requires ${featureAccess[feature].join(' or ')} subscription` 
    }
  }

  static async trackUsage(userId: string, metric: string, value: number = 1): Promise<void> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.usageMetric.upsert({
        where: {
          userId_metric_period_date: {
            userId,
            metric,
            period: 'daily',
            date: today
          }
        },
        update: {
          value: {
            increment: value
          }
        },
        create: {
          userId,
          metric,
          value,
          period: 'daily',
          date: today
        }
      })
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
  }

  static async getUsageStats(userId: string): Promise<UsageStats> {
    try {
      const status = await this.getUserSubscriptionStatus(userId)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const dailyUsage = await prisma.usageMetric.findMany({
        where: {
          userId,
          period: 'daily',
          date: today
        }
      })

      const chatUsage = dailyUsage.find(u => u.metric === 'chat_messages')?.value || 0
      const roadmapUsage = dailyUsage.find(u => u.metric === 'roadmaps_created')?.value || 0
      const aiCallUsage = dailyUsage.find(u => u.metric === 'ai_calls')?.value || 0

      const chatLimit = status.limits.chatMessages || 0
      const roadmapLimit = status.limits.roadmaps || 0

      return {
        chatMessages: {
          used: chatUsage,
          limit: chatLimit,
          unlimited: chatLimit === -1
        },
        roadmapsCreated: {
          used: roadmapUsage,
          limit: roadmapLimit,
          unlimited: roadmapLimit === -1
        },
        aiCalls: {
          used: aiCallUsage,
          limit: 1000 // Default API limit
        }
      }
    } catch (error) {
      console.error('Error getting usage stats:', error)
      return {
        chatMessages: { used: 0, limit: 10, unlimited: false },
        roadmapsCreated: { used: 0, limit: 0, unlimited: false },
        aiCalls: { used: 0, limit: 1000 }
      }
    }
  }

  static async checkUsageLimit(userId: string, feature: string): Promise<{ allowed: boolean, reason?: string }> {
    try {
      const usage = await this.getUsageStats(userId)
      const status = await this.getUserSubscriptionStatus(userId)

      switch (feature) {
        case 'chat_message':
          if (usage.chatMessages.unlimited) {
            return { allowed: true }
          }
          if (usage.chatMessages.used >= usage.chatMessages.limit) {
            return { 
              allowed: false, 
              reason: `Daily chat limit reached (${usage.chatMessages.limit} messages). Upgrade to Premium for unlimited chat.`
            }
          }
          return { allowed: true }

        case 'roadmap_creation':
          if (usage.roadmapsCreated.unlimited) {
            return { allowed: true }
          }
          if (usage.roadmapsCreated.used >= usage.roadmapsCreated.limit) {
            return { 
              allowed: false, 
              reason: `Roadmap creation limit reached. Upgrade to Premium for unlimited roadmaps.`
            }
          }
          return { allowed: true }

        default:
          return { allowed: true }
      }
    } catch (error) {
      console.error('Error checking usage limit:', error)
      return { allowed: false, reason: 'Error checking limits' }
    }
  }

  static async createSubscription(userId: string, tierData: {
    tier: string
    billing: string
    paymentProvider: string
    providerId: string
    customerId: string
    amount: number
  }): Promise<string> {
    try {
      const startDate = new Date()
      let endDate = new Date()
      
      // Calculate end date based on billing cycle
      switch (tierData.billing) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case 'annual':
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }

      const subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: tierData.tier,
          status: 'active',
          billing: tierData.billing,
          amount: tierData.amount,
          paymentProvider: tierData.paymentProvider,
          providerId: tierData.providerId,
          customerId: tierData.customerId,
          startDate,
          endDate,
          nextBilling: endDate
        }
      })

      // Update user subscription info
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tierData.tier,
          subscriptionStatus: 'active',
          subscriptionStarted: startDate,
          subscriptionExpires: endDate,
          paymentProvider: tierData.paymentProvider,
          customerId: tierData.customerId,
          subscriptionId: subscription.id
        }
      })

      // Track analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'subscription_created',
          userId,
          data: JSON.stringify({
            tier: tierData.tier,
            billing: tierData.billing,
            amount: tierData.amount
          })
        }
      })

      return subscription.id
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error('Failed to create subscription')
    }
  }

  static async cancelSubscription(userId: string, reason?: string): Promise<void> {
    try {
      await prisma.subscription.updateMany({
        where: { 
          userId,
          status: 'active'
        },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
          cancelReason: reason
        }
      })

      // User keeps access until end of billing period
      // Don't update user subscription status immediately
      
      // Track analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'subscription_canceled',
          userId,
          data: JSON.stringify({ reason })
        }
      })
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  static async upgradeSubscription(userId: string, newTier: string): Promise<void> {
    try {
      const currentStatus = await this.getUserSubscriptionStatus(userId)
      
      // Cancel current subscription
      await this.cancelSubscription(userId, 'upgrade')
      
      // Note: In real implementation, you'd create a new subscription via payment provider
      // For now, just update the user's tier
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTier,
          subscriptionStatus: 'active'
        }
      })

      // Track analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'subscription_upgraded',
          userId,
          data: JSON.stringify({
            from: currentStatus.tier,
            to: newTier
          })
        }
      })
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      throw new Error('Failed to upgrade subscription')
    }
  }
}

export default SubscriptionManager