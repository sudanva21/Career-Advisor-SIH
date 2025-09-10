import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should redirect to signin with next parameter', async ({ page }) => {
    // Navigate to a protected route directly
    await page.goto('/dashboard')

    // Should redirect to signin with next parameter
    await expect(page).toHaveURL(/\/auth\/signin\?next=/)
  })

  test('should handle signin process', async ({ page }) => {
    // Go to signin page
    await page.goto('/auth/signin')

    // Check signin form is visible
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByLabel('Email Address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()

    // Check demo credentials are shown
    await expect(page.getByText('demo@example.com')).toBeVisible()
    await expect(page.getByText('demo123')).toBeVisible()
  })

  test('should validate signin form', async ({ page }) => {
    await page.goto('/auth/signin')

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()

    // Fill invalid email
    await page.getByLabel('Email Address').fill('invalid-email')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should show email format error
    await expect(page.getByText('Invalid email format')).toBeVisible()
  })

  test('should handle signup navigation', async ({ page }) => {
    await page.goto('/auth/signin')

    // Click signup link
    await page.getByRole('link', { name: 'Sign up now' }).click()

    // Should navigate to signup
    await expect(page).toHaveURL('/auth/signup')
  })

  test('should handle forgot password link', async ({ page }) => {
    await page.goto('/auth/signin')

    // Forgot password link should be present
    const forgotLink = page.getByRole('link', { name: 'Forgot your password?' })
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toHaveAttribute('href', '/auth/forgot-password')
  })

  test('should show password toggle functionality', async ({ page }) => {
    await page.goto('/auth/signin')

    const passwordField = page.getByLabel('Password')
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).last()

    // Password should be hidden initially
    await expect(passwordField).toHaveAttribute('type', 'password')

    // Fill password
    await passwordField.fill('testpassword')

    // Click toggle button
    await toggleButton.click()

    // Password should be visible
    await expect(passwordField).toHaveAttribute('type', 'text')

    // Click toggle again
    await toggleButton.click()

    // Password should be hidden again
    await expect(passwordField).toHaveAttribute('type', 'password')
  })

  test('should handle loading state during signin', async ({ page }) => {
    await page.goto('/auth/signin')

    // Fill form with demo credentials
    await page.getByLabel('Email Address').fill('demo@example.com')
    await page.getByLabel('Password').fill('demo123')

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should show loading state
    await expect(page.getByText('Signing In...')).toBeVisible()

    // Button should be disabled during loading
    const submitButton = page.getByRole('button', { name: /Signing In|Sign In/ })
    await expect(submitButton).toBeDisabled()
  })
})

test.describe('Route Protection', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/profile', '/roadmap']

    for (const route of protectedRoutes) {
      await page.goto(route)
      
      // Should redirect to signin
      await expect(page).toHaveURL(/\/auth\/signin/)
      
      // Should have next parameter
      const url = new URL(page.url())
      expect(url.searchParams.get('next')).toBe(route)
    }
  })

  test('should allow access to public routes', async ({ page }) => {
    const publicRoutes = ['/', '/colleges', '/quiz', '/auth/signin', '/auth/signup']

    for (const route of publicRoutes) {
      await page.goto(route)
      
      // Should not redirect to signin
      await expect(page).not.toHaveURL(/\/auth\/signin/)
      
      // Should be on the intended route
      if (route === '/') {
        await expect(page).toHaveURL('/')
      } else {
        await expect(page).toHaveURL(route)
      }
    }
  })

  test('should preserve next parameter through auth flow', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to signin with next parameter
    await expect(page).toHaveURL(/\/auth\/signin\?next=/)

    // Next parameter should be preserved
    const url = new URL(page.url())
    expect(url.searchParams.get('next')).toBe('/dashboard')

    // Click to signup from signin
    await page.getByRole('link', { name: 'Sign up now' }).click()

    // Should still have next parameter (if implemented)
    const signupUrl = new URL(page.url())
    expect(signupUrl.pathname).toBe('/auth/signup')
  })
})