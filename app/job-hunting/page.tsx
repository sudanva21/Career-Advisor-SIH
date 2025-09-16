'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Brain, 
  Briefcase, 
  Send, 
  Star, 
  MapPin, 
  DollarSign,
  Clock,
  Eye,
  Copy,
  Download,
  Search,
  Filter,
  Target,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface ResumeAnalysis {
  personalInfo: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
  }
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
    achievements: string[]
    technologies: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa?: string
    details: string
  }>
  skills: {
    technical: string[]
    soft: string[]
    tools: string[]
    languages: string[]
  }
  projects: Array<{
    name: string
    description: string
    technologies: string[]
    year?: string
  }>
  summary: {
    totalExperience: string
    seniorityLevel: string
    primaryRole: string
    keyStrengths: string[]
    careerFocus: string
    salaryRange: string
  }
  recommendations: {
    improvementAreas: string[]
    missingSkills: string[]
    careerAdvice: string[]
    jobSearchTips: string[]
  }
}

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  description: string
  requirements: string[]
  posted_date: string
  match_score: number
  jobData?: any
}

interface OutreachDraft {
  id: string
  type: 'email' | 'cover_letter' | 'linkedin_message'
  subject?: string
  content: string
  job_title: string
  company: string
  personalized: boolean
  status?: string
  created_at?: string
}

