/**
 * PDF Parser - Extracts text from PDF files for resume analysis
 * Uses pdf-parse library for text extraction
 */

// Dynamic import to prevent build-time issues with pdf-parse
let pdfParse: any = null

export interface PDFParseResult {
  text: string
  pages: number
  info: any
  metadata: any
}

export class PDFParser {
  /**
   * Lazy load pdf-parse to prevent build-time issues
   */
  private static async getPdfParser() {
    if (!pdfParse) {
      pdfParse = (await import('pdf-parse')).default
    }
    return pdfParse
  }

  /**
   * Extract text from PDF buffer
   */
  static async extractText(pdfBuffer: Buffer): Promise<PDFParseResult> {
    try {
      const pdf = await this.getPdfParser()
      const data = await pdf(pdfBuffer)
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
        metadata: data.metadata
      }
    } catch (error) {
      console.error('❌ PDF parsing error:', error)
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract text from PDF file
   */
  static async extractTextFromFile(file: File): Promise<PDFParseResult> {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported')
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    return this.extractText(buffer)
  }

  /**
   * Clean and normalize extracted text
   */
  static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with AI processing
      .replace(/[^\w\s\-@.,!?()]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim()
  }

  /**
   * Extract structured information from resume text
   */
  static extractResumeStructure(text: string): {
    personalInfo: string
    experience: string
    education: string
    skills: string
    projects: string
    other: string
  } {
    const cleanedText = this.cleanText(text)
    const sections = {
      personalInfo: '',
      experience: '',
      education: '',
      skills: '',
      projects: '',
      other: ''
    }

    const lines = cleanedText.split('\n')
    let currentSection = 'personalInfo'
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const lowerLine = line.toLowerCase()

      // Identify section headers
      if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work history')) {
        currentSection = 'experience'
        continue
      } else if (lowerLine.includes('education') || lowerLine.includes('academic') || lowerLine.includes('qualifications')) {
        currentSection = 'education'
        continue
      } else if (lowerLine.includes('skills') || lowerLine.includes('technical') || lowerLine.includes('competencies')) {
        currentSection = 'skills'
        continue
      } else if (lowerLine.includes('projects') || lowerLine.includes('portfolio') || lowerLine.includes('achievements')) {
        currentSection = 'projects'
        continue
      }

      // Add line to current section
      if (currentSection === 'personalInfo' && i < 10) {
        // First 10 lines are likely personal information
        sections.personalInfo += line + '\n'
      } else {
        sections[currentSection as keyof typeof sections] += line + '\n'
      }
    }

    return sections
  }

  /**
   * Validate PDF file before processing
   */
  static validatePDFFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' }
    }

    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are supported' }
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 10MB.' }
    }

    // Check for minimum file size (at least 1KB)
    const minSize = 1024 // 1KB
    if (file.size < minSize) {
      return { valid: false, error: 'File size too small. Please upload a valid resume.' }
    }

    return { valid: true }
  }

  /**
   * Extract contact information from resume text
   */
  static extractContactInfo(text: string): {
    email?: string
    phone?: string
    linkedin?: string
    github?: string
    website?: string
  } {
    const contactInfo: any = {}

    // Extract email
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    const emailMatch = text.match(emailRegex)
    if (emailMatch) {
      contactInfo.email = emailMatch[0]
    }

    // Extract phone number
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    const phoneMatch = text.match(phoneRegex)
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0]
    }

    // Extract LinkedIn
    const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/g
    const linkedinMatch = text.match(linkedinRegex)
    if (linkedinMatch) {
      contactInfo.linkedin = `https://${linkedinMatch[0]}`
    }

    // Extract GitHub
    const githubRegex = /(github\.com\/[a-zA-Z0-9-]+)/g
    const githubMatch = text.match(githubRegex)
    if (githubMatch) {
      contactInfo.github = `https://${githubMatch[0]}`
    }

    // Extract website
    const websiteRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g
    const websiteMatch = text.match(websiteRegex)
    if (websiteMatch) {
      // Filter out LinkedIn and GitHub URLs
      const website = websiteMatch.find(url => 
        !url.includes('linkedin.com') && 
        !url.includes('github.com')
      )
      if (website) {
        contactInfo.website = website
      }
    }

    return contactInfo
  }

  /**
   * Extract years of experience from resume text
   */
  static extractExperienceYears(text: string): number {
    const experiencePatterns = [
      /(\d+)\+?\s*years?\s*(of\s*)?experience/gi,
      /experience[:\s]*(\d+)\+?\s*years?/gi,
      /(\d+)\+?\s*years?\s*in/gi
    ]

    for (const pattern of experiencePatterns) {
      const match = text.match(pattern)
      if (match) {
        const years = parseInt(match[0].replace(/\D/g, ''))
        if (years > 0 && years < 50) { // Reasonable range
          return years
        }
      }
    }

    // Try to estimate from job dates
    const datePattern = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi
    const dates = text.match(datePattern)
    
    if (dates && dates.length > 0) {
      let totalYears = 0
      
      dates.forEach(dateRange => {
        const parts = dateRange.split(/[-–]/)
        const startYear = parseInt(parts[0].trim())
        const endPart = parts[1].trim().toLowerCase()
        const endYear = endPart.includes('present') || endPart.includes('current') 
          ? new Date().getFullYear() 
          : parseInt(endPart)
        
        if (startYear && endYear && endYear >= startYear) {
          totalYears += (endYear - startYear)
        }
      })
      
      return totalYears
    }

    return 0 // Unable to determine
  }
}

export default PDFParser