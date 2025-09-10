import { test, expect } from '@playwright/test'

test.describe('Dashboard Protection', () => {
  test('should redirect unauthenticated users to signin', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard')

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Should have next parameter pointing to dashboard
    const url = new URL(page.url())
    expect(url.searchParams.get('next')).toBe('/dashboard')
  })

  test('should handle dashboard navigation from navbar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Dashboard link should not be visible for unauthenticated users
    const dashboardLink = page.locator('a[href="/dashboard"]:has-text("Dashboard")')
    await expect(dashboardLink).not.toBeVisible()
  })

  test('should show loading spinner during auth check', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard')

    // Should show signin page (since unauthenticated)
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Check that signin page loads properly
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  })
})

test.describe('Profile Protection', () => {
  test('should redirect unauthenticated users from profile page', async ({ page }) => {
    await page.goto('/profile')

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Should have next parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('next')).toBe('/profile')
  })

  test('should handle profile navigation from features dropdown', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Open Features dropdown
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.click()

    // Click Profile Dashboard (should require auth)
    await page.getByRole('menuitem', { name: /Profile Dashboard/ }).click()

    // Should redirect to signin with next parameter
    await expect(page).toHaveURL(/\/auth\/signin\?next=/)
    
    const url = new URL(page.url())
    expect(decodeURIComponent(url.searchParams.get('next') || '')).toBe('/profile')
  })
})

test.describe('Roadmap Protection', () => {
  test('should redirect unauthenticated users from roadmap page', async ({ page }) => {
    await page.goto('/roadmap')

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Should have next parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('next')).toBe('/roadmap')
  })

  test('should handle roadmap navigation from features', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Click on 3D Career Tree feature card
    const careerTreeCard = page.locator('[aria-label="Learn more about 3D Career Tree"]')
    await expect(careerTreeCard).toBeVisible()
    await careerTreeCard.click()

    // Should redirect to signin since user is not authenticated
    await expect(page).toHaveURL(/\/auth\/signin/)
    
    // Check next parameter
    const url = new URL(page.url())
    expect(decodeURIComponent(url.searchParams.get('next') || '')).toBe('/roadmap')
  })

  test('should handle AI Roadmap from navbar dropdown', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      test.skip()
    }

    // Open Features dropdown
    const featuresBtn = page.locator('button[aria-haspopup="true"]:has-text("Features")')
    await featuresBtn.click()

    // Click AI Roadmap
    await page.getByRole('menuitem', { name: /AI Roadmap/ }).click()

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})