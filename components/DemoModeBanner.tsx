'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DemoModeBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode by checking environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const isConfigured = (
      url && 
      key && 
      url !== 'https://your-project-id.supabase.co' && 
      key !== 'your-anon-key-here' &&
      url.startsWith('https://') &&
      key.startsWith('eyJ')
    )
    
    setIsDemoMode(!isConfigured)
  }, [])

  if (!isDemoMode || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm border-b border-yellow-400/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-900" />
              <div className="text-sm font-medium text-yellow-900">
                <span className="font-bold">Demo Mode:</span> Multiple demo accounts available. 
                <span className="hidden sm:inline"> Try: demo@example.com/demo123, admin@example.com/admin123, or user@example.com/user123</span>
                <span className="sm:hidden"> Demo accounts available - check sign-in page.</span>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-yellow-900 hover:text-yellow-800 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}