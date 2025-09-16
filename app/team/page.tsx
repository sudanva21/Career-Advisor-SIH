'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Users, 
  Code, 
  Brain, 
  Palette,
  Shield,
  Target,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Phone,
  Star,
  Crown
} from 'lucide-react'

const TeamPage = () => {
  const allTeamMembers = [
    {
      name: 'Sudanva',
      role: 'Team Leader & Technical Lead',
      bio: 'Leading the CareerGuide vision through technical innovation and strategic guidance. Expert in full-stack development and AI integration.',
      skills: ['Technical Leadership', 'Full-Stack Development', 'AI/ML', 'Presentation', 'Product Strategy'],
      profileImage: '/sudanva-profile.jpg',
      icon: Code,
      color: 'text-neon-cyan',
      isLeader: true,
      email: 'sudanva7@gmail.com',
      phone: '+91 8310491208',
      social: {
        linkedin: 'https://www.linkedin.com/in/sudanva-shilannavar/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        twitter: 'https://x.com/Sudanva999?t=0TMLL6qBkTfH9MbRdp6Ssg&s=09',
        github: 'https://github.com/sudanva21'
      }
    },
    {
      name: 'Rakshita Patil',
      role: 'Quality Assurance & Testing Specialist',
      bio: 'Ensures exceptional user experience through comprehensive testing and quality assurance. Expert in debugging and system optimization.',
      skills: ['Quality Assurance', 'Testing Strategies', 'Debugging', 'User Experience'],
      profileImage: '/rakshita-profile.jpg',
      icon: Shield,
      color: 'text-neon-pink',
      isLeader: false
    },
    {
      name: 'Sagar Kuligoud',
      role: 'Project Coordinator & Presentation Lead',
      bio: 'Drives team coordination and manages project workflows. Specializes in strategic presentations and team management.',
      skills: ['Project Coordination', 'Team Management', 'Presentation', 'Strategic Planning'],
      profileImage: '/sagar-profile.jpg',
      icon: Target,
      color: 'text-purple-400',
      isLeader: false
    },
    {
      name: 'Laxmikant Talli',
      role: 'Data Analyst & Insights Specialist',
      bio: 'Transforms complex data into actionable insights and compelling visualizations. Expert in statistical analysis and data presentation.',
      skills: ['Data Analysis', 'Data Visualization', 'Statistical Analysis', 'Presentation'],
      profileImage: '/laxmikant-profile.jpg',
      icon: Brain,
      color: 'text-green-400',
      isLeader: false
    },
    {
      name: 'Akash Kambar',
      role: 'Innovation & Strategy Contributor',
      bio: 'Brings creative problem-solving and fresh perspectives to complex challenges. Specializes in strategic thinking and innovation.',
      skills: ['Creative Problem Solving', 'Innovation', 'Strategic Thinking', 'Research'],
      profileImage: '/akash-profile.jpg',
      icon: Users,
      color: 'text-yellow-400',
      isLeader: false
    },
    {
      name: 'Malikarjun Kadagoudr',
      role: 'Strategic Analyst & Developer',
      bio: 'Contributes analytical expertise and strategic development insights. Expert in creative solutions and problem-solving approaches.',
      skills: ['Strategic Analysis', 'Creative Development', 'Problem Solving', 'Research'],
      profileImage: '/malikarjun-profile.jpg',
      icon: Palette,
      color: 'text-orange-400',
      isLeader: false
    }
  ]

  const departments = [
    {
      name: 'Engineering',
      icon: Code,
      color: 'text-neon-cyan',
      bgColor: 'from-neon-cyan/10 to-neon-cyan/5',
      members: 8,
      description: 'Building scalable AI-powered career guidance systems'
    },
    {
      name: 'AI Research',
      icon: Brain,
      color: 'text-neon-pink',
      bgColor: 'from-neon-pink/10 to-neon-pink/5',
      members: 5,
      description: 'Developing cutting-edge machine learning models for career matching'
    },
    {
      name: 'Design',
      icon: Palette,
      color: 'text-purple-400',
      bgColor: 'from-purple-400/10 to-purple-400/5',
      members: 4,
      description: 'Creating intuitive and beautiful user experiences'
    },
    {
      name: 'Security',
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'from-green-400/10 to-green-400/5',
      members: 3,
      description: 'Ensuring data privacy and platform security'
    }
  ]

  const cultureValues = [
    {
      title: 'Student-First Mindset',
      description: 'Every decision we make is guided by what\'s best for students and their career success.'
    },
    {
      title: 'Innovation & Excellence',
      description: 'We continuously push the boundaries of what\'s possible in educational technology.'
    },
    {
      title: 'Collaboration',
      description: 'Great products are built by great teams working together towards a common goal.'
    },
    {
      title: 'Lifelong Learning',
      description: 'We believe in continuous growth and learning, both personally and professionally.'
    }
  ]

  const openPositions = [
    'Senior AI Engineer',
    'Full-Stack Developer',
    'UX/UI Designer',
    'Product Manager',
    'DevOps Engineer',
    'Content Strategist'
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
                <Users className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Meet Our Team</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Our Team
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Meet the passionate individuals behind CareerGuide who are dedicated to 
              transforming the future of career guidance through innovation and technology.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Unified Team Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTeamMembers.map((member, index) => {
              const IconComponent = member.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300 relative ${
                    member.isLeader ? 'border-2 border-neon-cyan/50' : ''
                  }`}
                >
                  {/* Leader Badge */}
                  {member.isLeader && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-space-dark" />
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink p-1 mx-auto mb-4 ${
                      member.isLeader ? 'w-28 h-28' : ''
                    }`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-space-dark flex items-center justify-center">
                        {member.profileImage ? (
                          <Image
                            src={member.profileImage}
                            alt={`${member.name} - ${member.role}`}
                            width={member.isLeader ? 112 : 96}
                            height={member.isLeader ? 112 : 96}
                            className="w-full h-full object-cover rounded-full"
                            priority={member.isLeader}
                          />
                        ) : (
                          <IconComponent className={`h-12 w-12 ${member.color}`} />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className={`font-bold text-white mb-2 ${member.isLeader ? 'text-2xl' : 'text-xl'}`}>
                    {member.name}
                  </h3>
                  <p className={`font-semibold mb-4 ${member.color} ${member.isLeader ? 'text-lg' : 'text-base'}`}>
                    {member.role}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">{member.bio}</p>
                  
                  <div className="space-y-2 mb-6">
                    <h4 className="text-white font-semibold text-sm mb-3">Core Skills</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.skills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex} 
                          className="px-3 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full border border-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info for Leader */}
                  {member.isLeader && member.social && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </a>
                        <a 
                          href={`tel:${member.phone}`}
                          className="flex items-center space-x-2 px-4 py-2 glass-card rounded-lg text-white font-semibold hover:bg-gray-800/50 transition-all duration-300 text-sm"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Call</span>
                        </a>
                      </div>
                      <div className="flex space-x-3 justify-center">
                        <a 
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="p-2 glass-card rounded-lg text-gray-400 hover:text-neon-cyan transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a 
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="p-2 glass-card rounded-lg text-gray-400 hover:text-neon-cyan transition-colors"
                          title="X (Twitter)"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                        <a 
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="p-2 glass-card rounded-lg text-gray-400 hover:text-neon-cyan transition-colors"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Departments Section */}
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
              Our <span className="text-neon-pink">Departments</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Diverse talents working together to build the future of career guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, index) => {
              const IconComponent = dept.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-br ${dept.bgColor}`}
                >
                  <IconComponent className={`h-16 w-16 ${dept.color} mx-auto mb-6`} />
                  <h3 className="text-2xl font-bold text-white mb-4">{dept.name}</h3>
                  <div className="text-3xl font-bold text-neon-cyan mb-4">{dept.members}</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{dept.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Culture Section */}
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
              Our <span className="text-neon-cyan">Culture</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The values that guide us in everything we do.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {cultureValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-2xl"
          >
            <Target className="h-16 w-16 text-neon-pink mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Join Our Mission</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We're always looking for talented individuals who share our passion 
              for transforming career guidance through technology.
            </p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Open Positions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {openPositions.map((position, index) => (
                  <div key={index} className="glass-card p-4 rounded-lg">
                    <span className="text-neon-cyan font-semibold">{position}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.a
              href="/careers"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
            >
              View All Openings
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default TeamPage