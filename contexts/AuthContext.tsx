'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    url && 
    key && 
    url !== 'https://your-project-id.supabase.co' && 
    key !== 'your-anon-key-here' &&
    url.startsWith('https://') &&
    key.startsWith('eyJ') // JWT should start with eyJ
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always use real Supabase authentication - no more mock mode
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not properly configured. Please check your environment variables.')
    // Still proceed with real Supabase client, but with warning
  }
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout reached, setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          clearTimeout(loadingTimeout)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
        
        clearTimeout(loadingTimeout)
        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          clearTimeout(loadingTimeout)
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        } catch (error) {
          console.error('Error in auth state change:', error)
          clearTimeout(loadingTimeout)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      // Add timeout to profile fetch to prevent hanging
      const fetchPromise = fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      )

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (response.ok) {
        const { profile } = await response.json()
        setProfile(profile)
      } else {
        console.error('Error fetching profile from API:', response.status)
        await createFallbackProfile()
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      await createFallbackProfile()
    }
  }

  const createFallbackProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setProfile({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 
                    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                    null,
          avatar_url: user.user_metadata?.avatar_url || null,
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: user.created_at,
          updated_at: user.created_at
        })
      }
    } catch (fallbackError) {
      console.error('Error creating fallback profile:', fallbackError)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
        },
        // For development: disable email confirmation
        emailRedirectTo: undefined
      }
    })

    if (!error && data.user) {
      // Try to create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: `${firstName} ${lastName}`,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setProfile(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }
    
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  // Always use real auth context - no more mock fallback
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}