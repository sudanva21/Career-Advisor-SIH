'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Activity,
  Crown,
  Star,
  Zap,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from 'recharts'

interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  churnRate: number
  conversionRate: number
  tierDistribution: {
    free: number
    basic: number
    premium: number
    elite: number
  }
}

interface SubscriptionRecord {
  id: string
  user: {
    email: string
    firstName?: string
    lastName?: string
  }
  tier: string
  status: string
  amount: number
  startDate: string
  nextBilling?: string
  usage: {
    chatMessages: number
    roadmapsCreated: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin (in real app, this would be a proper role check)
    if (!user || user.email !== 'admin@careerpath.ai') {
      router.push('/dashboard')
      return
    }

    loadAdminData()
  }, [user, router])

  const loadAdminData = async () => {
    try {
      // In a real app, these would be separate API calls
      const [statsRes, subscriptionsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/subscriptions')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (subscriptionsRes.ok) {
        const subsData = await subscriptionsRes.json()
        setSubscriptions(subsData.subscriptions || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      // Use mock data for demo
      setStats({
        totalUsers: 2847,
        activeSubscriptions: 1456,
        monthlyRevenue: 24150,
        churnRate: 3.2,
        conversionRate: 12.5,
        tierDistribution: {
          free: 1391,
          basic: 743,
          premium: 478,
          elite: 235
        }
      })

      setSubscriptions([
        {
          id: '1',
          user: { email: 'john.doe@email.com', firstName: 'John', lastName: 'Doe' },
          tier: 'premium',
          status: 'active',
          amount: 19.99,
          startDate: '2024-01-15',
          nextBilling: '2024-02-15',
          usage: { chatMessages: 234, roadmapsCreated: 3 }
        },
        {
          id: '2', 
          user: { email: 'jane.smith@email.com', firstName: 'Jane', lastName: 'Smith' },
          tier: 'elite',
          status: 'active',
          amount: 39.99,
          startDate: '2024-01-10',
          nextBilling: '2024-02-10',
          usage: { chatMessages: 456, roadmapsCreated: 8 }
        },
        {
          id: '3',
          user: { email: 'bob.wilson@email.com', firstName: 'Bob', lastName: 'Wilson' },
          tier: 'basic',
          status: 'canceled',
          amount: 9.99,
          startDate: '2024-01-05',
          usage: { chatMessages: 89, roadmapsCreated: 1 }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'from-blue-500 to-cyan-500'
      case 'premium': return 'from-purple-500 to-pink-500' 
      case 'elite': return 'from-yellow-400 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'canceled': return 'text-red-400 bg-red-400/10'
      case 'payment_failed': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = !searchTerm || 
      sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${sub.user.firstName} ${sub.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTier = filterTier === 'all' || sub.tier === filterTier
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    
    return matchesSearch && matchesTier && matchesStatus
  })

  const revenueData = [
    { name: 'Jan', revenue: 18500, subscriptions: 1234 },
    { name: 'Feb', revenue: 21200, subscriptions: 1342 },
    { name: 'Mar', revenue: 24150, subscriptions: 1456 },
  ]

  const tierData = stats ? [
    { name: 'Free', value: stats.tierDistribution.free, color: '#6B7280' },
    { name: 'Basic', value: stats.tierDistribution.basic, color: '#3B82F6' },
    { name: 'Premium', value: stats.tierDistribution.premium, color: '#8B5CF6' },
    { name: 'Elite', value: stats.tierDistribution.elite, color: '#F59E0B' },
  ] : []

  if (!user || user.email !== 'admin@careerpath.ai') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="animate-spin text-neon-cyan" size={24} />
          <span className="text-white">Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E17] via-[#1a1b3e] to-[#0B0E17] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Subscription analytics and user management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users size={24} className="text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CreditCard size={24} className="text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats?.activeSubscriptions || 0}</div>
                <div className="text-sm text-gray-400">Active Subscriptions</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <DollarSign size={24} className="text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${(stats?.monthlyRevenue || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-400">Monthly Revenue</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <TrendingUp size={24} className="text-cyan-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats?.conversionRate || 0}%</div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Revenue Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tier Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Subscription Tiers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Subscription Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Active Subscriptions</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="elite">Elite</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
              <option value="payment_failed">Payment Failed</option>
            </select>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300">User</th>
                  <th className="text-left py-3 px-4 text-gray-300">Tier</th>
                  <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300">Usage</th>
                  <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription, index) => (
                  <tr key={subscription.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">
                          {subscription.user.firstName} {subscription.user.lastName}
                        </div>
                        <div className="text-sm text-gray-400">{subscription.user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getTierColor(subscription.tier)} text-white`}>
                        {subscription.tier === 'basic' && <Star size={12} className="mr-1" />}
                        {subscription.tier === 'premium' && <Zap size={12} className="mr-1" />}
                        {subscription.tier === 'elite' && <Crown size={12} className="mr-1" />}
                        {subscription.tier}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">${subscription.amount}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-300">
                        <div>{subscription.usage.chatMessages} messages</div>
                        <div>{subscription.usage.roadmapsCreated} roadmaps</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-neon-cyan transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}