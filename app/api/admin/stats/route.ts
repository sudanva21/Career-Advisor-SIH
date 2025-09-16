import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// GET - Admin statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    // Check if user is authenticated and is admin
    if (!session || session.user.email !== 'admin@careerpath.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Get total users
      const totalUsers = await prisma.user.count()

      // Get active subscriptions
      const activeSubscriptions = await prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          subscriptionTier: {
            not: 'free'
          }
        }
      })

      // Get tier distribution
      const tierCounts = await prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: true
      })

      const tierDistribution = {
        free: 0,
        basic: 0,
        premium: 0,
        elite: 0
      }

      tierCounts.forEach(tier => {
        if (tier.subscriptionTier in tierDistribution) {
          tierDistribution[tier.subscriptionTier as keyof typeof tierDistribution] = tier._count
        }
      })

      // Calculate monthly revenue (mock calculation)
      const monthlyRevenue = 
        tierDistribution.basic * 9.99 +
        tierDistribution.premium * 19.99 +
        tierDistribution.elite * 39.99

      // Calculate conversion rate
      const paidUsers = tierDistribution.basic + tierDistribution.premium + tierDistribution.elite
      const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0

      // Mock churn rate (would be calculated from historical data)
      const churnRate = 3.2

      return NextResponse.json({
        totalUsers,
        activeSubscriptions,
        monthlyRevenue: Math.round(monthlyRevenue),
        churnRate,
        conversionRate: Math.round(conversionRate * 100) / 100,
        tierDistribution
      })

    } catch (dbError) {
      console.error('Database error fetching admin stats:', dbError)
      
      // Return mock data for demo
      return NextResponse.json({
        totalUsers: 2847,
        activeSubscriptions: 1456,
        monthlyRevenue: 24150,
        churnRate: 3.2,
        conversionRate: 12.5,
        tierDistribution: {
          free: 1391,
          basic: 743,
          premium: 478,
          elite: 235
        }
      })
    }

  } catch (error) {
    console.error('Error in admin stats API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}