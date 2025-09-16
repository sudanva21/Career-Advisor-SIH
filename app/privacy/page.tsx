'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye,
  Database,
  UserCheck,
  Globe,
  Mail,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react'

const PrivacyPage = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: `We collect information you provide directly to us, such as when you create an account, take career assessments, or contact us for support. This includes:
      
      • Personal information (name, email address, phone number)
      • Profile information (education, skills, career interests)
      • Assessment responses and career preferences
      • Usage data and interaction patterns
      • Device and browser information
      • Location data (with your consent)`
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: UserCheck,
      content: `We use the information we collect to provide, maintain, and improve our services:
      
      • Provide personalized career guidance and recommendations
      • Generate AI-powered career assessments and roadmaps
      • Send you relevant educational content and career opportunities
      • Improve our AI algorithms and recommendation systems
      • Communicate with you about your account and our services
      • Ensure platform security and prevent fraudulent activity
      • Comply with legal obligations and enforce our terms`
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing and Disclosure',
      icon: Globe,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
      
      • With your explicit consent
      • With service providers who help us operate our platform
      • With educational institutions (with your permission)
      • To comply with legal requirements or protect rights and safety
      • In connection with a business transaction (merger, acquisition)
      • Aggregated, anonymized data for research and improvement purposes`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: `We implement industry-standard security measures to protect your information:
      
      • End-to-end encryption for sensitive data transmission
      • Secure cloud storage with regular security audits
      • Multi-factor authentication options
      • Regular security monitoring and vulnerability assessments
      • Employee training on data protection practices
      • Compliance with SOC 2 and ISO 27001 standards
      • Incident response procedures and breach notifications`
    },
    {
      id: 'your-rights',
      title: 'Your Rights and Choices',
      icon: Eye,
      content: `You have several rights regarding your personal information:
      
      • Access: Request a copy of your personal data
      • Correction: Update or correct inaccurate information
      • Deletion: Request deletion of your personal data
      • Portability: Export your data in a structured format
      • Restriction: Limit how we process your information
      • Objection: Object to certain types of processing
      • Opt-out: Unsubscribe from marketing communications
      • Account deactivation: Permanently delete your account`
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking',
      icon: Globe,
      content: `We use cookies and similar technologies to improve your experience:
      
      • Essential cookies for basic platform functionality
      • Analytics cookies to understand usage patterns
      • Performance cookies to optimize platform speed
      • Preference cookies to remember your settings
      • Marketing cookies for personalized content
      
      You can control cookie preferences through your browser settings or our cookie preference center.`
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      icon: Globe,
      content: `Your information may be transferred to and processed in countries other than your own:
      
      • We use approved transfer mechanisms (Standard Contractual Clauses)
      • Adequate protection measures are implemented
      • Data processing agreements with all service providers
      • Compliance with applicable data protection laws
      • Regular reviews of international data handling practices`
    },
    {
      id: 'children-privacy',
      title: 'Children\'s Privacy',
      icon: UserCheck,
      content: `We are committed to protecting children's privacy:
      
      • Our services are designed for users 13 years and older
      • Parental consent required for users under 18 in some jurisdictions
      • Limited data collection from minors
      • Special protections for educational use cases
      • Clear privacy notices for younger users
      • Regular review of child safety measures`
    }
  ]

  const contactInfo = [
    {
      method: 'Email',
      value: 'sudanva7@gmail.com',
      icon: Mail,
      description: 'For privacy-related inquiries'
    },
    {
      method: 'Subject Line',
      value: 'Privacy Policy Question',
      icon: FileText,
      description: 'Please use this subject for faster processing'
    }
  ]

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
                <Shield className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Privacy & Security</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Your privacy is important to us. This policy explains how we collect, use, 
              and protect your personal information when you use CareerGuide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Last Updated: January 20, 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Version 2.0</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
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
              Privacy <span className="text-neon-cyan">Overview</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Data Protection',
                description: 'Industry-leading security measures to protect your personal information'
              },
              {
                icon: Eye,
                title: 'Transparency',
                description: 'Clear information about what data we collect and how we use it'
              },
              {
                icon: UserCheck,
                title: 'Your Control',
                description: 'Full control over your data with easy access, update, and deletion options'
              }
            ].map((item, index) => {
              const IconComponent = item.icon
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
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const IconComponent = section.icon
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl"
                  id={section.id}
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <IconComponent className="h-8 w-8 text-neon-cyan" />
                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  </div>
                  
                  <div className="prose prose-gray prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Rights Summary */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl text-center"
          >
            <Shield className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Your Data Rights
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              You have full control over your personal data. Access, update, download, 
              or delete your information at any time through your account settings 
              or by contacting our privacy team.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span>Update profile information in Settings</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span>Download your data from Account page</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span>Delete account permanently</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span>Manage cookie preferences</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-4">Legal Rights</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                    <span>Right to access your data</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                    <span>Right to rectification</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                    <span>Right to erasure</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                    <span>Right to data portability</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Privacy <span className="text-neon-pink">Questions?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              If you have any questions about this privacy policy or our data practices, 
              please don't hesitate to contact us.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon
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
                  <h3 className="text-xl font-bold text-white mb-2">{contact.method}</h3>
                  <p className="text-neon-cyan text-lg font-semibold mb-4">{contact.value}</p>
                  <p className="text-gray-300 text-sm">{contact.description}</p>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.a
              href="mailto:sudanva7@gmail.com?subject=Privacy Policy Question"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
            >
              Contact Privacy Team
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPage