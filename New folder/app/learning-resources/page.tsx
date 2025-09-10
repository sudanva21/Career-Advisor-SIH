'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, BookOpen, Video, FileText, ExternalLink, Clock, Star, ArrowLeft, Download, Play } from 'lucide-react'
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  type: 'video' | 'article' | 'course' | 'book' | 'practice'
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  rating: number
  description: string
  link: string
  author: string
  topics: string[]
  free: boolean
  thumbnail?: string
}

const learningResources: Resource[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    type: 'course',
    category: 'Programming',
    difficulty: 'Beginner',
    duration: '65 hours',
    rating: 4.8,
    description: 'Learn full-stack web development from scratch. Build real projects and deploy them live.',
    link: 'https://example.com/web-bootcamp',
    author: 'Angela Yu',
    topics: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'MongoDB'],
    free: false
  },
  {
    id: '2',
    title: 'Python for Data Science',
    type: 'video',
    category: 'Data Science',
    difficulty: 'Intermediate',
    duration: '12 hours',
    rating: 4.7,
    description: 'Master data science with Python. Learn pandas, numpy, matplotlib, and machine learning basics.',
    link: 'https://example.com/python-data-science',
    author: 'Jose Portilla',
    topics: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning'],
    free: true
  },
  {
    id: '3',
    title: 'Digital Marketing Fundamentals',
    type: 'course',
    category: 'Marketing',
    difficulty: 'Beginner',
    duration: '20 hours',
    rating: 4.6,
    description: 'Learn the basics of digital marketing including SEO, social media, and paid advertising.',
    link: 'https://example.com/digital-marketing',
    author: 'Google Digital Garage',
    topics: ['SEO', 'Social Media', 'PPC', 'Analytics', 'Content Marketing'],
    free: true
  },
  {
    id: '4',
    title: 'UI/UX Design Principles',
    type: 'book',
    category: 'Design',
    difficulty: 'Intermediate',
    duration: '8 hours read',
    rating: 4.9,
    description: 'Essential design principles for creating user-friendly interfaces and experiences.',
    link: 'https://example.com/design-principles',
    author: 'Don Norman',
    topics: ['User Research', 'Prototyping', 'Visual Design', 'Usability', 'Psychology'],
    free: false
  },
  {
    id: '5',
    title: 'Financial Modeling in Excel',
    type: 'course',
    category: 'Finance',
    difficulty: 'Advanced',
    duration: '15 hours',
    rating: 4.5,
    description: 'Build comprehensive financial models and perform valuation analysis using Excel.',
    link: 'https://example.com/financial-modeling',
    author: 'Wharton Online',
    topics: ['Excel', 'Valuation', 'DCF', 'LBO', 'Financial Analysis'],
    free: false
  },
  {
    id: '6',
    title: 'Agile Project Management',
    type: 'article',
    category: 'Management',
    difficulty: 'Intermediate',
    duration: '2 hours read',
    rating: 4.4,
    description: 'Comprehensive guide to agile methodologies and project management best practices.',
    link: 'https://example.com/agile-pm',
    author: 'PMI Institute',
    topics: ['Scrum', 'Kanban', 'Sprint Planning', 'Team Leadership', 'Stakeholder Management'],
    free: true
  },
  {
    id: '7',
    title: 'Machine Learning Specialization',
    type: 'course',
    category: 'Data Science',
    difficulty: 'Advanced',
    duration: '40 hours',
    rating: 4.9,
    description: 'Deep dive into machine learning algorithms, neural networks, and AI applications.',
    link: 'https://example.com/ml-specialization',
    author: 'Andrew Ng',
    topics: ['Neural Networks', 'Deep Learning', 'TensorFlow', 'Supervised Learning', 'Unsupervised Learning'],
    free: false
  },
  {
    id: '8',
    title: 'React Development Practice',
    type: 'practice',
    category: 'Programming',
    difficulty: 'Intermediate',
    duration: '10 hours',
    rating: 4.3,
    description: 'Hands-on exercises and projects to master React development and modern JavaScript.',
    link: 'https://example.com/react-practice',
    author: 'FreeCodeCamp',
    topics: ['React', 'JavaScript', 'Hooks', 'State Management', 'Component Design'],
    free: true
  },
  {
    id: '9',
    title: 'Machine Learning Crash Course',
    type: 'course',
    category: 'Data Science',
    difficulty: 'Intermediate',
    duration: '40 hours',
    rating: 4.6,
    description: 'Google AI crash course covering machine learning fundamentals and TensorFlow.',
    link: 'https://developers.google.com/machine-learning/crash-course',
    author: 'Google AI',
    topics: ['Machine Learning', 'TensorFlow', 'Neural Networks'],
    free: true
  },
  {
    id: '10',
    title: 'The Design of Everyday Things',
    type: 'book',
    category: 'Design',
    difficulty: 'Beginner',
    duration: '8 hours',
    rating: 4.9,
    description: 'Essential book on user-centered design principles and psychology.',
    link: 'https://example.com/design-book',
    author: 'Don Norman',
    topics: ['UX Design', 'Psychology', 'Product Design'],
    free: false
  },
  {
    id: '11',
    title: 'Figma Design System Course',
    type: 'video',
    category: 'Design',
    difficulty: 'Intermediate',
    duration: '6 hours',
    rating: 4.7,
    description: 'Complete guide to building scalable design systems in Figma.',
    link: 'https://example.com/figma-course',
    author: 'Design Academy',
    topics: ['Figma', 'Design Systems', 'UI Design'],
    free: false
  },
  {
    id: '12',
    title: 'Digital Marketing Fundamentals',
    type: 'course',
    category: 'Marketing',
    difficulty: 'Beginner',
    duration: '25 hours',
    rating: 4.4,
    description: 'Learn SEO, social media marketing, and analytics fundamentals.',
    link: 'https://example.com/digital-marketing',
    author: 'Marketing Institute',
    topics: ['SEO', 'Social Media', 'Analytics'],
    free: true
  },
  {
    id: '13',
    title: 'Project Management with Agile',
    type: 'article',
    category: 'Management',
    difficulty: 'Intermediate',
    duration: '2 hours',
    rating: 4.3,
    description: 'Comprehensive guide to agile project management methodologies.',
    link: 'https://example.com/agile-guide',
    author: 'PM Weekly',
    topics: ['Agile', 'Scrum', 'Project Management'],
    free: true
  },
  {
    id: '14',
    title: 'Financial Planning for Beginners',
    type: 'video',
    category: 'Finance',
    difficulty: 'Beginner',
    duration: '4 hours',
    rating: 4.5,
    description: 'Learn personal finance basics, budgeting, and investment strategies.',
    link: 'https://example.com/finance-basics',
    author: 'Finance Pro',
    topics: ['Budgeting', 'Investments', 'Savings'],
    free: true
  }
]

