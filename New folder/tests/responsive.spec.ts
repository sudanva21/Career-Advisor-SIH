import { test, expect } from '@playwright/test';

test.describe('Career Advisor Platform - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should render correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      // Core elements should be visible on all screen sizes
      await expect(page.getByRole('link', { name: 'CA Career Advisor' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start Your Quiz' })).toBeVisible();
      
      // Features section should be accessible
      await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();
      await expect(page.getByRole('heading', { name: 'Powerful Features for Your Future', level: 2 })).toBeVisible();

      // Footer should be accessible
      await page.getByText('© 2025 CareerGuide').scrollIntoViewIfNeeded();
      await expect(page.getByText('© 2025 CareerGuide')).toBeVisible();
    });
  });

  test('should show desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Desktop menu items should be visible
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quiz' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Colleges' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show hamburger menu on mobile screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Desktop menu items should be hidden
    const homeBtn = page.getByRole('navigation').getByRole('button', { name: 'Home' });
    await expect(homeBtn).not.toBeVisible();

    // Hamburger button should be visible
    const hamburgerBtn = page.getByRole('navigation').getByRole('button').first();
    await expect(hamburgerBtn).toBeVisible();
  });

  test('should stack feature cards vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Navigate to features section
    await page.getByText('Powerful Features for Your Future').scrollIntoViewIfNeeded();

    // All feature cards should be visible (stacked vertically)
    await expect(page.getByRole('heading', { name: '3D Career Tree', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'College Finder', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Timeline Tracker', level: 3 })).toBeVisible();

    // Check that cards are displayed in mobile-friendly layout
    const careerTreeCard = page.getByRole('heading', { name: '3D Career Tree', level: 3 });
    const careerTreeBoundingBox = await careerTreeCard.boundingBox();
    
    if (careerTreeBoundingBox) {
      // Card should take most of the screen width on mobile
      expect(careerTreeBoundingBox.width).toBeGreaterThan(200);
    }
  });

  test('should handle footer layout on different screen sizes', async ({ page }) => {
    const testFooterLayout = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      
      // Scroll to footer
      await page.getByText('© 2025 CareerGuide').scrollIntoViewIfNeeded();

      // Footer sections should be visible
      await expect(page.getByRole('heading', { name: 'Product', level: 3 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Company', level: 3 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Resources', level: 3 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Legal', level: 3 })).toBeVisible();

      // Email subscription should be visible
      await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
    };

    // Test on mobile
    await testFooterLayout(375, 667);
    
    // Test on tablet
    await testFooterLayout(768, 1024);
    
    // Test on desktop
    await testFooterLayout(1920, 1080);
  });

  test('should handle text scaling and readability', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main heading should be readable on mobile
    const mainHeading = page.getByRole('heading', { name: 'Your Personalized Career & College Guide', level: 1 });
    await expect(mainHeading).toBeVisible();
    
    const headingBoundingBox = await mainHeading.boundingBox();
    if (headingBoundingBox) {
      // Text should not be too small on mobile
      expect(headingBoundingBox.height).toBeGreaterThan(30);
    }

    // Subheading should be readable
    const subheading = page.getByText('Discover your path with AI-powered quizzes');
    await expect(subheading).toBeVisible();
  });

  test('should handle button sizes on touch devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // CTA buttons should be touch-friendly (minimum 44px height recommended)
    const startQuizBtn = page.getByRole('button', { name: 'Start Your Quiz' });
    const learnMoreBtn = page.getByRole('button', { name: 'Learn How It Works' });

    await expect(startQuizBtn).toBeVisible();
    await expect(learnMoreBtn).toBeVisible();

    const startQuizBoundingBox = await startQuizBtn.boundingBox();
    const learnMoreBoundingBox = await learnMoreBtn.boundingBox();

    if (startQuizBoundingBox && learnMoreBoundingBox) {
      // Buttons should be large enough for touch interaction
      expect(startQuizBoundingBox.height).toBeGreaterThan(40);
      expect(learnMoreBoundingBox.height).toBeGreaterThan(40);
    }
  });
});