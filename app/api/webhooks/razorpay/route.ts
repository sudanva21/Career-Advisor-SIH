import { NextRequest, NextResponse } from 'next/server'
import { RazorpayService } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = await RazorpayService.handleWebhook(body, signature)
    
    if (!event) {
      return NextResponse.json({ received: true })
    }

    switch (event.type) {
      case 'subscription.activated':
      case 'subscription.charged':
        await handleSubscriptionActivated(event.subscription)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.subscription)
        break

      case 'payment.captured':
        await handlePaymentCaptured(event.payment)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payment)
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

async function handleSubscriptionActivated(subscription: any) {
  try {
    const customerId = subscription.customer_id
    
    // Find user by Razorpay customer ID
    const user = await prisma.user.findFirst({
      where: { customerId }
    })

    if (!user) {
      console.error('User not found for Razorpay customer:', customerId)
      return
    }

    // Get plan details to determine tier
    const planDetails = await RazorpayService.getSubscriptionDetails(subscription.id)
    let tier = 'free'
    
    if (planDetails.plan_id?.includes('basic')) tier = 'basic'
    else if (planDetails.plan_id?.includes('premium')) tier = 'premium'
    else if (planDetails.plan_id?.includes('elite')) tier = 'elite'

    // Calculate subscription dates
    const startDate = new Date(subscription.start_at * 1000)
    const endDate = new Date(subscription.end_at * 1000)

    // Update user subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        subscriptionStarted: startDate,
        subscriptionExpires: endDate,
        paymentProvider: 'razorpay'
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
        billing: subscription.plan_id?.includes('quarterly') ? 'quarterly' : 'monthly',
        amount: subscription.plan_id?.includes('basic') ? 999 : subscription.plan_id?.includes('premium') ? 1999 : 7999,
        currency: 'INR',
        paymentProvider: 'razorpay',
        providerId: subscription.id,
        customerId,
        startDate,
        endDate,
        nextBilling: endDate
      },
      update: {
        status: subscription.status,
        endDate,
        nextBilling: endDate
      }
    })

    console.log(`Activated subscription for user ${user.email} to ${tier}`)

  } catch (error) {
    console.error('Error handling subscription activation:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const customerId = subscription.customer_id
    
    const user = await prisma.user.findFirst({
      where: { customerId }
    })

    if (!user) {
      console.error('User not found for Razorpay customer:', customerId)
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
        cancelReason: 'razorpay_cancellation'
      }
    })

    console.log(`Canceled subscription for user ${user.email}`)

  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    // Find subscription by payment
    const subscription = await prisma.subscription.findFirst({
      where: { 
        paymentProvider: 'razorpay',
        status: 'active'
      },
      include: { user: true }
    })

    if (!subscription) return

    // Record payment
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency.toUpperCase(),
        status: 'succeeded',
        paymentProvider: 'razorpay',
        providerId: payment.id,
        paymentMethod: payment.method,
        paidAt: new Date(payment.created_at * 1000)
      }
    })

    console.log(`Payment captured for user ${subscription.user.email}`)

  } catch (error) {
    console.error('Error handling payment capture:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Find subscription by customer
    const subscription = await prisma.subscription.findFirst({
      where: { 
        paymentProvider: 'razorpay',
        status: 'active'
      },
      include: { user: true }
    })

    if (!subscription) return

    // Record failed payment
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: payment.amount / 100,
        currency: payment.currency.toUpperCase(),
        status: 'failed',
        paymentProvider: 'razorpay',
        providerId: payment.id,
        failureReason: payment.error_description || 'payment_failed'
      }
    })

    // Update user status to payment failed
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        subscriptionStatus: 'payment_failed'
      }
    })

    console.log(`Payment failed for user ${subscription.user.email}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}