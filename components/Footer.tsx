'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  ArrowUp
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { translations } = useLanguage()

  const footerLinks = {
    product: [
      { name: translations?.footer?.features || 'Features', href: '#features' },
      { name: translations?.features?.careerQuiz?.name || 'Career Quiz', href: '#quiz' },
      { name: translations?.features?.careerTree?.name || '3D Career Tree', href: '#career-map' },
      { name: translations?.features?.collegeFinder?.name || 'College Finder', href: '#colleges' },
      { name: 'Timeline Tracker', href: '#timeline' }
    ],
    company: [
      { name: translations?.footer?.about || 'About', href: '/about' },
      { name: translations?.footer?.team || 'Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: translations?.footer?.press || 'Press', href: '/press' },
      { name: translations?.footer?.contact || 'Contact', href: '/contact' }
    ],
    resources: [
      { name: translations?.footer?.help || 'Help', href: '/help' },
      { name: 'Study Materials', href: '/materials' },
      { name: 'Career Guides', href: '/guides' },
      { name: translations?.footer?.blog || 'Blog', href: '/blog' },
      { name: 'API Docs', href: '/api' }
    ],
    legal: [
      { name: translations?.footer?.privacy || 'Privacy Policy', href: '/privacy' },
      { name: translations?.footer?.terms || 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-300' }
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <footer className="relative bg-gradient-to-t from-space-darker to-space-dark border-t border-glass-border">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid-bg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3"
              >
                <Sparkles className="h-8 w-8 text-neon-cyan" />
                <span className="text-2xl font-bold text-white">
                  Career<span className="text-neon-cyan">Guide</span>
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-gray-300 text-sm leading-relaxed max-w-md"
              >
                {translations?.footer?.description || 'Your comprehensive platform for career guidance and college recommendations powered by AI.'}
              </motion.p>

              {/* Contact Info */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 text-gray-300 text-sm"
                >
                  <Mail className="h-4 w-4 text-neon-cyan" />
                  <span>sudanva7@gmail.com</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 text-gray-300 text-sm"
                >
                  <Phone className="h-4 w-4 text-neon-cyan" />
                  <span>+91 7204686919</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 text-gray-300 text-sm"
                >
                  <MapPin className="h-4 w-4 text-neon-cyan" />
                  <span>123 Innovation Drive, Tech City</span>
                </motion.div>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <div key={category} className="space-y-4">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                  className="text-white font-semibold uppercase text-sm tracking-wider"
                >
                  {category === 'product' ? translations.footer.features : 
                   category === 'company' ? 'Company' : 
                   category === 'resources' ? translations.footer.support : 
                   category === 'legal' ? translations.footer.legal : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.h3>
                <ul className="space-y-3">
                  {links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: categoryIndex * 0.1 + linkIndex * 0.05 
                      }}
                      viewport={{ once: true }}
                    >
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-gray-300 hover:text-neon-cyan transition-colors duration-300 text-sm group flex items-center"
                      >
                        <span className="relative">
                          {link.name}
                          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-neon-cyan transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-glass-border"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex space-x-6">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      viewport={{ once: true }}
                      className={`text-gray-400 ${social.color} transition-all duration-300 p-2 rounded-full glass-card`}
                      aria-label={social.name}
                    >
                      <IconComponent className="h-5 w-5" />
                    </motion.a>
                  )
                })}
              </div>

              {/* Newsletter Signup */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4"
              >
                <span className="text-gray-300 text-sm">Stay updated:</span>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2 bg-glass-bg border border-glass-border rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-r-lg text-space-dark font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-glass-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm"
            >
              © {currentYear} CareerGuide. {translations?.footer?.copyright || 'All rights reserved.'} Built with ❤️ for students everywhere.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.1, y: -2 }}
              viewport={{ once: true }}
              onClick={scrollToTop}
              className="self-end md:self-auto p-3 rounded-full glass-card text-gray-400 hover:text-neon-cyan transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-neon-pink/5 rounded-full blur-3xl"></div>
    </footer>
  )
}

export default Footer