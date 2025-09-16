'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Info, ArrowLeft, Zap, Star, BookOpen, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const CareerTree3D = dynamic(() => import('@/components/CareerTree3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-glass-bg rounded-2xl">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-300">Loading 3D Career Tree...</p>
      </div>
    </div>
  )
})

interface CareerData {
  name: string
  category: string
  description: string
  averageSalary: string
  growthRate: string
  education: string[]
  skills: string[]
  relatedCareers: string[]
  keyActivities: string[]
  workEnvironment: string
}

const careerDatabase: Record<string, CareerData> = {
  'Software Engineer': {
    name: 'Software Engineer',
    category: 'Technology',
    description: 'Design, develop, and maintain software applications and systems using programming languages and development frameworks.',
    averageSalary: '$85,000 - $150,000',
    growthRate: '22%',
    education: ['Computer Science', 'Software Engineering', 'Information Technology'],
    skills: ['Programming', 'Problem Solving', 'Algorithms', 'Database Management', 'Version Control', 'Testing'],
    relatedCareers: ['Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'Mobile Developer'],
    keyActivities: ['Code Development', 'System Design', 'Bug Fixing', 'Code Review', 'Documentation', 'Testing'],
    workEnvironment: 'Office or Remote, collaborative team environment'
  },
  'Data Scientist': {
    name: 'Data Scientist',
    category: 'Technology',
    description: 'Analyze large datasets to extract insights and build predictive models using statistical methods and machine learning.',
    averageSalary: '$95,000 - $165,000',
    growthRate: '31%',
    education: ['Data Science', 'Statistics', 'Computer Science', 'Mathematics'],
    skills: ['Python/R', 'Statistics', 'Machine Learning', 'Data Visualization', 'SQL', 'Research'],
    relatedCareers: ['Data Analyst', 'Machine Learning Engineer', 'Business Intelligence Analyst', 'Research Scientist'],
    keyActivities: ['Data Analysis', 'Model Building', 'Research', 'Visualization', 'Reporting', 'Experimentation'],
    workEnvironment: 'Office or Remote, research-focused environment'
  },
  'Digital Marketing Manager': {
    name: 'Digital Marketing Manager',
    category: 'Marketing',
    description: 'Plan and execute digital marketing campaigns across various online platforms to drive brand awareness and sales.',
    averageSalary: '$65,000 - $120,000',
    growthRate: '19%',
    education: ['Marketing', 'Communications', 'Business', 'Digital Media'],
    skills: ['SEO/SEM', 'Social Media', 'Content Strategy', 'Analytics', 'Campaign Management', 'Creativity'],
    relatedCareers: ['Content Marketing Manager', 'Social Media Manager', 'SEO Specialist', 'Brand Manager'],
    keyActivities: ['Campaign Planning', 'Content Creation', 'Analytics Review', 'Strategy Development', 'Team Coordination'],
    workEnvironment: 'Fast-paced office environment, client interaction'
  },
  'UX Designer': {
    name: 'UX Designer',
    category: 'Design',
    description: 'Research user needs and design intuitive, user-friendly interfaces and experiences for digital products.',
    averageSalary: '$70,000 - $130,000',
    growthRate: '13%',
    education: ['Design', 'Psychology', 'Human-Computer Interaction', 'Fine Arts'],
    skills: ['User Research', 'Prototyping', 'Wireframing', 'Design Tools', 'Empathy', 'Visual Communication'],
    relatedCareers: ['UI Designer', 'Product Designer', 'Interaction Designer', 'User Researcher'],
    keyActivities: ['User Research', 'Design Creation', 'Prototyping', 'Testing', 'Collaboration', 'Iteration'],
    workEnvironment: 'Creative studio or office environment, collaborative'
  },
  'Financial Analyst': {
    name: 'Financial Analyst',
    category: 'Finance',
    description: 'Analyze financial data and trends to provide insights for investment decisions and business strategy.',
    averageSalary: '$60,000 - $110,000',
    growthRate: '5%',
    education: ['Finance', 'Economics', 'Accounting', 'Business Administration'],
    skills: ['Financial Modeling', 'Excel', 'Analysis', 'Reporting', 'Attention to Detail', 'Communication'],
    relatedCareers: ['Investment Banker', 'Portfolio Manager', 'Risk Analyst', 'Corporate Finance Analyst'],
    keyActivities: ['Financial Analysis', 'Report Writing', 'Data Interpretation', 'Forecasting', 'Presentations'],
    workEnvironment: 'Corporate office, deadline-driven environment'
  },
  'Product Manager': {
    name: 'Product Manager',
    category: 'Management',
    description: 'Guide product development from conception to launch, coordinating between teams and stakeholders.',
    averageSalary: '$90,000 - $160,000',
    growthRate: '19%',
    education: ['Business', 'Engineering', 'Computer Science', 'MBA'],
    skills: ['Strategic Thinking', 'Leadership', 'Communication', 'Analytics', 'Project Management', 'Market Research'],
    relatedCareers: ['Program Manager', 'Business Analyst', 'Strategy Consultant', 'Marketing Manager'],
    keyActivities: ['Strategy Development', 'Team Coordination', 'Market Research', 'Feature Planning', 'Stakeholder Management'],
    workEnvironment: 'Collaborative office environment, cross-functional teams'
  }
}

const categories = ['All', 'Technology', 'Marketing', 'Design', 'Finance', 'Management']

export default function CareerTreePage() {
  const [selectedCareer, setSelectedCareer] = useState<string>('Software Engineer')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showInfo, setShowInfo] = useState<boolean>(true)

  const filteredCareers = Object.values(careerDatabase).filter(career => {
    const matchesCategory = selectedCategory === 'All' || career.category === selectedCategory
    const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const currentCareer = careerDatabase[selectedCareer]

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-neon-cyan transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center space-x-2 px-4 py-2 bg-glass-bg border border-neon-cyan/20 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-all"
          >
            <Info className="w-4 h-4" />
            <span>{showInfo ? 'Hide' : 'Show'} Info</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
              3D Career Tree
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore career paths in an interactive 3D environment. Discover connections between skills, roles, and opportunities.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search careers or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-space-dark">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Career List */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 text-neon-cyan mr-2" />
                Career Options ({filteredCareers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCareers.map((career) => (
                  <button
                    key={career.name}
                    onClick={() => setSelectedCareer(career.name)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedCareer === career.name
                        ? 'bg-neon-cyan/20 border border-neon-cyan/40 text-white'
                        : 'bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{career.name}</div>
                    <div className="text-sm opacity-75">{career.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 text-neon-pink mr-2" />
                {currentCareer.name} - Interactive View
              </h3>
              
              <CareerTree3D
                careerPath={currentCareer.name}
                relatedCareers={currentCareer.relatedCareers}
                skills={currentCareer.skills}
              />
            </div>
          </div>
        </div>

        {/* Career Details */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 glass-card p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <BookOpen className="w-6 h-6 text-neon-cyan mr-3" />
                {currentCareer.name} Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overview */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-neon-cyan mb-2">Overview</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{currentCareer.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-neon-pink mb-2">Work Environment</h4>
                    <p className="text-gray-300 text-sm">{currentCareer.workEnvironment}</p>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-neon-cyan mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Salary Range
                    </h4>
                    <p className="text-white font-medium">{currentCareer.averageSalary}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-neon-pink mb-2">Growth Rate</h4>
                    <p className="text-white font-medium">{currentCareer.growthRate} (Above average)</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-neon-purple mb-2">Education</h4>
                    <div className="space-y-1">
                      {currentCareer.education.map((edu, index) => (
                        <span key={index} className="inline-block bg-gray-800/50 px-2 py-1 rounded text-sm text-gray-300 mr-2 mb-2">
                          {edu}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills & Activities */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-neon-cyan mb-2">Key Skills</h4>
                    <div className="space-y-1">
                      {currentCareer.skills.map((skill, index) => (
                        <span key={index} className="inline-block bg-neon-cyan/20 px-2 py-1 rounded text-sm text-neon-cyan mr-2 mb-2">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-neon-pink mb-2">Key Activities</h4>
                    <div className="space-y-1">
                      {currentCareer.keyActivities.map((activity, index) => (
                        <div key={index} className="text-gray-300 text-sm">• {activity}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-12"
        >
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Explore Your Career Path?</h3>
            <p className="text-gray-300 mb-6">Take our career quiz to discover which path aligns with your interests and skills.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quiz"
                className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-bold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all"
              >
                Take Career Quiz
              </Link>
              <Link
                href="/roadmap"
                className="px-6 py-3 bg-glass-bg border border-neon-cyan/30 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-all"
              >
                Create Learning Path
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}