'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Sparkles, MapPin, Clock, Zap, BookOpen, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

const features = [
  {
    id: '3d-career-tree',
    icon: Sparkles,
    title: '3D Career Tree',
    description: 'Explore career paths in an interactive 3D environment. Visualize connections between skills, industries, and opportunities.',
    color: 'neon-cyan',
    gradient: 'from-neon-cyan to-blue-500'
  },
  {
    id: 'college-finder',
    icon: MapPin,
    title: 'College Finder',
    description: 'Discover nearby government colleges with AI-powered recommendations based on your interests and academic performance.',
    color: 'neon-pink',
    gradient: 'from-neon-pink to-purple-500'
  },
  {
    id: 'timeline-tracker',
    icon: Clock,
    title: 'Timeline Tracker',
    description: 'Plan your educational journey with personalized timelines, milestones, and deadline reminders.',
    color: 'neon-purple',
    gradient: 'from-neon-purple to-indigo-500'
  }
]

const additionalFeatures = [
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations based on your skills and interests',
    color: 'neon-cyan',
    href: '/roadmap'
  },
  {
    icon: BookOpen,
    title: 'Study Materials',
    description: 'Access curated resources for entrance exams and skill development',
    color: 'neon-pink',
    href: '/learning-resources'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and track academic and career goals with smart reminders',
    color: 'neon-purple',
    href: '/dashboard'
  }
]

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const IconComponent = feature.icon
  const router = useRouter()
  const { user } = useAuth()

  const handleFeatureClick = () => {
    if (feature.id === '3d-career-tree') {
      router.push('/career-tree')
    } else if (feature.id === 'college-finder') {
      router.push('/colleges')
    } else if (feature.id === 'timeline-tracker') {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/signin?next=/dashboard')
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onClick={handleFeatureClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleFeatureClick()
        }
      }}
      className="group relative glass-card p-8 h-full cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${feature.title}`}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-neon-cyan/5 group-hover:via-neon-pink/5 group-hover:to-neon-purple/5 transition-all duration-500 pointer-events-none" />
      
      {/* Icon */}
      <div className="relative mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="w-full h-full text-white" />
        </div>
        
        {/* Icon glow */}
        <div className={`absolute inset-0 w-16 h-16 rounded-full bg-${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3 
          className="text-2xl font-bold text-white mb-4 group-hover:text-glow transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          {feature.title}
        </motion.h3>
        
        <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {feature.description}
        </p>
      </div>

      {/* Interactive elements */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`w-8 h-8 rounded-full bg-${feature.color} flex items-center justify-center`}>
          <motion.div
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.3 }}
          >
            <Zap className="w-4 h-4 text-space-dark" />
          </motion.div>
        </div>
      </div>

      {/* Border animation */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-neon-cyan/30 transition-all duration-500" />
    </motion.div>
  )
}

const AdditionalFeatureCard = ({ feature, index }: { feature: typeof additionalFeatures[0], index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const IconComponent = feature.icon
  const router = useRouter()
  const { user } = useAuth()

  const handleClick = () => {
    if (feature.href) {
      if ((feature.href === '/dashboard' || feature.href === '/roadmap') && !user) {
        router.push(`/auth/signin?next=${encodeURIComponent(feature.href)}`)
      } else {
        router.push(feature.href)
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className="flex items-start space-x-4 p-6 rounded-xl glass-card hover:bg-glass-bg group cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Navigate to ${feature.title}`}
    >
      <div className={`p-3 rounded-lg bg-${feature.color}/20 group-hover:bg-${feature.color}/30 transition-colors duration-300`}>
        <IconComponent className={`w-6 h-6 text-${feature.color}`} />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
        <p className="text-gray-300 text-sm">{feature.description}</p>
      </div>
    </motion.div>
  )
}

const FeatureCards = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const router = useRouter()
  const { user } = useAuth()
  const { translations } = useLanguage()

  // Generate features from translations
  const translatedFeatures = [
    {
      id: '3d-career-tree',
      icon: Sparkles,
      title: translations.featureCards.careerVisualization.title,
      description: translations.featureCards.careerVisualization.description,
      color: 'neon-cyan',
      gradient: 'from-neon-cyan to-blue-500'
    },
    {
      id: 'college-finder',
      icon: MapPin,
      title: translations.featureCards.collegeRecommendations.title,
      description: translations.featureCards.collegeRecommendations.description,
      color: 'neon-pink',
      gradient: 'from-neon-pink to-purple-500'
    },
    {
      id: 'quiz',
      icon: Clock,
      title: translations.featureCards.personalizedQuiz.title,
      description: translations.featureCards.personalizedQuiz.description,
      color: 'neon-purple',
      gradient: 'from-neon-purple to-indigo-500'
    }
  ]

  const handleExploreFeatures = () => {
    // Scroll to top and then navigate to features through navbar
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Small delay to allow scroll, then trigger navbar features dropdown
    setTimeout(() => {
      const featuresButton = document.querySelector('[aria-label="Features menu"]')?.parentElement?.querySelector('button')
      if (featuresButton) {
        featuresButton.click()
      }
    }, 500)
  }

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-b from-space-dark to-space-darker overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid-bg"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Powerful Features for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
              Your Future
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Discover the tools and insights you need to make informed decisions about your career and education path.
          </motion.p>
        </motion.div>

        {/* Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {translatedFeatures.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {additionalFeatures.map((feature, index) => (
            <AdditionalFeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExploreFeatures}
            className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 cursor-pointer"
            role="button"
            aria-label="Explore all platform features"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleExploreFeatures()
              }
            }}
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 -left-32 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl"></div>
    </section>
  )
}

export default FeatureCards