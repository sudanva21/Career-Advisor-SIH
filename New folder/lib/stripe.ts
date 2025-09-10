import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const STRIPE_PLANS = {
  basic: {
    priceId: 'price_basic_monthly', // Replace with actual Stripe price IDs
    amount: 999, // $9.99 in cents
    interval: 'month',
    features: [
      'Personalized AI Chatbot',
      'Basic career guidance',
      'Up to 100 messages/month',
      'Email support'
    ]
  },
  premium: {
    priceId: 'price_premium_monthly',
    amount: 1999, // $19.99 in cents
    interval: 'month',
    features: [
      'Everything in Basic',
      'AI Roadmap Generator',
      'Up to 500 messages/month',
      'Priority support',
      'Skill assessments'
    ]
  },
  elite: {
    priceId: 'price_elite_quarterly',
    amount: 9999, // $99.99 for 3 months in cents
    interval: 'quarter',
    intervalCount: 3,
    features: [
      'Everything in Premium',
      'ChatGPT-5 & Gemini Pro access',
      'Brock AI Career Coach',
      'Unlimited messages',
      '1-on-1 mentoring sessions',
      'White-glove support'
    ]
  }
}

export class StripeService {
  
  static async createCustomer(email: string, name?: string) {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'careerpath_app'
      }
    })
  }

  static async createSubscription(customerId: string, priceId: string) {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })
  }

  static async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string
  ) {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          source: 'careerpath_app'
        }
      }
    })
  }

  static async updateSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'always_invoice',
    })
  }

  static async cancelSubscription(subscriptionId: string, immediately = false) {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId)
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }
  }

  static async createPromoCode(code: string, percentOff: number, validFor?: string[]) {
    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration: 'once',
      max_redemptions: 100,
    })

    return await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code.toUpperCase(),
      restrictions: validFor ? {
        first_time_transaction: true,
      } : undefined
    })
  }

  static async handleWebhook(body: string, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    try {
      const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          return {
            type: event.type,
            subscription: event.data.object as Stripe.Subscription
          }
        
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          return {
            type: event.type,
            invoice: event.data.object as Stripe.Invoice
          }
        
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`)
          return null
      }
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      throw new Error('Invalid webhook signature')
    }
  }

  static async getUsage(subscriptionId: string) {
    // Get usage records for metered billing if needed
    return await stripe.subscriptionItems.listUsageRecords(
      subscriptionId,
      {
        limit: 100,
      }
    )
  }

  static async reportUsage(subscriptionItemId: string, quantity: number) {
    // Report usage for metered billing
    return await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      }
    )
  }

}

export default stripe