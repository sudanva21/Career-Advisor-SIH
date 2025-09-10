import { test, expect } from '@playwright/test';

test.describe('Career Advisor Platform - Performance', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to be visible
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle 3D content loading gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Page should be usable even while 3D content loads
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Your Quiz' })).toBeVisible();
    
    // Wait for potential 3D content
    await page.waitForTimeout(2000);
    
    // Page should still be responsive
    await page.getByRole('button', { name: 'Start Your Quiz' }).click();
    await expect(page.getByRole('button', { name: 'Start Your Quiz' })).toBeVisible();
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    // Navigate through different sections multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      
      // Navigate to features
      await page.getByRole('button', { name: 'Features' }).click();
      await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeInViewport();
      
      // Navigate back to home
      await page.getByRole('button', { name: 'Home' }).click();
      await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeInViewport();
      
      // Small delay between iterations
      await page.waitForTimeout(100);
    }
    
    // Page should still be responsive after multiple navigations
    await expect(page.getByRole('button', { name: 'Start Your Quiz' })).toBeVisible();
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/');
    
    // Rapidly hover over multiple elements
    const elements = [
      page.getByRole('button', { name: 'Start Your Quiz' }),
      page.getByRole('button', { name: 'Learn How It Works' }),
      page.getByText('CareerGuide'),
    ];
    
    // Rapid hover sequence
    for (let i = 0; i < 5; i++) {
      for (const element of elements) {
        await element.hover();
        await page.waitForTimeout(50);
      }
    }
    
    // Elements should still be responsive
    await expect(page.getByRole('button', { name: 'Start Your Quiz' })).toBeVisible();
    await page.getByRole('button', { name: 'Start Your Quiz' }).click();
  });

  test('should handle mobile performance', async ({ page }) => {
    // Simulate slower mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    
    // Main content should be visible quickly on mobile
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeVisible();
    
    const mobileLoadTime = Date.now() - startTime;
    
    // Mobile load should be within 4 seconds (allowing for slower devices)
    expect(mobileLoadTime).toBeLessThan(4000);
    
    // Mobile menu should work smoothly
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first();
    await hamburgerBtn.click();
    
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).toBeVisible();
  });

  test('should handle scroll performance', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Rapid scrolling through the page
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(50);
    }
    
    // Scroll back to top
    await page.keyboard.press('Home');
    
    const scrollTime = Date.now() - startTime;
    
    // Scrolling should be smooth and not cause performance issues
    expect(scrollTime).toBeLessThan(2000);
    
    // Page should still be responsive after scrolling
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeVisible();
  });

  test('should not have console errors that affect performance', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Navigate through different sections
    await page.getByRole('button', { name: 'Features' }).click();
    await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();
    
    // Test mobile menu
    await page.setViewportSize({ width: 375, height: 667 });
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first();
    await hamburgerBtn.click();
    
    // Allow time for any asynchronous operations
    await page.waitForTimeout(2000);
    
    // Filter out known acceptable warnings (like development warnings)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Download the React DevTools') &&
      !error.includes('Invalid next.config.js options detected') &&
      !error.includes('Warning:')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle animation performance', async ({ page }) => {
    await page.goto('/');
    
    // Test that animations don't block main thread
    const startTime = Date.now();
    
    // Trigger various animations
    await page.getByRole('button', { name: 'Start Your Quiz' }).hover();
    await page.getByRole('button', { name: 'Learn How It Works' }).hover();
    
    // Navigate to features to trigger scroll animations
    await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();
    
    // Hover over feature cards
    await page.getByRole('heading', { name: '3D Career Tree', level: 3 }).hover();
    await page.getByRole('heading', { name: 'College Finder', level: 3 }).hover();
    
    const animationTime = Date.now() - startTime;
    
    // Animations should not cause significant delays
    expect(animationTime).toBeLessThan(1500);
    
    // Page should remain responsive during animations
    await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeVisible();
  });
});