import { NextRequest, NextResponse } from 'next/server'

interface MockSubscription {
  id: string
  tier: 'free' | 'basic' | 'premium' | 'elite'
  status: 'active' | 'canceled' | 'expired' | 'pending'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
  billing: 'monthly' | 'quarterly'
}

// Mock subscription data for demo user
const mockSubscriptions: Record<string, MockSubscription> = {
  'demo@example.com': {
    id: 'mock-sub-123',
    tier: 'free',
    status: 'active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billing: 'monthly',
    cancelAtPeriodEnd: false
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, return mock subscription for demo user
    // In a real app, you'd get the user from the session/token
    const subscription = mockSubscriptions['demo@example.com']
    
    return NextResponse.json({
      subscription: subscription || null
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    // For demo purposes, simulate subscription actions
    const subscription = mockSubscriptions['demo@example.com']
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'cancel':
        subscription.cancelAtPeriodEnd = true
        break
      case 'reactivate':
        subscription.cancelAtPeriodEnd = false
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      subscription,
      message: `Subscription ${action}ed successfully`
    })
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}