const categories = ['All', 'Programming', 'Data Science', 'Marketing', 'Design', 'Finance', 'Management']
const types = ['All', 'course', 'video', 'article', 'book', 'practice']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

const typeIcons = {
  course: BookOpen,
  video: Play,
  article: FileText,
  book: BookOpen,
  practice: Star
}

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const IconComponent = typeIcons[resource.type]
  
  const handleResourceClick = () => {
    // Open resource in new tab
    window.open(resource.link, '_blank', 'noopener,noreferrer')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleResourceClick()
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 h-full group cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
      onClick={handleResourceClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${resource.title} by ${resource.author}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            resource.type === 'course' ? 'bg-neon-cyan/20' :
            resource.type === 'video' ? 'bg-neon-pink/20' :
            resource.type === 'article' ? 'bg-neon-purple/20' :
            resource.type === 'book' ? 'bg-yellow-500/20' :
            'bg-green-500/20'
          }`}>
            <IconComponent className={`w-5 h-5 ${
              resource.type === 'course' ? 'text-neon-cyan' :
              resource.type === 'video' ? 'text-neon-pink' :
              resource.type === 'article' ? 'text-neon-purple' :
              resource.type === 'book' ? 'text-yellow-400' :
              'text-green-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
              {resource.title}
            </h3>
            <p className="text-sm text-gray-400">by {resource.author}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {resource.free ? (
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
              Free
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
        {resource.description}
      </p>

      {/* Topics */}
      <div className="flex flex-wrap gap-2 mb-4">
        {resource.topics.slice(0, 3).map((topic, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-full"
          >
            {topic}
          </span>
        ))}
        {resource.topics.length > 3 && (
          <span className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded-full">
            +{resource.topics.length - 3} more
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{resource.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">{resource.rating}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${
          resource.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
          resource.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {resource.difficulty}
        </span>
      </div>

      {/* Action */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-neon-cyan capitalize">{resource.category}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.open(resource.link, '_blank', 'noopener,noreferrer')
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-cyan/20 to-neon-pink/20 border border-neon-cyan/30 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-all group-hover:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
          aria-label={`Access ${resource.title} resource`}
        >
          <span>Access</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function LearningResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const filteredResources = learningResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory
    const matchesType = selectedType === 'All' || resource.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'All' || resource.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty
  })

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
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-glass-bg border border-neon-cyan/20 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
              Learning Resources
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Curated collection of courses, videos, articles, and practice materials to accelerate your career growth.
          </p>
        </motion.div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources, topics, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/30"
              aria-label="Search learning resources"
              role="searchbox"
            />
          </div>
          
          <div className="text-gray-400 text-sm">
            Showing {filteredResources.length} of {learningResources.length} resources
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-space-dark">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                  >
                    {types.map(type => (
                      <option key={type} value={type} className="bg-space-dark">
                        {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty} className="bg-space-dark">
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('All')
                      setSelectedType('All')
                      setSelectedDifficulty('All')
                    }}
                    className="w-full px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                    aria-label="Clear all filters and search"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 opacity-20">
              <Search className="w-full h-full text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No resources found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search terms or filters</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All')
                setSelectedType('All')
                setSelectedDifficulty('All')
              }}
              className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Featured Collections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Featured Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-neon-cyan" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Beginner's Guide</h3>
              <p className="text-gray-300 text-sm mb-4">Perfect starting point for new learners</p>
              <button 
                onClick={() => {
                  setSelectedDifficulty('Beginner')
                  setSelectedCategory('All')
                  setSelectedType('All')
                  window.scrollTo({ top: 400, behavior: 'smooth' })
                }}
                className="text-neon-cyan hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 rounded px-2 py-1"
                aria-label="Filter to show beginner resources"
              >
                Explore Collection →
              </button>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-neon-pink" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Top Rated</h3>
              <p className="text-gray-300 text-sm mb-4">Highest rated resources by learners</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                  setSelectedType('All')
                  setSelectedDifficulty('All')
                  // Sort would be handled in a more complex implementation
                  window.scrollTo({ top: 400, behavior: 'smooth' })
                }}
                className="text-neon-pink hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neon-pink/50 rounded px-2 py-1"
                aria-label="Show top rated resources"
              >
                View Best Resources →
              </button>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-neon-purple" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Free Resources</h3>
              <p className="text-gray-300 text-sm mb-4">Quality learning materials at no cost</p>
              <button 
                onClick={() => {
                  setSearchTerm('free')
                  setSelectedCategory('All')
                  setSelectedType('All')
                  setSelectedDifficulty('All')
                  window.scrollTo({ top: 400, behavior: 'smooth' })
                }}
                className="text-neon-purple hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple/50 rounded px-2 py-1"
                aria-label="Filter to show free resources"
              >
                Browse Free Content →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-300 mb-6">
              Take our career quiz to get personalized resource recommendations based on your goals.
            </p>
            
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