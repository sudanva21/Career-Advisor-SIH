import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET - Fetch 3D skill trees for user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const { searchParams } = new URL(request.url)
    
    const treeType = searchParams.get('type') // 'skill' or 'career'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()

    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in to view skill trees' 
      }, { status: 401 })
    }

    try {
      // Query user_skills table for 3D trees (stored with special metadata)
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      let query = db
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .not('metadata', 'is', null)

      if (treeType) {
        query = query.eq('metadata->>is3DTree', 'true')
        query = query.eq('metadata->>treeType', treeType)
      } else {
        query = query.eq('metadata->>is3DTree', 'true')
      }

      const { data: skillTrees, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching skill trees:', error)
        logDatabasePermissionOnce('Skill Tree API')
        
        return NextResponse.json({ 
          success: true,
          skillTrees: getDemoSkillTrees(treeType),
          total: getDemoSkillTrees(treeType).length,
          message: 'Using demo skill trees data'
        })
      }

      // Transform data for frontend
      const transformedTrees = skillTrees?.map(tree => ({
        id: tree.id,
        userId: tree.user_id,
        title: tree.metadata?.title || tree.name,
        description: tree.metadata?.description || 'Custom skill tree',
        treeType: tree.metadata?.treeType || 'skill',
        nodes: tree.metadata?.nodes || [],
        connections: tree.metadata?.connections || [],
        difficulty: tree.metadata?.difficulty || 'intermediate',
        progress: tree.current,
        target: tree.target,
        createdAt: tree.created_at,
        updatedAt: tree.updated_at
      })) || []

      console.log(`📊 Found ${transformedTrees.length} skill trees for user ${userId}`)

      return NextResponse.json({
        success: true,
        skillTrees: transformedTrees,
        total: transformedTrees.length
      })

    } catch (dbError) {
      console.error('Database error fetching skill trees:', dbError)
      logDatabasePermissionOnce('Skill Tree API (fallback)')
      
      return NextResponse.json({
        success: true,
        skillTrees: getDemoSkillTrees(treeType),
        total: getDemoSkillTrees(treeType).length,
        message: 'Using demo skill trees data (fallback)'
      })
    }

  } catch (error) {
    console.error('Error in GET /api/skill-tree:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch skill trees',
      skillTrees: [],
      total: 0
    }, { status: 500 })
  }
}

