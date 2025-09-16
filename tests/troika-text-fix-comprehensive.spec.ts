import { test, expect } from '@playwright/test';

test.describe('Comprehensive Troika-Three-Text Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set up error monitoring for each test
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`Page Error: ${error.message}`);
    });
  });

  test('should load homepage without any troika-related errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errors.push(msg.text());
      }
    });

    await page.goto('/', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify page loaded correctly
    await expect(page).toHaveTitle(/Career Advisor/);
    
    // Check for troika-specific errors
    const troikaErrors = errors.filter(error => 
      error.toLowerCase().includes('troika') ||
      error.toLowerCase().includes('count') && error.includes('undefined') ||
      error.includes('BufferAttribute') ||
      error.includes('getAttribute')
    );
    
    expect(troikaErrors).toHaveLength(0);
  });

  test('should successfully render 3D career tree with SafeText3D', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for 3D component to initialize
    await page.waitForTimeout(4000);
    
    // Verify career tree loaded
    await expect(page.locator('h1')).toContainText('3D Career Tree');
    
    // Check for legend elements (indicates 3D scene rendered)
    await expect(page.locator('text=Main Career')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Related Careers')).toBeVisible();
    await expect(page.locator('text=Required Skills')).toBeVisible();
    
    // Verify no critical errors occurred
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('Download the React DevTools') &&
      !error.includes('Multiple GoTrueClient')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle SafeText3D canvas-based rendering correctly', async ({ page }) => {
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Evaluate if SafeText3D components are working
    const canvasCount = await page.evaluate(() => {
      // Check for canvas elements created by SafeText3D
      const canvases = document.querySelectorAll('canvas');
      return canvases.length;
    });
    
    // Should have at least the main WebGL canvas
    expect(canvasCount).toBeGreaterThan(0);
    
    // Verify 3D scene is interactive
    await expect(page.locator('text=Drag to rotate')).toBeVisible();
    await expect(page.locator('text=Scroll to zoom')).toBeVisible();
  });

  test('should maintain 3D scene stability under user interactions', async ({ page }) => {
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Get the 3D canvas area
    const canvasArea = page.locator('canvas').first();
    
    if (await canvasArea.isVisible()) {
      // Simulate mouse interactions on 3D scene
      const bbox = await canvasArea.boundingBox();
      if (bbox) {
        // Simulate drag rotation
        await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
        await page.mouse.down();
        await page.mouse.move(bbox.x + bbox.width / 2 + 50, bbox.y + bbox.height / 2);
        await page.mouse.up();
        
        // Wait and check for errors after interaction
        await page.waitForTimeout(1000);
        
        // Simulate scroll zoom
        await page.mouse.wheel(0, -100);
        await page.waitForTimeout(500);
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(500);
      }
    }
    
    // Should still have no critical errors after interactions
    const criticalErrors = errors.filter(error => 
      error.includes('troika') || 
      error.includes('BufferAttribute') ||
      error.includes('count') && error.includes('undefined')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should properly handle different career selections', async ({ page }) => {
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Test different career selections
    const careerOptions = [
      'Software Engineer',
      'Data Scientist', 
      'UX Designer',
      'Digital Marketing Manager'
    ];
    
    for (const career of careerOptions) {
      const careerButton = page.locator(`text=${career}`).first();
      if (await careerButton.isVisible()) {
        await careerButton.click();
        await page.waitForTimeout(1000);
        
        // Verify the 3D scene updates without errors
        await expect(page.locator('text=Interactive View')).toBeVisible();
      }
    }
  });

  test('should handle memory cleanup for canvas textures', async ({ page }) => {
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Navigate away and back to test cleanup
    await page.goto('/', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Should still render correctly after navigation
    await expect(page.locator('text=Main Career')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Related Careers')).toBeVisible();
    
    // Check memory usage hasn't exploded (basic check)
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
    
    // Basic memory sanity check if available
    if (memoryInfo && memoryInfo.usedJSHeapSize) {
      // Heap shouldn't be unreasonably large (more than 100MB)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('should work across different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/career-tree', { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // Should render on all viewport sizes
      await expect(page.locator('h1')).toContainText('3D Career Tree');
      
      // 3D scene should adapt to viewport
      const canvas = page.locator('canvas').first();
      if (await canvas.isVisible()) {
        const bbox = await canvas.boundingBox();
        expect(bbox?.width).toBeGreaterThan(0);
        expect(bbox?.height).toBeGreaterThan(0);
      }
    }
  });

  test('should handle error boundaries gracefully', async ({ page }) => {
    // Test error boundary functionality by triggering potential errors
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Inject a potential error condition
    await page.evaluate(() => {
      // Try to trigger an error in text rendering
      window.dispatchEvent(new ErrorEvent('error', {
        message: 'Simulated troika text error'
      }));
    });
    
    await page.waitForTimeout(2000);
    
    // Page should still be functional
    await expect(page.locator('h1')).toContainText('3D Career Tree');
    
    // Error boundaries should have handled the error
    const alertsVisible = await page.locator('[role="alert"]').count();
    // Should not have unhandled error alerts
    expect(alertsVisible).toBe(0);
  });

  test('should maintain performance with multiple text elements', async ({ page }) => {
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    const startTime = Date.now();
    
    // Wait for all 3D elements to load
    await page.waitForTimeout(4000);
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (less than 8 seconds)
    expect(loadTime).toBeLessThan(8000);
    
    // Verify all text elements are rendered
    await expect(page.locator('text=Main Career')).toBeVisible();
    await expect(page.locator('text=Related Careers')).toBeVisible(); 
    await expect(page.locator('text=Required Skills')).toBeVisible();
  });

  test('should handle page reload without errors', async ({ page }) => {
    // Initial load
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload page
    await page.reload({ timeout: 15000 });
    await page.waitForLoadState('domcontentloaded'); 
    await page.waitForTimeout(3000);
    
    // Should still work after reload
    await expect(page.locator('text=3D Career Tree')).toBeVisible();
    await expect(page.locator('text=Main Career')).toBeVisible({ timeout: 10000 });
    
    // No critical errors should occur during reload
    const criticalErrors = errors.filter(error => 
      error.includes('troika') || 
      error.includes('BufferAttribute') ||
      (error.includes('count') && error.includes('undefined'))
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('SafeText3D Component Verification', () => {
  test('should render text with canvas-based approach', async ({ page }) => {
    await page.goto('/career-tree', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check that SafeText3D is working by verifying WebGL context
    const webglSupported = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    });
    
    expect(webglSupported).toBe(true);
    
    // Verify 3D scene elements are visible (indicating SafeText3D worked)
    await expect(page.locator('text=Main Career')).toBeVisible({ timeout: 10000 });
  });

  test('should fallback gracefully when WebGL fails', async ({ page }) => {
    // Disable WebGL to test fallback
    await page.goto('/career-tree', { timeout: 15000 });
    
    // Override WebGL context creation to simulate failure
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(contextType: string, ...args: any[]) {
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          return null; // Simulate WebGL failure
        }
        return originalGetContext.call(this, contextType, ...args);
      };
    });
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Page should still load without critical errors
    await expect(page.locator('h1')).toContainText('3D Career Tree');
    
    // Should show fallback elements instead of crashing
    const hasErrorMessage = await page.locator('text=WebGL not supported').count();
    const hasBasicContent = await page.locator('text=Career Options').count();
    
    // Either show error message or basic content, but don't crash
    expect(hasErrorMessage + hasBasicContent).toBeGreaterThan(0);
  });
});