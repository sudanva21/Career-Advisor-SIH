import { test, expect } from '@playwright/test'

test.describe('Quick Subscription System Validation', () => {
  
  test('Should validate core subscription functionality', async ({ page }) => {
    // Test pricing page loads
    await page.goto('http://localhost:3002/pricing/simple')
    await expect(page.getByText('Choose Your Career Plan')).toBeVisible()
    
    // Test all three plans are visible
    await expect(page.getByText('Basic Plan')).toBeVisible()
    await expect(page.getByText('Premium Plan')).toBeVisible()  
    await expect(page.getByText('Elite Plan')).toBeVisible()
    
    // Test pricing is displayed
    await expect(page.getByText('$9.99')).toBeVisible()
    await expect(page.getByText('$19.99')).toBeVisible()
    await expect(page.getByText('$39.99')).toBeVisible()
  })

  test('Should validate subscription API endpoints', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Test subscription status API
    const subscriptionResponse = await page.request.get('/api/subscription')
    expect(subscriptionResponse.status()).toBe(200)
    
    const data = await subscriptionResponse.json()
    expect(data.status.tier).toBe('free')
    expect(data.status.isActive).toBe(false)
  })

  test('Should validate roadmap generator loads', async ({ page }) => {
    await page.goto('http://localhost:3002/roadmap')
    
    await expect(page.getByText('AI Roadmap Generator')).toBeVisible()
    await expect(page.getByText('Create a personalized career learning path with AI')).toBeVisible()
    
    // Career options should be visible
    await expect(page.getByText('Full-Stack Web Developer')).toBeVisible()
    await expect(page.getByText('Data Scientist')).toBeVisible()
  })

  test('Should validate chatbot functionality', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Open chatbot
    await page.getByRole('button', { name: 'Open AI Career Assistant' }).click()
    
    // Verify chatbot opens
    await expect(page.getByText('AI Career Advisor')).toBeVisible()
    await expect(page.getByText('Welcome to Career Advisor!')).toBeVisible()
  })

  test('Should validate payment checkout requires authentication', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Test checkout creation without auth
    const checkoutResponse = await page.request.post('/api/payments/create-checkout', {
      data: {
        tier: 'basic',
        provider: 'stripe',
        billing: 'monthly'
      }
    })
    
    // Should require authentication
    expect(checkoutResponse.status()).toBe(401)
  })

  test('Should validate feature access restrictions', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Test roadmap creation without auth
    const roadmapResponse = await page.request.post('/api/roadmap', {
      data: {
        title: 'Test Roadmap',
        careerGoal: 'Software Developer'
      }
    })
    
    // Should require authentication for roadmap creation
    expect(roadmapResponse.status()).toBe(401)
  })

  test('Should validate admin access control', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Test admin endpoints
    const adminStatsResponse = await page.request.get('/api/admin/stats')
    expect(adminStatsResponse.status()).toBe(401)
    
    const adminSubsResponse = await page.request.get('/api/admin/subscriptions')
    expect(adminSubsResponse.status()).toBe(401)
  })

  test('Should validate responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3002/pricing/simple')
    
    await expect(page.getByText('Choose Your Career Plan')).toBeVisible()
    await expect(page.getByText('Basic Plan')).toBeVisible()
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('Should validate navigation works', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Test navigation to key pages
    await page.getByRole('link', { name: 'Quiz' }).click()
    expect(page.url()).toContain('/quiz')
    
    await page.getByRole('link', { name: 'Colleges' }).click()
    expect(page.url()).toContain('/colleges')
    
    await page.getByRole('link', { name: 'Dashboard' }).click()
    expect(page.url()).toContain('/dashboard')
  })
})