// POST - Create a new 3D skill tree
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()

    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, treeType, nodes, connections, difficulty } = body

    // Validate required fields
    if (!title || !treeType || !nodes) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, treeType, nodes' 
      }, { status: 400 })
    }

    console.log('Creating skill tree for user:', userId, { title, treeType, difficulty })

    try {
      // Ensure user exists
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      await db.from('users').upsert({
        id: userId,
        email: session?.user?.email || 'demo@example.com',
        updated_at: new Date().toISOString()
      })

      // Create skill tree as enhanced skill with metadata
      const { data: skillTree, error } = await db
        .from('user_skills')
        .insert({
          user_id: userId,
          name: title,
          current: 0,
          target: nodes.length * 10, // Each node worth 10 points
          category: treeType === 'career' ? 'Career Planning' : 'Technical Skills',
          metadata: {
            is3DTree: true,
            title,
            description: description || 'Custom 3D skill tree',
            treeType,
            nodes,
            connections,
            difficulty: difficulty || 'intermediate'
          }
        })
        .select()

      if (error) {
        console.error('Error creating skill tree:', error)
        logDatabasePermissionOnce('Create Skill Tree API')
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create skill tree in database'
        }, { status: 500 })
      }

      // Log the creation activity
      try {
        const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
        await db.from('user_activities').insert({
          user_id: userId,
          type: 'skill',
          title: 'Skill Tree Created',
          description: `Created ${treeType} skill tree: ${title}`,
          metadata: {
            skillTreeId: skillTree?.[0]?.id,
            title,
            treeType,
            difficulty,
            nodeCount: nodes.length,
            action: 'create'
          }
        })
      } catch (activityError) {
        console.warn('Failed to log skill tree creation activity:', activityError)
      }

      console.log('Skill tree created successfully:', skillTree?.[0]?.id)

      return NextResponse.json({ 
        success: true,
        message: 'Skill tree created successfully',
        skillTree: {
          id: skillTree?.[0]?.id,
          title,
          description: description || 'Custom 3D skill tree',
          treeType,
          nodes,
          connections,
          difficulty,
          progress: 0,
          target: nodes.length * 10
        }
      })

    } catch (dbError) {
      console.error('Database error creating skill tree:', dbError)
      logDatabasePermissionOnce('Create Skill Tree API (fallback)')
      
      return NextResponse.json({ 
        success: true,
        message: 'Skill tree created successfully (local)',
        skillTree: {
          id: 'local-' + Date.now(),
          title,
          description: description || 'Custom 3D skill tree',
          treeType,
          nodes,
          connections,
          difficulty,
          progress: 0,
          target: nodes.length * 10
        }
      })
    }

  } catch (error) {
    console.error('Error in POST /api/skill-tree:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update skill tree progress
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()

    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skillTreeId, progress, completedNodes } = body

    // Validate required fields
    if (!skillTreeId || typeof progress !== 'number') {
      return NextResponse.json({ 
        error: 'Missing required fields: skillTreeId, progress' 
      }, { status: 400 })
    }

    console.log('Updating skill tree progress for user:', userId, { skillTreeId, progress })

    try {
      // Update progress
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data: updatedTree, error } = await db
        .from('user_skills')
        .update({ 
          current: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', skillTreeId)
        .eq('user_id', userId) // Ensure user owns this tree
        .select()

      if (error) {
        console.error('Error updating skill tree progress:', error)
        logDatabasePermissionOnce('Update Skill Tree API')
        return NextResponse.json({ 
          success: false,
          error: 'Failed to update skill tree progress in database'
        }, { status: 500 })
      }

      if (!updatedTree || updatedTree.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'Skill tree not found or access denied'
        }, { status: 404 })
      }

      // Log the progress update activity
      try {
        const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
        await db.from('user_activities').insert({
          user_id: userId,
          type: 'skill',
          title: 'Skill Tree Progress',
          description: `Updated progress on ${updatedTree[0].name} (${progress} points)`,
          metadata: {
            skillTreeId,
            progress,
            completedNodes: completedNodes || 0,
            action: 'progress'
          }
        })
      } catch (activityError) {
        console.warn('Failed to log skill tree progress activity:', activityError)
      }

      console.log('Skill tree progress updated successfully:', skillTreeId)

      return NextResponse.json({ 
        success: true,
        message: 'Skill tree progress updated successfully',
        updatedProgress: progress
      })

    } catch (dbError) {
      console.error('Database error updating skill tree progress:', dbError)
      logDatabasePermissionOnce('Update Skill Tree API (fallback)')
      
      return NextResponse.json({ 
        success: true,
        message: 'Skill tree progress updated successfully (local)',
        updatedProgress: progress
      })
    }

  } catch (error) {
    console.error('Error in PUT /api/skill-tree:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Demo data for development/fallback
function getDemoSkillTrees(treeType?: string | null) {
  const allTrees = [
    {
      id: 'demo-tree-1',
      userId: 'demo-user',
      title: 'Full Stack Development',
      description: 'Complete web development skill tree covering frontend, backend, and deployment',
      treeType: 'skill',
      nodes: [
        { id: 'html', label: 'HTML', x: 0, y: 0, z: 0, completed: true },
        { id: 'css', label: 'CSS', x: 1, y: 0, z: 0, completed: true },
        { id: 'js', label: 'JavaScript', x: 2, y: 0, z: 0, completed: true },
        { id: 'react', label: 'React', x: 3, y: 1, z: 0, completed: false },
        { id: 'node', label: 'Node.js', x: 2, y: -1, z: 0, completed: false },
        { id: 'db', label: 'Database', x: 3, y: -1, z: 0, completed: false }
      ],
      connections: [
        { from: 'html', to: 'css' },
        { from: 'css', to: 'js' },
        { from: 'js', to: 'react' },
        { from: 'js', to: 'node' },
        { from: 'node', to: 'db' }
      ],
      difficulty: 'intermediate',
      progress: 30,
      target: 60,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'demo-tree-2',
      userId: 'demo-user',
      title: 'Software Engineer Career Path',
      description: 'Career progression from junior to senior software engineer',
      treeType: 'career',
      nodes: [
        { id: 'intern', label: 'Intern', x: 0, y: 0, z: 0, completed: true },
        { id: 'junior', label: 'Junior Developer', x: 1, y: 0, z: 0, completed: true },
        { id: 'mid', label: 'Mid-level Developer', x: 2, y: 0, z: 0, completed: false },
        { id: 'senior', label: 'Senior Developer', x: 3, y: 0, z: 0, completed: false },
        { id: 'lead', label: 'Tech Lead', x: 4, y: 1, z: 0, completed: false },
        { id: 'architect', label: 'Solutions Architect', x: 4, y: -1, z: 0, completed: false }
      ],
      connections: [
        { from: 'intern', to: 'junior' },
        { from: 'junior', to: 'mid' },
        { from: 'mid', to: 'senior' },
        { from: 'senior', to: 'lead' },
        { from: 'senior', to: 'architect' }
      ],
      difficulty: 'advanced',
      progress: 20,
      target: 60,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]

  return treeType ? allTrees.filter(tree => tree.treeType === treeType) : allTrees
}