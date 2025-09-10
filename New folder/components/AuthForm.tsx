'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, User, Lock, ArrowRight } from 'lucide-react'
import { SignUpInput, SignInInput } from '@/lib/validations'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSubmit: (data: SignUpInput | SignInInput) => Promise<void>
  isLoading?: boolean
  error?: string
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<SignUpInput | SignInInput>(
    mode === 'signup' 
      ? { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
      : { email: '', password: '' }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-bg"></div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400"
            >
              {mode === 'signin' 
                ? 'Sign in to continue your career journey'
                : 'Start your personalized career discovery'
              }
            </motion.p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={(formData as SignUpInput).firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={(formData as SignUpInput).lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                    required
                  />
                </motion.div>
              </div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signup' ? 0.5 : 0.4 }}
              className="relative"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                required
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signup' ? 0.6 : 0.5 }}
              className="relative"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative"
              >
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={(formData as SignUpInput).confirmPassword || ''}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signup' ? 0.8 : 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-space-dark border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: mode === 'signup' ? 0.9 : 0.7 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <a 
                href={mode === 'signin' ? '/auth/signup' : '/auth/signin'}
                className="text-neon-cyan hover:text-neon-pink transition-colors font-semibold"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthForm