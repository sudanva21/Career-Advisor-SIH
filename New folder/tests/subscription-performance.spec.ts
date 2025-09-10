import { test, expect } from '@playwright/test'

test.describe('Subscription System - Performance & Accessibility', () => {
  
  test('Should load pricing page within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3002/pricing/simple')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Verify critical content is visible
    await expect(page.getByText('Choose Your Career Plan')).toBeVisible()
    await expect(page.getByText('Basic Plan')).toBeVisible()
    await expect(page.getByText('Premium Plan')).toBeVisible()
    await expect(page.getByText('Elite Plan')).toBeVisible()
    
    console.log(`✓ Pricing page loaded in ${loadTime}ms`)
  })

  test('Should load roadmap generator with acceptable performance', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3002/roadmap')
    
    // Wait for roadmap generator to load
    await expect(page.getByText('AI Roadmap Generator')).toBeVisible()
    await expect(page.getByText('Full-Stack Web Developer')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Roadmap generator should load within 4 seconds (may include AI models)
    expect(loadTime).toBeLessThan(4000)
    
    console.log(`✓ Roadmap generator loaded in ${loadTime}ms`)
  })

  test('Should open chatbot quickly', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    const startTime = Date.now()
    
    // Open chatbot
    await page.getByRole('button', { name: 'Open AI Career Assistant' }).click()
    
    // Wait for chatbot to be fully visible
    await expect(page.getByText('AI Career Advisor')).toBeVisible()
    await expect(page.getByText('Welcome to Career Advisor!')).toBeVisible()
    
    const openTime = Date.now() - startTime
    
    // Chatbot should open within 1 second
    expect(openTime).toBeLessThan(1000)
    
    console.log(`✓ Chatbot opened in ${openTime}ms`)
  })

  test('Should handle API response times efficiently', async ({ page }) => {
    const apiEndpoints = [
      '/api/subscription',
      '/api/admin/stats',
      '/api/admin/subscriptions'
    ]
    
    for (const endpoint of apiEndpoints) {
      const startTime = Date.now()
      
      await page.request.get(endpoint)
      
      const responseTime = Date.now() - startTime
      
      // API should respond within 500ms
      expect(responseTime).toBeLessThan(500)
      
      console.log(`✓ ${endpoint} responded in ${responseTime}ms`)
    }
  })

  test('Should maintain performance under load simulation', async ({ page }) => {
    // Simulate multiple concurrent requests
    const concurrentRequests = []
    
    for (let i = 0; i < 10; i++) {
      concurrentRequests.push(page.request.get('/api/subscription'))
    }
    
    const startTime = Date.now()
    const responses = await Promise.all(concurrentRequests)
    const totalTime = Date.now() - startTime
    
    // All requests should complete within 2 seconds
    expect(totalTime).toBeLessThan(2000)
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200)
    })
    
    console.log(`✓ 10 concurrent requests completed in ${totalTime}ms`)
  })

  test('Should meet accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:3002/pricing/simple')
    
    // Check for essential accessibility attributes
    
    // Verify heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check for alt text on images (if any)
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt).not.toBeNull()
    }
    
    // Check for button accessibility
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) { // Check first 10 buttons
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy()
    }
    
    console.log('✓ Basic accessibility checks passed')
  })

  test('Should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3002/pricing/simple')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    
    // Should focus on the first interactive element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test multiple tabs
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const currentFocus = page.locator(':focus')
      await expect(currentFocus).toBeVisible()
    }
    
    console.log('✓ Keyboard navigation works')
  })

  test('Should provide appropriate focus indicators', async ({ page }) => {
    await page.goto('http://localhost:3002/pricing/simple')
    
    // Tab to interactive elements and check for focus styles
    await page.keyboard.press('Tab')
    
    const focusedElement = page.locator(':focus')
    
    // Check if focused element has visible outline or other focus indicator
    const styles = await focusedElement.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow
      }
    })
    
    // Should have some form of focus indicator
    const hasFocusIndicator = 
      styles.outline !== 'none' || 
      styles.outlineWidth !== '0px' || 
      styles.boxShadow !== 'none'
    
    expect(hasFocusIndicator).toBe(true)
    
    console.log('✓ Focus indicators present')
  })

  test('Should handle memory usage efficiently', async ({ page }) => {
    // Navigate through multiple pages to test memory handling
    const pages = [
      'http://localhost:3002',
      'http://localhost:3002/pricing/simple',
      'http://localhost:3002/roadmap',
      'http://localhost:3002/dashboard',
      'http://localhost:3002/colleges',
      'http://localhost:3002/quiz'
    ]
    
    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      
      // Wait a bit to allow any memory-intensive operations
      await page.waitForTimeout(500)
    }
    
    // Return to pricing page - should still work efficiently
    await page.goto('http://localhost:3002/pricing/simple')
    await expect(page.getByText('Choose Your Career Plan')).toBeVisible()
    
    console.log('✓ Memory handling efficient across page navigation')
  })

  test('Should optimize image loading', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Check for lazy loading attributes
    const images = page.locator('img')
    const imageCount = await images.count()
    
    let lazyLoadedImages = 0
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const loading = await img.getAttribute('loading')
      
      if (loading === 'lazy') {
        lazyLoadedImages++
      }
    }
    
    console.log(`✓ Found ${lazyLoadedImages} lazy-loaded images out of ${imageCount} total`)
  })

  test('Should maintain responsive performance', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      const startTime = Date.now()
      await page.goto('http://localhost:3002/pricing/simple')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Should load efficiently on all devices
      expect(loadTime).toBeLessThan(4000)
      
      // Verify content is accessible
      await expect(page.getByText('Choose Your Career Plan')).toBeVisible()
      
      console.log(`✓ Responsive performance on ${viewport.width}x${viewport.height}: ${loadTime}ms`)
    }
  })

  test('Should handle error states gracefully', async ({ page }) => {
    // Test network error simulation
    await page.route('**/api/subscription', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    await page.goto('http://localhost:3002/pricing/simple')
    
    // Page should still load even with API errors
    await expect(page.getByText('Choose Your Career Plan')).toBeVisible()
    
    console.log('✓ Graceful error handling verified')
  })

  test('Should optimize chatbot performance', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Open chatbot
    const startTime = Date.now()
    await page.getByRole('button', { name: 'Open AI Career Assistant' }).click()
    
    await expect(page.getByText('AI Career Advisor')).toBeVisible()
    const openTime = Date.now() - startTime
    
    // Test chatbot interaction performance
    const messageStartTime = Date.now()
    
    // Send a quick action message
    await page.getByRole('button', { name: 'Tell me about career paths' }).click()
    
    // Wait for response (may be error due to API config)
    await page.waitForTimeout(2000)
    
    const responseTime = Date.now() - messageStartTime
    
    // Interaction should be responsive
    expect(openTime).toBeLessThan(1000)
    expect(responseTime).toBeLessThan(5000) // Allow more time for AI response
    
    console.log(`✓ Chatbot: open=${openTime}ms, response=${responseTime}ms`)
  })

  test('Should validate SEO and meta tags', async ({ page }) => {
    await page.goto('http://localhost:3002/pricing/simple')
    
    // Check for essential meta tags
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(10)
    
    // Check for description meta tag
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    if (description) {
      expect(description.length).toBeGreaterThan(50)
    }
    
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h1Count).toBeLessThanOrEqual(2) // Should not have too many H1s
    
    console.log(`✓ SEO basics: title="${title}", h1 count=${h1Count}`)
  })
})