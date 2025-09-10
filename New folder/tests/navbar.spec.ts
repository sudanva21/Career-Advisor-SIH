import { test, expect } from '@playwright/test'

test.describe('Navbar Features Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display Features dropdown on desktop', async ({ page }) => {
    // Skip on mobile
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Find Features dropdown button
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await expect(featuresBtn).toBeVisible()

    // Click Features dropdown
    await featuresBtn.click()

    // Check dropdown is visible
    const dropdown = page.locator('[role="menu"][aria-label="Features menu"]')
    await expect(dropdown).toBeVisible()

    // Check all expected features are present
    await expect(page.getByRole('menuitem', { name: /Career Quiz/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /College Finder/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /AI Roadmap/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Profile Dashboard/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /3D Career Tree/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Learning Resources/ })).toBeVisible()
  })

  test('should handle keyboard navigation in Features dropdown', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Focus on Features button
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.focus()

    // Press Enter to open dropdown
    await page.keyboard.press('Enter')

    // Check dropdown opened
    const dropdown = page.locator('[role="menu"][aria-label="Features menu"]')
    await expect(dropdown).toBeVisible()

    // Press Escape to close dropdown
    await page.keyboard.press('Escape')
    await expect(dropdown).not.toBeVisible()
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Open dropdown
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.click()

    const dropdown = page.locator('[role="menu"][aria-label="Features menu"]')
    await expect(dropdown).toBeVisible()

    // Click outside dropdown
    await page.click('body', { position: { x: 100, y: 100 } })
    
    // Dropdown should close
    await expect(dropdown).not.toBeVisible()
  })

  test('should navigate to features from dropdown', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Open dropdown
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.click()

    // Click on College Finder (public feature)
    await page.getByRole('menuitem', { name: /College Finder/ }).click()

    // Should navigate to colleges page
    await expect(page).toHaveURL('/colleges')
  })

  test('should show sign-in required for protected features', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Open dropdown
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.click()

    // Check that protected features show "Sign in required"
    const roadmapFeature = page.getByRole('menuitem', { name: /AI Roadmap/ })
    await expect(roadmapFeature).toContainText('Sign in required')

    // Click protected feature should redirect to signin
    await roadmapFeature.click()
    await expect(page).toHaveURL(/\/auth\/signin\?next=/)
  })

  test('should display Features dropdown in mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Open mobile menu
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first()
    await hamburgerBtn.click()

    // Find Features dropdown in mobile menu
    const mobileFeatures = page.locator('[aria-expanded]').filter({ hasText: 'Features' }).first()
    await expect(mobileFeatures).toBeVisible()

    // Click to expand mobile features
    await mobileFeatures.click()

    // Check mobile features menu
    const mobileMenu = page.locator('[role="menu"][aria-label="Mobile features menu"]')
    await expect(mobileMenu).toBeVisible()

    // Check features are visible
    await expect(page.getByRole('menuitem', { name: /Career Quiz/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /College Finder/ })).toBeVisible()
  })

  test('should show Dashboard link only for authenticated users', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Dashboard link should not be visible for unauthenticated users
    const dashboardLink = page.locator('a[href="/dashboard"]:has-text("Dashboard")')
    await expect(dashboardLink).not.toBeVisible()
  })
})

test.describe('Navbar Authentication State', () => {
  test('should show sign-in and get-started buttons when not authenticated', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Should show Sign In link
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    
    // Should show Get Started button
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible()
  })

  test('should handle smooth scrolling for anchor links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Click Home to scroll to top
    await page.getByRole('button', { name: 'Home' }).click()

    // Wait for scroll animation
    await page.waitForTimeout(1000)

    // Should be at top of page
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  })
})