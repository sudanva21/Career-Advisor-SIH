'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Compass, 
  Search,
  Filter,
  Clock,
  Users,
  Star,
  BookOpen,
  TrendingUp,
  Code,
  Briefcase,
  Palette,
  Heart,
  DollarSign,
  GraduationCap,
  ArrowRight,
  Play,
  FileText,
  Award
} from 'lucide-react'

const GuidesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['All', 'Technology', 'Healthcare', 'Business', 'Creative', 'Engineering', 'Education', 'Finance']
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const guides = [
    {
      id: 1,
      title: 'Complete Guide to Software Engineering Careers',
      category: 'Technology',
      difficulty: 'Beginner',
      readTime: '25 min',
      readers: 15420,
      rating: 4.9,
      icon: Code,
      color: 'text-neon-cyan',
      description: 'Everything you need to know about starting a career in software engineering, from programming languages to career progression.',
      topics: ['Programming Languages', 'Career Paths', 'Salary Expectations', 'Skills Development'],
      featured: true,
      lastUpdated: '2024-01-15',
      author: 'CareerGuide Team'
    },
    {
      id: 2,
      title: 'Healthcare Career Paths: From Nursing to Surgery',
      category: 'Healthcare',
      difficulty: 'Intermediate',
      readTime: '35 min',
      readers: 12340,
      rating: 4.8,
      icon: Heart,
      color: 'text-neon-pink',
      description: 'Comprehensive guide to healthcare careers including education requirements, specializations, and growth opportunities.',
      topics: ['Medical Specialties', 'Education Requirements', 'Licensing', 'Career Growth'],
      featured: true,
      lastUpdated: '2024-01-10',
      author: 'Dr. Sarah Johnson'
    },
    {
      id: 3,
      title: 'Breaking into Finance: Investment Banking & Beyond',
      category: 'Finance',
      difficulty: 'Advanced',
      readTime: '45 min',
      readers: 8760,
      rating: 4.7,
      icon: DollarSign,
      color: 'text-green-400',
      description: 'Guide to finance careers including investment banking, corporate finance, and fintech opportunities.',
      topics: ['Investment Banking', 'Corporate Finance', 'FinTech', 'Networking'],
      featured: true,
      lastUpdated: '2024-01-08',
      author: 'Michael Chen'
    },
    {
      id: 4,
      title: 'Creative Careers: Design, Media & Arts',
      category: 'Creative',
      difficulty: 'Beginner',
      readTime: '20 min',
      readers: 9450,
      rating: 4.6,
      icon: Palette,
      color: 'text-purple-400',
      description: 'Explore creative career paths in design, media, arts, and entertainment industries.',
      topics: ['Graphic Design', 'UX/UI Design', 'Digital Marketing', 'Content Creation'],
      featured: false,
      lastUpdated: '2024-01-05',
      author: 'Emma Williams'
    },
    {
      id: 5,
      title: 'Business Leadership & Management Careers',
      category: 'Business',
      difficulty: 'Intermediate',
      readTime: '30 min',
      readers: 11200,
      rating: 4.5,
      icon: Briefcase,
      color: 'text-orange-400',
      description: 'Path to business leadership roles including MBA considerations and executive career development.',
      topics: ['Leadership Skills', 'MBA Programs', 'Executive Roles', 'Strategic Planning'],
      featured: false,
      lastUpdated: '2024-01-03',
      author: 'David Park'
    },
    {
      id: 6,
      title: 'Engineering Disciplines: Mechanical to Aerospace',
      category: 'Engineering',
      difficulty: 'Intermediate',
      readTime: '40 min',
      readers: 7890,
      rating: 4.4,
      icon: GraduationCap,
      color: 'text-blue-400',
      description: 'Comprehensive overview of engineering disciplines and their career prospects.',
      topics: ['Mechanical Engineering', 'Electrical Engineering', 'Aerospace', 'Civil Engineering'],
      featured: false,
      lastUpdated: '2024-01-01',
      author: 'Prof. Lisa Zhang'
    }
  ]

  const stats = [
    { value: '100+', label: 'Career Guides', icon: BookOpen },
    { value: '500K+', label: 'Guide Readers', icon: Users },
    { value: '4.7★', label: 'Average Rating', icon: Star },
    { value: '95%', label: 'Success Rate', icon: TrendingUp }
  ]

  const popularTopics = [
    { name: 'Tech Careers', count: 45, color: 'bg-neon-cyan/20 text-neon-cyan' },
    { name: 'Interview Prep', count: 38, color: 'bg-neon-pink/20 text-neon-pink' },
    { name: 'Salary Negotiation', count: 32, color: 'bg-purple-400/20 text-purple-400' },
    { name: 'Career Change', count: 29, color: 'bg-green-400/20 text-green-400' },
    { name: 'Remote Work', count: 25, color: 'bg-orange-400/20 text-orange-400' },
    { name: 'Skills Development', count: 23, color: 'bg-blue-400/20 text-blue-400' }
  ]

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'All' || guide.difficulty === selectedDifficulty
    const matchesSearch = searchTerm === '' || 
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesDifficulty && matchesSearch
  })

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
                <Compass className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Career Guidance</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Career Guides
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
            >
              Explore comprehensive career guides covering every industry and role. 
              From entry-level positions to executive leadership, find your path to success.
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
                  placeholder="Search career guides and topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-glass-bg border border-glass-border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                />
              </div>
            </motion.div>
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

      {/* Popular Topics */}
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
              Popular <span className="text-neon-cyan">Topics</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {popularTopics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                className={`px-6 py-3 rounded-full ${topic.color} glass-card cursor-pointer`}
              >
                <span className="font-semibold">{topic.name}</span>
                <span className="ml-2 opacity-75">({topic.count})</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="relative z-10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-neon-cyan" />
                <span className="text-white font-semibold">Filter Guides:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-space-dark">{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty} className="bg-space-dark">{difficulty}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-neon-cyan font-semibold">
                {filteredGuides.length} guides found
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Guides */}
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
              Featured <span className="text-neon-pink">Guides</span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {filteredGuides.filter(guide => guide.featured).map((guide, index) => {
              const IconComponent = guide.icon
              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 group"
                >
                  <div className="bg-gradient-to-r from-neon-cyan to-neon-pink p-1">
                    <div className="bg-space-dark p-2">
                      <div className="text-center text-white font-semibold text-sm">Featured Guide</div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className={`h-10 w-10 ${guide.color}`} />
                      <div className="text-right text-sm text-gray-400">
                        <div>{guide.category}</div>
                        <div>{guide.difficulty}</div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-neon-cyan transition-colors">
                      {guide.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">{guide.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{guide.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{guide.readers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{guide.rating}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{guide.topics.length} topics</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {guide.topics.slice(0, 2).map((topic, topicIndex) => (
                        <span key={topicIndex} className="px-3 py-1 glass-card rounded-full text-xs text-neon-cyan">
                          {topic}
                        </span>
                      ))}
                      {guide.topics.length > 2 && (
                        <span className="px-3 py-1 glass-card rounded-full text-xs text-gray-400">
                          +{guide.topics.length - 2} more
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center justify-center space-x-2"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* All Guides */}
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
              All <span className="text-neon-cyan">Guides</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {filteredGuides.filter(guide => !guide.featured).map((guide, index) => {
              const IconComponent = guide.icon
              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-transform duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <IconComponent className={`h-10 w-10 ${guide.color} flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-400">
                            <span className="px-3 py-1 glass-card rounded-full">{guide.category}</span>
                            <span className="px-3 py-1 glass-card rounded-full">{guide.difficulty}</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{guide.readTime}</span>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
                            {guide.title}
                          </h3>
                          <p className="text-gray-300 leading-relaxed mb-4">{guide.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.topics.map((topic, topicIndex) => (
                              <span key={topicIndex} className="px-3 py-1 glass-card rounded-full text-xs text-neon-cyan">
                                {topic}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{guide.readers.toLocaleString()} readers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{guide.rating}</span>
                            </div>
                            <div>By {guide.author}</div>
                            <div>Updated {new Date(guide.lastUpdated).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center space-x-2"
                      >
                        <span>Read Guide</span>
                        <ArrowRight className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredGuides.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center py-20"
            >
              <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No guides found</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Try adjusting your search terms or filters to find the career guides you're looking for.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <Compass className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Personalized Guidance?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Take our AI-powered career assessment to get personalized recommendations 
              and a custom career roadmap tailored to your goals.
            </p>
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
            >
              Take Career Assessment
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default GuidesPage