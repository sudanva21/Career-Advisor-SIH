import { test, expect } from '@playwright/test'

test.describe('Career Advisor Platform - New Pages Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('http://localhost:3000')
  })

  test.describe('Blog Page Tests', () => {
    test('should load blog page and display articles', async ({ page }) => {
      // Navigate to blog page
      await page.click('text=Blog')
      await page.waitForURL('**/blog')
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Blog/)
      await expect(page.locator('h1')).toContainText('Career Insights')
      
      // Verify hero section
      await expect(page.locator('.glass-card').first()).toContainText('Latest Articles')
      
      // Check that articles are displayed
      await expect(page.locator('.glass-card')).toHaveCount({ min: 3 })
      
      // Verify featured article exists
      await expect(page.locator('text=The Future of AI in Career Counseling')).toBeVisible()
    })

    test('should filter articles by category', async ({ page }) => {
      await page.goto('http://localhost:3000/blog')
      
      // Wait for articles to load
      await page.waitForSelector('.glass-card', { timeout: 10000 })
      
      // Click on Career Tips category
      await page.click('text=Career Tips')
      await page.waitForTimeout(1000)
      
      // Verify filtering works (check for career tips content)
      const articles = page.locator('.glass-card')
      await expect(articles).toHaveCount({ min: 1 })
    })

    test('should search articles', async ({ page }) => {
      await page.goto('http://localhost:3000/blog')
      
      // Search for "AI" 
      await page.fill('input[placeholder*="Search"]', 'AI')
      await page.press('input[placeholder*="Search"]', 'Enter')
      await page.waitForTimeout(1000)
      
      // Verify search results
      const searchResults = page.locator('.glass-card')
      await expect(searchResults).toHaveCount({ min: 1 })
    })

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('http://localhost:3000/blog')
      
      // Check mobile navigation
      await expect(page.locator('h1')).toBeVisible()
      
      // Verify articles stack properly on mobile
      const articles = page.locator('.glass-card')
      await expect(articles.first()).toBeVisible()
    })
  })

  test.describe('API Documentation Page Tests', () => {
    test('should load API documentation page', async ({ page }) => {
      await page.goto('http://localhost:3000/api')
      
      // Check page title and main heading
      await expect(page).toHaveTitle(/API Documentation/)
      await expect(page.locator('h1')).toContainText('API Documentation')
      
      // Verify stats section
      await expect(page.locator('text=50+')).toBeVisible()
      await expect(page.locator('text=API Endpoints')).toBeVisible()
      
      // Check API features section
      await expect(page.locator('text=Fast & Reliable')).toBeVisible()
    })

    test('should navigate between API endpoints', async ({ page }) => {
      await page.goto('http://localhost:3000/api')
      
      // Click on Users endpoint
      await page.click('text=Users')
      await page.waitForTimeout(1000)
      
      // Verify content changes
      await expect(page.locator('text=User Management')).toBeVisible()
      
      // Click on Career Assessment
      await page.click('text=Career Assessment')
      await page.waitForTimeout(1000)
      
      await expect(page.locator('text=AI-powered career assessment')).toBeVisible()
    })

    test('should copy code examples', async ({ page }) => {
      await page.goto('http://localhost:3000/api')
      
      // Wait for content to load
      await page.waitForSelector('button[aria-label*="copy" i], button:has(svg)', { timeout: 10000 })
      
      // Click copy button (look for copy icon or button)
      const copyButton = page.locator('button').filter({ has: page.locator('svg') }).first()
      if (await copyButton.isVisible()) {
        await copyButton.click()
        // Check for success indicator (green check icon)
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Contact Page Tests', () => {
    test('should load contact page with form', async ({ page }) => {
      await page.goto('http://localhost:3000/contact')
      
      // Check page title
      await expect(page).toHaveTitle(/Contact/)
      await expect(page.locator('h1')).toContainText('Contact Us')
      
      // Verify contact methods section
      await expect(page.locator('text=Email Support')).toBeVisible()
      await expect(page.locator('text=sudanva7@gmail.com')).toBeVisible()
      
      // Check form elements
      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('textarea[name="message"]')).toBeVisible()
    })

    test('should validate form submission', async ({ page }) => {
      await page.goto('http://localhost:3000/contact')
      
      // Fill out the form
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="subject"]', 'Test Subject')
      await page.fill('textarea[name="message"]', 'This is a test message')
      
      // Submit the form
      await page.click('button[type="submit"]')
      
      // Wait for success message
      await expect(page.locator('text=Message Sent Successfully')).toBeVisible({ timeout: 5000 })
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('http://localhost:3000/contact')
      
      // Try to submit empty form
      await page.click('button[type="submit"]')
      
      // Check for validation messages or required field indicators
      const nameInput = page.locator('input[name="name"]')
      await expect(nameInput).toHaveAttribute('required')
    })
  })

  test.describe('About Page Tests', () => {
    test('should load about page with company information', async ({ page }) => {
      await page.goto('http://localhost:3000/about')
      
      // Check page title and heading
      await expect(page).toHaveTitle(/About/)
      await expect(page.locator('h1')).toContainText('About CareerGuide')
      
      // Verify stats section
      await expect(page.locator('text=50K+')).toBeVisible()
      await expect(page.locator('text=Students Guided')).toBeVisible()
      
      // Check mission and vision sections
      await expect(page.locator('text=Our Mission')).toBeVisible()
      await expect(page.locator('text=Our Vision')).toBeVisible()
    })

    test('should display team information', async ({ page }) => {
      await page.goto('http://localhost:3000/about')
      
      // Scroll to team section
      await page.locator('text=Meet the').scrollIntoViewIfNeeded()
      
      // Check team member information
      await expect(page.locator('text=Sudanva')).toBeVisible()
      await expect(page.locator('text=Founder & CEO')).toBeVisible()
    })

    test('should show company timeline', async ({ page }) => {
      await page.goto('http://localhost:3000/about')
      
      // Check timeline section
      await expect(page.locator('text=Our Journey')).toBeVisible()
      await expect(page.locator('text=2023')).toBeVisible()
      await expect(page.locator('text=2024')).toBeVisible()
    })
  })

  test.describe('Team Page Tests', () => {
    test('should load team page successfully', async ({ page }) => {
      await page.goto('http://localhost:3000/team')
      
      // Check page loads without errors - main hero heading only
      await expect(page.locator('h1')).toContainText('Our Team')
      
      // Verify main description from hero section
      await expect(page.locator('text=Meet the passionate individuals behind CareerGuide')).toBeVisible()
      await expect(page.locator('text=Sudanva')).toBeVisible()
      await expect(page.locator('text=Team Leader & Technical Lead')).toBeVisible()
      
      // Verify all team members in unified layout
      await expect(page.locator('text=Rakshita Patil')).toBeVisible()
      await expect(page.locator('text=Sagar Kuligoud')).toBeVisible()
      await expect(page.locator('text=Laxmikant Talli')).toBeVisible()
      await expect(page.locator('text=Akash Kambar')).toBeVisible()
      await expect(page.locator('text=Malikarjun Kadagoudr')).toBeVisible()
      
      // Check departments section
      await expect(page.locator('text=Our Departments')).toBeVisible()
      await expect(page.locator('text=Engineering')).toBeVisible()
    })

    test('should display team member roles and skills', async ({ page }) => {
      await page.goto('http://localhost:3000/team')
      
      // Check updated roles in unified layout
      await expect(page.locator('text=Quality Assurance & Testing Specialist')).toBeVisible()
      await expect(page.locator('text=Project Coordinator & Presentation Lead')).toBeVisible()
      await expect(page.locator('text=Data Analyst & Insights Specialist')).toBeVisible()
      
      // Check for skills display
      await expect(page.locator('text=Core Skills')).toBeVisible()
      await expect(page.locator('text=Quality Assurance')).toBeVisible()
      await expect(page.locator('text=Data Analysis')).toBeVisible()
    })

    test('should display leader contact and social links', async ({ page }) => {
      await page.goto('http://localhost:3000/team')
      
      // Check contact buttons for leader
      await expect(page.locator('a[href="mailto:sudanva7@gmail.com"]')).toBeVisible()
      await expect(page.locator('a[href="tel:+91 8310491208"]')).toBeVisible()
      
      // Check social media links
      await expect(page.locator('a[href*="linkedin.com/in/sudanva-shilannavar"]')).toBeVisible()
      await expect(page.locator('a[href*="x.com/Sudanva999"]')).toBeVisible()
      await expect(page.locator('a[href*="github.com/sudanva21"]')).toBeVisible()
    })

    test('should display leader profile image and badge', async ({ page }) => {
      await page.goto('http://localhost:3000/team')
      
      // Check if profile image is present for team leader
      await expect(page.locator('img[alt*="Sudanva - Team Leader"]')).toBeVisible()
      
      // Check for leader badge/crown icon presence
      await expect(page.locator('text=Sudanva').locator('../../..')).toBeVisible()
    })

    test('should show equal-sized team member cards', async ({ page }) => {
      await page.goto('http://localhost:3000/team')
      
      // Verify all team members are displayed in similar card format
      const teamCards = page.locator('.glass-card')
      await expect(teamCards).toHaveCountGreaterThanOrEqual(6)
      
      // Check that team leader has subtle differences (border)
      const leaderCard = page.locator('.glass-card').filter({ hasText: 'Sudanva' })
      await expect(leaderCard).toHaveClass(/border-neon-cyan/)
    })

    test('should display job openings', async ({ page }) => {
      await page.goto('http://localhost:3000/team')
      
      // Scroll to job openings
      await page.locator('text=Open Positions').scrollIntoViewIfNeeded()
      
      // Check for job listings
      await expect(page.locator('text=Senior AI Engineer')).toBeVisible()
      await expect(page.locator('text=Full-Stack Developer')).toBeVisible()
    })
  })

  test.describe('Privacy Policy Page Tests', () => {
    test('should load privacy policy', async ({ page }) => {
      await page.goto('http://localhost:3000/privacy')
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Privacy/)
      await expect(page.locator('h1')).toContainText('Privacy Policy')
      
      // Verify key sections
      await expect(page.locator('text=Information We Collect')).toBeVisible()
      await expect(page.locator('text=How We Use Your Information')).toBeVisible()
      await expect(page.locator('text=Your Rights and Choices')).toBeVisible()
    })

    test('should have proper legal information', async ({ page }) => {
      await page.goto('http://localhost:3000/privacy')
      
      // Check for last updated date
      await expect(page.locator('text=Last Updated:')).toBeVisible()
      
      // Verify contact information
      await expect(page.locator('text=sudanva7@gmail.com')).toBeVisible()
    })
  })

  test.describe('Terms of Service Page Tests', () => {
    test('should load terms of service', async ({ page }) => {
      await page.goto('http://localhost:3000/terms')
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Terms/)
      await expect(page.locator('h1')).toContainText('Terms of Service')
      
      // Verify key sections
      await expect(page.locator('text=Acceptance of Terms')).toBeVisible()
      await expect(page.locator('text=Service Description')).toBeVisible()
      await expect(page.locator('text=User Accounts and Registration')).toBeVisible()
    })

    test('should display important notices', async ({ page }) => {
      await page.goto('http://localhost:3000/terms')
      
      // Check for important notice section
      await expect(page.locator('text=Important Notice')).toBeVisible()
      
      // Verify contact information
      await expect(page.locator('text=sudanva7@gmail.com')).toBeVisible()
    })
  })

  test.describe('Careers Page Tests', () => {
    test('should load careers page with job listings', async ({ page }) => {
      await page.goto('http://localhost:3000/careers')
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Careers/)
      await expect(page.locator('h1')).toContainText('Careers')
      
      // Verify job openings section
      await expect(page.locator('text=Open Positions')).toBeVisible()
      await expect(page.locator('text=Senior AI Engineer')).toBeVisible()
      
      // Check company culture section
      await expect(page.locator('text=Why Work at CareerGuide')).toBeVisible()
    })

    test('should filter jobs by department and location', async ({ page }) => {
      await page.goto('http://localhost:3000/careers')
      
      // Wait for jobs to load
      await page.waitForSelector('.glass-card', { timeout: 10000 })
      
      // Filter by AI Research department
      await page.selectOption('select', 'AI Research')
      await page.waitForTimeout(1000)
      
      // Verify filtering works
      await expect(page.locator('text=Senior AI Engineer')).toBeVisible()
      await expect(page.locator('text=Data Scientist')).toBeVisible()
    })

    test('should show job application buttons', async ({ page }) => {
      await page.goto('http://localhost:3000/careers')
      
      // Check for Apply Now buttons
      const applyButtons = page.locator('button:has-text("Apply Now")')
      await expect(applyButtons).toHaveCount({ min: 1 })
      
      // Verify application process section
      await expect(page.locator('text=Application Process')).toBeVisible()
    })

    test('should display company perks and benefits', async ({ page }) => {
      await page.goto('http://localhost:3000/careers')
      
      // Check perks section
      await expect(page.locator('text=Cutting-Edge Technology')).toBeVisible()
      await expect(page.locator('text=Collaborative Culture')).toBeVisible()
      await expect(page.locator('text=Growth Opportunities')).toBeVisible()
    })
  })

  test.describe('Navigation and Cross-Page Tests', () => {
    test('should navigate between all new pages', async ({ page }) => {
      // Start from homepage
      await page.goto('http://localhost:3000')
      
      // Navigate to blog
      await page.click('text=Blog')
      await expect(page.locator('h1')).toContainText('Career Insights')
      
      // Navigate to API docs
      await page.goto('http://localhost:3000/api')
      await expect(page.locator('h1')).toContainText('API Documentation')
      
      // Navigate to contact
      await page.goto('http://localhost:3000/contact')
      await expect(page.locator('h1')).toContainText('Contact Us')
      
      // Navigate to about
      await page.goto('http://localhost:3000/about')
      await expect(page.locator('h1')).toContainText('About CareerGuide')
      
      // Navigate to team
      await page.goto('http://localhost:3000/team')
      await expect(page.locator('h1')).toContainText('Our Team')
      
      // Navigate to careers
      await page.goto('http://localhost:3000/careers')
      await expect(page.locator('h1')).toContainText('Careers')
    })

    test('should have consistent branding across pages', async ({ page }) => {
      const pages = ['/blog', '/api', '/contact', '/about', '/team', '/careers', '/privacy', '/terms']
      
      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`)
        
        // Check for consistent design elements
        await expect(page.locator('.glass-card').first()).toBeVisible()
        
        // Verify gradient text elements
        const gradientText = page.locator('.bg-gradient-to-r')
        if (await gradientText.count() > 0) {
          await expect(gradientText.first()).toBeVisible()
        }
      }
    })

    test('should be responsive across all new pages', async ({ page }) => {
      const pages = ['/blog', '/api', '/contact', '/about', '/team', '/careers']
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1200, height: 800 }   // Desktop
      ]
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        
        for (const pagePath of pages) {
          await page.goto(`http://localhost:3000${pagePath}`)
          
          // Check that main heading is visible
          await expect(page.locator('h1').first()).toBeVisible()
          
          // Ensure no horizontal overflow
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
          const viewportWidth = viewport.width
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20) // 20px tolerance
        }
      }
    })

    test('should load all pages without console errors', async ({ page }) => {
      const consoleErrors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      const pages = ['/blog', '/api', '/contact', '/about', '/team', '/careers', '/privacy', '/terms']
      
      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`)
        await page.waitForLoadState('networkidle')
        
        // Wait a bit for any potential delayed errors
        await page.waitForTimeout(2000)
      }
      
      // Filter out known acceptable errors (like network errors in dev mode)
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('_next/static') &&
        !error.includes('net::ERR_')
      )
      
      expect(criticalErrors).toEqual([])
    })
  })

  test.describe('Performance and Accessibility Tests', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const pages = ['/blog', '/api', '/contact', '/about', '/team', '/careers']
      
      for (const pagePath of pages) {
        const startTime = Date.now()
        await page.goto(`http://localhost:3000${pagePath}`)
        await page.waitForLoadState('networkidle')
        const loadTime = Date.now() - startTime
        
        // Expect page to load within 10 seconds
        expect(loadTime).toBeLessThan(10000)
      }
    })

    test('should have accessible elements', async ({ page }) => {
      await page.goto('http://localhost:3000/contact')
      
      // Check form accessibility
      const nameInput = page.locator('input[name="name"]')
      await expect(nameInput).toBeVisible()
      
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible()
      
      // Check heading hierarchy
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('h2')).toBeVisible()
    })
  })
})