// Free translation service using LibreTranslate API
// Alternative APIs: Google Translate (limited free tier), MyMemory (free but limited)

export interface TranslationService {
  translate(text: string, targetLang: string): Promise<string>
}

// Using LibreTranslate as the primary service (it's completely free and open-source)
class LibreTranslateService implements TranslationService {
  private baseUrl = 'https://libretranslate.com/translate'
  
  async translate(text: string, targetLang: string): Promise<string> {
    // Skip translation for English
    if (targetLang === 'en') return text

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`LibreTranslate failed for ${targetLang}:`, response.status, response.statusText)
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const translatedText = data.translatedText || text
      console.log(`✅ LibreTranslate success for ${targetLang}:`, text.substring(0, 30), '→', translatedText.substring(0, 30))
      return translatedText
    } catch (error) {
      console.warn('❌ LibreTranslate error:', error)
      throw error // Throw error to try fallback service
    }
  }
}

// Fallback service using MyMemory (free but limited)
class MyMemoryTranslateService implements TranslationService {
  private baseUrl = 'https://api.mymemory.translated.net/get'
  
  async translate(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en') return text

    try {
      // Add timeout for MyMemory as well
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`MyMemory failed for ${targetLang}:`, response.status, response.statusText)
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const translatedText = data.responseData?.translatedText || text
      console.log(`✅ MyMemory success for ${targetLang}:`, text.substring(0, 30), '→', translatedText.substring(0, 30))
      return translatedText
    } catch (error) {
      console.warn('❌ MyMemory error:', error)
      throw error
    }
  }
}

// Translation service with fallback
class TranslationServiceWithFallback implements TranslationService {
  private primaryService = new LibreTranslateService()
  private fallbackService = new MyMemoryTranslateService()

  async translate(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en') return text

    console.log(`🌐 Translating "${text.substring(0, 50)}..." to ${targetLang}`)

    // Try primary service first
    try {
      const result = await this.primaryService.translate(text, targetLang)
      return result
    } catch (error) {
      console.warn('🔄 Primary service failed, trying fallback...', error)
    }

    // Try fallback service
    try {
      const result = await this.fallbackService.translate(text, targetLang)
      return result
    } catch (error) {
      console.warn('❌ All translation services failed, returning original text', error)
    }

    // If all services fail, return original text
    return text
  }
}

export const translationService = new TranslationServiceWithFallback()

// Language codes mapping
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ks: { name: 'Kashmiri', nativeName: 'कॉशुर' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' }
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES