'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Users, 
  Heart,
  Award,
  Lightbulb,
  Globe,
  TrendingUp,
  Star,
  Code,
  Brain,
  Compass,
  Shield,
  Zap,
  BookOpen,
  Coffee,
  Mail,
  Linkedin,
  Github,
  Rocket
} from 'lucide-react'

const AboutPage = () => {
  const stats = [
    { value: '50K+', label: 'Students Guided', icon: Users },
    { value: '95%', label: 'Success Rate', icon: TrendingUp },
    { value: '200+', label: 'Career Paths', icon: Compass },
    { value: '4.9★', label: 'User Rating', icon: Star }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Student-Centric',
      description: 'Every feature we build puts students first. Your success is our primary goal and driving force.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI and technology to provide personalized, data-driven career guidance.'
    },
    {
      icon: Shield,
      title: 'Trust & Privacy',
      description: 'Your personal information and career data are protected with enterprise-grade security measures.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Quality career guidance should be accessible to everyone, regardless of background or location.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Growth',
      description: 'We constantly evolve our platform based on industry trends and user feedback.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive community where students can learn, share, and grow together.'
    }
  ]

  const timeline = [
    {
      year: '2023',
      title: 'The Vision',
      description: 'Identified the gap in personalized career guidance for students in the digital age.',
      icon: Lightbulb
    },
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'Launched CareerGuide with AI-powered assessments and personalized recommendations.',
      icon: Rocket
    },
    {
      year: '2024',
      title: 'Community Growth',
      description: 'Reached 50,000+ students and expanded to cover 200+ career paths.',
      icon: Users
    },
    {
      year: 'Future',
      title: 'Global Expansion',
      description: 'Planning to expand internationally and add more advanced AI features.',
      icon: Globe
    }
  ]

  const team = [
    {
      name: 'Sudanva',
      role: 'Founder & CEO',
      description: 'Full-stack developer passionate about using technology to solve real-world problems. Experienced in AI/ML and career counseling.',
      image: '/api/placeholder/300/300',
      social: {
        linkedin: 'https://linkedin.com/in/sudanva',
        github: 'https://github.com/sudanva',
        email: 'sudanva7@gmail.com'
      },
      skills: ['AI/ML', 'Full-Stack Development', 'Product Strategy', 'Career Counseling']
    }
  ]

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Assessments',
      description: 'Advanced machine learning algorithms analyze your skills, interests, and personality'
    },
    {
      icon: Compass,
      title: 'Personalized Roadmaps',
      description: 'Custom career paths tailored to your goals and current skill level'
    },
    {
      icon: BookOpen,
      title: 'Educational Guidance',
      description: 'Comprehensive college and course recommendations based on your career goals'
    },
    {
      icon: Award,
      title: 'Industry Insights',
      description: 'Real-time market data and trends to help you make informed decisions'
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
                <Target className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Our Story</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                About CareerGuide
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              We're on a mission to democratize career guidance by making personalized, 
              AI-powered career counseling accessible to every student, everywhere.
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

      {/* Mission & Vision */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-card p-12 rounded-2xl"
            >
              <Target className="h-16 w-16 text-neon-cyan mb-8" />
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                To empower every student with the tools, insights, and guidance they need 
                to make informed career decisions and build successful professional lives.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We believe that career guidance shouldn't be a luxury available only to a few. 
                Through technology and AI, we're making professional career counseling 
                accessible, affordable, and effective for students worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-card p-12 rounded-2xl"
            >
              <Zap className="h-16 w-16 text-neon-pink mb-8" />
              <h2 className="text-4xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                A world where every student has access to personalized career guidance, 
                enabling them to pursue fulfilling careers that align with their passions and strengths.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We envision a future where career confusion is eliminated through intelligent, 
                data-driven recommendations that consider individual personalities, market trends, 
                and emerging opportunities in the global job market.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
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
              Our <span className="text-neon-cyan">Values</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do and build
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300"
                >
                  <IconComponent className="h-12 w-12 text-neon-cyan mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
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
              Our <span className="text-neon-pink">Journey</span>
            </h2>
            <p className="text-xl text-gray-300">
              From vision to reality - the story of CareerGuide
            </p>
          </motion.div>

          <div className="space-y-12">
            {timeline.map((item, index) => {
              const IconComponent = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`glass-card p-8 rounded-2xl ${
                      index % 2 === 0 ? 'text-left' : 'text-right'
                    }`}>
                      <div className="text-neon-cyan font-bold text-lg mb-2">{item.year}</div>
                      <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-neon-cyan" />
                  </div>
                  
                  <div className="flex-1"></div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
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
              Meet the <span className="text-neon-cyan">Team</span>
            </h2>
            <p className="text-xl text-gray-300">
              The people behind CareerGuide's mission
            </p>
          </motion.div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl text-center max-w-md"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-neon-cyan to-neon-pink rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Code className="h-16 w-16 text-space-dark" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <div className="text-neon-cyan font-semibold mb-4">{member.role}</div>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">{member.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {member.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="px-3 py-1 glass-card rounded-full text-xs text-neon-cyan">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <motion.a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="p-3 glass-card rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-500" />
                  </motion.a>
                  <motion.a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="p-3 glass-card rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Github className="h-5 w-5 text-gray-400" />
                  </motion.a>
                  <motion.a
                    href={`mailto:${member.social.email}`}
                    whileHover={{ scale: 1.1 }}
                    className="p-3 glass-card rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-neon-cyan" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
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
              What Makes Us <span className="text-neon-pink">Different</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
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
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <Coffee className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of students who have discovered their ideal career path with CareerGuide. 
              Take the first step towards your dream career today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/assessment"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                Take Assessment
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass-card rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage