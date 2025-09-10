import { test, expect } from '@playwright/test';

test.describe('Troika Three Text Fix', () => {
  test('should load home page without troika-three-text errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });

    // Navigate to home page with a shorter timeout
    await page.goto('/', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait a bit for any potential troika errors to surface
    await page.waitForTimeout(2000);
    
    // Check that the page loaded successfully
    await expect(page).toHaveTitle(/Career Advisor/);
    
    // Filter out known acceptable warnings and check for troika errors
    const troikaErrors = errors.filter(error => 
      error.toLowerCase().includes('troika') ||
      error.toLowerCase().includes('glyphids') ||
      error.toLowerCase().includes('cannot destructure')
    );
    
    // Log all errors for debugging
    console.log('All console errors:', errors);
    console.log('Troika-specific errors:', troikaErrors);
    
    // Assert no troika-related errors occurred
    expect(troikaErrors).toHaveLength(0);
  });
  
  test('should render 3D text components without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for 3D components to potentially render
    await page.waitForTimeout(3000);
    
    // Check that basic page elements are present
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    
    // Verify no critical errors occurred
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('THREE.WebGLRenderer') &&
      !error.includes('Deprecated')
    );
    
    console.log('Critical errors:', criticalErrors);
    expect(criticalErrors).toHaveLength(0);
  });
});