import { test, expect } from '@playwright/test'

test.describe('Supabase Error Handling', () => {
  test('achievements API should handle missing Supabase environment variables gracefully', async ({ request }) => {
    // Test the achievements endpoint
    const achievementsResponse = await request.get('/api/achievements')
    
    // Should return 200 status even with database errors
    expect(achievementsResponse.status()).toBe(200)
    
    const achievementsData = await achievementsResponse.json()
    
    // Should have the expected structure
    expect(achievementsData).toHaveProperty('completed')
    expect(achievementsData).toHaveProperty('inProgress') 
    expect(achievementsData).toHaveProperty('available')
    expect(achievementsData).toHaveProperty('stats')
    
    // Should be arrays
    expect(Array.isArray(achievementsData.completed)).toBe(true)
    expect(Array.isArray(achievementsData.inProgress)).toBe(true)
    expect(Array.isArray(achievementsData.available)).toBe(true)
    
    // Stats should have expected properties
    expect(achievementsData.stats).toHaveProperty('totalCompleted')
    expect(achievementsData.stats).toHaveProperty('totalAvailable')
    expect(achievementsData.stats).toHaveProperty('completionRate')
    expect(achievementsData.stats).toHaveProperty('pointsEarned')
  })

  test('activity API should handle missing Supabase environment variables gracefully', async ({ request }) => {
    // Test the activity endpoint
    const activityResponse = await request.get('/api/activity')
    
    // Should return 200 status even with database errors
    expect(activityResponse.status()).toBe(200)
    
    const activityData = await activityResponse.json()
    
    // Should have the expected structure
    expect(activityData).toHaveProperty('activities')
    expect(activityData).toHaveProperty('total')
    expect(activityData).toHaveProperty('hasMore')
    expect(activityData).toHaveProperty('pagination')
    
    // Should be proper types
    expect(Array.isArray(activityData.activities)).toBe(true)
    expect(typeof activityData.total).toBe('number')
    expect(typeof activityData.hasMore).toBe('boolean')
    
    // Pagination should have expected properties
    expect(activityData.pagination).toHaveProperty('limit')
    expect(activityData.pagination).toHaveProperty('offset')
    expect(activityData.pagination).toHaveProperty('total')
  })

  test('activity POST API should handle missing Supabase environment variables gracefully', async ({ request }) => {
    // Test creating a new activity
    const activityPayload = {
      type: 'quiz',
      title: 'Test Activity',
      description: 'Test activity description',
      metadata: { score: 85 }
    }
    
    const postResponse = await request.post('/api/activity', {
      data: activityPayload
    })
    
    // Should return 200 status
    expect(postResponse.status()).toBe(200)
    
    const postData = await postResponse.json()
    
    // Should indicate success even with database errors
    expect(postData).toHaveProperty('success')
    expect(postData.success).toBe(true)
    expect(postData).toHaveProperty('message')
    expect(postData).toHaveProperty('activity')
    
    // Activity should have expected properties
    expect(postData.activity).toHaveProperty('type', 'quiz')
    expect(postData.activity).toHaveProperty('title', 'Test Activity')
    expect(postData.activity).toHaveProperty('description', 'Test activity description')
  })

  test('achievements POST API should handle missing Supabase environment variables gracefully', async ({ request }) => {
    // Test awarding an achievement
    const achievementPayload = {
      achievementId: 'first-login',
      checkOnly: false
    }
    
    const postResponse = await request.post('/api/achievements', {
      data: achievementPayload
    })
    
    // Should return 200 status
    expect(postResponse.status()).toBe(200)
    
    const postData = await postResponse.json()
    
    // Should indicate success even with database errors
    expect(postData).toHaveProperty('success')
    expect(postData.success).toBe(true)
    expect(postData).toHaveProperty('message')
    expect(postData).toHaveProperty('achievement')
    
    // Achievement should have expected properties
    expect(postData.achievement).toHaveProperty('title')
    expect(postData.achievement).toHaveProperty('description')
    expect(postData.achievement).toHaveProperty('type')
    expect(postData.achievement).toHaveProperty('rarity')
  })

  test('API endpoints should handle invalid requests properly', async ({ request }) => {
    // Test invalid activity type
    const invalidActivityResponse = await request.post('/api/activity', {
      data: {
        type: 'invalid-type',
        title: 'Test',
        description: 'Test'
      }
    })
    
    expect(invalidActivityResponse.status()).toBe(400)
    const invalidData = await invalidActivityResponse.json()
    expect(invalidData).toHaveProperty('error')
    expect(invalidData.error).toContain('Invalid activity type')
    
    // Test missing required fields
    const missingFieldsResponse = await request.post('/api/activity', {
      data: {
        type: 'quiz'
        // Missing title and description
      }
    })
    
    expect(missingFieldsResponse.status()).toBe(400)
    const missingData = await missingFieldsResponse.json()
    expect(missingData).toHaveProperty('error')
    expect(missingData.error).toContain('Missing required fields')
  })

  test('achievements check-only functionality should work', async ({ request }) => {
    // Test check-only mode
    const checkResponse = await request.post('/api/achievements', {
      data: {
        achievementId: 'first-login',
        checkOnly: true
      }
    })
    
    expect(checkResponse.status()).toBe(200)
    const checkData = await checkResponse.json()
    
    expect(checkData).toHaveProperty('hasAchievement')
    expect(typeof checkData.hasAchievement).toBe('boolean')
    
    // Should handle invalid achievement ID
    const invalidCheckResponse = await request.post('/api/achievements', {
      data: {
        achievementId: 'non-existent-achievement'
      }
    })
    
    expect(invalidCheckResponse.status()).toBe(400)
    const invalidCheckData = await invalidCheckResponse.json()
    expect(invalidCheckData).toHaveProperty('error')
    expect(invalidCheckData.error).toBe('Invalid achievement ID')
  })

  test('API endpoints should return consistent response formats', async ({ request }) => {
    // Test that all endpoints return JSON responses
    const endpoints = [
      '/api/achievements',
      '/api/activity'
    ]
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint)
      expect(response.status()).toBe(200)
      
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('application/json')
      
      // Should be valid JSON
      const data = await response.json()
      expect(typeof data).toBe('object')
      expect(data).not.toBeNull()
    }
  })

  test('activity API should handle pagination parameters', async ({ request }) => {
    // Test with custom pagination
    const paginatedResponse = await request.get('/api/activity?limit=5&offset=0')
    
    expect(paginatedResponse.status()).toBe(200)
    const paginatedData = await paginatedResponse.json()
    
    expect(paginatedData.pagination.limit).toBe(5)
    expect(paginatedData.pagination.offset).toBe(0)
    
    // Test with type filter
    const filteredResponse = await request.get('/api/activity?type=quiz')
    
    expect(filteredResponse.status()).toBe(200)
    const filteredData = await filteredResponse.json()
    
    expect(filteredData).toHaveProperty('activities')
    expect(Array.isArray(filteredData.activities)).toBe(true)
  })

  test('error responses should include helpful information', async ({ request }) => {
    // Test that error responses are informative
    const invalidMethodResponse = await request.delete('/api/achievements')
    
    // Should handle unsupported HTTP methods gracefully
    expect([405, 404].includes(invalidMethodResponse.status())).toBe(true)
    
    // Test malformed JSON
    const malformedResponse = await request.post('/api/activity', {
      data: 'invalid-json-string'
    })
    
    // Should handle malformed requests
    expect([400, 500].includes(malformedResponse.status())).toBe(true)
  })
})