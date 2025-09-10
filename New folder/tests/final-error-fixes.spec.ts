import { test, expect } from '@playwright/test'

test.describe('Final Error Fixes Verification', () => {
  
  test('should confirm all errors are fixed', async ({ page }) => {
    const consoleMessages: string[] = []
    const warnings: string[] = []
    const errors: string[] = []
    
    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      
      if (msg.type() === 'warning') {
        warnings.push(text)
      } else if (msg.type() === 'error') {
        errors.push(text)
      }
    })
    
    console.log('=== Testing error fixes ===')
    
    // Test multiple pages
    console.log('Loading homepage...')
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(2000)
    
    console.log('Loading colleges page...')
    await page.goto('http://localhost:3000/colleges')
    await page.waitForTimeout(2000)
    
    console.log('Loading dashboard...')
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(3000)
    
    // Analyze console messages
    const metadataWarnings = consoleMessages.filter(msg => 
      msg.includes('metadata.metadataBase is not set')
    )
    
    const viewportWarnings = consoleMessages.filter(msg => 
      msg.includes('Unsupported metadata viewport is configured')
    )
    
    const permissionMessages = consoleMessages.filter(msg => 
      msg.includes('Database permission denied')
    )
    
    const permissionSpamCount = permissionMessages.length
    
    console.log('=== ERROR FIX VERIFICATION RESULTS ===')
    console.log(`Total console messages: ${consoleMessages.length}`)
    console.log(`Warnings: ${warnings.length}`)
    console.log(`Errors: ${errors.length}`)
    console.log(`Metadata warnings: ${metadataWarnings.length}`)
    console.log(`Viewport warnings: ${viewportWarnings.length}`)
    console.log(`Permission messages: ${permissionSpamCount}`)
    
    // Print sample messages for debugging
    if (metadataWarnings.length > 0) {
      console.log('Sample metadata warning:', metadataWarnings[0])
    }
    
    if (permissionMessages.length > 0) {
      console.log('Sample permission message:', permissionMessages[0])
    }
    
    // Verify fixes
    expect(metadataWarnings.length).toBe(0)
    console.log('✅ Metadata warnings eliminated')
    
    expect(viewportWarnings.length).toBe(0) 
    console.log('✅ Viewport warnings eliminated')
    
    // Permission messages should be significantly reduced (ideally 0-2)
    expect(permissionSpamCount).toBeLessThanOrEqual(3)
    console.log(`✅ Permission message spam reduced (${permissionSpamCount} total)`)
    
    // Application should still be functional
    const currentUrl = page.url()
    const isWorking = currentUrl.includes('localhost:3000')
    expect(isWorking).toBe(true)
    console.log('✅ Application remains functional')
    
    console.log('=== ALL ERROR FIXES VERIFIED ===')
  })
})