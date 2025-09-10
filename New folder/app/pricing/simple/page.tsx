'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Crown } from 'lucide-react'

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for students and beginners',
    monthly: 9.99,
    quarterly: 24.99,
    features: [
      'AI Career Chatbot',
      'Basic Career Assessment',
      'College Database Access',
      'Email Support'
    ],
    icon: Star,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Ideal for professionals',
    monthly: 19.99,
    quarterly: 49.99,
    features: [
      'Everything in Basic',
      'AI Roadmap Generator',
      'Unlimited Roadmaps',
      'Priority Support'
    ],
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    description: 'For power users and enterprises',
    monthly: 39.99,
    quarterly: 99.99,
    features: [
      'Everything in Premium',
      'ChatGPT-5 & Gemini Pro',
      'Brock AI Assistant',
      '24/7 Support'
    ],
    icon: Crown,
    color: 'from-yellow-400 to-red-500'
  }
]

export default function SimplePricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly')

  const handleSubscribe = (planId: string) => {
    alert(`Subscribe to ${planId} plan - Payment integration coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {' '}Career Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Unlock your potential with AI-powered career guidance
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-neon-cyan text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                billingCycle === 'quarterly'
                  ? 'bg-neon-cyan text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quarterly
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-neon-pink to-neon-purple text-white text-xs px-2 py-1 rounded-full">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const price = plan[billingCycle]
            const savings = billingCycle === 'quarterly' ? (plan.monthly * 3 - plan.quarterly) : 0

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-neon-cyan shadow-lg shadow-neon-cyan/25 scale-105' 
                    : 'border-gray-800 hover:border-gray-700'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 rounded-full">
                      <span className="text-black font-bold text-sm">Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} bg-opacity-20 mb-4`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-6">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">
                        ${price.toFixed(2)}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{billingCycle === 'quarterly' ? '3 months' : 'month'}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="text-green-400 text-sm mt-1">
                        Save ${savings.toFixed(2)} (25% off)
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} bg-opacity-20 flex items-center justify-center mt-0.5`}>
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black hover:shadow-lg hover:scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-gray-700'
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}