export default function JobHuntingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'resume' | 'jobs' | 'outreach'>('resume')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [outreachDrafts, setOutreachDrafts] = useState<OutreachDraft[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [searchingJobs, setSearchingJobs] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadSavedData()
    }
  }, [user])

  const loadSavedData = async () => {
    try {
      const response = await fetch('/api/job-hunting/data')
      if (response.ok) {
        const data = await response.json()
        setResumeAnalysis(data.resumeAnalysis)
        setJobListings(data.jobListings || [])
        setOutreachDrafts(data.outreachDrafts || [])
      }
    } catch (error) {
      console.error('Failed to load job hunting data:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setResumeFile(file)
    } else {
      toast.error('Please upload a PDF file')
    }
  }

  const analyzeResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file first')
      return
    }

    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)

      const response = await fetch('/api/job-hunting/parse-resume', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to analyze resume')
      }

      const data = await response.json()
      setResumeAnalysis(data.analysis)
      toast.success('Resume analyzed successfully!')
      
      // Automatically switch to jobs tab
      setActiveTab('jobs')
      
      // Automatically search for jobs
      await searchJobs(data.analysis)
      
    } catch (error) {
      console.error('Resume analysis error:', error)
      toast.error('Failed to analyze resume. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const searchJobs = async (analysis?: ResumeAnalysis) => {
    const analysisToUse = analysis || resumeAnalysis
    if (!analysisToUse) {
      toast.error('Please analyze your resume first')
      return
    }

    setSearchingJobs(true)
    try {
      const response = await fetch('/api/job-hunting/search-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeAnalysis: analysisToUse,
          preferences: {
            location: 'Remote',
            jobType: 'Full-time'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to search for jobs')
      }

      const data = await response.json()
      setJobListings(data.jobs.map((job: any) => ({
        id: job.title + job.company,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        description: job.description,
        requirements: job.requirements,
        posted_date: job.posted,
        match_score: job.matchScore,
        jobData: job
      })))
      
      toast.success(`Found ${data.jobs.length} job matches!`)
      
    } catch (error) {
      console.error('Job search error:', error)
      toast.error('Failed to search for jobs. Please try again.')
    } finally {
      setSearchingJobs(false)
    }
  }

  const generateOutreach = async (job: JobListing, type: 'email' | 'cover_letter') => {
    if (!resumeAnalysis) {
      toast.error('Please analyze your resume first')
      return
    }

    try {
      const response = await fetch('/api/job-hunting/generate-outreach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobData: job.jobData || job,
          resumeAnalysis,
          type,
          customMessage: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate outreach')
      }

      const data = await response.json()
      
      // Add to outreach drafts
      const newDraft: OutreachDraft = {
        id: data.draftId || Date.now().toString(),
        type,
        subject: data.outreach.subject,
        content: data.outreach.content,
        job_title: job.title,
        company: job.company,
        personalized: true
      }
      
      setOutreachDrafts(prev => [newDraft, ...prev])
      setActiveTab('outreach')
      toast.success(`${type === 'email' ? 'Email' : 'Cover letter'} generated successfully!`)
      
    } catch (error) {
      console.error('Outreach generation error:', error)
      toast.error('Failed to generate outreach. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10'
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10'
    return 'text-orange-400 bg-orange-400/10'
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-space-dark text-white pt-16">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-space-dark" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Job Hunting Hub</h1>
                <p className="text-sm text-gray-400">AI-powered career assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'resume', label: 'Resume Analysis', icon: FileText },
            { id: 'jobs', label: 'Job Matches', icon: Search },
            { id: 'outreach', label: 'Outreach Drafts', icon: Send }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-neon-cyan text-space-dark font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'resume' && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Upload Section */}
              <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Upload className="w-6 h-6 mr-3 text-neon-cyan" />
                  Upload Your Resume
                </h2>
                
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-neon-cyan transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">
                      {resumeFile ? resumeFile.name : 'Choose your resume file'}
                    </p>
                    <p className="text-gray-400">PDF format only</p>
                  </label>
                </div>

                <button
                  onClick={analyzeResume}
                  disabled={!resumeFile || analyzing}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-space-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-space-dark border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Analyze Resume with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Analysis Results */}
              {resumeAnalysis && (
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-neon-cyan" />
                    Analysis Results
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Summary */}
                    <div className="bg-black/20 p-6 rounded-xl">
                      <h4 className="font-semibold text-neon-cyan mb-4">Professional Summary</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Role:</span> {resumeAnalysis.summary.primaryRole}</p>
                        <p><span className="text-gray-400">Experience:</span> {resumeAnalysis.summary.totalExperience}</p>
                        <p><span className="text-gray-400">Level:</span> {resumeAnalysis.summary.seniorityLevel}</p>
                        <p><span className="text-gray-400">Salary Range:</span> {resumeAnalysis.summary.salaryRange}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-black/20 p-6 rounded-xl">
                      <h4 className="font-semibold text-neon-cyan mb-4">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeAnalysis.skills.technical.slice(0, 8).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-6 bg-black/20 p-6 rounded-xl">
                    <h4 className="font-semibold text-neon-purple mb-4">AI Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-2">Areas to Improve:</p>
                        <ul className="space-y-1">
                          {resumeAnalysis.recommendations.improvementAreas.slice(0, 3).map((area, index) => (
                            <li key={index} className="text-gray-300">• {area}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-2">Missing Skills:</p>
                        <ul className="space-y-1">
                          {resumeAnalysis.recommendations.missingSkills.slice(0, 3).map((skill, index) => (
                            <li key={index} className="text-gray-300">• {skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search Header */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Search className="w-6 h-6 mr-3 text-neon-cyan" />
                    Job Matches ({jobListings.length})
                  </h2>
                  <button
                    onClick={() => searchJobs()}
                    disabled={!resumeAnalysis || searchingJobs}
                    className="px-6 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-space-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {searchingJobs ? (
                      <>
                        <div className="w-4 h-4 border-2 border-space-dark border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Refresh Jobs</span>
                      </>
                    )}
                  </button>
                </div>
                
                {!resumeAnalysis && (
                  <p className="text-gray-400">Please analyze your resume first to see job matches.</p>
                )}
              </div>

              {/* Job Listings */}
              <div className="grid grid-cols-1 gap-6">
                {jobListings.map((job) => (
                  <div key={job.id} className="glass-card p-6 rounded-xl hover:border-neon-cyan/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                        <p className="text-neon-cyan font-semibold">{job.company}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(job.match_score)}`}>
                        {job.match_score}% Match
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-gray-400 text-sm mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.type}
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => generateOutreach(job, 'email')}
                          className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Generate Email</span>
                        </button>
                        <button
                          onClick={() => generateOutreach(job, 'cover_letter')}
                          className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Cover Letter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {jobListings.length === 0 && resumeAnalysis && !searchingJobs && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No job matches found. Try searching again.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'outreach' && (
            <motion.div
              key="outreach"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Send className="w-6 h-6 mr-3 text-neon-cyan" />
                  Outreach Drafts ({outreachDrafts.length})
                </h2>
                <p className="text-gray-400">AI-generated personalized messages for your job applications.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {outreachDrafts.map((draft) => (
                  <div key={draft.id} className="glass-card p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {draft.type === 'email' ? 'Email Application' : 'Cover Letter'}
                        </h3>
                        <p className="text-neon-cyan">{draft.job_title} at {draft.company}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(draft.content)}
                          className="p-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {draft.subject && (
                      <div className="mb-4 p-3 bg-black/20 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Subject:</p>
                        <p className="text-white font-semibold">{draft.subject}</p>
                      </div>
                    )}

                    <div className="bg-black/20 p-4 rounded-lg">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {draft.content}
                      </pre>
                    </div>

                    {draft.personalized && (
                      <div className="mt-4 flex items-center text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Personalized with AI</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {outreachDrafts.length === 0 && (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-4">No outreach drafts yet.</p>
                  <p className="text-gray-400">Generate personalized emails and cover letters from the Jobs tab.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}