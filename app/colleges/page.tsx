'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Map as MapIcon, 
  Grid3X3,
  SlidersHorizontal,
  X,
  Star,
  Loader
} from 'lucide-react'
import CollegeCard from '@/components/CollegeCard'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// Dynamically import map components (Leaflet fallback)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Google Maps (preferred if API key present)
const GoogleCollegesMap = dynamic(() => import('@/components/GoogleCollegesMap'), { ssr: false }) as any

interface College {
  id: string
  name: string
  shortName: string
  location: string
  state: string
  city: string
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
  website: string
  established: number
  fees: string
  cutoff: string
  rating: number
  type: string
  latitude: number
  longitude: number
  courses: string[]
  isSaved?: boolean
  distance?: number
}

// Mock college data - replace with real API
const mockColleges: College[] = [
  {
    id: '1',
    name: 'Indian Institute of Technology Delhi',
    location: 'Hauz Khas, New Delhi',
    state: 'Delhi',
    city: 'New Delhi',
    type: 'Government',
    established: 1961,
    website: 'https://home.iitd.ac.in',
    courses: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'],
    rating: 4.8,
    fees: '₹2.5L - 3L',
    cutoff: 'JEE Rank 1-500',
    latitude: 28.5449,
    longitude: 77.1928
  },
  {
    id: '2',
    name: 'Birla Institute of Technology and Science',
    location: 'Pilani, Rajasthan',
    state: 'Rajasthan',
    city: 'Pilani',
    type: 'Private',
    established: 1964,
    website: 'https://www.bits-pilani.ac.in',
    courses: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'],
    rating: 4.6,
    fees: '₹4L - 5L',
    cutoff: 'BITSAT 350+',
    latitude: 28.3670,
    longitude: 75.5886
  },
  {
    id: '3',
    name: 'Delhi Technological University',
    location: 'Shahbad Daulatpur, Delhi',
    state: 'Delhi',
    city: 'New Delhi',
    type: 'Government',
    established: 1941,
    website: 'http://www.dtu.ac.in',
    courses: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
    rating: 4.4,
    fees: '₹1.5L - 2L',
    cutoff: 'JEE Rank 3000-8000',
    latitude: 28.7501,
    longitude: 77.1177
  },
  {
    id: '4',
    name: 'Manipal Institute of Technology',
    location: 'Manipal, Karnataka',
    state: 'Karnataka',
    city: 'Manipal',
    type: 'Private',
    established: 1957,
    website: 'https://manipal.edu',
    courses: ['Computer Science', 'Information Technology', 'Mechanical', 'Aeronautical', 'Biomedical'],
    rating: 4.3,
    fees: '₹3.5L - 4.5L',
    cutoff: 'MET Rank 1-5000',
    latitude: 13.3475,
    longitude: 74.7869
  },
  {
    id: '5',
    name: 'Vellore Institute of Technology',
    location: 'Vellore, Tamil Nadu',
    state: 'Tamil Nadu',
    city: 'Vellore',
    type: 'Private',
    established: 1984,
    website: 'https://vit.ac.in',
    courses: ['Computer Science', 'Electronics', 'Biotechnology', 'Chemical', 'Mechanical'],
    rating: 4.2,
    fees: '₹2L - 3L',
    cutoff: 'VITEEE Rank 1-10000',
    latitude: 12.9716,
    longitude: 79.1588
  },
  {
    id: '6',
    name: 'National Institute of Technology Trichy',
    location: 'Tiruchirappalli, Tamil Nadu',
    state: 'Tamil Nadu',
    city: 'Tiruchirappalli',
    type: 'Government',
    established: 1964,
    website: 'https://www.nitt.edu',
    courses: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'],
    rating: 4.7,
    fees: '₹1.5L - 2L',
    cutoff: 'JEE Rank 800-3000',
    latitude: 10.7596,
    longitude: 78.8149
  }
]

// Filter options are now dynamic, set in state

