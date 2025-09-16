import { createClient } from '@supabase/supabase-js'

// Development setup utilities
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Creates a confirmed test user for development
 * This bypasses the email confirmation requirement
 */
export async function createDevUser() {
  const testEmail = 'dev@test.com'
  const testPassword = 'dev123456'
  
  try {
    // First try to sign in to see if user already exists
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (existingUser.user) {
      console.log('Dev user already exists and can sign in')
      return { success: true, user: existingUser.user }
    }
    
    // If sign in failed due to email not confirmed, we'll continue
    if (signInError && !signInError.message.includes('Email not confirmed')) {
      // Try to create the user
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Dev',
            last_name: 'User',
          }
        }
      })
      
      if (error) {
        console.log('Error creating dev user:', error)
        return { success: false, error }
      }
      
      console.log('Dev user created. Email confirmation may be required.')
      return { success: true, user: data.user, needsConfirmation: true }
    }
    
    return { success: false, error: signInError }
  } catch (err) {
    console.error('Dev setup error:', err)
    return { success: false, error: err }
  }
}

/**
 * Provides instructions for setting up Supabase for development
 */
export function getSupabaseDevInstructions() {
  return {
    title: 'Supabase Development Setup',
    steps: [
      '1. Go to your Supabase project dashboard',
      '2. Navigate to Authentication > Settings',
      '3. Disable "Enable email confirmations" for development',
      '4. Or manually confirm users in Authentication > Users',
      '5. Restart your application after making changes'
    ],
    testCredentials: {
      email: 'dev@test.com',
      password: 'dev123456'
    }
  }
}