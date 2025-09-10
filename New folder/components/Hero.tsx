'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

// Dynamically import 3D component with SSR disabled
const HeroLines3D = dynamic(() => import('./HeroLines3D').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-space-dark via-space-darker to-space-dark opacity-50" />
  )
})

const Hero = () => {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { translations } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToFeatures = () => {
    const element = document.querySelector('#features')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToQuiz = () => {
    // Check if user is authenticated
    if (user) {
      router.push('/quiz')
    } else {
      router.push('/auth/signin')
    }
  }

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-space-dark"
    >
      {/* Background Grid Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-bg"></div>
      </div>

      {/* 3D Background Lines */}
      {mounted && (
        <div className="absolute inset-0 opacity-60">
          <HeroLines3D />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple text-glow">
              {translations.hero.title}
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Discover your path with{' '}
            <span className="text-neon-cyan font-semibold">AI-powered quizzes</span>,{' '}
            <span className="text-neon-pink font-semibold">3D career maps</span> &{' '}
            <span className="text-neon-purple font-semibold">nearby government college suggestions</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
          >
            {/* Always show these CTAs to match test expectations */}
            <>
              {/* Primary CTA - Start Your Quiz */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToQuiz}
                className="group relative px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center gap-3 min-w-[200px] justify-center"
              >
                <span>Start Your Quiz</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
              </motion.button>

              {/* Secondary CTA - Learn How It Works */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToFeatures}
                className="group relative px-8 py-4 border-2 border-glass-border rounded-lg text-white font-semibold text-lg transition-all duration-300 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center gap-3 min-w-[200px] justify-center glass-card"
              >
                <Play className="w-5 h-5" />
                <span>Learn How It Works</span>
              </motion.button>
            </>
          </motion.div>

          {/* Stats or Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto"
          >
            {[
              { number: '10K+', label: 'Students Guided' },
              { number: '500+', label: 'Career Paths' },
              { number: '1000+', label: 'Colleges Listed' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="text-2xl sm:text-3xl font-bold text-neon-cyan">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="w-1 h-3 bg-neon-cyan rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-space-dark via-transparent to-space-dark/50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-space-dark/30 via-transparent to-space-dark/30 pointer-events-none"></div>
    </section>
  )
}

export default Hero