export default function CollegesPage() {
  const { user } = useAuth()
  const [colleges, setColleges] = useState<College[]>([])
  const [filteredColleges, setFilteredColleges] = useState<College[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | undefined>(undefined)
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDe9PcYT1EB2-p4uumsQ4hx2jOVM61Hrow'
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [savedColleges, setSavedColleges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [states, setStates] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [courses, setCourses] = useState<string[]>([])
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'fees'>('rating')
  const [aiOverview, setAiOverview] = useState<string>('')
  const [aiLoading, setAiLoading] = useState<boolean>(false)

  // Fetch colleges and saved colleges data
  useEffect(() => {
    fetchColleges()
    if (user) {
      fetchSavedColleges()
    }
  }, [user])

  const fetchColleges = async () => {
    try {
      setLoading(true)
      console.log('🎓 Fetching colleges data...')
      
      const response = await fetch('/api/colleges')
      const data = await response.json()
      
      if (data.success && data.colleges) {
        console.log('✅ Colleges fetched:', data.colleges.length)
        setColleges(data.colleges)
        
        // Extract unique values for filters
        const uniqueStates = Array.from(new Set(data.colleges.map((c: College) => c.state))).sort()
        const uniqueTypes = Array.from(new Set(data.colleges.map((c: College) => c.type))).sort()
        const uniqueCourses = Array.from(new Set(data.colleges.flatMap((c: College) => c.courses || c.programs || []))).sort()
        
        setStates(uniqueStates)
        setTypes(uniqueTypes)  
        setCourses(uniqueCourses)
      } else {
        console.warn('⚠️ No colleges data received, using fallback')
        setColleges(mockColleges)
        setStates(Array.from(new Set(mockColleges.map(c => c.state))).sort())
        setTypes(Array.from(new Set(mockColleges.map(c => c.type))).sort())
        setCourses(Array.from(new Set(mockColleges.flatMap(c => c.courses))).sort())
      }
    } catch (error) {
      console.error('❌ Error fetching colleges:', error)
      toast.error('Failed to load colleges')
      setColleges(mockColleges)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedColleges = async () => {
    try {
      const response = await fetch('/api/saved-colleges')
      const data = await response.json()
      
      if (data.success && data.savedColleges) {
        console.log('📚 Saved colleges fetched:', data.savedColleges.length)
        setSavedColleges(data.savedColleges.map((sc: any) => sc.collegeId || sc.college_id))
      }
    } catch (error) {
      console.error('❌ Error fetching saved colleges:', error)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = colleges.filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           college.city.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesState = !selectedState || college.state === selectedState
      const matchesType = !selectedType || college.type === selectedType
      const matchesCourse = !selectedCourse || college.courses.includes(selectedCourse)
      const matchesRating = college.rating >= minRating
      
      return matchesSearch && matchesState && matchesType && matchesCourse && matchesRating
    })

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.rating - a.rating
        case 'fees':
          // Simple fee comparison (would need better parsing in real app)
          return a.fees.localeCompare(b.fees)
        default:
          return 0
      }
    })

    setFilteredColleges(filtered)
  }, [colleges, searchQuery, selectedState, selectedType, selectedCourse, minRating, sortBy])

  // Fetch AI overview when a college is selected
  useEffect(() => {
    const selected = filteredColleges.find(c => c.id === selectedCollegeId)
    if (!selected) return

    const run = async () => {
      try {
        setAiLoading(true)
        setAiOverview('')
        const resp = await fetch('/api/colleges/overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selected.name,
            city: selected.city,
            state: selected.state,
            programs: selected.courses,
            rating: selected.rating,
            type: selected.type,
            website: selected.website,
          })
        })
        const data = await resp.json()
        if (data.success && data.overview) setAiOverview(data.overview)
      } catch (e) {
        console.error('AI overview error', e)
      } finally {
        setAiLoading(false)
      }
    }

    run()
  }, [selectedCollegeId, filteredColleges])

  const handleSaveCollege = async (collegeId: string) => {
    if (!user) {
      toast.error('Please log in to save colleges')
      return
    }

    const isSaved = savedColleges.includes(collegeId)
    const college = colleges.find(c => c.id === collegeId)
    
    if (!college) {
      toast.error('College not found')
      return
    }

    try {
      // Optimistically update UI
      setSavedColleges(prev => 
        isSaved 
          ? prev.filter(id => id !== collegeId)
          : [...prev, collegeId]
      )

      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSaved ? 'remove' : 'save',
          collegeId: college.id,
          collegeName: college.name,
          collegeLocation: college.location,
          collegeType: college.type
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(isSaved ? 'College removed from saved list' : 'College saved successfully!')
      } else {
        // Revert optimistic update on error
        setSavedColleges(prev => 
          isSaved 
            ? [...prev, collegeId]
            : prev.filter(id => id !== collegeId)
        )
        toast.error(result.error || 'Failed to update college')
      }
    } catch (error) {
      console.error('Error saving college:', error)
      // Revert optimistic update on error
      setSavedColleges(prev => 
        isSaved 
          ? [...prev, collegeId]
          : prev.filter(id => id !== collegeId)
      )
      toast.error('Failed to save college')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedState('')
    setSelectedType('')
    setSelectedCourse('')
    setMinRating(0)
  }

  const activeFiltersCount = [selectedState, selectedType, selectedCourse].filter(Boolean).length + (minRating > 0 ? 1 : 0)

  return (
    <div className="min-h-screen bg-space-dark relative overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-bg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">College</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Discover top engineering colleges across India with detailed information and insights
            </p>
          </div>

          {/* Search and Controls */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search colleges or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Filters Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    filtersOpen
                      ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                      : 'border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-neon-pink text-space-dark px-2 py-1 text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </motion.button>

                {/* View Toggle */}
                <div className="flex bg-black/20 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-neon-cyan text-space-dark'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'map'
                        ? 'bg-neon-cyan text-space-dark'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-gray-700 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* State Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                      >
                        <option value="">All States</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                      >
                        <option value="">All Types</option>
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                      >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Min Rating: {minRating.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Sort by</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                        >
                          <option value="rating">Rating</option>
                          <option value="name">Name</option>
                          <option value="fees">Fees</option>
                        </select>
                      </div>
                      
                      <div className="pt-6">
                        <span className="text-sm text-gray-400">
                          {filteredColleges.length} colleges found
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-1 text-neon-pink hover:text-neon-cyan transition-colors text-sm font-semibold"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="w-8 h-8 text-neon-cyan animate-spin" />
              <p className="text-gray-400">Loading colleges...</p>
            </div>
          </div>
        ) : filteredColleges.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredColleges.map((college, index) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => { setSelectedCollegeId(college.id); setViewMode('map') }}
              >
                <CollegeCard
                  college={college}
                  onSave={handleSaveCollege}
                  isSaved={savedColleges.includes(college.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Map View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-4 rounded-2xl"
          >
            <div className="h-[600px] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Map */}
              <div className="col-span-2 min-h-[400px]">
                {typeof window !== 'undefined' && (
                  <GoogleCollegesMap colleges={filteredColleges as any} selectedCollegeId={selectedCollegeId} apiKeyOverride={GOOGLE_MAPS_API_KEY} />
                )}
              </div>
              {/* AI Overview */}
              <div className="col-span-1">
                <div className="h-full glass-card p-4 rounded-lg overflow-auto">
                  <h3 className="text-white font-semibold mb-2">AI Overview</h3>
                  {!selectedCollegeId && (
                    <p className="text-gray-400 text-sm">Select a college card to see an AI overview here.</p>
                  )}
                  {selectedCollegeId && aiLoading && (
                    <div className="text-gray-400 text-sm">Generating overview...</div>
                  )}
                  {selectedCollegeId && !aiLoading && aiOverview && (
                    <div className="prose prose-invert text-sm whitespace-pre-wrap">{aiOverview}</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {filteredColleges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Colleges Found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-neon-cyan to-neon-pink px-6 py-3 rounded-lg text-space-dark font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}