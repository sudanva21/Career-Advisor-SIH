'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Send,
  MessageCircle,
  User,
  Building,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Calendar,
  CheckCircle,
  Zap,
  Heart,
  Star
} from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with your account, technical issues, or general questions',
      value: 'sudanva7@gmail.com',
      action: 'mailto:sudanva7@gmail.com',
      responseTime: 'Within 24 hours',
      color: 'text-neon-cyan'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team for immediate assistance',
      value: 'Available 9 AM - 6 PM IST',
      action: '#',
      responseTime: 'Instant',
      color: 'text-neon-pink'
    },
    {
      icon: Calendar,
      title: 'Schedule a Call',
      description: 'Book a consultation with our career experts',
      value: 'Free 30-min consultation',
      action: '#',
      responseTime: 'Same day',
      color: 'text-purple-400'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      description: 'Visit our headquarters for in-person meetings',
      value: 'Bangalore, Karnataka, India',
      action: '#',
      responseTime: 'By appointment',
      color: 'text-green-400'
    }
  ]

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'partnership', label: 'Business Partnership' },
    { value: 'career', label: 'Career Consultation' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ]

  const socialLinks = [
    {
      icon: Linkedin,
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/sudanva',
      color: 'text-blue-500'
    },
    {
      icon: Github,
      name: 'GitHub',
      url: 'https://github.com/sudanva',
      color: 'text-gray-400'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: 'https://twitter.com/sudanva',
      color: 'text-blue-400'
    },
    {
      icon: Globe,
      name: 'Website',
      url: 'https://careerguide.com',
      color: 'text-neon-cyan'
    }
  ]

  const stats = [
    { value: '24/7', label: 'Support Available', icon: Clock },
    { value: '<2hrs', label: 'Average Response', icon: Zap },
    { value: '98%', label: 'Satisfaction Rate', icon: Heart },
    { value: '4.9★', label: 'Support Rating', icon: Star }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        category: 'general'
      })
    }, 3000)
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
                <MessageCircle className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Get in Touch</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Contact Us
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Have questions about your career path? Need help with our platform? 
              Our expert team is here to support your professional journey every step of the way.
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

      {/* Contact Methods */}
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
              Choose Your <span className="text-neon-cyan">Contact Method</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300 group"
                >
                  <IconComponent className={`h-12 w-12 mx-auto mb-6 ${method.color}`} />
                  <h3 className="text-xl font-bold text-white mb-4">{method.title}</h3>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{method.description}</p>
                  
                  <div className="space-y-3">
                    <div className="text-neon-cyan font-semibold">{method.value}</div>
                    <div className="text-gray-400 text-xs">Response: {method.responseTime}</div>
                  </div>

                  <motion.a
                    href={method.action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 inline-block w-full px-6 py-3 glass-card rounded-lg text-white hover:bg-white/10 transition-colors"
                  >
                    Contact Now
                  </motion.a>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
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
              Send Us a <span className="text-neon-pink">Message</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Message Sent Successfully!</h3>
                <p className="text-gray-300 mb-6">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <div className="text-neon-cyan">Redirecting...</div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value} className="bg-space-dark">
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors duration-300 resize-none"
                    placeholder="Tell us more about how we can help you..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl text-space-dark font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25 flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </motion.button>

                <p className="text-gray-400 text-sm text-center">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Social Media & Additional Info */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-white mb-8">
                Connect With <span className="text-neon-cyan">Us</span>
              </h3>
              
              <div className="space-y-6">
                {socialLinks.map((link, index) => {
                  const IconComponent = link.icon
                  return (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, x: 10 }}
                      className="flex items-center space-x-4 p-6 glass-card rounded-2xl hover:bg-white/5 transition-all duration-300"
                    >
                      <IconComponent className={`h-8 w-8 ${link.color}`} />
                      <div>
                        <div className="text-white font-semibold">{link.name}</div>
                        <div className="text-gray-400 text-sm">Follow us for updates</div>
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>

            {/* Office Hours & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-white mb-8">
                Support <span className="text-neon-pink">Hours</span>
              </h3>
              
              <div className="glass-card p-8 rounded-2xl mb-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Monday - Friday</span>
                    <span className="text-neon-cyan">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Saturday</span>
                    <span className="text-neon-cyan">10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Sunday</span>
                    <span className="text-gray-400">Closed</span>
                  </div>
                  <div className="border-t border-glass-border pt-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-neon-cyan" />
                      <span className="text-gray-300 text-sm">Emergency support available 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-2xl">
                <h4 className="text-xl font-bold text-white mb-4">Quick Questions?</h4>
                <p className="text-gray-300 mb-4">
                  Check out our FAQ section for instant answers to common questions about 
                  career guidance, platform features, and account management.
                </p>
                <motion.a
                  href="/faq"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-6 py-3 glass-card rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  View FAQ
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage