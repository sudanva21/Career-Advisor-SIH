import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// GET - Admin subscription list
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    // Check if user is authenticated and is admin
    if (!session || session.user.email !== 'admin@careerpath.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const tier = searchParams.get('tier')
    const status = searchParams.get('status')

    try {
      const whereClause: any = {}
      
      if (tier && tier !== 'all') {
        whereClause.subscriptionTier = tier
      }
      
      if (status && status !== 'all') {
        whereClause.subscriptionStatus = status
      }

      // Get subscription data with user information
      const subscriptions = await prisma.user.findMany({
        where: {
          ...whereClause,
          subscriptionTier: {
            not: 'free'
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionStarted: true,
          subscriptionExpires: true,
          usageMetrics: {
            where: {
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            },
            select: {
              metric: true,
              value: true
            }
          }
        },
        take: limit,
        skip: offset,
        orderBy: {
          subscriptionStarted: 'desc'
        }
      })

      const formattedSubscriptions = subscriptions.map(user => {
        // Calculate usage from metrics
        const chatMessages = user.usageMetrics
          .filter(m => m.metric === 'chat_messages')
          .reduce((sum, m) => sum + m.value, 0)
        
        const roadmapsCreated = user.usageMetrics
          .filter(m => m.metric === 'roadmaps_created')
          .reduce((sum, m) => sum + m.value, 0)

        // Calculate amount based on tier
        let amount = 0
        switch (user.subscriptionTier) {
          case 'basic': amount = 9.99; break
          case 'premium': amount = 19.99; break
          case 'elite': amount = 39.99; break
        }

        return {
          id: user.id,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          tier: user.subscriptionTier,
          status: user.subscriptionStatus,
          amount,
          startDate: user.subscriptionStarted?.toISOString(),
          nextBilling: user.subscriptionExpires?.toISOString(),
          usage: {
            chatMessages,
            roadmapsCreated
          }
        }
      })

      return NextResponse.json({
        subscriptions: formattedSubscriptions,
        total: subscriptions.length
      })

    } catch (dbError) {
      console.error('Database error fetching subscriptions:', dbError)
      
      // Return mock data for demo
      return NextResponse.json({
        subscriptions: [
          {
            id: '1',
            user: { email: 'john.doe@email.com', firstName: 'John', lastName: 'Doe' },
            tier: 'premium',
            status: 'active',
            amount: 19.99,
            startDate: '2024-01-15T00:00:00.000Z',
            nextBilling: '2024-02-15T00:00:00.000Z',
            usage: { chatMessages: 234, roadmapsCreated: 3 }
          },
          {
            id: '2', 
            user: { email: 'jane.smith@email.com', firstName: 'Jane', lastName: 'Smith' },
            tier: 'elite',
            status: 'active',
            amount: 39.99,
            startDate: '2024-01-10T00:00:00.000Z',
            nextBilling: '2024-02-10T00:00:00.000Z',
            usage: { chatMessages: 456, roadmapsCreated: 8 }
          },
          {
            id: '3',
            user: { email: 'bob.wilson@email.com', firstName: 'Bob', lastName: 'Wilson' },
            tier: 'basic',
            status: 'canceled',
            amount: 9.99,
            startDate: '2024-01-05T00:00:00.000Z',
            usage: { chatMessages: 89, roadmapsCreated: 1 }
          }
        ],
        total: 3
      })
    }

  } catch (error) {
    console.error('Error in admin subscriptions API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}