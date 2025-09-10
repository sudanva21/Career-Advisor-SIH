'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Code,
  Brain,
  Palette,
  Shield,
  Rocket,
  ArrowRight,
  Filter,
  Search,
  Star
} from 'lucide-react'

const CareersPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')

  const departments = ['All', 'Engineering', 'AI Research', 'Design', 'Product', 'Marketing', 'Operations']
  const locations = ['All', 'Remote', 'India', 'Hybrid']

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior AI Engineer',
      department: 'AI Research',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      icon: Brain,
      color: 'text-neon-pink',
      description: 'Lead the development of our AI-powered career matching algorithms and recommendation systems.',
      requirements: ['5+ years in AI/ML', 'Python, TensorFlow', 'NLP expertise', 'PhD preferred'],
      benefits: ['Equity package', 'Health insurance', 'Learning budget', 'Flexible hours']
    },
    {
      id: 2,
      title: 'Full-Stack Developer',
      department: 'Engineering',
      location: 'India',
      type: 'Full-time',
      salary: '₹8-15 LPA',
      icon: Code,
      color: 'text-neon-cyan',
      description: 'Build and maintain our career guidance platform using modern web technologies.',
      requirements: ['3+ years experience', 'React, Node.js', 'TypeScript', 'Database knowledge'],
      benefits: ['Stock options', 'Health coverage', 'Remote work', 'Growth opportunities']
    },
    {
      id: 3,
      title: 'Product Designer',
      department: 'Design',
      location: 'Hybrid',
      type: 'Full-time',
      salary: '₹10-18 LPA',
      icon: Palette,
      color: 'text-purple-400',
      description: 'Design intuitive user experiences that help students navigate their career journeys.',
      requirements: ['4+ years UX design', 'Figma expertise', 'User research', 'Portfolio required'],
      benefits: ['Creative freedom', 'Design budget', 'Conferences', 'Team retreats']
    },
    {
      id: 4,
      title: 'Data Scientist',
      department: 'AI Research',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹12-20 LPA',
      icon: Shield,
      color: 'text-green-400',
      description: 'Analyze career trends and build predictive models to improve our recommendations.',
      requirements: ['Statistics background', 'Python, R', 'ML experience', 'PhD preferred'],
      benefits: ['Research time', 'Conference budget', 'Publication support', 'Flexible schedule']
    },
    {
      id: 5,
      title: 'Product Manager',
      department: 'Product',
      location: 'India',
      type: 'Full-time',
      salary: '₹18-30 LPA',
      icon: Rocket,
      color: 'text-yellow-400',
      description: 'Drive product strategy and roadmap for our career guidance platform.',
      requirements: ['5+ years PM experience', 'Technical background', 'Analytics skills', 'Leadership'],
      benefits: ['Equity stake', 'Strategy role', 'Team leadership', 'Growth potential']
    },
    {
      id: 6,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Hybrid',
      type: 'Full-time',
      salary: '₹8-15 LPA',
      icon: Users,
      color: 'text-pink-400',
      description: 'Lead marketing initiatives to reach students and career counselors.',
      requirements: ['Digital marketing', 'Content strategy', 'Analytics', '3+ years experience'],
      benefits: ['Creative campaigns', 'Marketing budget', 'Brand building', 'Growth hacking']
    }
  ]

  const perks = [
    {
      icon: Code,
      title: 'Cutting-Edge Technology',
      description: 'Work with the latest AI and web technologies to solve real-world career challenges.',
      color: 'text-neon-cyan'
    },
    {
      icon: Users,
      title: 'Collaborative Culture',
      description: 'Join a diverse team of passionate professionals committed to student success.',
      color: 'text-neon-pink'
    },
    {
      icon: Rocket,
      title: 'Growth Opportunities',
      description: 'Rapid career advancement in a fast-growing EdTech startup environment.',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Comprehensive Benefits',
      description: 'Health insurance, equity packages, learning budgets, and flexible work arrangements.',
      color: 'text-green-400'
    }
  ]

  const filteredJobs = jobOpenings.filter(job => {
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment
    const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation
    return matchesDepartment && matchesLocation
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
                <Briefcase className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Join Our Team</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Careers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Join us in revolutionizing career guidance through AI and technology. 
              Help millions of students discover their perfect career path.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Company Culture */}
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
              Why Work at <span className="text-neon-cyan">CareerGuide</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of a mission-driven team that's transforming how students plan their careers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {perks.map((perk, index) => {
              const IconComponent = perk.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300"
                >
                  <IconComponent className={`h-16 w-16 ${perk.color} mx-auto mb-6`} />
                  <h3 className="text-xl font-bold text-white mb-4">{perk.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{perk.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Job Openings */}
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
              Open <span className="text-neon-pink">Positions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Find your next opportunity and help us shape the future of career guidance.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="glass-card p-6 rounded-2xl mb-12">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-neon-cyan" />
                <span className="text-white font-semibold">Filter by:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-gray-300 text-sm mb-2">Department</label>
                  <select 
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-gray-300 text-sm mb-2">Location</label>
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-neon-cyan font-semibold">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} found
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredJobs.map((job, index) => {
              const IconComponent = job.icon
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="glass-card p-3 rounded-xl">
                        <IconComponent className={`h-8 w-8 ${job.color}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{job.department}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-neon-green font-semibold">{job.salary}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center space-x-2">
                        <Star className="h-4 w-4 text-neon-cyan" />
                        <span>Requirements</span>
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {job.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="text-gray-300 text-sm flex items-center space-x-2">
                            <div className="w-1 h-1 bg-neon-cyan rounded-full"></div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-neon-pink" />
                        <span>Benefits</span>
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {job.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="text-gray-300 text-sm flex items-center space-x-2">
                            <div className="w-1 h-1 bg-neon-pink rounded-full"></div>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-xl text-space-dark font-bold transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center justify-center space-x-2"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              )
            })}
          </div>

          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 rounded-2xl text-center"
            >
              <Search className="h-16 w-16 text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Positions Found</h3>
              <p className="text-gray-300 mb-8">
                No positions match your current filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedDepartment('All')
                  setSelectedLocation('All')
                }}
                className="px-6 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Application Process */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <Rocket className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Us?</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Don't see a perfect fit? We're always looking for exceptional talent. 
              Send us your resume and let's explore how you can contribute to our mission.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                Send Resume
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass-card rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-gray-800/50 flex items-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>Meet the Team</span>
              </motion.button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Application Process</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <span className="text-white font-semibold">Apply</span>
                  </div>
                  <p className="text-gray-300 text-sm">Submit your application with resume and cover letter</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-neon-pink/20 text-neon-pink rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <span className="text-white font-semibold">Interview</span>
                  </div>
                  <p className="text-gray-300 text-sm">Technical and cultural fit interviews with our team</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-400/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <span className="text-white font-semibold">Join</span>
                  </div>
                  <p className="text-gray-300 text-sm">Welcome aboard and start making an impact!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default CareersPage