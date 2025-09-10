'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown, 
  ArrowRight,
  Loader2,
  CreditCard,
  Shield,
  Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { SUBSCRIPTION_TIERS, FREE_TIER } from '@/lib/subscription-tiers'
import toast from 'react-hot-toast'

interface SubscriptionStatus {
  tier: string
  isActive: boolean
  expiresAt?: Date
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus()
    }
  }, [user])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription')
      const data = await response.json()
      setCurrentSubscription(data.status)
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    }
  }

  const handleSubscribe = async (tierId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      router.push('/auth/signin')
      return
    }

    setLoading(tierId)
    
    try {
      // Create checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierId,
          provider: 'stripe', // Default to Stripe, can add provider selection
          billing: billingCycle === 'quarterly' ? 'quarterly' : 'monthly'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (data.code === 'TIER_REQUIRED') {
          toast.error('This feature requires a subscription upgrade')
          return
        }
        throw new Error(data.error || 'Failed to create payment session')
      }

      // Redirect to payment provider
      if (data.url) {
        window.location.href = data.url
      } else if (data.provider === 'razorpay') {
        // Handle Razorpay checkout (implement if needed)
        toast.success('Razorpay integration coming soon!')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to start subscription process')
    } finally {
      setLoading(null)
    }
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'basic': return Star
      case 'premium': return Zap
      case 'elite': return Crown
      default: return Star
    }
  }

  const isCurrentTier = (tierId: string) => {
    return currentSubscription?.tier === tierId && currentSubscription?.isActive
  }

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const getDiscount = (monthly: number, quarterly: number) => {
    return Math.round((1 - (quarterly / 3) / monthly) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
          >
            <Crown size={20} className="text-neon-cyan" />
            <span className="text-white font-medium">Choose Your Career Success Plan</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Unlock Your
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {' '}Career Potential
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            From personalized AI guidance to advanced career roadmaps, choose the perfect plan 
            to accelerate your professional growth.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-1"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                billingCycle === 'quarterly'
                  ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quarterly
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-neon-pink to-neon-purple text-white text-xs px-2 py-1 rounded-full">
                Save 25%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {SUBSCRIPTION_TIERS.map((tier, index) => {
            const Icon = getTierIcon(tier.id)
            const isPopular = tier.popular
            const isCurrent = isCurrentTier(tier.id)
            const discount = getDiscount(tier.price.monthly, tier.price.quarterly)

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl border-2 p-8 ${
                  isPopular 
                    ? 'border-neon-cyan shadow-lg shadow-neon-cyan/25 scale-105' 
                    : 'border-gray-800 hover:border-gray-700'
                } transition-all duration-300 group`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 rounded-full">
                      <span className="text-black font-bold text-sm">Most Popular</span>
                    </div>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-xs">Current Plan</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tier.color} bg-opacity-20 mb-4`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 mb-6">{tier.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">
                        ${formatPrice(tier.price[billingCycle])}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{billingCycle === 'quarterly' ? '3 months' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'quarterly' && (
                      <div className="text-green-400 text-sm mt-1">
                        Save ${formatPrice((tier.price.monthly * 3) - tier.price.quarterly)} ({discount}% off)
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${tier.color} bg-opacity-20 flex items-center justify-center mt-0.5`}>
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id || isCurrent}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isCurrent
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black hover:shadow-lg hover:shadow-neon-cyan/25 hover:scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {loading === tier.id ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isCurrent ? (
                    <span>Current Plan</span>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Free Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Try Free First</h3>
          <p className="text-gray-400 mb-6">
            Explore our platform with limited access to all features
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {FREE_TIER.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check size={16} className="text-neon-cyan" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/auth/signup')}
            className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-gray-700 hover:border-gray-600"
          >
            Start Free Trial
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
              <Shield size={24} className="text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Secure Payments</h4>
            <p className="text-gray-400">Enterprise-grade security with SSL encryption</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
              <CreditCard size={24} className="text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Flexible Billing</h4>
            <p className="text-gray-400">Cancel anytime, no hidden fees</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
              <Clock size={24} className="text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">30-Day Guarantee</h4>
            <p className="text-gray-400">Full refund if you're not satisfied</p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Can I upgrade or downgrade anytime?</h4>
              <p className="text-gray-400">Yes, you can change your plan at any time. Upgrades are immediate, and downgrades take effect at the next billing cycle.</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-3">What payment methods do you accept?</h4>
              <p className="text-gray-400">We accept all major credit cards, debit cards, and digital wallets through Stripe and Razorpay.</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Is there a free trial?</h4>
              <p className="text-gray-400">Yes, you can try our platform for free with limited features. No credit card required for the free tier.</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-3">What's included in Elite Plan AI models?</h4>
              <p className="text-gray-400">Elite members get access to ChatGPT-5, Gemini Pro, and our specialized Brock AI career coach for personalized guidance.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}