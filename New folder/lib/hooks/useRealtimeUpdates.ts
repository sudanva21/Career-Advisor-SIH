'use client'

import React, { useEffect, useRef } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useRealtimeUpdates(
  table: string,
  onUpdate: (payload: any) => void,
  filters?: { column: string; value: string }[]
) {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!user && process.env.NODE_ENV !== 'development') {
      return
    }

    const userId = user?.id || 'demo-user'
    
    console.log(`🔄 Setting up real-time subscription for ${table} (user: ${userId})`)
    
    // Set up real-time subscription
    let channel = supabase
      .channel(`${table}-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}` // Filter by user_id
        },
        (payload) => {
          console.log(`📡 Real-time update received for ${table}:`, payload)
          onUpdate(payload)
        }
      )

    // Apply additional filters if provided
    if (filters) {
      filters.forEach(filter => {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `${filter.column}=eq.${filter.value}`
          },
          (payload) => {
            console.log(`📡 Filtered real-time update received for ${table}:`, payload)
            onUpdate(payload)
          }
        )
      })
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`📡 Subscription status for ${table}:`, status)
    })

    subscriptionRef.current = channel

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        console.log(`🔄 Cleaning up real-time subscription for ${table}`)
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [user?.id, table, onUpdate])

  return {
    isConnected: subscriptionRef.current?.state === 'SUBSCRIBED'
  }
}

// Hook for saved colleges real-time updates
export function useSavedCollegesUpdates(onUpdate: (colleges: any[]) => void) {
  const handleUpdate = async (payload: any) => {
    // Fetch fresh data when any saved college is updated
    try {
      const response = await fetch('/api/saved-colleges')
      const data = await response.json()
      if (data.success) {
        onUpdate(data.savedColleges || [])
      }
    } catch (error) {
      console.error('Error refreshing saved colleges:', error)
    }
  }

  return useRealtimeUpdates('saved_colleges', handleUpdate)
}

// Hook for dashboard updates with data fetching
export function useDashboardUpdates() {
  const { user } = useAuth()
  const [stats, setStats] = React.useState({
    completedQuizzes: 0,
    savedColleges: 0,
    skillsAcquired: 0,
    achievementsUnlocked: 0,
    roadmapProgress: 0,
    weeklyProgress: 0
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchDashboardStats = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch stats from user-stats API
      const response = await fetch('/api/user-stats')
      const data = await response.json()

      if (data.success) {
        setStats({
          completedQuizzes: data.stats.completedQuizzes || 0,
          savedColleges: data.stats.savedColleges || 0,
          skillsAcquired: data.stats.skillsAcquired || 0,
          achievementsUnlocked: data.stats.achievementsUnlocked || 0,
          roadmapProgress: data.stats.roadmapProgress || 0,
          weeklyProgress: data.stats.weeklyProgress || 0
        })
      } else {
        console.error('Failed to fetch dashboard stats:', data.error)
        setError('Failed to load dashboard statistics')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  React.useEffect(() => {
    if (user || process.env.NODE_ENV === 'development') {
      fetchDashboardStats()
    }
  }, [user, fetchDashboardStats])

  const handleUpdate = React.useCallback((payload: any) => {
    console.log('🔄 Dashboard data changed, refreshing...', payload)
    // Trigger dashboard data refresh
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const activityUpdates = useRealtimeUpdates('user_activities', handleUpdate)
  const collegeUpdates = useRealtimeUpdates('saved_colleges', handleUpdate)
  const quizUpdates = useRealtimeUpdates('quiz_results', handleUpdate)
  const skillUpdates = useRealtimeUpdates('user_skills', handleUpdate)
  const achievementUpdates = useRealtimeUpdates('user_achievements', handleUpdate)
  
  return {
    stats,
    isLoading,
    error,
    isConnected: activityUpdates.isConnected || 
                 collegeUpdates.isConnected || 
                 quizUpdates.isConnected ||
                 skillUpdates.isConnected ||
                 achievementUpdates.isConnected,
    refresh: fetchDashboardStats
  }
}

// Hook for profile updates
export function useProfileUpdates(onUpdate: (profile: any) => void) {
  const handleUpdate = async (payload: any) => {
    // Fetch fresh profile data
    try {
      const response = await fetch('/api/profile')
      const profile = await response.json()
      onUpdate(profile)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  return useRealtimeUpdates('users', handleUpdate)
}