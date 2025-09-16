// Test Google AI API directly
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGoogleAI() {
  try {
    console.log('🧪 Testing Google AI API...');
    
    const genAI = new GoogleGenerativeAI('AIzaSyCgBe2ZbGdpb5QUG-5qBGLbwC_tS6mvS5A');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('✅ Google AI initialized successfully');

    const result = await model.generateContent('Test prompt');
    const response = result.response;
    const text = response.text();
    
    console.log('✅ AI generation successful:', text.substring(0, 100) + '...');
    
    // Test the exact same logic as in the API
    const prompt = `Create a detailed career roadmap for someone wanting to achieve this goal: "Software Developer"

Profile:
- Current Level: beginner
- Timeframe: 12 months
- Interests: programming, web development
- Current Skills: javascript, html
- Learning Style: hands-on
- Budget: low

Generate a comprehensive roadmap with the following JSON structure:
{
  "title": "Catchy roadmap title",
  "description": "Brief description",
  "phases": []
}

Return ONLY valid JSON, no additional text or markdown.`;

    const roadmapResult = await model.generateContent(prompt);
    const roadmapResponse = roadmapResult.response;
    const roadmapText = roadmapResponse.text();
    
    console.log('🤖 AI roadmap generation successful');
    console.log('Response length:', roadmapText.length);
    console.log('First 200 chars:', roadmapText.substring(0, 200));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    });
  }
}

testGoogleAI();