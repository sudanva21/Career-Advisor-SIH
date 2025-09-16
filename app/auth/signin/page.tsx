'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'

// Dynamically import 3D components
const BackgroundLines3D = dynamic(() => import('@/components/BackgroundLines3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-space-dark opacity-50" />
})

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function SignInPage() {
  const router = useRouter()
  const { signIn, user, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      const searchParams = new URLSearchParams(window.location.search)
      const next = searchParams.get('next') || '/dashboard'
      router.push(next)
    }
  }, [user, authLoading, router])

  // Check for success messages in URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const message = searchParams.get('message')
    
    if (message === 'account-created') {
      setSuccessMessage('Account created successfully! You can now sign in.')
    }
  }, [])

  const validateForm = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        setErrors({ general: error.message || 'Invalid credentials. Please try again.' })
      } else {
        // Wait a moment for the authentication state to update
        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search)
          const next = searchParams.get('next') || '/dashboard'
          router.push(next)
        }, 100)
      }
      
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-dark relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-bg"></div>
      </div>
      <div className="absolute inset-0 opacity-30">
        <BackgroundLines3D />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full flex items-center justify-center">
                <span className="text-space-dark font-bold text-xl">CA</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue your career journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-8 rounded-2xl">
              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm"
                >
                  {successMessage}
                </motion.div>
              )}

              {/* General Error */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                >
                  {errors.general}
                </motion.div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className={`block w-full pl-12 pr-3 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-600 focus:border-neon-cyan focus:ring-neon-cyan/50'
                    }`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className={`block w-full pl-12 pr-12 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-600 focus:border-neon-cyan focus:ring-neon-cyan/50'
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-neon-cyan transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-neon-cyan hover:text-neon-pink transition-colors text-sm font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full bg-gradient-to-r from-neon-cyan to-neon-pink px-8 py-4 rounded-lg text-space-dark font-bold text-lg hover:shadow-lg hover:shadow-neon-cyan/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-space-dark border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-neon-cyan hover:text-neon-pink transition-colors font-semibold"
              >
                Sign up now
              </Link>
            </p>
          </div>


        </motion.div>
      </div>
    </div>
  )
}