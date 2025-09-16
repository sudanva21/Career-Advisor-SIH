'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle,
  Mail,
  Phone,
  Video,
  FileText,
  Users,
  Settings,
  Shield,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Getting Started')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const helpCategories = [
    { name: 'Getting Started', icon: BookOpen, count: 8 },
    { name: 'Account & Profile', icon: Users, count: 12 },
    { name: 'Career Assessment', icon: Settings, count: 15 },
    { name: 'Technical Support', icon: HelpCircle, count: 10 },
    { name: 'Privacy & Security', icon: Shield, count: 6 },
    { name: 'Billing & Payments', icon: CreditCard, count: 9 }
  ]

  const quickActions = [
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all platform features',
      action: 'Watch Now',
      color: 'text-neon-cyan'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      color: 'text-neon-pink'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your questions via email',
      action: 'Send Email',
      color: 'text-purple-400'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      action: 'Call Now',
      color: 'text-green-400'
    }
  ]

  const faqData = {
    'Getting Started': [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner, enter your email and create a password. You\'ll receive a confirmation email to verify your account.'
      },
      {
        question: 'What is the career assessment?',
        answer: 'Our AI-powered career assessment analyzes your interests, skills, and personality to recommend personalized career paths. It takes about 15-20 minutes to complete.'
      },
      {
        question: 'How accurate are the career recommendations?',
        answer: 'Our AI system has a 98% accuracy rate, trained on millions of career data points and continuously updated with industry trends and job market analysis.'
      },
      {
        question: 'Can I retake the career assessment?',
        answer: 'Yes! You can retake the assessment anytime as your interests and skills evolve. We recommend retaking it every 6-12 months or after major life changes.'
      }
    ],
    'Account & Profile': [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to Settings > Profile to update your personal information, contact details, and preferences. Changes are saved automatically.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes, go to Settings > Account > Email Settings. You\'ll need to verify the new email address before the change takes effect.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Account > Delete Account. This action is permanent and cannot be undone. All your data will be permanently removed.'
      }
    ],
    'Career Assessment': [
      {
        question: 'How long does the assessment take?',
        answer: 'The comprehensive assessment takes approximately 15-20 minutes. You can save your progress and continue later if needed.'
      },
      {
        question: 'What if I don\'t agree with my results?',
        answer: 'Career recommendations are starting points for exploration. You can explore other career paths, retake the assessment, or contact our career counselors for personalized guidance.'
      },
      {
        question: 'Can I see detailed explanations for my results?',
        answer: 'Yes! Each recommendation comes with detailed explanations, required skills, education paths, salary ranges, and growth prospects.'
      }
    ]
  }

  const contactOptions = [
    {
      method: 'Email',
      value: 'sudanva7@gmail.com',
      icon: Mail,
      description: 'General inquiries and support'
    },
    {
      method: 'Phone',
      value: '+91 7204686919',
      icon: Phone,
      description: 'Urgent support and technical issues'
    }
  ]

  const filteredFaqs = faqData[activeCategory as keyof typeof faqData]?.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-darker via-space-dark to-space-darker">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-bg opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-center space-x-3 px-6 py-3 glass-card rounded-full">
                <HelpCircle className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Help Center</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                How Can We Help?
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
            >
              Find answers to common questions, explore our knowledge base, 
              or get in touch with our support team for personalized assistance.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-glass-bg border border-glass-border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Quick <span className="text-neon-cyan">Actions</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <IconComponent className={`h-12 w-12 ${action.color} mx-auto mb-6`} />
                  <h3 className="text-xl font-bold text-white mb-4">{action.title}</h3>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{action.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 glass-card rounded-lg text-white hover:bg-white/10 transition-colors"
                  >
                    {action.action}
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Help Categories & FAQ */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Categories</h3>
                <div className="space-y-2">
                  {helpCategories.map((category, index) => {
                    const IconComponent = category.icon
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActiveCategory(category.name)}
                        className={`w-full text-left p-4 rounded-lg transition-colors duration-300 flex items-center space-x-3 ${
                          activeCategory === category.name
                            ? 'bg-neon-cyan/10 border border-neon-cyan/20'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${
                          activeCategory === category.name ? 'text-neon-cyan' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <span className={`font-semibold ${
                            activeCategory === category.name ? 'text-neon-cyan' : 'text-white'
                          }`}>
                            {category.name}
                          </span>
                          <div className="text-sm text-gray-400">{category.count} articles</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* FAQ Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-3xl font-bold text-white mb-8">
                  {activeCategory} <span className="text-neon-pink">FAQ</span>
                </h2>

                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border border-glass-border rounded-lg overflow-hidden"
                    >
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full p-6 text-left flex items-center justify-between transition-colors duration-300"
                      >
                        <span className="text-white font-semibold">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-neon-cyan" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </motion.button>
                      
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6"
                        >
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {filteredFaqs.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                    <p className="text-gray-300">Try different search terms or browse categories above.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Need <span className="text-neon-pink">Help?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our support team is here to help you succeed. Reach out through your preferred channel.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl text-center"
                >
                  <IconComponent className="h-12 w-12 text-neon-cyan mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">{option.method}</h3>
                  <p className="text-neon-cyan text-lg font-semibold mb-2">{option.value}</p>
                  <p className="text-gray-300 text-sm mb-6">{option.description}</p>
                  <motion.a
                    href={option.method === 'Email' ? `mailto:${option.value}` : `tel:${option.value}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
                  >
                    Contact Now
                  </motion.a>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <FileText className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Additional Resources
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Explore our comprehensive guides, tutorials, and documentation to make the most of CareerGuide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/guides"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center justify-center space-x-2"
              >
                <span>Career Guides</span>
                <ExternalLink className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="/materials"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass-card rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 flex items-center justify-center space-x-2"
              >
                <span>Study Materials</span>
                <ExternalLink className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HelpPage