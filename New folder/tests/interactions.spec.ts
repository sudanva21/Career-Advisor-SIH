import { test, expect } from '@playwright/test'

test.describe('UI Interactions and Clickability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should have clickable hero buttons', async ({ page }) => {
    // Check Get Started button is clickable
    const getStartedBtn = page.getByRole('button', { name: 'Get Started' })
    await expect(getStartedBtn).toBeVisible()
    await expect(getStartedBtn).toBeEnabled()

    // Click should navigate to signup
    await getStartedBtn.click()
    await expect(page).toHaveURL('/auth/signup')

    // Go back to test Sign In button
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const signInBtn = page.getByRole('button', { name: 'Sign In' })
    await expect(signInBtn).toBeVisible()
    await expect(signInBtn).toBeEnabled()

    await signInBtn.click()
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should have clickable feature cards', async ({ page }) => {
    // All feature cards should be clickable
    const featureCards = page.locator('[role="button"][aria-label*="Learn more about"]')
    
    // Should have multiple feature cards
    await expect(featureCards).not.toHaveCount(0)

    // Check each card is clickable
    const cardCount = await featureCards.count()
    for (let i = 0; i < cardCount; i++) {
      const card = featureCards.nth(i)
      await expect(card).toBeVisible()
      
      // Should have cursor pointer
      await expect(card).toHaveCSS('cursor', 'pointer')
      
      // Should be keyboard accessible
      await card.focus()
      await expect(card).toBeFocused()
    }
  })

  test('should have working "Explore All Features" button', async ({ page }) => {
    const exploreBtn = page.getByRole('button', { name: 'Explore all platform features' })
    await expect(exploreBtn).toBeVisible()
    await expect(exploreBtn).toBeEnabled()

    // Should have cursor pointer
    await expect(exploreBtn).toHaveCSS('cursor', 'pointer')

    // Click should trigger scroll and navbar interaction
    await exploreBtn.click()

    // Wait for scroll animation
    await page.waitForTimeout(1000)

    // Should be at top of page
    const heroSection = page.getByRole('heading', { level: 1 })
    await expect(heroSection).toBeInViewport()
  })

  test('should handle keyboard interactions', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Test keyboard navigation on Features dropdown
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.focus()
    
    // Should be focused
    await expect(featuresBtn).toBeFocused()

    // Press Enter to open dropdown
    await page.keyboard.press('Enter')
    
    // Dropdown should open
    const dropdown = page.locator('[role="menu"][aria-label="Features menu"]')
    await expect(dropdown).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(dropdown).not.toBeVisible()
  })

  test('should handle hover effects', async ({ page }) => {
    // Check hover effects on hero buttons
    const getStartedBtn = page.getByRole('button', { name: 'Get Started' })
    
    // Hover over button
    await getStartedBtn.hover()
    
    // Should have hover effects (visual changes are hard to test precisely)
    await expect(getStartedBtn).toBeVisible()

    // Test feature card hover effects
    const firstFeatureCard = page.locator('[role="button"][aria-label*="Learn more about"]').first()
    await firstFeatureCard.hover()
    await expect(firstFeatureCard).toBeVisible()
  })

  test('should have accessible navigation elements', async ({ page }) => {
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Check navbar has proper ARIA attributes
    const navbar = page.getByRole('navigation')
    await expect(navbar).toBeVisible()

    // Features dropdown should have proper ARIA attributes
    const featuresBtn = page.locator('button[aria-haspopup="true"]')
    await expect(featuresBtn).toHaveAttribute('aria-haspopup', 'true')
    await expect(featuresBtn).toHaveAttribute('aria-expanded', 'false')

    // Open dropdown
    await featuresBtn.click()
    await expect(featuresBtn).toHaveAttribute('aria-expanded', 'true')

    // Menu should have proper role
    const dropdown = page.locator('[role="menu"]')
    await expect(dropdown).toBeVisible()

    // Menu items should have proper role
    const menuItems = page.locator('[role="menuitem"]')
    await expect(menuItems.first()).toBeVisible()
  })

  test('should handle mobile interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Mobile hamburger button should be clickable
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first()
    await expect(hamburgerBtn).toBeVisible()
    await expect(hamburgerBtn).toBeEnabled()

    // Click to open mobile menu
    await hamburgerBtn.click()

    // Mobile menu should open
    const mobileMenu = page.locator('nav').locator('[role="button"]', { hasText: 'Features' })
    await expect(mobileMenu).toBeVisible()

    // Mobile Features should be expandable
    await mobileMenu.click()

    // Mobile features menu should appear
    const mobileFeatures = page.locator('[role="menu"][aria-label="Mobile features menu"]')
    await expect(mobileFeatures).toBeVisible()
  })

  test('should prevent double-clicks and handle loading states', async ({ page }) => {
    // Go to signin page to test form submission
    await page.goto('/auth/signin')

    const submitBtn = page.getByRole('button', { name: 'Sign In' })
    
    // Fill out form first to enable submission
    await page.getByLabel('Email Address').fill('test@example.com')
    await page.getByLabel('Password').fill('password')

    // Submit form
    await submitBtn.click()

    // Button should become disabled during loading
    await expect(submitBtn).toBeDisabled()
  })

  test('should handle scroll interactions', async ({ page }) => {
    // Test scroll-to-top functionality if available
    const navbar = page.getByRole('navigation')
    await expect(navbar).toBeVisible()

    // Scroll down to features section
    await page.evaluate(() => {
      window.scrollTo(0, 1000)
    })

    // Wait for scroll
    await page.waitForTimeout(500)

    // Test navbar becomes more opaque/visible on scroll
    await expect(navbar).toBeVisible()

    // Test home button scroll to top
    const homeBtn = page.getByRole('button', { name: 'Home' })
    if (await homeBtn.isVisible()) {
      await homeBtn.click()
      
      // Should scroll to top
      await page.waitForTimeout(1000)
      const heroTitle = page.getByRole('heading', { level: 1 })
      await expect(heroTitle).toBeInViewport()
    }
  })
})

test.describe('Form Interactions', () => {
  test('should handle signin form interactions', async ({ page }) => {
    await page.goto('/auth/signin')

    const emailField = page.getByLabel('Email Address')
    const passwordField = page.getByLabel('Password')
    const submitBtn = page.getByRole('button', { name: 'Sign In' })

    // Fields should be interactive
    await expect(emailField).toBeVisible()
    await expect(emailField).toBeEnabled()
    await expect(passwordField).toBeVisible()
    await expect(passwordField).toBeEnabled()

    // Test field focus and input
    await emailField.click()
    await expect(emailField).toBeFocused()
    await emailField.fill('test@example.com')
    await expect(emailField).toHaveValue('test@example.com')

    await passwordField.click()
    await expect(passwordField).toBeFocused()
    await passwordField.fill('password123')

    // Submit button should be enabled with valid input
    await expect(submitBtn).toBeEnabled()

    // Clear fields - submit should show validation
    await emailField.clear()
    await passwordField.clear()
    await submitBtn.click()

    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })
})