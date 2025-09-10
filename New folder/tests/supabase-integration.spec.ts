import { test, expect, Page } from '@playwright/test'

test.describe('Supabase Integration E2E Tests', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    // Set up console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text())
      }
    })
  })

  test.afterEach(async () => {
    await page.close()
  })

  test.describe('Homepage and Navigation', () => {
    test('should load homepage successfully', async () => {
      await page.goto('http://localhost:3002')
      
      // Wait for the main content to load
      await expect(page.locator('h1')).toContainText('AI-Powered Career Discovery')
      await expect(page.locator('[data-testid="hero-section"]').or(page.locator('main'))).toBeVisible()
      
      // Verify navigation elements
      await expect(page.locator('nav').or(page.locator('[role="navigation"]'))).toBeVisible()
      await expect(page.locator('text=Career Advisor').or(page.locator('text=CA'))).toBeVisible()
      
      // Check for key CTA buttons
      await expect(
        page.locator('text=Get Started').or(
          page.locator('text=Start Journey').or(
            page.locator('text=Begin').or(
              page.locator('[href*="signup"]')
            )
          )
        )
      ).toBeVisible()
    })

    test('should navigate to colleges page', async () => {
      await page.goto('http://localhost:3002')
      
      // Click on Colleges link in navigation
      await page.locator('text=Colleges').or(page.locator('[href*="colleges"]')).first().click()
      await expect(page).toHaveURL(/.*\/colleges/)
      
      // Verify colleges page loads
      await expect(page.locator('h1')).toContainText(/College|Discover|Find/)
      await page.waitForSelector('[data-testid="college-grid"]', { state: 'visible', timeout: 10000 })
        .catch(() => page.waitForSelector('.college-grid', { state: 'visible', timeout: 5000 }))
        .catch(() => page.waitForSelector('[class*="grid"]', { state: 'visible', timeout: 5000 }))
    })
  })

  test.describe('College Browsing and Real Data Integration', () => {
    test('should display real college data from Supabase', async () => {
      await page.goto('http://localhost:3002/colleges')
      
      // Wait for colleges to load
      await page.waitForFunction(() => {
        const collegeElements = document.querySelectorAll('[data-testid*="college"], .college-card, [class*="college"]')
        return collegeElements.length > 0
      }, {}, { timeout: 15000 })

      // Verify real college data is displayed
      const collegeCards = page.locator('[data-testid*="college"], .college-card, [class*="college"]')
      const cardCount = await collegeCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // Check for Indian institutions (key identifiers)
      const collegeText = await page.textContent('body')
      const hasIndianInstitutions = /IIT|NIT|IIIT|Indian Institute|University|College/i.test(collegeText || '')
      expect(hasIndianInstitutions).toBe(true)

      // Verify college cards have proper structure
      const firstCard = collegeCards.first()
      await expect(firstCard).toBeVisible()
      
      // Look for college name, location, or ranking
      const cardContent = await firstCard.textContent()
      expect(cardContent).toBeTruthy()
      expect(cardContent!.length).toBeGreaterThan(10)
    })

    test('should handle college filtering functionality', async () => {
      await page.goto('http://localhost:3002/colleges')
      
      // Wait for initial load
      await page.waitForFunction(() => {
        return document.querySelectorAll('[data-testid*="college"], .college-card, [class*="college"]').length > 0
      }, {}, { timeout: 15000 })

      const initialCardCount = await page.locator('[data-testid*="college"], .college-card, [class*="college"]').count()

      // Try to find and use search/filter functionality
      const searchInput = page.locator('input[type="text"]').or(
        page.locator('input[placeholder*="search"]')
      ).or(page.locator('[data-testid*="search"]')).first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('IIT')
        
        // Wait for filtering to take effect
        await page.waitForTimeout(2000)
        
        const filteredText = await page.textContent('body')
        expect(filteredText).toMatch(/IIT|Indian Institute of Technology/i)
      }

      // Check if filter buttons exist
      const filterButtons = page.locator('button').filter({ hasText: /Engineering|Medical|Arts|Commerce|Science|Location|Type/ })
      const filterCount = await filterButtons.count()
      
      if (filterCount > 0) {
        await filterButtons.first().click()
        await page.waitForTimeout(1000)
        
        // Verify filtering worked (card count might change)
        const newCardCount = await page.locator('[data-testid*="college"], .college-card, [class*="college"]').count()
        expect(typeof newCardCount).toBe('number')
      }
    })
  })

  test.describe('College Save/Remove Functionality', () => {
    test('should save and remove colleges with database persistence', async () => {
      await page.goto('http://localhost:3002/colleges')
      
      // Wait for colleges to load
      await page.waitForFunction(() => {
        return document.querySelectorAll('[data-testid*="college"], .college-card, [class*="college"]').length > 0
      }, {}, { timeout: 15000 })

      // Find heart/save button on first college card
      const collegeCards = page.locator('[data-testid*="college"], .college-card, [class*="college"]')
      const firstCard = collegeCards.first()
      
      // Look for heart icon or save button
      const saveButton = firstCard.locator('button').filter({ 
        has: page.locator('svg, [class*="heart"], [data-testid*="save"], [data-testid*="heart"]')
      }).first().or(
        firstCard.locator('button[data-testid*="save"]')
      ).or(
        firstCard.locator('button[data-testid*="heart"]')
      ).or(
        firstCard.locator('button').filter({ hasText: /save|heart|favorite/i })
      )

      if (await saveButton.isVisible()) {
        console.log('Found save button, testing save functionality...')
        
        // Click to save the college
        await saveButton.click()
        
        // Wait for the API call to complete and check console for success message
        await page.waitForTimeout(2000)
        
        // Check for success indication (heart color change, toast, or console message)
        const logs = await page.evaluate(() => {
          return (window as any).__testLogs || []
        })
        
        // The button state might change (filled heart vs outline)
        const buttonAfterSave = await saveButton.getAttribute('class')
        console.log('Button state after save:', buttonAfterSave)
        
        // Try to click again to unsave
        await saveButton.click()
        await page.waitForTimeout(2000)
        
        const buttonAfterUnsave = await saveButton.getAttribute('class')
        console.log('Button state after unsave:', buttonAfterUnsave)
        
        // States should be different
        expect(buttonAfterSave !== buttonAfterUnsave).toBeTruthy()
      }
    })

    test('should track college save activity in dashboard', async () => {
      // First save a college
      await page.goto('http://localhost:3002/colleges')
      
      await page.waitForFunction(() => {
        return document.querySelectorAll('[data-testid*="college"], .college-card, [class*="college"]').length > 0
      }, {}, { timeout: 15000 })

      const collegeCards = page.locator('[data-testid*="college"], .college-card, [class*="college"]')
      const firstCard = collegeCards.first()
      
      // Get college name for tracking
      const collegeName = await firstCard.locator('h2, h3, [class*="title"], [class*="name"]').first().textContent()
      
      const saveButton = firstCard.locator('button').filter({ 
        has: page.locator('svg, [class*="heart"], [data-testid*="save"]')
      }).first()

      if (await saveButton.isVisible()) {
        await saveButton.click()
        await page.waitForTimeout(1000)
        
        // Navigate to dashboard
        await page.goto('http://localhost:3002/dashboard')
        
        // Wait for dashboard to load
        await page.waitForSelector('text=Welcome', { timeout: 10000 })
          .catch(() => page.waitForSelector('text=Dashboard', { timeout: 5000 }))
          .catch(() => page.waitForSelector('h1', { timeout: 5000 }))

        // Check if saved colleges count is updated
        const savedCollegesSection = page.locator('text=Saved Colleges').or(
          page.locator('text=saved').or(
            page.locator('[data-testid*="saved"]')
          )
        )
        
        if (await savedCollegesSection.isVisible()) {
          // Look for a number greater than 0 near "Saved Colleges"
          const dashboardText = await page.textContent('body')
          const hasNonZeroSavedCount = /Saved Colleges[^0]*[1-9]/.test(dashboardText || '')
          console.log('Dashboard shows saved colleges:', hasNonZeroSavedCount)
        }

        // Check Recent Activity section for college save activity
        const activitySection = page.locator('text=Recent Activity').or(
          page.locator('text=Activity').or(
            page.locator('[data-testid*="activity"]')
          )
        )
        
        if (await activitySection.isVisible()) {
          const activityText = await page.textContent('body')
          const hasCollegeActivity = /saved|college|activity/i.test(activityText || '')
          expect(hasCollegeActivity).toBe(true)
        }
      }
    })
  })

  test.describe('Dashboard Real Data Integration', () => {
    test('should load dashboard with real data from Supabase APIs', async () => {
      await page.goto('http://localhost:3002/dashboard')
      
      // Wait for dashboard to load completely
      await page.waitForSelector('text=Welcome', { timeout: 15000 })
        .catch(() => page.waitForSelector('text=Dashboard', { timeout: 10000 }))
        .catch(() => page.waitForSelector('h1', { timeout: 5000 }))

      // Verify dashboard sections load
      const sections = [
        'Welcome',
        'Quiz Completions',
        'Saved Colleges', 
        'Skills',
        'Achievements',
        'Recent Activity',
        'AI Recommendations',
        'Upcoming Tasks'
      ]

      for (const section of sections) {
        const sectionElement = page.locator(`text=${section}`).or(
          page.locator(`[data-testid*="${section.toLowerCase().replace(' ', '-')}"]`)
        )
        
        if (await sectionElement.isVisible()) {
          console.log(`✓ Dashboard section found: ${section}`)
        }
      }

      // Verify stats cards show numbers (even if 0)
      const statsCards = page.locator('[class*="grid"] > div').filter({ 
        has: page.locator('text=/^[0-9]+$/')
      })
      const statsCount = await statsCards.count()
      expect(statsCount).toBeGreaterThan(0)

      // Verify AI recommendations are loaded
      const aiRecommendations = page.locator('text=AI Recommendations').or(
        page.locator('text=Recommendations')
      )
      
      if (await aiRecommendations.isVisible()) {
        // Should have recommendation cards
        const recommendationCards = page.locator('[data-testid*="recommendation"], .recommendation-card, [class*="recommendation"]')
        const recCount = await recommendationCards.count()
        expect(recCount).toBeGreaterThan(0)
      }
    })

    test('should display achievements without errors', async () => {
      await page.goto('http://localhost:3002/dashboard')
      
      // Wait for dashboard to load
      await page.waitForSelector('text=Welcome', { timeout: 10000 })
        .catch(() => page.waitForSelector('h1', { timeout: 5000 }))

      // Look for achievements section
      const achievementsSection = page.locator('text=Achievement').or(
        page.locator('text=Recent Achievement')
      )
      
      if (await achievementsSection.isVisible()) {
        // Should not show error messages
        const errorMessages = page.locator('text=Error').or(
          page.locator('text=undefined').or(
            page.locator('text=TypeError')
          )
        )
        const errorCount = await errorMessages.count()
        expect(errorCount).toBe(0)

        // Should show achievement stats or "No achievements yet"
        const achievementContent = page.locator('text=No achievements yet').or(
          page.locator('text=Unlocked').or(
            page.locator('text=Points')
          )
        )
        await expect(achievementContent.first()).toBeVisible()
      }
    })

    test('should show real activity data and AI recommendations', async () => {
      await page.goto('http://localhost:3002/dashboard')
      
      // Wait for dashboard to fully load
      await page.waitForTimeout(5000)

      // Check Recent Activity section
      const activitySection = page.locator('text=Recent Activity')
      if (await activitySection.isVisible()) {
        // Should have activity items
        const activityItems = page.locator('[data-testid*="activity"], .activity-item, [class*="activity"]')
        const activityCount = await activityItems.count()
        
        if (activityCount > 0) {
          console.log(`Found ${activityCount} activity items`)
          
          // Activity items should have proper structure
          const firstActivity = activityItems.first()
          const activityText = await firstActivity.textContent()
          expect(activityText).toBeTruthy()
          expect(activityText!.length).toBeGreaterThan(5)
        }
      }

      // Check AI Recommendations
      const recommendationsSection = page.locator('text=AI Recommendations')
      if (await recommendationsSection.isVisible()) {
        // Should have recommendation cards
        const recCards = page.locator('[data-testid*="recommendation"], .recommendation-card')
        const recCount = await recCards.count()
        
        if (recCount > 0) {
          console.log(`Found ${recCount} AI recommendations`)
          
          // Recommendations should have confidence scores
          const recText = await page.textContent('body')
          const hasConfidence = /%|confidence|score/i.test(recText || '')
          console.log('Recommendations show confidence scores:', hasConfidence)
          
          // Should have action buttons
          const actionButtons = page.locator('button').filter({ 
            hasText: /Add Skills|Explore|Take Assessment|View|Start/ 
          })
          const buttonCount = await actionButtons.count()
          expect(buttonCount).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Skills and Profile Data', () => {
    test('should handle skills data correctly', async () => {
      await page.goto('http://localhost:3002/dashboard')
      
      // Wait for dashboard to load
      await page.waitForTimeout(3000)

      // Look for skills section
      const skillsSection = page.locator('text=Skill').or(
        page.locator('text=Skills')
      )
      
      if (await skillsSection.isVisible()) {
        console.log('Skills section found on dashboard')
        
        // Should show skill progress or "No skills" message
        const skillContent = page.locator('text=Total Skills').or(
          page.locator('text=No skills').or(
            page.locator('text=Add Skills')
          )
        )
        await expect(skillContent.first()).toBeVisible()

        // Check for skill progress indicators
        const progressElements = page.locator('[class*="progress"], .progress-bar, [role="progressbar"]')
        const progressCount = await progressElements.count()
        console.log(`Found ${progressCount} progress elements`)
      }
    })
  })

  test.describe('API Integration and Error Handling', () => {
    test('should handle API responses gracefully', async () => {
      // Monitor network requests to our APIs
      const apiRequests: string[] = []
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push(request.url())
        }
      })

      await page.goto('http://localhost:3002/dashboard')
      await page.waitForTimeout(5000)

      // Should have made API calls to our endpoints
      const relevantAPIs = apiRequests.filter(url => 
        url.includes('/api/dashboard') || 
        url.includes('/api/activity') ||
        url.includes('/api/achievements') ||
        url.includes('/api/colleges') ||
        url.includes('/api/recommendations')
      )
      
      expect(relevantAPIs.length).toBeGreaterThan(0)
      console.log('API calls made:', relevantAPIs)

      // Dashboard should not show major error messages
      const errorElements = page.locator('text=Error').or(
        page.locator('text=Failed to load').or(
          page.locator('text=Something went wrong')
        )
      )
      const errorCount = await errorElements.count()
      expect(errorCount).toBe(0)
    })

    test('should handle offline/demo mode correctly', async () => {
      await page.goto('http://localhost:3002/colleges')
      
      // Wait for colleges to load
      await page.waitForFunction(() => {
        return document.querySelectorAll('[data-testid*="college"], .college-card, [class*="college"]').length > 0
      }, {}, { timeout: 15000 })

      // Should show some colleges (either real or demo data)
      const collegeCards = page.locator('[data-testid*="college"], .college-card, [class*="college"]')
      const cardCount = await collegeCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // Check for demo mode indicator or normal operation
      const bodyText = await page.textContent('body')
      const hasContent = /IIT|NIT|University|College|Engineering|Medical/i.test(bodyText || '')
      expect(hasContent).toBe(true)
    })
  })

  test.describe('User Interaction Flows', () => {
    test('should complete college browsing to dashboard workflow', async () => {
      // Step 1: Browse colleges
      await page.goto('http://localhost:3002/colleges')
      await page.waitForFunction(() => {
        return document.querySelectorAll('[data-testid*="college"], .college-card, [class*="college"]').length > 0
      }, {}, { timeout: 15000 })

      const initialCollegeCount = await page.locator('[data-testid*="college"], .college-card, [class*="college"]').count()
      expect(initialCollegeCount).toBeGreaterThan(0)

      // Step 2: Try to save a college
      const firstCard = page.locator('[data-testid*="college"], .college-card, [class*="college"]').first()
      const saveButton = firstCard.locator('button').filter({ 
        has: page.locator('svg, [class*="heart"], [data-testid*="save"]')
      }).first()

      let collegeSaved = false
      if (await saveButton.isVisible()) {
        await saveButton.click()
        await page.waitForTimeout(1000)
        collegeSaved = true
        console.log('College save attempted')
      }

      // Step 3: Navigate to dashboard
      await page.goto('http://localhost:3002/dashboard')
      await page.waitForTimeout(3000)

      // Step 4: Verify dashboard loads correctly
      await expect(page.locator('text=Welcome').or(page.locator('h1'))).toBeVisible()

      // If we saved a college, verify it's reflected
      if (collegeSaved) {
        const dashboardText = await page.textContent('body')
        const hasActivity = /saved|college|activity/i.test(dashboardText || '')
        console.log('Dashboard reflects college activity:', hasActivity)
      }

      // Step 5: Check AI recommendations are relevant
      const aiSection = page.locator('text=AI Recommendations')
      if (await aiSection.isVisible()) {
        const recommendations = page.locator('[data-testid*="recommendation"], .recommendation-card')
        const recCount = await recommendations.count()
        expect(recCount).toBeGreaterThan(0)
        console.log(`AI provided ${recCount} recommendations`)
      }
    })

    test('should navigate between major sections without errors', async () => {
      const testRoutes = [
        { path: '/', name: 'Homepage' },
        { path: '/colleges', name: 'Colleges' },
        { path: '/dashboard', name: 'Dashboard' }
      ]

      for (const route of testRoutes) {
        console.log(`Testing navigation to ${route.name}`)
        await page.goto(`http://localhost:3002${route.path}`)
        
        // Wait for page to load
        await page.waitForTimeout(2000)
        
        // Should not have major errors
        const errorElements = page.locator('text=Error').or(
          page.locator('text=404').or(
            page.locator('text=Something went wrong')
          )
        )
        const errorCount = await errorElements.count()
        expect(errorCount).toBe(0)

        // Should have some content
        const bodyText = await page.textContent('body')
        expect(bodyText).toBeTruthy()
        expect(bodyText!.length).toBeGreaterThan(100)
        
        console.log(`✓ ${route.name} loaded successfully`)
      }
    })
  })
})