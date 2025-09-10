'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Settings, ChevronDown, Sparkles, MapPin, BookOpen, Target, Zap, Clock, Crown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false)
  const [isMobileFeatureDropdownOpen, setIsMobileFeatureDropdownOpen] = useState(false)
  const { user, profile, signOut, loading } = useAuth()
  const { translations } = useLanguage()
  const router = useRouter()
  const featureDropdownRef = useRef<HTMLDivElement>(null)



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featureDropdownRef.current && !featureDropdownRef.current.contains(event.target as Node)) {
        setIsFeatureDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMobileMenuOpen(false)
    setIsFeatureDropdownOpen(false)
    setIsMobileFeatureDropdownOpen(false)
  }

  const handleProtectedRoute = (href: string) => {
    if (!user) {
      router.push(`/auth/signin?next=${encodeURIComponent(href)}`)
      return
    }
    router.push(href)
    setIsMobileMenuOpen(false)
    setIsFeatureDropdownOpen(false)
    setIsMobileFeatureDropdownOpen(false)
  }

  const features = [
    { 
      name: translations.features.careerQuiz.name, 
      href: '/quiz', 
      icon: Sparkles, 
      description: translations.features.careerQuiz.description,
      requiresAuth: false
    },
    { 
      name: translations.features.collegeFinder.name, 
      href: '/colleges', 
      icon: MapPin, 
      description: translations.features.collegeFinder.description,
      requiresAuth: false
    },
    { 
      name: translations.features.aiRoadmap.name, 
      href: '/ai-roadmap', 
      icon: Target, 
      description: translations.features.aiRoadmap.description,
      requiresAuth: true
    },
    { 
      name: translations.features.jobHunting.name, 
      href: '/job-hunting', 
      icon: Zap, 
      description: translations.features.jobHunting.description,
      requiresAuth: true
    },
    { 
      name: translations.features.careerTree.name, 
      href: '/career-tree', 
      icon: Zap, 
      description: translations.features.careerTree.description,
      requiresAuth: false
    },
    { 
      name: translations.features.learningResources.name, 
      href: '/learning-resources', 
      icon: BookOpen, 
      description: translations.features.learningResources.description,
      requiresAuth: false
    },
    { 
      name: translations.features.subscriptionPlans.name, 
      href: '/pricing', 
      icon: Crown, 
      description: translations.features.subscriptionPlans.description,
      requiresAuth: false
    }
  ]

  const navItems = [
    { name: translations.nav.home, href: '/' },
    { name: translations.nav.colleges, href: '/colleges' },
    ...(user ? [{ name: translations.nav.pricing, href: '/pricing' }] : [])
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-space-dark/90 backdrop-blur-lg border-b border-neon-cyan/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full flex items-center justify-center">
              <span className="text-space-dark font-bold text-sm">CA</span>
            </div>
            <span className="text-white font-bold text-xl">Career Advisor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.href.startsWith('#') ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-gray-300 hover:text-neon-cyan transition-colors duration-200 font-medium"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-neon-cyan transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Features Dropdown */}
            <div className="relative" ref={featureDropdownRef}>
              <button
                onClick={() => setIsFeatureDropdownOpen(!isFeatureDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsFeatureDropdownOpen(!isFeatureDropdownOpen)
                  }
                }}
                className="text-gray-300 hover:text-neon-cyan transition-colors duration-200 font-medium flex items-center space-x-1"
                aria-haspopup="true"
                aria-expanded={isFeatureDropdownOpen}
                role="button"
                tabIndex={0}
              >
                <span>{translations.nav.features}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFeatureDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isFeatureDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 w-80 bg-space-dark/95 backdrop-blur-lg border border-neon-cyan/20 rounded-xl shadow-2xl shadow-neon-cyan/10 z-50"
                    role="menu"
                    aria-label="Features menu"
                  >
                    <div className="p-2">
                      {features.map((feature, index) => {
                        const IconComponent = feature.icon
                        return (
                          <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {feature.requiresAuth && !user ? (
                              <button
                                onClick={() => handleProtectedRoute(feature.href)}
                                className="w-full p-3 rounded-lg hover:bg-gray-800/50 transition-colors group text-left"
                                role="menuitem"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
                                    <IconComponent className="w-4 h-4 text-neon-cyan" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-white group-hover:text-neon-cyan transition-colors">
                                      {feature.name}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                      {feature.description}
                                    </div>
                                    <div className="text-xs text-neon-pink mt-1">
                                      {translations.features.signInRequired}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ) : feature.href.startsWith('#') ? (
                              <button
                                onClick={() => handleNavClick(feature.href)}
                                className="w-full p-3 rounded-lg hover:bg-gray-800/50 transition-colors group text-left"
                                role="menuitem"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
                                    <IconComponent className="w-4 h-4 text-neon-cyan" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-white group-hover:text-neon-cyan transition-colors">
                                      {feature.name}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                      {feature.description}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ) : (
                              <Link
                                href={feature.href}
                                onClick={() => {
                                  setIsFeatureDropdownOpen(false)
                                  setIsMobileMenuOpen(false)
                                }}
                                className="block w-full p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                                role="menuitem"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
                                    <IconComponent className="w-4 h-4 text-neon-cyan" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-white group-hover:text-neon-cyan transition-colors">
                                      {feature.name}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                      {feature.description}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Dashboard Link (visible only when authenticated) */}
            {!loading && user && (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-neon-cyan/20 to-neon-pink/20 border border-neon-cyan/30 rounded-lg text-white hover:border-neon-cyan hover:shadow-lg hover:shadow-neon-cyan/25 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{translations.nav.dashboard}</span>
              </Link>
            )}
            
            {!loading && user ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-2 text-white bg-gradient-to-r from-neon-cyan/20 to-neon-pink/20 px-4 py-2 rounded-lg border border-neon-cyan/30 hover:border-neon-cyan transition-all"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('👤 User dropdown clicked:', profile?.first_name || user.email)
                      // The dropdown will show on hover anyway, but this ensures it works on click too
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>{profile?.first_name || user.email?.split('@')[0] || 'User'}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-space-dark border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                        {user.email}
                      </div>
                      <Link href="/profile" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors">
                        <User className="w-4 h-4 mr-2" />
                        {translations.nav.profile}
                      </Link>
                      <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors">
                        <Settings className="w-4 h-4 mr-2" />
                        {translations.nav.dashboard}
                      </Link>
                      <Link href="/subscription" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors">
                        <Crown className="w-4 h-4 mr-2" />
                        {translations.dashboard.subscription}
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {translations.nav.signOut}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading && !user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {translations.nav.signIn}
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-neon-cyan to-neon-pink px-6 py-2 rounded-lg text-space-dark font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all"
                >
                  {translations.auth.signUp}
                </Link>
              </div>
            ) : (
              <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-neon-cyan transition-colors p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            {navItems.map((item) => (
              item.href.startsWith('#') ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="block text-gray-300 hover:text-neon-cyan transition-colors font-medium text-left"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-neon-cyan transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Mobile Features Dropdown */}
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={() => setIsMobileFeatureDropdownOpen(!isMobileFeatureDropdownOpen)}
                className="w-full flex items-center justify-between text-gray-300 hover:text-neon-cyan transition-colors font-medium text-left"
                aria-haspopup="true"
                aria-expanded={isMobileFeatureDropdownOpen}
              >
                <span>{translations.nav.features}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileFeatureDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isMobileFeatureDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-2 pl-4 border-l border-gray-700"
                    role="menu"
                    aria-label="Mobile features menu"
                  >
                    {features.map((feature, index) => {
                      const IconComponent = feature.icon
                      return (
                        <motion.div
                          key={feature.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {feature.requiresAuth && !user ? (
                            <button
                              onClick={() => handleProtectedRoute(feature.href)}
                              className="w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors group text-left"
                              role="menuitem"
                            >
                              <div className="flex items-center space-x-3">
                                <IconComponent className="w-4 h-4 text-neon-cyan" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-white group-hover:text-neon-cyan transition-colors">
                                    {feature.name}
                                  </div>
                                  <div className="text-xs text-neon-pink">{translations.features.signInRequired}</div>
                                </div>
                              </div>
                            </button>
                          ) : feature.href.startsWith('#') ? (
                            <button
                              onClick={() => handleNavClick(feature.href)}
                              className="w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors group text-left"
                              role="menuitem"
                            >
                              <div className="flex items-center space-x-3">
                                <IconComponent className="w-4 h-4 text-neon-cyan" />
                                <div className="text-sm font-medium text-white group-hover:text-neon-cyan transition-colors">
                                  {feature.name}
                                </div>
                              </div>
                            </button>
                          ) : (
                            <Link
                              href={feature.href}
                              onClick={() => {
                                setIsMobileFeatureDropdownOpen(false)
                                setIsMobileMenuOpen(false)
                              }}
                              className="block w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
                              role="menuitem"
                            >
                              <div className="flex items-center space-x-3">
                                <IconComponent className="w-4 h-4 text-neon-cyan" />
                                <div className="text-sm font-medium text-white group-hover:text-neon-cyan transition-colors">
                                  {feature.name}
                                </div>
                              </div>
                            </Link>
                          )}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile Language Switcher */}
            <div className="pt-4 border-t border-gray-700">
              <LanguageSwitcher />
            </div>
            
            {/* Mobile Dashboard Link */}
            {!loading && user && profile && (
              <Link
                href="/dashboard"
                className="block px-4 py-3 bg-gradient-to-r from-neon-cyan/20 to-neon-pink/20 border border-neon-cyan/30 rounded-lg text-white hover:border-neon-cyan transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>{translations.nav.dashboard}</span>
                </div>
              </Link>
            )}
            
            {!loading && user && profile ? (
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <div className="text-white">{translations.dashboard.welcome.replace('!', '')}, {profile.first_name}!</div>
                <div className="text-sm text-gray-400">{user.email}</div>
                <Link
                  href="/profile"
                  className="block text-gray-300 hover:text-neon-cyan transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translations.nav.profile}
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-gray-300 hover:text-neon-cyan transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translations.nav.dashboard}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block text-gray-300 hover:text-neon-cyan transition-colors text-left"
                >
                  {translations.nav.signOut}
                </button>
              </div>
            ) : !loading && !user ? (
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <Link
                  href="/auth/signin"
                  className="block text-gray-300 hover:text-neon-cyan transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translations.nav.signIn}
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-gradient-to-r from-neon-cyan to-neon-pink px-6 py-2 rounded-lg text-space-dark font-semibold text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translations.auth.signUp}
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-700">
                <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}