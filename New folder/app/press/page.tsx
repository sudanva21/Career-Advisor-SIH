'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Image as ImageIcon, 
  Video,
  Award,
  Calendar,
  Users,
  TrendingUp,
  Globe,
  Mail,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

const PressPage = () => {
  const [copiedText, setCopiedText] = useState('')

  const stats = [
    { value: '50K+', label: 'Students Served', icon: Users },
    { value: '98%', label: 'Success Rate', icon: Award },
    { value: '1000+', label: 'Career Paths', icon: TrendingUp },
    { value: '25+', label: 'Countries', icon: Globe }
  ]

  const pressReleases = [
    {
      date: '2024-01-15',
      title: 'CareerGuide Launches Revolutionary AI-Powered Career Assessment Platform',
      summary: 'New platform combines 3D visualization with machine learning to provide personalized career guidance for students worldwide.',
      link: '#'
    },
    {
      date: '2024-02-20',
      title: 'Platform Reaches 50,000 Students Milestone with 98% Success Rate',
      summary: 'CareerGuide celebrates major milestone as platform helps over 50,000 students discover their ideal career paths.',
      link: '#'
    },
    {
      date: '2024-03-10',
      title: 'Partnership with Leading Educational Institutions Expands Global Reach',
      summary: 'Strategic partnerships with universities and schools bring AI-powered career guidance to students in 25+ countries.',
      link: '#'
    }
  ]

  const mediaAssets = [
    {
      category: 'Logos',
      items: [
        { name: 'Primary Logo (PNG)', size: '2MB', type: 'PNG' },
        { name: 'Primary Logo (SVG)', size: '150KB', type: 'SVG' },
        { name: 'Logo - Dark Background', size: '1.8MB', type: 'PNG' },
        { name: 'Logo - Light Background', size: '1.9MB', type: 'PNG' },
        { name: 'Icon Only', size: '800KB', type: 'PNG' }
      ]
    },
    {
      category: 'Screenshots',
      items: [
        { name: 'Dashboard Overview', size: '3.2MB', type: 'PNG' },
        { name: 'Career Quiz Interface', size: '2.8MB', type: 'PNG' },
        { name: '3D Career Map', size: '4.1MB', type: 'PNG' },
        { name: 'College Finder', size: '3.5MB', type: 'PNG' },
        { name: 'Mobile App Screenshots', size: '15MB', type: 'ZIP' }
      ]
    },
    {
      category: 'Videos',
      items: [
        { name: 'Platform Demo', size: '45MB', type: 'MP4' },
        { name: 'Founder Interview', size: '120MB', type: 'MP4' },
        { name: 'Student Testimonials', size: '85MB', type: 'MP4' }
      ]
    }
  ]

  const awards = [
    {
      year: '2024',
      title: 'Best EdTech Innovation',
      organization: 'India Education Awards',
      description: 'Recognized for revolutionary AI-powered career guidance platform'
    },
    {
      year: '2024',
      title: 'Top Startup to Watch',
      organization: 'TechCrunch India',
      description: 'Featured as one of the most promising EdTech startups in India'
    },
    {
      year: '2023',
      title: 'Student Choice Award',
      organization: 'EdTech Review',
      description: 'Voted by students as the most helpful career guidance platform'
    }
  ]

  const keyFacts = [
    'Founded in 2023 by Sudanva with a vision to democratize career guidance',
    'AI-powered platform with 98% accuracy in career matching',
    'Serves students in 25+ countries with multilingual support',
    'Partnership network includes 100+ educational institutions',
    'Featured in major publications including TechCrunch and EdTech Review',
    'Growing at 200% year-over-year with 50K+ active users'
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

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
                <FileText className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Press & Media</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Press Kit
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Media resources, company information, and press materials for journalists, 
              bloggers, and content creators covering CareerGuide.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center glass-card p-8 rounded-2xl"
                >
                  <IconComponent className="h-8 w-8 text-neon-cyan mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-8">
                About <span className="text-neon-cyan">CareerGuide</span>
              </h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  CareerGuide is a revolutionary AI-powered platform that transforms how students 
                  discover and pursue their ideal career paths. Founded by Sudanva in 2023, the 
                  platform combines cutting-edge artificial intelligence with immersive 3D 
                  visualizations to provide personalized career guidance.
                </p>
                <p>
                  With a 98% success rate in career matching, CareerGuide has helped over 50,000 
                  students across 25+ countries make informed decisions about their future. The 
                  platform's unique approach includes interactive career assessments, real-time 
                  industry data, and comprehensive college recommendations.
                </p>
                <p>
                  Our mission is to democratize access to world-class career guidance, ensuring 
                  every student, regardless of their background or location, can discover their 
                  true potential and build a successful career.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Key Facts</h3>
                <ul className="space-y-4">
                  {keyFacts.map((fact, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{fact}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-glass-border">
                  <h4 className="text-white font-semibold mb-4">Media Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-neon-cyan" />
                      <span className="text-gray-300">sudanva7@gmail.com</span>
                      <button
                        onClick={() => copyToClipboard('sudanva7@gmail.com')}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {copiedText === 'sudanva7@gmail.com' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">Phone: +91 7204686919</span>
                      <button
                        onClick={() => copyToClipboard('+91 7204686919')}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {copiedText === '+91 7204686919' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
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
              Recent <span className="text-neon-pink">Press Releases</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="h-5 w-5 text-neon-cyan" />
                      <span className="text-neon-cyan font-semibold">
                        {new Date(release.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{release.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{release.summary}</p>
                  </div>
                  <motion.a
                    href={release.link}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 glass-card rounded-lg text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <span>Read More</span>
                    <ExternalLink className="h-4 w-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Assets */}
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
              Media <span className="text-neon-cyan">Assets</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              High-resolution logos, screenshots, and videos for media coverage.
            </p>
          </motion.div>

          <div className="space-y-12">
            {mediaAssets.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  {category.category === 'Logos' && <ImageIcon className="h-6 w-6 text-neon-cyan" />}
                  {category.category === 'Screenshots' && <ImageIcon className="h-6 w-6 text-neon-pink" />}
                  {category.category === 'Videos' && <Video className="h-6 w-6 text-purple-400" />}
                  <span>{category.category}</span>
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((asset, assetIndex) => (
                    <div key={assetIndex} className="glass-card p-6 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-semibold mb-1">{asset.name}</h4>
                          <span className="text-gray-400 text-sm">{asset.type} • {asset.size}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Download className="h-4 w-4 text-neon-cyan" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
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
              Awards & <span className="text-neon-pink">Recognition</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl text-center"
              >
                <Award className="h-12 w-12 text-neon-pink mx-auto mb-6" />
                <div className="text-2xl font-bold text-neon-cyan mb-2">{award.year}</div>
                <h3 className="text-xl font-bold text-white mb-4">{award.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{award.organization}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{award.description}</p>
              </motion.div>
            ))}
          </div>
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
            <Mail className="h-16 w-16 text-neon-cyan mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Media Inquiries
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              For interviews, additional information, or high-resolution assets, 
              please contact our media team directly.
            </p>
            <motion.a
              href="mailto:sudanva7@gmail.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
            >
              Contact Media Team
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default PressPage