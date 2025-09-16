'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  MapPin, 
  Star, 
  ExternalLink,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Bookmark,
  Search,
  Filter,
  SortAsc,
  Heart,
  Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { useSavedCollegesUpdates } from '@/lib/hooks/useRealtimeUpdates'

interface SavedCollege {
  id: string
  savedId: string
  collegeId: string
  savedAt: string
  name: string
  shortName: string
  location: string
  state: string
  city: string
  type: string
  established: number
  website: string
  courses: string[]
  rating: number
  fees: string
  cutoff: string
  ranking: number
  acceptanceRate: number
  tuition: string
  imageUrl: string
  programs: string[]
  averageGPA: string
  averageSAT: number
  description: string
  highlights: string[]
  campusSize: string
  studentPopulation: number
  isPublic: boolean
  isSaved: boolean
}

export default function SavedCollegesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'savedAt' | 'rating' | 'ranking'>('savedAt')
  const [filterBy, setFilterBy] = useState<'all' | 'government' | 'private'>('all')
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedColleges()
  }, [])

  // Set up real-time updates for saved colleges
  useSavedCollegesUpdates((updatedColleges) => {
    console.log('🔄 Real-time update: Saved colleges changed')
    setSavedColleges(updatedColleges)
    toast.success('Saved colleges updated!')
  })

  const fetchSavedColleges = async () => {
    try {
      setLoading(true)
      console.log('🎓 Fetching saved colleges...')
      
      const response = await fetch('/api/saved-colleges')
      const data = await response.json()
      
      if (data.success) {
        setSavedColleges(data.savedColleges || [])
        console.log(`✅ Found ${data.count} saved colleges`)
        
        if (data.message) {
          console.log('📝', data.message)
        }
      } else {
        console.error('❌ Failed to fetch saved colleges:', data.error)
        toast.error('Failed to fetch saved colleges')
      }
    } catch (error) {
      console.error('❌ Error fetching saved colleges:', error)
      toast.error('Failed to fetch saved colleges')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCollege = async (college: SavedCollege) => {
    try {
      setRemoving(college.savedId)
      console.log('🗑️ Removing college:', college.name)

      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          collegeId: college.collegeId,
          collegeName: college.name,
          collegeLocation: college.location,
          collegeType: college.type
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state immediately
        setSavedColleges(prev => prev.filter(c => c.savedId !== college.savedId))
        toast.success(`${college.name} removed from saved colleges`)
        console.log('✅ College removed successfully')
      } else {
        toast.error('Failed to remove college')
        console.error('❌ Failed to remove college:', data.error)
      }
    } catch (error) {
      console.error('❌ Error removing college:', error)
      toast.error('Failed to remove college')
    } finally {
      setRemoving(null)
    }
  }

  const getFilteredAndSortedColleges = () => {
    let filtered = savedColleges

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.courses.some(course => 
          course.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(college => {
        if (filterBy === 'government') return college.isPublic
        if (filterBy === 'private') return !college.isPublic
        return true
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'savedAt':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'ranking':
          return a.ranking - b.ranking
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredColleges = getFilteredAndSortedColleges()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Loading your saved colleges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid-bg"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Saved Colleges
              </h1>
              <p className="text-gray-400 flex items-center">
                <Bookmark className="mr-2" size={16} />
                {savedColleges.length} colleges saved
              </p>
            </div>
            <Link
              href="/colleges"
              className="px-6 py-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
            >
              Browse More Colleges
            </Link>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search saved colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none"
              />
            </div>

            {/* Filter by type */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="government">Government</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
              >
                <option value="savedAt">Recently Saved</option>
                <option value="name">College Name</option>
                <option value="rating">Rating</option>
                <option value="ranking">Ranking</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Colleges Grid */}
        {filteredColleges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <Heart size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              {searchTerm || filterBy !== 'all' ? 'No colleges found' : 'No saved colleges yet'}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start exploring and save colleges that interest you'
              }
            </p>
            <Link
              href="/colleges"
              className="inline-flex items-center px-6 py-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
            >
              <GraduationCap className="mr-2" size={20} />
              Browse Colleges
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredColleges.map((college, index) => (
                <motion.div
                  key={college.savedId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-300 group"
                >
                  {/* College Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={college.imageUrl}
                      alt={college.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveCollege(college)}
                      disabled={removing === college.savedId}
                      className="absolute top-3 right-3 p-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removing === college.savedId ? (
                        <LoadingSpinner />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>

                    {/* Saved date */}
                    <div className="absolute bottom-3 left-3 flex items-center text-white text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Clock size={12} className="mr-1" />
                      Saved {new Date(college.savedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* College Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-neon-cyan transition-colors">
                        {college.name}
                      </h3>
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <MapPin size={14} className="mr-1" />
                        {college.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <span className="text-white font-medium">{college.rating}</span>
                          <span className="text-gray-400 text-sm ml-2">
                            Rank #{college.ranking}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          college.isPublic 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {college.type}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Established</span>
                        <span className="text-white">{college.established}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Students</span>
                        <span className="text-white">{college.studentPopulation.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Acceptance Rate</span>
                        <span className="text-white">{college.acceptanceRate}%</span>
                      </div>
                    </div>

                    {/* Programs */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Top Programs:</p>
                      <div className="flex flex-wrap gap-1">
                        {college.programs.slice(0, 3).map((program, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-neon-cyan/10 text-neon-cyan text-xs rounded-full border border-neon-cyan/20"
                          >
                            {program}
                          </span>
                        ))}
                        {college.programs.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                            +{college.programs.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/colleges/${college.collegeId}`}
                        className="flex-1 px-4 py-2 bg-neon-cyan/20 text-neon-cyan text-center text-sm rounded-lg hover:bg-neon-cyan/30 transition-colors"
                      >
                        View Details
                      </Link>
                      {college.website !== '#' && (
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}