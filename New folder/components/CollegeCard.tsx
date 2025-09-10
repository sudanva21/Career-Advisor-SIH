'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  ExternalLink, 
  Heart, 
  Bookmark,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface College {
  id: string
  name: string
  location: string
  state: string
  city: string
  type: string
  established: number
  website?: string
  courses: string[]
  rating: number
  fees: string
  cutoff: string
  image?: string
  distance?: number
}

interface CollegeCardProps {
  college: College
  onSave?: (collegeId: string) => void
  isSaved?: boolean
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onSave, isSaved = false }) => {
  const [saved, setSaved] = useState(isSaved)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (loading) return
    
    setLoading(true)
    const newSavedState = !saved
    
    try {
      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: newSavedState ? 'save' : 'remove',
          collegeId: college.id,
          collegeName: college.name,
          collegeLocation: college.location,
          collegeType: college.type
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSaved(newSavedState)
        onSave?.(college.id)
        
        // Show success message (you could use toast here)
        console.log(result.message)
      } else {
        console.error('Failed to update college save status')
      }
    } catch (error) {
      console.error('Error saving college:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'government': return 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/30'
      case 'private': return 'text-neon-pink bg-neon-pink/20 border-neon-pink/30'
      case 'deemed': return 'text-neon-purple bg-neon-purple/20 border-neon-purple/30'
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 rounded-2xl hover:border-neon-cyan/50 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
              {college.name}
            </h3>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.1 }}
              whileTap={{ scale: loading ? 1 : 0.9 }}
              onClick={handleSave}
              disabled={loading}
              className={`p-1 rounded-full transition-colors ${
                loading
                  ? 'text-gray-600 cursor-not-allowed'
                  : saved 
                    ? 'text-neon-pink' 
                    : 'text-gray-400 hover:text-neon-pink'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <Heart className="w-5 h-5 fill-current" />
              ) : (
                <Heart className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{college.city}, {college.state}</span>
            </div>
            {college.distance && (
              <div className="flex items-center space-x-1">
                <span>•</span>
                <span>{college.distance} km away</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(college.type)}`}>
              {college.type}
            </span>
            
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-white font-semibold">{college.rating}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Est. {college.established}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-medium text-gray-300">Annual Fees</span>
          </div>
          <p className="text-neon-cyan font-bold text-sm">{college.fees}</p>
        </div>
        
        <div className="bg-black/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-neon-pink" />
            <span className="text-xs font-medium text-gray-300">Cutoff</span>
          </div>
          <p className="text-neon-pink font-bold text-sm">{college.cutoff}</p>
        </div>
      </div>

      {/* Courses Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Popular Courses</h4>
        <div className="flex flex-wrap gap-2">
          {college.courses.slice(0, 3).map((course, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600"
            >
              {course}
            </span>
          ))}
          {college.courses.length > 3 && (
            <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full border border-gray-600">
              +{college.courses.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <motion.div
        initial={false}
        animate={{ height: showDetails ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">All Available Courses</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {college.courses.map((course, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-neon-cyan/10 text-neon-cyan text-xs rounded-full border border-neon-cyan/30"
              >
                {course}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-neon-cyan hover:text-neon-pink text-sm font-semibold transition-colors"
        >
          {showDetails ? 'Show Less' : 'View Details'}
        </button>
        
        <div className="flex space-x-2">
          {college.website && (
            <motion.a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg text-space-dark font-semibold text-sm hover:shadow-lg hover:shadow-neon-cyan/25 transition-all"
            >
              <span>Visit</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 border border-neon-cyan text-neon-cyan rounded-lg font-semibold text-sm hover:bg-neon-cyan/10 transition-all"
          >
            Compare
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default CollegeCard