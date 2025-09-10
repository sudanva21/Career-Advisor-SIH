import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Create admin client with service role key for user creation
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Create a test user with confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    })

    if (authError) {
      console.error('Error creating test user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
    }

    // Create corresponding database record in Supabase users table
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: authData.user.email!,
          first_name: 'Test',
          last_name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creating user record in Supabase:', userError)
        return NextResponse.json({ 
          success: true, 
          message: 'Test user created in auth but failed to create database record',
          user: authData.user,
          warning: 'Database record creation failed'
        })
      }

      console.log('Test user created successfully:', userData)

      return NextResponse.json({ 
        success: true, 
        message: 'Test user created successfully. You can now sign in with testuser@example.com / testpassword123',
        user: userData || {
          id: authData.user.id,
          email: authData.user.email,
          first_name: 'Test',
          last_name: 'User'
        }
      })
    } catch (dbError) {
      console.error('Database error when creating user record:', dbError)
      return NextResponse.json({ 
        success: true, 
        message: 'Test user created in auth but failed to create database record',
        user: authData.user
      })
    }

  } catch (error) {
    console.error('Error in create-test-user:', error)
    return NextResponse.json({ 
      error: 'Failed to create test user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}