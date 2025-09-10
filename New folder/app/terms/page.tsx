'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Scale, 
  AlertTriangle,
  UserCheck,
  Shield,
  Gavel,
  Mail,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

const TermsPage = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: `By accessing and using CareerGuide ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.

• These terms apply to all visitors, users, and others who access the Service
• If you do not agree to all the terms and conditions, you may not use the Service
• We may revise these terms at any time by updating this posting
• You should visit this page periodically to review the terms`
    },
    {
      id: 'description',
      title: 'Service Description',
      icon: FileText,
      content: `CareerGuide is an AI-powered career guidance platform that provides:

• Personalized career assessments and recommendations
• Educational pathway guidance and college information
• Career roadmap generation and tracking tools
• Industry insights and professional development resources
• Community features and expert guidance
• Premium features for enhanced career planning

The Service is provided "as is" and we make no warranties about its reliability, accuracy, or fitness for any particular purpose.`
    },
    {
      id: 'user-accounts',
      title: 'User Accounts and Registration',
      icon: UserCheck,
      content: `To access certain features, you must register for an account:

• You must provide accurate and complete information during registration
• You are responsible for maintaining the confidentiality of your account
• You are responsible for all activities that occur under your account
• You must immediately notify us of any unauthorized use of your account
• You must be at least 13 years old to create an account
• Parental consent may be required for users under 18 in some jurisdictions`
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      icon: Shield,
      content: `You agree to use the Service only for lawful purposes and in accordance with these terms:

Prohibited Activities:
• Violating any applicable laws or regulations
• Impersonating any person or entity
• Transmitting spam, viruses, or malicious code
• Attempting to gain unauthorized access to the Service
• Interfering with or disrupting the Service
• Collecting user information without consent
• Using the Service for commercial purposes without permission
• Creating multiple accounts to circumvent restrictions`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      icon: Scale,
      content: `The Service and its original content, features, and functionality are owned by CareerGuide:

• All text, graphics, logos, images, and software are our property
• You may not copy, modify, distribute, or create derivative works
• User-generated content remains your property, but you grant us rights to use it
• You may not use our trademarks without prior written consent
• We respect intellectual property rights and expect users to do the same
• We will respond to valid DMCA takedown notices`
    },
    {
      id: 'privacy-data',
      title: 'Privacy and Data Protection',
      icon: Shield,
      content: `Your privacy is important to us:

• Our Privacy Policy governs the collection and use of your information
• We implement appropriate security measures to protect your data
• You have rights regarding your personal information
• We may use aggregated, anonymized data for research and improvement
• We do not sell your personal information to third parties
• Data retention policies are outlined in our Privacy Policy`
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      icon: FileText,
      content: `For premium features and services:

• Subscription fees are billed in advance on a recurring basis
• All fees are non-refundable except as required by law
• We may change subscription fees with 30 days' notice
• Taxes may apply to your subscription
• You can cancel your subscription at any time
• Free trial periods may be offered at our discretion
• Payment disputes should be reported immediately`
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: XCircle,
      content: `Either party may terminate this agreement:

• You may delete your account at any time
• We may suspend or terminate your account for violations of these terms
• We may discontinue the Service at any time with notice
• Upon termination, your right to use the Service ceases immediately
• We may retain certain information as required by law or for legitimate business purposes
• Termination does not relieve you of any payment obligations`
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers and Limitations',
      icon: AlertTriangle,
      content: `The Service is provided "as is" without warranties of any kind:

• We do not guarantee the accuracy of career advice or recommendations
• We are not responsible for decisions made based on our recommendations
• The Service may contain inaccuracies or errors
• We do not guarantee uninterrupted or secure access
• Third-party links and content are not under our control
• Career outcomes are not guaranteed
• Educational information is for guidance purposes only`
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: Scale,
      content: `Our liability to you is limited:

• We are not liable for indirect, incidental, or consequential damages
• Our total liability shall not exceed the amount paid by you for the Service
• Some jurisdictions do not allow limitation of liability
• We are not liable for third-party actions or content
• You assume all risks associated with using the Service
• This limitation applies to the fullest extent permitted by law`
    },
    {
      id: 'governing-law',
      title: 'Governing Law and Disputes',
      icon: Gavel,
      content: `These terms are governed by applicable law:

• Any disputes will be resolved through binding arbitration
• Class action lawsuits are waived
• Small claims court actions are permitted
• Indian law governs these terms
• Disputes must be filed within one year of the claim arising
• We both consent to the jurisdiction of Indian courts
• Injunctive relief may be sought in court`
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: Clock,
      content: `We may modify these terms at any time:

• Changes will be posted on this page
• Material changes will be communicated to users
• Continued use after changes constitutes acceptance
• You should review these terms periodically
• We will indicate when terms were last updated
• Previous versions may be available upon request`
    }
  ]

  const quickFacts = [
    {
      title: 'Free Account',
      description: 'Basic career assessments and guidance',
      included: true
    },
    {
      title: 'Premium Features',
      description: 'Advanced roadmaps and expert consultations',
      included: false
    },
    {
      title: 'Data Privacy',
      description: 'Your personal information is protected',
      included: true
    },
    {
      title: 'Age Requirement',
      description: 'Must be 13+ to create an account',
      included: true
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
                <Scale className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Legal Terms</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Terms of Service
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              These terms and conditions outline the rules and regulations for the use of CareerGuide's platform and services.
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
                <FileText className="h-4 w-4" />
                <span>Version 2.0</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
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
              Quick <span className="text-neon-cyan">Facts</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickFacts.map((fact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl text-center"
              >
                <div className="flex justify-center mb-4">
                  {fact.included ? (
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-12 w-12 text-orange-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{fact.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{fact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
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

      {/* Important Notice */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <div className="flex items-center space-x-4 mb-6">
              <AlertTriangle className="h-12 w-12 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Important Notice</h2>
            </div>
            
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                By using CareerGuide, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                These terms constitute a legal agreement between you and CareerGuide.
              </p>
              <p>
                Career guidance is provided for informational purposes only and should not be considered as professional career counseling. 
                We recommend consulting with qualified career professionals for personalized advice.
              </p>
              <p>
                If you have any questions about these terms, please contact us before using the Service. 
                Continued use of the platform indicates your acceptance of any updated terms.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <Mail className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Questions About Terms?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us. 
              We're here to help clarify any aspects of our agreement.
            </p>
            <div className="space-y-4 mb-8">
              <div className="text-gray-300">
                <strong>Email:</strong> <span className="text-neon-cyan">sudanva7@gmail.com</span>
              </div>
              <div className="text-gray-300">
                <strong>Subject:</strong> Terms of Service Question
              </div>
              <div className="text-gray-300">
                <strong>Response Time:</strong> Within 24 hours
              </div>
            </div>
            <motion.a
              href="mailto:sudanva7@gmail.com?subject=Terms of Service Question"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
            >
              Contact Legal Team
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default TermsPage