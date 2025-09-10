import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = await StripeService.handleWebhook(body, signature)
    
    if (!event) {
      return NextResponse.json({ received: true })
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.invoice)
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

async function handleSubscriptionChange(subscription: any) {
  try {
    const customerId = subscription.customer
    
    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { customerId }
    })

    if (!user) {
      console.error('User not found for Stripe customer:', customerId)
      return
    }

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price?.id
    let tier = 'free'
    
    if (priceId?.includes('basic')) tier = 'basic'
    else if (priceId?.includes('premium')) tier = 'premium'
    else if (priceId?.includes('elite')) tier = 'elite'

    // Update user subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        subscriptionStarted: new Date(subscription.current_period_start * 1000),
        subscriptionExpires: new Date(subscription.current_period_end * 1000),
        paymentProvider: 'stripe'
      }
    })

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: {
        providerId: subscription.id
      },
      create: {
        userId: user.id,
        tier,
        status: subscription.status,
        billing: subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'monthly' : 'quarterly',
        amount: subscription.items.data[0]?.price?.unit_amount / 100,
        currency: subscription.currency.toUpperCase(),
        paymentProvider: 'stripe',
        providerId: subscription.id,
        customerId,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
        nextBilling: new Date(subscription.current_period_end * 1000)
      },
      update: {
        status: subscription.status,
        endDate: new Date(subscription.current_period_end * 1000),
        nextBilling: new Date(subscription.current_period_end * 1000)
      }
    })

    console.log(`Updated subscription for user ${user.email} to ${tier}`)

  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer
    
    const user = await prisma.user.findFirst({
      where: { customerId }
    })

    if (!user) {
      console.error('User not found for Stripe customer:', customerId)
      return
    }

    // Downgrade user to free tier
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        subscriptionExpires: new Date()
      }
    })

    // Update subscription record
    await prisma.subscription.updateMany({
      where: { providerId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        cancelReason: 'stripe_cancellation'
      }
    })

    console.log(`Canceled subscription for user ${user.email}`)

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription
    
    if (!subscriptionId) return

    // Find subscription
    const subscription = await prisma.subscription.findFirst({
      where: { providerId: subscriptionId }
    })

    if (!subscription) return

    // Record payment
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'succeeded',
        paymentProvider: 'stripe',
        providerId: invoice.payment_intent,
        paymentMethod: 'card',
        paidAt: new Date(invoice.status_transitions.paid_at * 1000)
      }
    })

    console.log(`Payment succeeded for subscription ${subscriptionId}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription
    
    if (!subscriptionId) return

    // Find subscription
    const subscription = await prisma.subscription.findFirst({
      where: { providerId: subscriptionId }
    })

    if (!subscription) return

    // Record failed payment
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'failed',
        paymentProvider: 'stripe',
        providerId: invoice.payment_intent || invoice.id,
        failureReason: 'payment_failed'
      }
    })

    // Update user status to payment failed
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        subscriptionStatus: 'payment_failed'
      }
    })

    console.log(`Payment failed for subscription ${subscriptionId}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}