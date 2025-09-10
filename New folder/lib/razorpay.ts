import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const RAZORPAY_PLANS = {
  basic: {
    planId: 'plan_basic_monthly', // Replace with actual Razorpay plan IDs
    amount: 999, // ₹999 in paise (Indian currency)
    interval: 'monthly',
    features: [
      'Personalized AI Chatbot',
      'Basic career guidance',
      'Up to 100 messages/month',
      'Email support'
    ]
  },
  premium: {
    planId: 'plan_premium_monthly',
    amount: 1999, // ₹1999 in paise
    interval: 'monthly',
    features: [
      'Everything in Basic',
      'AI Roadmap Generator',
      'Up to 500 messages/month',
      'Priority support',
      'Skill assessments'
    ]
  },
  elite: {
    planId: 'plan_elite_quarterly',
    amount: 7999, // ₹7999 for 3 months in paise
    interval: 'quarterly',
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

export class RazorpayService {
  
  static async createCustomer(email: string, name?: string, contact?: string) {
    return await razorpay.customers.create({
      email,
      name,
      contact,
      notes: {
        source: 'careerpath_app'
      }
    })
  }

  static async createSubscription(customerId: string, planId: string) {
    return await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 120, // 10 years worth of payments
      notes: {
        source: 'careerpath_app'
      }
    })
  }

  static async createOrder(amount: number, currency = 'INR', receipt?: string) {
    return await razorpay.orders.create({
      amount: amount * 100, // Convert to smallest unit (paise)
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: {
        source: 'careerpath_app'
      }
    })
  }

  static async createPlan(
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    interval: number,
    amount: number,
    currency = 'INR',
    description?: string
  ) {
    return await razorpay.plans.create({
      period,
      interval,
      item: {
        name: description || 'CareerPath AI Subscription',
        amount: amount * 100, // Convert to paise
        currency,
        description
      },
      notes: {
        source: 'careerpath_app'
      }
    })
  }

  static async cancelSubscription(subscriptionId: string, cancelAtCycleEnd = false) {
    return await razorpay.subscriptions.cancel(subscriptionId, {
      cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0
    })
  }

  static async updateSubscription(subscriptionId: string, planId: string) {
    // Razorpay doesn't support direct plan updates, need to cancel and create new
    await this.cancelSubscription(subscriptionId, false)
    
    // Get customer from old subscription
    const oldSubscription = await razorpay.subscriptions.fetch(subscriptionId)
    const customerId = oldSubscription.customer_id
    
    // Create new subscription
    return await this.createSubscription(customerId, planId)
  }

  static async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string
  ): Promise<boolean> {
    const crypto = require('crypto')
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')
    
    return expectedSignature === signature
  }

  static async verifySubscription(
    subscriptionId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    const crypto = require('crypto')
    const body = subscriptionId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')
    
    return expectedSignature === signature
  }

  static async handleWebhook(body: any, signature: string) {
    const crypto = require('crypto')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex')
      
      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature')
      }
      
      const event = body.event
      const payload = body.payload
      
      switch (event) {
        case 'subscription.activated':
        case 'subscription.charged':
        case 'subscription.cancelled':
        case 'subscription.paused':
        case 'subscription.resumed':
          return {
            type: event,
            subscription: payload.subscription.entity
          }
        
        case 'payment.captured':
        case 'payment.failed':
          return {
            type: event,
            payment: payload.payment.entity
          }
        
        default:
          console.log(`Unhandled Razorpay event type: ${event}`)
          return null
      }
    } catch (err) {
      console.error('Razorpay webhook signature verification failed:', err)
      throw new Error('Invalid webhook signature')
    }
  }

  static async getPaymentDetails(paymentId: string) {
    return await razorpay.payments.fetch(paymentId)
  }

  static async getSubscriptionDetails(subscriptionId: string) {
    return await razorpay.subscriptions.fetch(subscriptionId)
  }

  static async createRefund(paymentId: string, amount?: number) {
    const refundData: any = { payment_id: paymentId }
    if (amount) {
      refundData.amount = amount * 100 // Convert to paise
    }
    
    return await razorpay.payments.refund(paymentId, refundData)
  }

}

export default razorpay