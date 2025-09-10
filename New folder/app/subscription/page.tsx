'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Check, 
  X, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { SUBSCRIPTION_TIERS, FREE_TIER, getSubscriptionTier } from '@/lib/subscription-tiers'
import toast from 'react-hot-toast'

interface UserSubscription {
  id: string
  tier: string
  status: 'active' | 'canceled' | 'expired' | 'pending'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
  billing: 'monthly' | 'quarterly'
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchSubscription()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription')
      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data.subscription)
      } else {
        console.error('Error fetching subscription:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (tierId: string) => {
    router.push(`/pricing?upgrade=${tierId}`)
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    setActionLoading('cancel')
    try {
      const response = await fetch('/api/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data.subscription)
        toast.success('Subscription canceled successfully. You can continue using premium features until the end of your billing period.')
      } else {
        toast.error(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivate = async () => {
    if (!subscription) return
    
    setActionLoading('reactivate')
    try {
      const response = await fetch('/api/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data.subscription)
        toast.success('Subscription reactivated successfully!')
      } else {
        toast.error(data.error || 'Failed to reactivate subscription')
      }
    } catch (error) {
      toast.error('Failed to reactivate subscription')
    } finally {
      setActionLoading(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8">You need to sign in to view your subscription details.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-4 rounded-lg text-black font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading your subscription details...</p>
        </div>
      </div>
    )
  }

  const currentTier = subscription ? getSubscriptionTier(subscription.tier) : FREE_TIER
  const isActive = subscription?.status === 'active'
  const isCanceled = subscription?.cancelAtPeriodEnd
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
          >
            <Crown size={20} className="text-neon-cyan" />
            <span className="text-white font-medium">Subscription Management</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Your Career
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {' '}Plan
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Manage your subscription, view usage, and upgrade your plan
          </motion.p>
        </div>

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl border-2 border-neon-cyan/30 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentTier?.color} bg-opacity-20 flex items-center justify-center`}>
                {currentTier?.id === 'basic' ? <Star size={32} className="text-white" /> :
                 currentTier?.id === 'premium' ? <Zap size={32} className="text-white" /> :
                 <Crown size={32} className="text-white" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentTier?.name}</h2>
                <p className="text-gray-400">{currentTier?.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : subscription?.status === 'expired'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {subscription ? (
                  isCanceled ? 'Canceling' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
                ) : 'Free'}
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          {subscription && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar size={16} className="text-neon-cyan" />
                  <span className="text-gray-300 text-sm">Billing Cycle</span>
                </div>
                <p className="text-white font-semibold capitalize">{subscription.billing}</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard size={16} className="text-neon-cyan" />
                  <span className="text-gray-300 text-sm">Next Payment</span>
                </div>
                <p className="text-white font-semibold">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Current Plan Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Plan Features</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {currentTier?.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check size={16} className="text-neon-cyan mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!subscription || subscription.tier === 'free' ? (
              <button
                onClick={() => router.push('/pricing')}
                className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 rounded-lg text-black font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Upgrade Now</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                {subscription.tier !== 'elite' && (
                  <button
                    onClick={() => handleUpgrade('elite')}
                    className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 rounded-lg text-black font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Upgrade to Elite</span>
                    <ArrowRight size={16} />
                  </button>
                )}
                
                {isCanceled ? (
                  <button
                    onClick={handleReactivate}
                    disabled={actionLoading === 'reactivate'}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {actionLoading === 'reactivate' ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        <span>Reactivate</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {actionLoading === 'cancel' ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <X size={16} />
                        <span>Cancel Subscription</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-gray-600 rounded-lg font-semibold transition-all"
            >
              View All Plans
            </button>
          </div>

          {/* Cancellation Warning */}
          {isCanceled && (
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">Subscription Ending</h4>
                <p className="text-gray-300 text-sm">
                  Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. 
                  You can reactivate anytime before then to continue your premium access.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 text-center">
            <CreditCard size={32} className="text-neon-cyan mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Payment History</h3>
            <p className="text-gray-400 text-sm mb-4">View all your transactions and receipts</p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-all">
              View History
            </button>
          </div>

          <div className="bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 text-center">
            <RefreshCw size={32} className="text-neon-cyan mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Usage Stats</h3>
            <p className="text-gray-400 text-sm mb-4">Monitor your API usage and limits</p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-all">
              View Usage
            </button>
          </div>

          <div className="bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 text-center">
            <Crown size={32} className="text-neon-cyan mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Refer & Earn</h3>
            <p className="text-gray-400 text-sm mb-4">Get rewards for referring friends</p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-all">
              Refer Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}