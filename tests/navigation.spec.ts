import { test, expect } from '@playwright/test';

test.describe('Career Advisor Platform - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate using desktop menu items', async ({ page }) => {
    // Skip this test on mobile viewports
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      test.skip();
    }

    // Test navigation to Features section
    await page.getByRole('button', { name: 'Features' }).click();
    
    // Should scroll to features section
    await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeInViewport();
    
    // Test navigation back to Home
    await page.getByRole('button', { name: 'Home' }).click();
    
    // Should scroll to top (hero section)
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeInViewport();
  });

  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be hidden initially
    const mobileMenuItems = page.locator('nav').getByRole('button', { name: 'Home' });
    await expect(mobileMenuItems).not.toBeVisible();
    
    // Find and click hamburger menu button
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first();
    await hamburgerBtn.click();
    
    // Mobile menu should now be visible
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Colleges' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Careers' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Contact' })).toBeVisible();
  });

  test('should navigate using mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first();
    await hamburgerBtn.click();
    
    // Click Features in mobile menu
    await page.getByRole('navigation').getByRole('button', { name: 'Features' }).click();
    
    // Should navigate to features section
    await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeInViewport();
    
    // Mobile menu should close after navigation
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).not.toBeVisible();
  });

  test('should close mobile menu when clicking outside', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first();
    await hamburgerBtn.click();
    
    // Verify menu is open
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).toBeVisible();
    
    // Click outside the menu (on main content)
    await page.getByRole('main').click({ position: { x: 100, y: 200 } });
    
    // Menu should close
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).not.toBeVisible();
  });

  test('should handle logo click navigation', async ({ page }) => {
    // Scroll down first
    await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();
    
    // Click logo to navigate to home
    await page.getByText('CareerGuide').first().click();
    
    // Should scroll to top
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeInViewport();
  });

  test('should show navbar background on scroll', async ({ page }) => {
    // Initially navbar should be transparent
    const navbar = page.getByRole('navigation');
    
    // Scroll down to trigger navbar background
    await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();
    
    // Wait for scroll effect to apply
    await page.waitForTimeout(300);
    
    // Navbar should still be visible (can't easily test background change without visual comparison)
    await expect(navbar).toBeVisible();
  });

  test('should handle scroll to top button', async ({ page }) => {
    // Scroll to footer
    await page.getByText('© 2025 CareerGuide').scrollIntoViewIfNeeded();
    
    // Click scroll to top button
    await page.getByRole('button', { name: 'Scroll to top' }).click();
    
    // Should scroll to top
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeInViewport();
  });

  test('should handle footer navigation links', async ({ page }) => {
    // Scroll to footer
    await page.getByText('© 2025 CareerGuide').scrollIntoViewIfNeeded();
    
    // Test footer navigation
    await page.getByRole('button', { name: 'Features' }).nth(1).click(); // Second Features button in footer
    
    // Should navigate to features section
    await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeInViewport();
  });
});