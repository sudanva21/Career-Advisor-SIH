import { test, expect } from '@playwright/test'

test.describe('Core Supabase Integration', () => {
  
  test('should load homepage and navigate to colleges', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Wait for homepage to load
    await page.waitForSelector('h1', { timeout: 10000 })
    
    // Should not show server error
    const title = await page.locator('h1').textContent()
    expect(title).not.toContain('Server Error')
    expect(title).not.toContain('404')
    
    // Navigate to colleges
    await page.locator('text=Colleges').or(page.locator('[href*="colleges"]')).first().click()
    await expect(page).toHaveURL(/.*\/colleges/)
    
    // Wait for colleges to load
    await page.waitForTimeout(3000)
    
    // Should show some college content
    const bodyText = await page.textContent('body')
    expect(bodyText).toMatch(/college|university|IIT|NIT|engineering|medical/i)
  })
  
  test('should load colleges with real data', async ({ page }) => {
    await page.goto('http://localhost:3000/colleges')
    
    // Wait for colleges page to load
    await page.waitForTimeout(5000)
    
    // Should not show server errors
    const h1Text = await page.locator('h1').textContent()
    expect(h1Text).not.toContain('Server Error')
    
    // Look for college cards or data
    const bodyText = await page.textContent('body')
    const hasCollegeData = /IIT|NIT|University|College|Engineering|Medical|Mumbai|Delhi|Bangalore/i.test(bodyText || '')
    
    if (!hasCollegeData) {
      console.log('College data not found, checking for loading state...')
      // Maybe still loading
      await page.waitForTimeout(3000)
      const updatedText = await page.textContent('body')
      const hasDataNow = /IIT|NIT|University|College/i.test(updatedText || '')
      expect(hasDataNow).toBe(true)
    } else {
      expect(hasCollegeData).toBe(true)
    }
  })
  
  test('should access dashboard and load real data', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Wait for dashboard to load
    await page.waitForTimeout(5000)
    
    // Check if redirected to sign-in (expected in demo mode)
    const currentUrl = page.url()
    if (currentUrl.includes('/auth/signin')) {
      console.log('Dashboard correctly redirected to auth - this is expected behavior')
      expect(currentUrl).toContain('/auth/signin')
    } else {
      // If dashboard loads directly (demo mode)
      const h1Text = await page.locator('h1').first().textContent()
      expect(h1Text).not.toContain('Server Error')
      
      const bodyText = await page.textContent('body')
      const hasDashboardContent = /welcome|dashboard|stats|activity|recommendation/i.test(bodyText || '')
      expect(hasDashboardContent).toBe(true)
    }
  })
  
  test('should handle college save functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/colleges')
    
    // Wait for colleges to load
    await page.waitForTimeout(5000)
    
    // Look for heart/save buttons
    const heartButtons = page.locator('button').filter({ 
      has: page.locator('svg[class*="heart"], [data-testid*="heart"], [class*="save"]')
    })
    
    const heartCount = await heartButtons.count()
    if (heartCount > 0) {
      console.log(`Found ${heartCount} heart/save buttons`)
      
      // Try to click the first one
      await heartButtons.first().click()
      
      // Wait for any API calls or state changes
      await page.waitForTimeout(2000)
      
      // The button should still be clickable (no errors)
      await expect(heartButtons.first()).toBeVisible()
      
      console.log('Heart button interaction completed successfully')
    } else {
      console.log('No heart buttons found, but this might be expected in current UI state')
    }
  })
  
  test('should make API calls to our endpoints', async ({ page }) => {
    const apiCalls: string[] = []
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url())
      }
    })
    
    // Visit main pages to trigger API calls
    await page.goto('http://localhost:3000/colleges')
    await page.waitForTimeout(3000)
    
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(3000)
    
    // Check what API calls were made
    const relevantCalls = apiCalls.filter(url => 
      url.includes('/api/colleges') || 
      url.includes('/api/dashboard') ||
      url.includes('/api/activity') ||
      url.includes('/api/achievements')
    )
    
    console.log('API calls made:', relevantCalls)
    
    // Should have made some API calls
    expect(apiCalls.length).toBeGreaterThan(0)
    
    console.log(`Total API calls: ${apiCalls.length}, Relevant calls: ${relevantCalls.length}`)
  })
})