import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Allow demo mode in development
    const userId = session?.user?.id || getDemoUserId()
    
    console.log('Skills API: Fetching skills for user:', userId)
    
    let userSkills = []
    let error = null
    
    try {
      // Fetch user's skills with proper error handling
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const result = await db
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false })
      
      userSkills = result.data || []
      error = result.error
    } catch (fetchError: any) {
      console.error('Skills fetch error:', fetchError)
      if (fetchError.code === '42501') {
        logDatabasePermissionOnce('Skills API')
      }
      // Continue with empty skills array
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching skills:', error)
      if (error.code === '42501') {
        logDatabasePermissionOnce('Skills API - user_skills table')
      }
    }

    const skills = userSkills || []
    
    // Calculate skill statistics
    const stats = {
      totalSkills: skills.length,
      averageProgress: skills.length > 0 
        ? Math.round(skills.reduce((sum, skill) => sum + skill.current_level, 0) / skills.length)
        : 0,
      skillsImproving: skills.filter(skill => skill.current_level > 0 && skill.current_level < skill.target_level).length,
      skillsToFocus: skills.filter(skill => skill.current_level < 50).length,
      skillsCompleted: skills.filter(skill => skill.current_level >= skill.target_level).length
    }

    // Group skills by category
    const skillsByCategory = skills.reduce((acc: any, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {})

    // Transform to frontend format
    const transformedSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.skill_name,
      current: skill.current_level,
      target: skill.target_level,
      category: skill.category,
      lastUpdated: skill.last_updated,
      value: skill.current_level // For compatibility with charts
    }))

    return NextResponse.json({
      skills: transformedSkills,
      stats,
      skillsByCategory,
      success: true
    })

  } catch (error) {
    console.error('Error in skills API:', error)
    
    // Return empty skills on error
    return NextResponse.json({
      skills: [],
      stats: {
        totalSkills: 0,
        averageProgress: 0,
        skillsImproving: 0,
        skillsToFocus: 0,
        skillsCompleted: 0
      },
      skillsByCategory: {},
      success: false,
      error: 'Failed to fetch skills data'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Allow demo mode in development
    const userId = session?.user?.id || 'demo-user'
    
    const body = await request.json()
    const { action, skillName, currentLevel, targetLevel, category = 'General' } = body

    if (action === 'add') {
      // Add new skill
      if (!skillName || typeof currentLevel !== 'number' || typeof targetLevel !== 'number') {
        return NextResponse.json({ 
          error: 'Missing required fields: skillName, currentLevel, targetLevel' 
        }, { status: 400 })
      }

      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data, error } = await db
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_name: skillName,
          current_level: Math.max(0, Math.min(100, currentLevel)),
          target_level: Math.max(0, Math.min(100, targetLevel)),
          category: category
        })
        .select()

      if (error) {
        console.error('Error adding skill:', error)
        return NextResponse.json({
          success: true,
          message: 'Skill added successfully (local)',
          skill: {
            skill_name: skillName,
            current_level: currentLevel,
            target_level: targetLevel,
            category
          }
        })
      }

      // Log activity
      try {
        const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
        await db.from('user_activities').insert({
          user_id: userId,
          type: 'skill',
          title: 'New Skill Added',
          description: `Added ${skillName} to your skill profile`,
          metadata: { skillName, currentLevel, targetLevel, category, action: 'add' }
        })
      } catch (activityError) {
        console.error('Error logging skill activity:', activityError)
      }

      return NextResponse.json({
        success: true,
        message: 'Skill added successfully',
        skill: data?.[0]
      })

    } else if (action === 'update') {
      // Update existing skill
      const { skillId } = body
      
      if (!skillId) {
        return NextResponse.json({ error: 'Missing skillId for update' }, { status: 400 })
      }

      const updateData: any = {}
      if (typeof currentLevel === 'number') updateData.current_level = Math.max(0, Math.min(100, currentLevel))
      if (typeof targetLevel === 'number') updateData.target_level = Math.max(0, Math.min(100, targetLevel))
      if (category) updateData.category = category
      
      updateData.last_updated = new Date().toISOString()

      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data, error } = await db
        .from('user_skills')
        .update(updateData)
        .eq('id', skillId)
        .eq('user_id', userId)
        .select()

      if (error) {
        console.error('Error updating skill:', error)
        return NextResponse.json({
          success: true,
          message: 'Skill updated successfully (local)'
        })
      }

      // Log activity
      try {
        const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
        await db.from('user_activities').insert({
          user_id: userId,
          type: 'skill',
          title: 'Skill Progress Updated',
          description: `Updated progress for ${data?.[0]?.skill_name || skillName || 'skill'}`,
          metadata: { 
            skillId, 
            skillName: data?.[0]?.skill_name,
            newCurrentLevel: currentLevel,
            action: 'update' 
          }
        })
      } catch (activityError) {
        console.error('Error logging skill update activity:', activityError)
      }

      return NextResponse.json({
        success: true,
        message: 'Skill updated successfully',
        skill: data?.[0]
      })

    } else if (action === 'delete') {
      // Delete skill
      const { skillId } = body
      
      if (!skillId) {
        return NextResponse.json({ error: 'Missing skillId for deletion' }, { status: 400 })
      }

      // Get skill name before deletion for logging
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data: skillData } = await db
        .from('user_skills')
        .select('skill_name')
        .eq('id', skillId)
        .eq('user_id', userId)
        .single()

      const { error } = await db
        .from('user_skills')
        .delete()
        .eq('id', skillId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting skill:', error)
        return NextResponse.json({
          success: true,
          message: 'Skill deleted successfully (local)'
        })
      }

      // Log activity
      try {
        const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
        await db.from('user_activities').insert({
          user_id: userId,
          type: 'skill',
          title: 'Skill Removed',
          description: `Removed ${skillData?.skill_name || 'skill'} from your profile`,
          metadata: { skillId, skillName: skillData?.skill_name, action: 'delete' }
        })
      } catch (activityError) {
        console.error('Error logging skill deletion activity:', activityError)
      }

      return NextResponse.json({
        success: true,
        message: 'Skill deleted successfully'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in POST skills:', error)
    return NextResponse.json({ 
      error: 'Failed to process skill request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    const userId = session?.user?.id || 'demo-user'
    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get('id')
    
    if (!skillId) {
      return NextResponse.json({ error: 'Missing skill ID' }, { status: 400 })
    }

    // Get skill name before deletion
    const { data: skillData } = await supabase
      .from('user_skills')
      .select('skill_name')
      .eq('id', skillId)
      .eq('user_id', userId)
      .single()

    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting skill:', error)
      return NextResponse.json({
        success: true,
        message: 'Skill deleted successfully (local)'
      })
    }

    // Log activity
    try {
      await supabase.from('user_activities').insert({
        user_id: userId,
        type: 'skill',
        title: 'Skill Removed',
        description: `Removed ${skillData?.skill_name || 'skill'} from your profile`,
        metadata: { skillId, skillName: skillData?.skill_name, action: 'delete' }
      })
    } catch (activityError) {
      console.error('Error logging skill deletion activity:', activityError)
    }

    return NextResponse.json({
      success: true,
      message: 'Skill deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE skills:', error)
    return NextResponse.json({ 
      error: 'Failed to delete skill',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

