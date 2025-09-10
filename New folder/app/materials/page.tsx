'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Download, 
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Award,
  Play,
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  ExternalLink,
  Heart,
  Share
} from 'lucide-react'

const StudyMaterialsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['All', 'Career Guides', 'Interview Prep', 'Resume Writing', 'Skill Development', 'Industry Insights', 'Educational Paths']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const materials = [
    {
      id: 1,
      title: 'Complete Software Engineering Career Guide',
      category: 'Career Guides',
      level: 'Beginner',
      type: 'PDF',
      icon: FileText,
      size: '15.2 MB',
      pages: 120,
      rating: 4.9,
      downloads: 15420,
      duration: null,
      description: 'Comprehensive guide covering programming languages, frameworks, career paths, and salary expectations in software engineering.',
      tags: ['Programming', 'Career Planning', 'Software Development'],
      featured: true,
      color: 'text-neon-cyan'
    },
    {
      id: 2,
      title: 'AI & Machine Learning Career Roadmap',
      category: 'Career Guides',
      level: 'Intermediate',
      type: 'Video Series',
      icon: Video,
      size: '2.3 GB',
      pages: null,
      rating: 4.8,
      downloads: 8940,
      duration: '6.5 hours',
      description: 'Step-by-step video series covering AI careers, required skills, projects, and industry trends.',
      tags: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
      featured: true,
      color: 'text-neon-pink'
    },
    {
      id: 3,
      title: 'FAANG Interview Preparation Kit',
      category: 'Interview Prep',
      level: 'Advanced',
      type: 'Interactive',
      icon: Award,
      size: '45.6 MB',
      pages: 200,
      rating: 4.95,
      downloads: 22150,
      duration: null,
      description: 'Complete interview preparation including coding problems, system design, and behavioral questions for top tech companies.',
      tags: ['FAANG', 'Interviews', 'Coding', 'System Design'],
      featured: true,
      color: 'text-purple-400'
    },
    {
      id: 4,
      title: 'Resume That Gets You Hired',
      category: 'Resume Writing',
      level: 'Beginner',
      type: 'Template Pack',
      icon: FileText,
      size: '8.4 MB',
      pages: 25,
      rating: 4.7,
      downloads: 18760,
      duration: null,
      description: 'Professional resume templates and writing guide with examples from successful candidates.',
      tags: ['Resume', 'Templates', 'Job Search'],
      featured: false,
      color: 'text-green-400'
    },
    {
      id: 5,
      title: 'Digital Marketing Mastery Course',
      category: 'Skill Development',
      level: 'Intermediate',
      type: 'Audio Course',
      icon: Headphones,
      size: '890 MB',
      pages: null,
      rating: 4.6,
      downloads: 6340,
      duration: '12 hours',
      description: 'Complete audio course covering SEO, social media marketing, content strategy, and analytics.',
      tags: ['Digital Marketing', 'SEO', 'Social Media'],
      featured: false,
      color: 'text-orange-400'
    },
    {
      id: 6,
      title: 'Healthcare Career Paths 2024',
      category: 'Industry Insights',
      level: 'Beginner',
      type: 'Infographic Set',
      icon: ImageIcon,
      size: '25.1 MB',
      pages: 15,
      rating: 4.4,
      downloads: 3290,
      duration: null,
      description: 'Visual guide to healthcare careers including emerging roles, salary trends, and education requirements.',
      tags: ['Healthcare', 'Medical', 'Career Paths'],
      featured: false,
      color: 'text-blue-400'
    }
  ]

  const stats = [
    { value: '500+', label: 'Study Materials', icon: BookOpen },
    { value: '100K+', label: 'Downloads', icon: Download },
    { value: '4.8★', label: 'Average Rating', icon: Star },
    { value: '50K+', label: 'Active Learners', icon: Users }
  ]

  const featuredCollections = [
    {
      name: 'Tech Career Starter Pack',
      count: 12,
      color: 'from-neon-cyan/20 to-neon-cyan/10',
      description: 'Everything you need to start a career in technology'
    },
    {
      name: 'Business Professional Kit',
      count: 18,
      color: 'from-neon-pink/20 to-neon-pink/10',
      description: 'Essential materials for business and management careers'
    },
    {
      name: 'Creative Industries Guide',
      count: 15,
      color: 'from-purple-400/20 to-purple-400/10',
      description: 'Resources for design, media, and creative professionals'
    }
  ]

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'All' || material.category === selectedCategory
    const matchesLevel = selectedLevel === 'All' || material.level === selectedLevel
    const matchesSearch = searchTerm === '' || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesLevel && matchesSearch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return FileText
      case 'Video Series': return Video
      case 'Audio Course': return Headphones
      case 'Interactive': return Award
      case 'Template Pack': return FileText
      case 'Infographic Set': return ImageIcon
      default: return FileText
    }
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
                <BookOpen className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Study Materials</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Study Materials
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
            >
              Access our comprehensive library of career guides, interview preparation materials, 
              skill development resources, and industry insights to accelerate your career growth.
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
                  placeholder="Search materials, guides, and resources..."
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

      {/* Featured Collections */}
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
              Featured <span className="text-neon-cyan">Collections</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCollections.map((collection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-8 rounded-2xl bg-gradient-to-br ${collection.color} hover:scale-105 transition-transform duration-300 cursor-pointer`}
              >
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-neon-cyan mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">{collection.name}</h3>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{collection.description}</p>
                  <div className="text-neon-cyan font-semibold">{collection.count} materials</div>
                </div>
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
                <span className="text-white font-semibold">Filter Materials:</span>
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
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                  >
                    {levels.map(level => (
                      <option key={level} value={level} className="bg-space-dark">{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-neon-cyan font-semibold">
                {filteredMaterials.length} materials found
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMaterials.map((material, index) => {
              const TypeIcon = getTypeIcon(material.type)
              return (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 group"
                >
                  {material.featured && (
                    <div className="bg-gradient-to-r from-neon-cyan to-neon-pink p-1">
                      <div className="bg-space-dark p-2">
                        <div className="text-center text-white font-semibold text-sm">Featured</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <TypeIcon className={`h-8 w-8 ${material.color}`} />
                      <div className="flex space-x-2">
                        <button className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors">
                          <Heart className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors">
                          <Share className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
                      {material.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{material.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {material.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-3 py-1 glass-card rounded-full text-xs text-neon-cyan">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>{material.level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>{material.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{material.rating}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {material.duration ? (
                          <>
                            <Clock className="h-4 w-4" />
                            <span>{material.duration}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            <span>{material.pages} pages</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{material.size}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center py-20"
            >
              <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No materials found</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Try adjusting your search terms or filters to find the study materials you're looking for.
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
            <BookOpen className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Specific Materials?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Can't find what you're looking for? Let us know what study materials 
              you need and we'll add them to our library.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
            >
              Request Materials
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default StudyMaterialsPage