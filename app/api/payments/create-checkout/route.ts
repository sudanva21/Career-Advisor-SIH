import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { StripeService } from '@/lib/stripe'
// import { RazorpayService } from '@/lib/razorpay'
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
        // Razorpay integration temporarily disabled for deployment
        return NextResponse.json({ 
          error: 'Razorpay payments are temporarily unavailable. Please use Stripe.' 
        }, { status: 503 })
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