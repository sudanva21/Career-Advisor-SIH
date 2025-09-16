'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['users']['Row']

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

export const MockAuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data for demo purposes
const createMockUser = (email: string, firstName: string, lastName: string): User => ({
  id: 'mock-user-' + Math.random().toString(36).substring(7),
  app_metadata: {},
  user_metadata: { first_name: firstName, last_name: lastName },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email,
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  recovery_sent_at: undefined,
  invited_at: undefined,
  action_link: undefined,
  email_change_sent_at: undefined,
  new_email: undefined,
  updated_at: new Date().toISOString(),
  is_anonymous: false,
  role: 'authenticated'
})

const createMockProfile = (user: User): Profile => ({
  id: user.id,
  email: user.email!,
  first_name: user.user_metadata?.first_name || null,
  last_name: user.user_metadata?.last_name || null,
  avatar_url: user.user_metadata?.avatar_url || null,
  created_at: user.created_at,
  updated_at: user.created_at
})

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  // Start with loading false to avoid hydration mismatch - auth state will be determined on client side
  const [loading, setLoading] = useState(false)

  // Log that we're using mock auth
  console.log('🎭 MockAuthProvider initialized - navbar loading should resolve quickly')

  useEffect(() => {
    // Initialize auth state on client-side only
    if (typeof window !== 'undefined') {
      try {
        // Check if demo user is logged in (stored in localStorage)
        const storedUser = localStorage.getItem('mock_user')
        
        if (storedUser) {
          try {
            const mockUser = JSON.parse(storedUser)
            setUser(mockUser)
            setProfile(createMockProfile(mockUser))
            setSession({
              user: mockUser,
              access_token: 'mock-access-token',
              token_type: 'Bearer',
              expires_in: 3600,
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000
            })
          } catch (error) {
            console.error('Error parsing stored user:', error)
            localStorage.removeItem('mock_user')
          }
        }
      } catch (error) {
        console.error('Error initializing mock auth:', error)
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    // Valid demo accounts
    const validAccounts = [
      { email: 'demo@example.com', password: 'demo123', firstName: 'Demo', lastName: 'User' },
      { email: 'testuser@example.com', password: 'testpassword123', firstName: 'Test', lastName: 'User' },
      { email: 'admin@example.com', password: 'admin123', firstName: 'Admin', lastName: 'User' },
      { email: 'user@example.com', password: 'user123', firstName: 'Regular', lastName: 'User' },
    ]

    // Check if credentials match any valid account
    const account = validAccounts.find(acc => acc.email === email && acc.password === password)
    
    if (account) {
      const mockUser = createMockUser(account.email, account.firstName, account.lastName)
      setUser(mockUser)
      setProfile(createMockProfile(mockUser))
      
      // Store user in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
      }
      
      setSession({
        user: mockUser,
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000
      })
      
      return { error: null }
    }
    
    // List all valid demo accounts in error message
    const accountsList = validAccounts.map(acc => `${acc.email} / ${acc.password}`).join(' | ')
    return { error: { message: `Invalid credentials. Try any of these demo accounts: ${accountsList}` } }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    // Allow any signup in demo mode
    const mockUser = createMockUser(email, firstName, lastName)
    setUser(mockUser)
    setProfile(createMockProfile(mockUser))
    
    // Store user in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
    }
    
    setSession({
      user: mockUser,
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000
    })
    
    return { error: null }
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    
    // Clear stored user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user')
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }
    
    const updatedProfile = { ...profile, ...updates } as Profile
    setProfile(updatedProfile)
    
    return { error: null }
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
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}