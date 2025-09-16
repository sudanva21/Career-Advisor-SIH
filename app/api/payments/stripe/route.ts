import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import Stripe from 'stripe'
import SubscriptionManager from '@/lib/subscription-manager'
import { calculatePrice, getSubscriptionTier } from '@/lib/subscription-tiers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const createPaymentSchema = z.object({
  tier: z.enum(['basic', 'premium', 'elite']),
  billing: z.enum(['monthly', 'quarterly']),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional()
})

// POST - Create Stripe payment intent
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, billing, successUrl, cancelUrl } = createPaymentSchema.parse(body)
    
    const amount = calculatePrice(tier, billing)
    const tierInfo = getSubscriptionTier(tier)
    
    if (amount === 0 || !tierInfo) {
      return NextResponse.json({ error: 'Invalid tier or billing cycle' }, { status: 400 })
    }

    // Check if customer exists in Stripe
    let customer
    try {
      const customers = await stripe.customers.list({
        email: session.user.email,
        limit: 1
      })
      
      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: session.user.email!,
          metadata: {
            userId: session.user.id
          }
        })
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error)
      return NextResponse.json({ error: 'Failed to setup payment' }, { status: 500 })
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierInfo.name,
              description: tierInfo.description,
              images: ['https://your-domain.com/logo.png'] // Add your logo
            },
            recurring: {
              interval: billing === 'monthly' ? 'month' : billing === 'quarterly' ? 'month' : 'year',
              interval_count: billing === 'quarterly' ? 3 : 1
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=canceled`,
      metadata: {
        userId: session.user.id,
        tier,
        billing
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          tier,
          billing
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      payment_method_collection: 'always'
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}

// GET - Verify payment session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      subscription: session.subscription
    })

  } catch (error) {
    console.error('Error verifying payment session:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment session' },
      { status: 500 }
    )
  }
}