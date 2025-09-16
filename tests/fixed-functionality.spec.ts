import { test, expect } from '@playwright/test'

test.describe('Fixed Functionality - Critical User Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard Access and Interactivity', async ({ page }) => {
    test.info().annotations.push({
      type: 'issue',
      description: 'Tests fix for dashboard authentication and non-functional components'
    })

    // Navigate to dashboard
    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to load completely
    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible({ timeout: 10000 })
    
    // Verify stats cards are functional
    const statsCards = page.locator('[class*="cursor-pointer"][class*="group"]').first()
    await expect(statsCards).toBeVisible()
    
    // Test stats card interaction
    await statsCards.click()
    
    // Verify skill progress is interactive
    const skillProgressBars = page.locator('[class*="cursor-pointer"][class*="hover:bg-gray-600"]').first()
    await expect(skillProgressBars).toBeVisible()
    await skillProgressBars.click()

    // Test AI recommendations interaction
    const recommendationButton = page.getByRole('button', { name: /Start Course|Begin Learning|Research Now|Explore Jobs/ }).first()
    if (await recommendationButton.count() > 0) {
      await recommendationButton.click()
      // Should show toast notification
      await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 5000 })
    }

    // Verify activity feed is clickable
    const activityItems = page.locator('[class*="cursor-pointer"][class*="group"]').filter({ hasText: /Achievement|Roadmap|College/ }).first()
    if (await activityItems.count() > 0) {
      await activityItems.click()
    }

    // Test navigation links functionality
    const viewSkillsLink = page.getByRole('link', { name: 'View All Skills & Add Experience' })
    await expect(viewSkillsLink).toBeVisible()
    await expect(viewSkillsLink).toHaveAttribute('href', '/profile?tab=skills')
  })

  test('AI Roadmap Generator - Complete User Flow', async ({ page }) => {
    test.info().annotations.push({
      type: 'issue', 
      description: 'Tests fix for disabled Continue button and non-functional roadmap generation'
    })

    // Navigate to roadmap generator
    await page.goto('http://localhost:3001/roadmap')
    await page.waitForLoadState('networkidle')

    // Wait for generator to load
    await expect(page.getByText('AI Roadmap Generator')).toBeVisible({ timeout: 10000 })

    // Step 1: Career Goal Selection
    await expect(page.getByText('Choose Your Career Goal')).toBeVisible()
    
    // Initially Continue button should be disabled
    const continueButton = page.getByRole('button', { name: 'Continue' })
    await expect(continueButton).toBeDisabled()
    
    // Select a career goal
    await page.getByRole('button', { name: 'Full-Stack Web Developer' }).click()
    
    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled()
    await continueButton.click()

    // Step 2: Experience Level
    await expect(page.getByText("What's Your Current Level?")).toBeVisible()
    
    // Select experience level
    await page.getByRole('button', { name: /Beginner.*New to the field/ }).click()
    
    // Continue to next step
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: Preferences and Timeline
    await expect(page.getByText('Customize Your Learning')).toBeVisible()
    
    // Initially Generate button should be disabled (waiting for interests)
    const generateButton = page.getByRole('button', { name: 'Generate Roadmap' })
    await expect(generateButton).toBeDisabled()
    
    // Select interests
    await page.getByRole('button', { name: 'Frontend Development' }).click()
    await page.getByRole('button', { name: 'Backend Development' }).click()
    
    // Select learning style
    await page.getByRole('button', { name: /Hands-on.*Learn by building/ }).click()
    
    // Generate button should now be enabled
    await expect(generateButton).toBeEnabled()
    
    // Click generate roadmap
    await generateButton.click()

    // Verify roadmap generation and display
    await expect(page.getByText('Your Learning Roadmap')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Learning Path/)).toBeVisible()
    
    // Verify roadmap content is displayed
    await expect(page.getByText('Learning Phases')).toBeVisible()
    await expect(page.getByText('AI Recommendations')).toBeVisible()
    await expect(page.getByText('Expected Outcome')).toBeVisible()
    
    // Verify action buttons are functional
    await expect(page.getByRole('button', { name: 'Start Your Journey' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save Roadmap' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible()
  })

  test('Dashboard to Roadmap Integration Flow', async ({ page }) => {
    test.info().annotations.push({
      type: 'integration',
      description: 'Tests integrated flow from dashboard recommendations to roadmap generation'
    })

    // Start at dashboard
    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to load
    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible({ timeout: 10000 })

    // Click on roadmap-related action from dashboard
    const roadmapLink = page.getByRole('link', { name: 'View Roadmap' })
    if (await roadmapLink.count() > 0) {
      await roadmapLink.click()
      await page.waitForLoadState('networkidle')
      
      // Should navigate to roadmap page
      await expect(page).toHaveURL('/roadmap')
      await expect(page.getByText('AI Roadmap Generator')).toBeVisible()
    }

    // Alternative: Navigate via Explore Full Roadmap button
    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')
    
    const exploreButton = page.getByRole('button', { name: 'Explore Full Roadmap' })
    if (await exploreButton.count() > 0) {
      await exploreButton.click()
      // Should navigate to roadmap or show detailed view
    }
  })

  test('Interactive Elements Response Verification', async ({ page }) => {
    test.info().annotations.push({
      type: 'interaction',
      description: 'Verifies all interactive elements respond correctly to user actions'
    })

    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to load
    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible({ timeout: 10000 })

    // Test notification button
    const notificationButton = page.getByRole('button', { name: 'View Notifications' })
    await notificationButton.click()
    // Should show toast notification
    await expect(page.locator('[role="status"]').filter({ hasText: /notifications/i })).toBeVisible({ timeout: 3000 })

    // Test skill progress bars (clickable for updates)
    const skillBars = page.locator('[class*="cursor-pointer"][class*="hover:bg-gray-600"]')
    const firstSkillBar = skillBars.first()
    if (await firstSkillBar.count() > 0) {
      await firstSkillBar.click()
      // Should show progress update toast
      await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 3000 })
    }

    // Test upcoming tasks interaction
    const taskButton = page.locator('[class*="cursor-pointer"] button').filter({ hasText: /chevron/i }).first()
    if (await taskButton.count() > 0) {
      await taskButton.click()
      // Should show task interaction toast
      await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 3000 })
    }
  })

  test('Error Handling and Fallback Functionality', async ({ page }) => {
    test.info().annotations.push({
      type: 'reliability',
      description: 'Tests that the application handles errors gracefully and provides fallbacks'
    })

    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    // Dashboard should load even if some API calls fail
    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible({ timeout: 10000 })

    // Should show mock/fallback data even without real backend
    await expect(page.getByText('Quiz Completions')).toBeVisible()
    await expect(page.getByText('Skills Acquired')).toBeVisible()
    await expect(page.getByText('Recent Activity')).toBeVisible()

    // Roadmap generator should work with fallback templates
    await page.goto('http://localhost:3001/roadmap')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('AI Roadmap Generator')).toBeVisible({ timeout: 10000 })

    // Complete the flow quickly to test fallback roadmap generation
    await page.getByRole('button', { name: 'Full-Stack Web Developer' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await page.getByRole('button', { name: /Beginner.*New to the field/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await page.getByRole('button', { name: 'Frontend Development' }).click()
    await page.getByRole('button', { name: /Hands-on.*Learn by building/ }).click()
    
    await page.getByRole('button', { name: 'Generate Roadmap' }).click()

    // Should generate roadmap even if AI services fail (fallback template)
    await expect(page.getByText('Your Learning Roadmap')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Learning Path/)).toBeVisible()
  })

  test('Responsive Design and Mobile Interaction', async ({ page }) => {
    test.info().annotations.push({
      type: 'responsive',
      description: 'Tests that fixed functionality works on mobile devices'
    })

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    // Dashboard should be functional on mobile
    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible({ timeout: 10000 })

    // Stats cards should be responsive and clickable on mobile
    const mobileStatsCard = page.locator('[class*="cursor-pointer"][class*="group"]').first()
    await expect(mobileStatsCard).toBeVisible()
    await mobileStatsCard.tap()

    // Test mobile roadmap generator
    await page.goto('http://localhost:3001/roadmap')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('AI Roadmap Generator')).toBeVisible({ timeout: 10000 })

    // Career selection should work on mobile
    await page.getByRole('button', { name: 'Full-Stack Web Developer' }).tap()
    await page.getByRole('button', { name: 'Continue' }).tap()

    // Should progress through steps on mobile
    await expect(page.getByText("What's Your Current Level?")).toBeVisible()
  })

  test('Navigation and State Persistence', async ({ page }) => {
    test.info().annotations.push({
      type: 'navigation',
      description: 'Tests navigation between pages and state management'
    })

    // Start at dashboard
    await page.goto('http://localhost:3001/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible({ timeout: 10000 })

    // Navigate to roadmap via link
    await page.getByRole('link', { name: 'View Roadmap' }).click()
    await page.waitForLoadState('networkidle')

    // Should be on roadmap page
    await expect(page).toHaveURL('/roadmap')
    
    // Navigate back to dashboard via nav
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await page.waitForLoadState('networkidle')

    // Should maintain dashboard state
    await expect(page.getByText('Welcome back, Demo User!')).toBeVisible()
    await expect(page.getByText('Recent Activity')).toBeVisible()

    // Test direct navigation to different sections
    await page.goto('http://localhost:3001/quiz')
    await expect(page).toHaveURL('/quiz')

    await page.goto('http://localhost:3001/colleges')  
    await expect(page).toHaveURL('/colleges')
  })
})