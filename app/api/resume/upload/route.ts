import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PDFParser } from '@/lib/pdf-parser'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate file
    const validation = PDFParser.validatePDFFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    try {
      // Extract text from PDF
      const pdfResult = await PDFParser.extractTextFromFile(file)
      const resumeText = pdfResult.text
      
      if (!resumeText || resumeText.trim().length < 100) {
        return NextResponse.json({ 
          error: 'Unable to extract sufficient text from PDF. Please ensure the PDF contains readable text.' 
        }, { status: 400 })
      }

      // Clean the extracted text
      const cleanedText = PDFParser.cleanText(resumeText)

      // Store the resume text in the database
      const { data: resumeRecord, error: saveError } = await supabaseAdmin
        .from('user_resumes')
        .upsert({
          user_id: session.user.id,
          file_name: file.name,
          file_size: file.size,
          content_text: cleanedText,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) {
        console.error('Failed to save resume:', saveError)
        return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
      }

      // Log activity
      await supabaseAdmin.from('user_activities').insert({
        user_id: session.user.id,
        type: 'resume',
        title: 'Resume Uploaded',
        description: `Uploaded resume: ${file.name}`,
        metadata: { 
          fileName: file.name,
          fileSize: file.size,
          textLength: cleanedText.length
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Resume uploaded and text extracted successfully',
        resume: {
          id: resumeRecord.id,
          fileName: file.name,
          fileSize: file.size,
          textLength: cleanedText.length,
          extractedText: cleanedText.substring(0, 500) + '...' // Preview
        }
      })

    } catch (parseError) {
      console.error('PDF parsing error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse PDF file. Please ensure it\'s a valid PDF with readable text.' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Resume upload error:', error)
    
    return NextResponse.json({
      error: 'Failed to upload resume',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}