import { test, expect } from '@playwright/test';

test.describe('Career Advisor Platform - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title and meta information', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('Career Advisor Platform | Your Personalized Career & College Guide');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeVisible();
    
    // Check subheading content
    const subheading = page.getByText('Discover your path with AI-powered quizzes, 3D career maps & nearby government college suggestions');
    await expect(subheading).toBeVisible();
  });

  test('should display navigation with logo and menu items', async ({ page }) => {
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    
    // Check logo - be more specific to avoid conflicts
    await expect(page.getByRole('link', { name: 'CA Career Advisor' })).toBeVisible();
    
    // Check navigation menu items
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quiz' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Colleges' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });

  test('should show hero section with CTA buttons', async ({ page }) => {
    // Check main CTA button
    const startQuizBtn = page.getByRole('button', { name: 'Start Your Quiz' });
    await expect(startQuizBtn).toBeVisible();
    
    // Check secondary CTA button
    const learnMoreBtn = page.getByRole('button', { name: 'Learn How It Works' });
    await expect(learnMoreBtn).toBeVisible();
    
    // Check stats section
    await expect(page.getByText('10K+')).toBeVisible();
    await expect(page.getByText('Students Guided')).toBeVisible();
    await expect(page.getByText('500+')).toBeVisible();
    await expect(page.getByText('Career Paths').first()).toBeVisible();
    await expect(page.getByText('1000+')).toBeVisible();
    await expect(page.getByText('Colleges Listed')).toBeVisible();
  });

  test('should display features section with all feature cards', async ({ page }) => {
    // Scroll to features section and ensure it's well in view
    await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();
    
    // Scroll down a bit more to ensure the button is in view
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(1000); // Wait for scroll to complete
    
    // Check section heading
    await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeVisible();
    
    // Check main feature cards
    await expect(page.getByRole('heading', { name: '3D Career Tree', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'College Finder', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Timeline Tracker', level: 3 })).toBeVisible();
    
    // Check additional feature items
    await expect(page.getByRole('heading', { name: 'AI-Powered Insights', level: 4 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Study Materials', level: 4 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Goal Setting', level: 4 })).toBeVisible();
    
    // Check CTA button - wait longer for animations to complete
    await page.waitForTimeout(3000); // Wait for animations to fully complete
    
    // Try to find the button with different approaches
    const exploreButton = page.getByText('Explore All Features');
    await expect(exploreButton).toBeVisible({ timeout: 10000 });
  });

  test('should display footer with all sections', async ({ page }) => {
    // Scroll to footer
    await page.getByText('© 2025 CareerGuide').scrollIntoViewIfNeeded();
    
    // Check brand section
    await expect(page.getByText('CareerGuide').nth(1)).toBeVisible(); // Second instance in footer
    
    // Check contact information
    await expect(page.getByText('support@careerguide.com')).toBeVisible();
    await expect(page.getByText('+1 (555) 123-4567')).toBeVisible();
    await expect(page.getByText('123 Innovation Drive, Tech City')).toBeVisible();
    
    // Check footer sections
    await expect(page.getByRole('heading', { name: 'Product', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Company', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resources', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Legal', level: 3 })).toBeVisible();
    
    // Check social links
    await expect(page.getByRole('link', { name: 'Facebook' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Twitter' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Instagram' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
    
    // Check newsletter signup
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
    
    // Check scroll to top button
    await expect(page.getByRole('button', { name: 'Scroll to top' })).toBeVisible();
  });

  test('should handle newsletter subscription form', async ({ page }) => {
    // Scroll to footer
    await page.getByText('© 2025 CareerGuide').scrollIntoViewIfNeeded();
    
    const emailInput = page.getByPlaceholder('Enter your email');
    const subscribeBtn = page.getByRole('button', { name: 'Subscribe' });
    
    // Test email input
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Test subscribe button click (should not cause errors)
    await subscribeBtn.click();
    
    // Form should still be visible (since it's not actually submitted)
    await expect(emailInput).toBeVisible();
  });
});