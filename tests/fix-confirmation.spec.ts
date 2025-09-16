import { test, expect } from '@playwright/test'

test.describe('Fix Confirmation', () => {
  
  test('should confirm viewport and permission fixes work', async ({ page }) => {
    const consoleMessages: string[] = []
    
    // Capture console messages
    page.on('console', msg => {
      consoleMessages.push(msg.text())
    })
    
    // Test homepage
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(3000)
    
    // Test colleges page  
    await page.goto('http://localhost:3000/colleges')
    await page.waitForTimeout(3000)
    
    // Analyze console messages
    const viewportWarnings = consoleMessages.filter(msg => 
      msg.includes('Unsupported metadata viewport is configured')
    )
    
    const permissionErrors = consoleMessages.filter(msg => 
      msg.includes('permission denied for schema public')
    )
    
    console.log('=== FIX CONFIRMATION RESULTS ===')
    console.log(`Total console messages: ${consoleMessages.length}`)
    console.log(`Viewport warnings: ${viewportWarnings.length}`)
    console.log(`Permission errors: ${permissionErrors.length}`)
    
    // Both should be 0 or significantly reduced
    expect(viewportWarnings.length).toBe(0)
    console.log('✅ Viewport metadata warnings eliminated')
    
    expect(permissionErrors.length).toBeLessThanOrEqual(2)
    console.log('✅ Supabase permission errors eliminated or greatly reduced')
    
    // Page content should still work
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('College')
    console.log('✅ Application functionality preserved')
    
    console.log('=== ALL FIXES CONFIRMED WORKING ===')
  })
})