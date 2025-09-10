import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type ActivityType = 
  | 'roadmap_generated' 
  | 'quiz_completed' 
  | 'job_analyzed' 
  | 'skill_updated' 
  | 'college_saved' 
  | 'achievement_unlocked'

export interface ActivityData {
  type: ActivityType
  title: string
  description?: string
  details?: Record<string, any>
  metadata?: Record<string, any>
}

export class ActivityLogger {
  private supabase = createClientComponentClient()

  /**
   * Log a user activity to the database
   */
  async logActivity(userId: string, activity: ActivityData): Promise<boolean> {
    try {
      if (!userId || userId === 'demo-user') {
        console.log('📝 Demo user activity (not saved):', activity.title)
        return true
      }

      const { error } = await this.supabase
        .from('activities')
        .insert({
          user_id: userId,
          type: activity.type,
          title: activity.title,
          description: activity.description || '',
          details: activity.details || {},
          metadata: activity.metadata || {}
        })

      if (error) {
        console.error('❌ Failed to log activity:', error)
        return false
      }

      console.log('✅ Activity logged:', activity.title)
      return true

    } catch (error) {
      console.error('❌ Activity logging error:', error)
      return false
    }
  }

  /**
   * Log roadmap generation activity
   */
  async logRoadmapGenerated(userId: string, roadmapData: any): Promise<boolean> {
    return this.logActivity(userId, {
      type: 'roadmap_generated',
      title: `Generated ${roadmapData.careerGoal || roadmapData.title} Roadmap`,
      description: `Created a personalized learning path for ${roadmapData.careerGoal || 'career development'}`,
      details: {
        career_goal: roadmapData.careerGoal || roadmapData.title,
        duration_months: roadmapData.duration || roadmapData.totalDuration,
        phases_count: roadmapData.phases?.length || 0,
        roadmap_id: roadmapData.id
      }
    })
  }

  /**
   * Log quiz completion activity
   */
  async logQuizCompleted(userId: string, quizResult: any): Promise<boolean> {
    return this.logActivity(userId, {
      type: 'quiz_completed',
      title: `Completed ${quizResult.quiz_type || 'Career'} Quiz`,
      description: `Discovered career match: ${quizResult.career_path || 'Multiple paths'}`,
      details: {
        quiz_id: quizResult.id,
        quiz_type: quizResult.quiz_type || 'career_assessment',
        career_path: quizResult.career_path,
        score: quizResult.score || 0,
        completion_time: quizResult.completion_time
      }
    })
  }

  /**
   * Log job analysis activity
   */
  async logJobAnalyzed(userId: string, jobData: any): Promise<boolean> {
    return this.logActivity(userId, {
      type: 'job_analyzed',
      title: `Analyzed ${jobData.title || 'Job'} Position`,
      description: `Resume analyzed for ${jobData.company || 'position'} role`,
      details: {
        job_title: jobData.title,
        company: jobData.company,
        match_score: jobData.matchScore || 0,
        location: jobData.location,
        generated_outreach: jobData.outreachGenerated || false
      }
    })
  }

  /**
   * Log skill update activity
   */
  async logSkillUpdated(userId: string, skillData: any): Promise<boolean> {
    return this.logActivity(userId, {
      type: 'skill_updated',
      title: `Updated ${skillData.skill_name} Skill`,
      description: `Skill level updated from ${skillData.old_level || 0}% to ${skillData.current_level}%`,
      details: {
        skill_name: skillData.skill_name,
        old_level: skillData.old_level || 0,
        current_level: skillData.current_level,
        target_level: skillData.target_level,
        category: skillData.category
      }
    })
  }

  /**
   * Log college save activity
   */
  async logCollegeSaved(userId: string, collegeData: any): Promise<boolean> {
    return this.logActivity(userId, {
      type: 'college_saved',
      title: `Saved ${collegeData.college_name}`,
      description: `Added ${collegeData.college_name} to saved colleges list`,
      details: {
        college_name: collegeData.college_name,
        college_type: collegeData.college_type,
        location: collegeData.location,
        courses: collegeData.courses,
        ranking: collegeData.ranking
      }
    })
  }

  /**
   * Log achievement unlock activity
   */
  async logAchievementUnlocked(userId: string, achievementData: any): Promise<boolean> {
    return this.logActivity(userId, {
      type: 'achievement_unlocked',
      title: `Unlocked "${achievementData.title}" Achievement`,
      description: achievementData.description || `Earned new achievement: ${achievementData.title}`,
      details: {
        achievement_id: achievementData.id,
        achievement_type: achievementData.type,
        points: achievementData.points || 0,
        category: achievementData.category || 'general'
      }
    })
  }

  /**
   * Get user activities with pagination
   */
  async getUserActivities(userId: string, limit = 10, offset = 0) {
    try {
      if (!userId || userId === 'demo-user') {
        // Return demo activities for demo user
        return {
          success: true,
          activities: [
            {
              id: '1',
              type: 'achievement',
              title: 'Welcome to Career Advisor!',
              description: 'Started your career discovery journey',
              created_at: new Date().toISOString(),
              details: { achievement_type: 'onboarding', points: 10 }
            },
            {
              id: '2',
              type: 'college',
              title: 'Explore Colleges',
              description: 'Check out top engineering colleges across India',
              created_at: new Date().toISOString(),
              details: { action: 'browse_colleges', section: 'engineering' }
            },
            {
              id: '3',
              type: 'quiz',
              title: 'Take Career Quiz',
              description: 'Discover your ideal career path with AI-powered assessment',
              created_at: new Date().toISOString(),
              details: { action: 'quiz_prompt', quiz_type: 'career_assessment' }
            }
          ],
          total: 3
        }
      }

      const { data, error, count } = await this.supabase
        .from('activities')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Failed to fetch activities:', error)
        return { success: false, activities: [], total: 0 }
      }

      return {
        success: true,
        activities: data || [],
        total: count || 0
      }

    } catch (error) {
      console.error('❌ Activity fetch error:', error)
      return { success: false, activities: [], total: 0 }
    }
  }
}

// Export singleton instance
export const activityLogger = new ActivityLogger()
export default activityLogger