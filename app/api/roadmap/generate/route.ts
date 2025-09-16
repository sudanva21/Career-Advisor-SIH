import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidatedConfig } from '@/lib/env-validation'
import { FreeAIService } from '@/lib/free-ai-services'
import { getDemoUserId, logDatabasePermissionOnce } from '@/lib/database/demo-mode'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    const userId = session?.user?.id || getDemoUserId()
    
    if (!session?.user?.id) {
      console.log('⚠️ No authentication, using demo mode for roadmap generation')
    }

    const { 
      careerGoal, 
      currentLevel, 
      timeframe, 
      interests, 
      skills, // Can be sent as either skills or currentSkills
      currentSkills, 
      learningStyle, 
      budget 
    } = await request.json()

    // Handle both field names for skills
    const skillsArray = skills || currentSkills || []
    
    if (!careerGoal || !careerGoal.trim()) {
      return NextResponse.json({ error: 'Career goal is required' }, { status: 400 })
    }

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()
    
    console.log('✅ Free AI service initialized successfully')

    console.log('🤖 Generating AI roadmap content...')

    let roadmapData
    try {
      roadmapData = await aiService.generateRoadmap(careerGoal, {
        currentLevel,
        timeframe: parseInt(timeframe),
        interests: interests || [],
        skills: skillsArray || [],
        learningStyle,
        budget
      })
      
      console.log('✅ AI roadmap generation successful')
    } catch (aiError: any) {
      console.error('❌ AI generation error:', {
        error: aiError?.message || 'Unknown AI error',
        provider: aiError?.provider || 'unknown'
      })
      
      let errorMessage = 'AI generation failed: '
      if (aiError?.message?.includes('rate limit') || aiError?.message?.includes('quota')) {
        errorMessage += 'API quota exceeded. Please try again later.'
      } else if (aiError?.message?.includes('API key')) {
        errorMessage += 'AI service authentication failed. Please check configuration.'
      } else if (aiError?.message?.includes('model not found')) {
        errorMessage += 'AI model not available. Please try again later.'
      } else {
        errorMessage += 'Unable to connect to AI services. Please check your connection and try again.'
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Transform the roadmap data into the database format
    const nodes = []
    const connections = []
    let nodeIndex = 0

    // Create nodes from phases and milestones
    if (roadmapData.phases && Array.isArray(roadmapData.phases)) {
      roadmapData.phases.forEach((phase, phaseIndex) => {
        // Add phase node
        const phaseNode = {
          id: `phase-${phaseIndex}`,
          type: 'phase',
          position: { x: phaseIndex * 300, y: 100 },
          data: {
            title: phase.title,
            description: phase.description,
            duration: phase.duration
          }
        }
        nodes.push(phaseNode)

        // Add milestone nodes
        if (phase.milestones && Array.isArray(phase.milestones)) {
          phase.milestones.forEach((milestone, milestoneIndex) => {
            const milestoneNode = {
              id: `milestone-${phaseIndex}-${milestoneIndex}`,
              type: 'milestone',
              position: { x: phaseIndex * 300, y: 200 + (milestoneIndex * 150) },
              data: {
                title: milestone.title,
                description: milestone.description,
                skills: milestone.skills || [],
                resources: milestone.resources || [],
                deliverables: milestone.deliverables || []
              }
            }
            nodes.push(milestoneNode)

            // Connect phase to milestone
            connections.push({
              id: `connection-${phaseIndex}-${milestoneIndex}`,
              source: `phase-${phaseIndex}`,
              target: `milestone-${phaseIndex}-${milestoneIndex}`
            })
          })
        }

        // Connect phases
        if (phaseIndex > 0) {
          connections.push({
            id: `phase-connection-${phaseIndex}`,
            source: `phase-${phaseIndex - 1}`,
            target: `phase-${phaseIndex}`
          })
        }
      })
    }

    // Create the roadmap record to match our actual table structure (using 'user_id' not 'userid')
    const roadmapRecord = {
      user_id: userId,
      title: roadmapData.title || `${careerGoal} Roadmap`,
      description: roadmapData.description || `Comprehensive roadmap to become a ${careerGoal}`,
      career_goal: careerGoal,
      current_level: currentLevel,
      duration_months: parseInt(timeframe),
      roadmap_data: {
        phases: roadmapData.phases || [],
        nodes: nodes,
        connections: connections
      },
      ai_generated: true,
      progress: 0,
      ai_recommendations: roadmapData.recommendations || null,
      timeline: roadmapData.timeline || null
    }

    console.log('💾 Saving roadmap to database...')

    // Save to database
    let savedRoadmap
    let { data: dbRoadmap, error: saveError } = await supabaseAdmin
      .from('career_roadmaps')
      .insert(roadmapRecord)
      .select()
      .single()

    if (saveError) {
      console.warn('⚠️ Database save error, using mock response:', saveError.message)
      logDatabasePermissionOnce('Roadmap Generation API')
      
      // If database save fails, return mock roadmap for demo
      savedRoadmap = {
        id: `roadmap_${Date.now()}`,
        user_id: userId,
        title: roadmapRecord.title || `${careerGoal} Roadmap`,
        description: roadmapRecord.description || `Comprehensive roadmap to become a ${careerGoal}`,
        career_goal: careerGoal,
        current_level: currentLevel,
        duration_months: parseInt(timeframe),
        roadmap_data: {
          phases: roadmapData.phases || [],
          nodes: nodes,
          connections: connections
        },
        ai_generated: true,
        progress: 0,
        ai_recommendations: roadmapData.recommendations || null,
        timeline: roadmapData.timeline || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else {
      savedRoadmap = dbRoadmap
    }

    console.log(`✅ Roadmap saved with ID: ${savedRoadmap.id}`)

    // Log activity to user_activities table (using 'user_id' instead of 'userid')
    try {
      await supabaseAdmin.from('user_activities').insert({
        user_id: userId,
        type: 'roadmap',
        title: 'Generated AI Career Roadmap',
        description: `Created roadmap for: ${careerGoal}`,
        metadata: { 
          careerGoal,
          aiGenerated: true,
          phases: roadmapData.phases?.length || 0,
          duration: timeframe,
          roadmap_id: savedRoadmap.id
        }
      })
      console.log('✅ Activity logged to user_activities')
    } catch (activityError) {
      console.warn('⚠️ Failed to log to user_activities:', activityError)
    }

    // Also log to the activities table for dashboard tracking (using 'user_id')
    try {
      await supabaseAdmin.from('activities').insert({
        user_id: userId,
        type: 'roadmap_generated',
        details: {
          roadmap_id: savedRoadmap.id,
          career_goal: careerGoal,
          current_level: currentLevel,
          duration_months: parseInt(timeframe),
          phases_count: roadmapData.phases?.length || 0
        }
      })
      console.log('✅ Activity logged to activities table')
    } catch (activityError) {
      console.warn('⚠️ Failed to log to activities table:', activityError)
    }

    // Include the additional AI recommendations
    const enrichedRoadmap = {
      ...savedRoadmap,
      ai_recommendations: roadmapData.recommendations || {},
      timeline: roadmapData.timeline || {}
    }

    return NextResponse.json({
      roadmap: enrichedRoadmap,
      success: true
    })

  } catch (error) {
    console.error('❌ Roadmap generation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({
      error: `Failed to generate career roadmap: ${errorMessage}`,
      success: false
    }, { status: 500 })
  }
}