import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { StripeService } from '@/lib/stripe'
import { RazorpayService } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

const checkoutSchema = z.object({
  tier: z.enum(['basic', 'premium', 'elite']),
  provider: z.enum(['stripe', 'razorpay']).default('stripe'),
  billing: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, provider, billing } = checkoutSchema.parse(body)

    // Get or create user in our database
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email! }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: session.user.email!,
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            password: 'supabase-auth', // Using Supabase for auth, so password not needed
            subscriptionTier: 'free'
          }
        })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const successUrl = `${baseUrl}/dashboard?payment=success&tier=${tier}`
    const cancelUrl = `${baseUrl}/pricing?payment=cancelled`

    try {
      if (provider === 'stripe') {
        // Create Stripe customer if needed
        let customerId = user.customerId
        if (!customerId) {
          const customer = await StripeService.createCustomer(
            user.email,
            `${user.firstName} ${user.lastName}`.trim()
          )
          customerId = customer.id
          
          // Update user with customer ID
          await prisma.user.update({
            where: { id: user.id },
            data: { customerId }
          })
        }

        // Determine price ID based on tier and billing
        let priceId = ''
        switch (tier) {
          case 'basic':
            priceId = billing === 'monthly' ? 'price_basic_monthly' : 'price_basic_annual'
            break
          case 'premium':
            priceId = billing === 'monthly' ? 'price_premium_monthly' : 'price_premium_annual'
            break
          case 'elite':
            priceId = 'price_elite_quarterly' // Elite is quarterly only
            break
        }

        const checkoutSession = await StripeService.createCheckoutSession(
          customerId,
          priceId,
          successUrl,
          cancelUrl
        )

        return NextResponse.json({
          provider: 'stripe',
          sessionId: checkoutSession.id,
          url: checkoutSession.url
        })

      } else if (provider === 'razorpay') {
        // Create Razorpay customer if needed
        let customerId = user.customerId
        if (!customerId) {
          const customer = await RazorpayService.createCustomer(
            user.email,
            `${user.firstName} ${user.lastName}`.trim(),
            session.user.phone || undefined
          )
          customerId = customer.id
          
          await prisma.user.update({
            where: { id: user.id },
            data: { customerId }
          })
        }

        // Create subscription
        let planId = ''
        switch (tier) {
          case 'basic':
            planId = 'plan_basic_monthly'
            break
          case 'premium':
            planId = 'plan_premium_monthly'
            break
          case 'elite':
            planId = 'plan_elite_quarterly'
            break
        }

        const subscription = await RazorpayService.createSubscription(customerId, planId)

        return NextResponse.json({
          provider: 'razorpay',
          subscriptionId: (subscription as any).id,
          key: process.env.RAZORPAY_KEY_ID,
          amount: (subscription as any).amount,
          currency: 'INR',
          subscription
        })
      }

    } catch (paymentError) {
      console.error('Payment provider error:', paymentError)
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}