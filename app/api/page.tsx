'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Book, 
  Key,
  Server,
  Shield,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Play,
  GitBranch,
  Database,
  Settings,
  Lock,
  Globe,
  MessageSquare
} from 'lucide-react'

const ApiDocsPage = () => {
  const [activeEndpoint, setActiveEndpoint] = useState('authentication')
  const [copiedCode, setCopiedCode] = useState('')

  const endpoints = [
    {
      id: 'authentication',
      name: 'Authentication',
      icon: Lock,
      color: 'text-neon-cyan'
    },
    {
      id: 'users',
      name: 'Users',
      icon: Shield,
      color: 'text-neon-pink'
    },
    {
      id: 'career-assessment',
      name: 'Career Assessment',
      icon: Settings,
      color: 'text-purple-400'
    },
    {
      id: 'colleges',
      name: 'Colleges',
      icon: Database,
      color: 'text-green-400'
    },
    {
      id: 'roadmap',
      name: 'Roadmap Generator',
      icon: GitBranch,
      color: 'text-yellow-400'
    }
  ]

  const features = [
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: '99.9% uptime with response times under 200ms globally'
    },
    {
      icon: Shield,
      title: 'Secure by Design',
      description: 'OAuth 2.0, API keys, and rate limiting for enterprise security'
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Distributed worldwide with edge caching for optimal performance'
    },
    {
      icon: Book,
      title: 'Comprehensive Docs',
      description: 'Detailed documentation with interactive examples and SDKs'
    }
  ]

  const stats = [
    { value: '50+', label: 'API Endpoints', icon: Server },
    { value: '1M+', label: 'API Calls/Month', icon: Zap },
    { value: '99.9%', label: 'Uptime', icon: Shield },
    { value: '200ms', label: 'Avg Response Time', icon: Database }
  ]

  const codeExamples = {
    authentication: {
      title: 'Authentication',
      description: 'Authenticate users and obtain access tokens for API requests.',
      examples: [
        {
          title: 'Login User',
          method: 'POST',
          endpoint: '/api/auth/login',
          code: `curl -X POST https://api.careerguide.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}`
        }
      ]
    },
    users: {
      title: 'User Management',
      description: 'Manage user profiles, preferences, and account information.',
      examples: [
        {
          title: 'Get User Profile',
          method: 'GET',
          endpoint: '/api/users/profile',
          code: `curl -X GET https://api.careerguide.com/users/profile \\
  -H "Authorization: Bearer your_access_token"

// Response
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "career_interests": ["Technology", "Data Science"],
      "education_level": "Bachelor's Degree",
      "experience_years": 5
    }
  }
}`
        },
        {
          title: 'Update User Profile',
          method: 'PUT',
          endpoint: '/api/users/profile',
          code: `curl -X PUT https://api.careerguide.com/users/profile \\
  -H "Authorization: Bearer your_access_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Jane",
    "career_interests": ["AI/ML", "Software Engineering"],
    "education_level": "Master's Degree"
  }'

// Response
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "profile": {
      "first_name": "Jane",
      "career_interests": ["AI/ML", "Software Engineering"],
      "education_level": "Master's Degree"
    }
  }
}`
        }
      ]
    },
    'career-assessment': {
      title: 'Career Assessment',
      description: 'AI-powered career assessment and recommendations.',
      examples: [
        {
          title: 'Start Assessment',
          method: 'POST',
          endpoint: '/api/assessment/start',
          code: `curl -X POST https://api.careerguide.com/assessment/start \\
  -H "Authorization: Bearer your_access_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "assessment_type": "comprehensive",
    "user_responses": {
      "interests": ["problem-solving", "creativity", "leadership"],
      "skills": ["programming", "communication", "analysis"],
      "values": ["work-life-balance", "growth", "impact"]
    }
  }'

// Response
{
  "success": true,
  "assessment_id": "assessment_456",
  "recommendations": [
    {
      "career": "Software Engineer",
      "match_score": 92,
      "reasoning": "Strong technical skills and problem-solving abilities",
      "growth_potential": "High",
      "salary_range": "$70k - $150k"
    },
    {
      "career": "Product Manager",
      "match_score": 87,
      "reasoning": "Leadership skills and strategic thinking",
      "growth_potential": "Very High",
      "salary_range": "$90k - $200k"
    }
  ]
}`
        }
      ]
    },
    colleges: {
      title: 'College Database',
      description: 'Access comprehensive college and university information.',
      examples: [
        {
          title: 'Search Colleges',
          method: 'GET',
          endpoint: '/api/colleges/search',
          code: `curl -X GET "https://api.careerguide.com/colleges/search?location=california&program=computer-science&limit=10" \\
  -H "Authorization: Bearer your_access_token"

// Response
{
  "success": true,
  "total_results": 156,
  "colleges": [
    {
      "id": "college_789",
      "name": "Stanford University",
      "location": "Stanford, CA",
      "programs": [
        {
          "name": "Computer Science",
          "degree_type": "Bachelor's",
          "accreditation": "ABET",
          "ranking": 2,
          "tuition": 56169
        }
      ],
      "admission_requirements": {
        "gpa_minimum": 3.8,
        "sat_range": "1470-1570",
        "acceptance_rate": 0.04
      }
    }
  ]
}`
        }
      ]
    },
    roadmap: {
      title: 'Roadmap Generator',
      description: 'Generate personalized career roadmaps and learning paths.',
      examples: [
        {
          title: 'Generate Roadmap',
          method: 'POST',
          endpoint: '/api/roadmaps/generate',
          code: `curl -X POST https://api.careerguide.com/roadmaps/generate \\
  -H "Authorization: Bearer your_access_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "career_goal": "Senior Software Engineer",
    "current_level": "Junior Developer",
    "timeline": "24 months",
    "focus_areas": ["backend", "system_design"]
  }'

// Response
{
  "success": true,
  "roadmap_id": "roadmap_101",
  "roadmap": {
    "title": "Path to Senior Software Engineer",
    "duration": 24,
    "milestones": [
      {
        "month": 6,
        "title": "Master Backend Frameworks",
        "skills": ["Node.js", "Express", "Database Design"]
      },
      {
        "month": 12,
        "title": "Learn System Design",
        "skills": ["Scalability", "Microservices", "Caching"]
      }
    ]
  }
}`
        }
      ]
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const currentEndpoint = codeExamples[activeEndpoint as keyof typeof codeExamples]

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
                <Code className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Developer API</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                API Documentation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Integrate CareerGuide's powerful AI-driven career guidance into your applications. 
              Access our comprehensive API for career assessments, college data, and personalized recommendations.
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
                  className="glass-card p-8 rounded-2xl text-center"
                >
                  <IconComponent className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Why Choose Our <span className="text-neon-pink">API</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for developers who need reliable, scalable, and intelligent career guidance solutions.
            </p>
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
                  className="glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300"
                >
                  <IconComponent className="h-16 w-16 text-neon-cyan mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* API Documentation */}
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
              API <span className="text-neon-cyan">Endpoints</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our comprehensive API endpoints with interactive examples.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-2xl sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6">Endpoints</h3>
                <nav className="space-y-2">
                  {endpoints.map((endpoint) => {
                    const IconComponent = endpoint.icon
                    return (
                      <button
                        key={endpoint.id}
                        onClick={() => setActiveEndpoint(endpoint.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeEndpoint === endpoint.id
                            ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${endpoint.color}`} />
                        <span className="font-medium">{endpoint.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="glass-card p-8 rounded-2xl">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">{currentEndpoint.title}</h3>
                  <p className="text-gray-300 text-lg">{currentEndpoint.description}</p>
                </div>

                <div className="space-y-8">
                  {currentEndpoint.examples.map((example, index) => (
                    <div key={index} className="border border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-gray-800/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            example.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                            example.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                            example.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {example.method}
                          </span>
                          <span className="text-gray-300 font-mono">{example.endpoint}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(example.code)}
                          className="flex items-center space-x-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan rounded-lg transition-colors"
                        >
                          {copiedCode === example.code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {copiedCode === example.code ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-white mb-4">{example.title}</h4>
                        <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                            <code>{example.code}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs and Resources */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <Code className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of developers who are building the future of career guidance 
              with our comprehensive API and development tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                Get API Key
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass-card rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-gray-800/50 flex items-center space-x-2"
              >
                <ExternalLink className="h-5 w-5" />
                <span>View on GitHub</span>
              </motion.button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Available SDKs</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {['JavaScript', 'Python', 'PHP', 'Ruby', 'Go', 'Java'].map((sdk) => (
                  <div key={sdk} className="glass-card px-4 py-2 rounded-lg">
                    <span className="text-neon-cyan font-semibold">{sdk}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default ApiDocsPage