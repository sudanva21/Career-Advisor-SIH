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
        })
      })

      if (!response.ok) {
        console.warn(`Translation failed for ${targetLang}:`, response.statusText)
        return text // Return original text on failure
      }

      const data = await response.json()
      return data.translatedText || text
    } catch (error) {
      console.warn('Translation error:', error)
      return text // Return original text on error
    }
  }
}

// Fallback service using MyMemory (free but limited)
class MyMemoryTranslateService implements TranslationService {
  private baseUrl = 'https://api.mymemory.translated.net/get'
  
  async translate(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en') return text

    try {
      const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`)
      
      if (!response.ok) {
        console.warn(`MyMemory translation failed for ${targetLang}:`, response.statusText)
        return text
      }

      const data = await response.json()
      return data.responseData?.translatedText || text
    } catch (error) {
      console.warn('MyMemory translation error:', error)
      return text
    }
  }
}

// Translation service with fallback
class TranslationServiceWithFallback implements TranslationService {
  private primaryService = new LibreTranslateService()
  private fallbackService = new MyMemoryTranslateService()

  async translate(text: string, targetLang: string): Promise<string> {
    // Try primary service first
    try {
      const result = await this.primaryService.translate(text, targetLang)
      // If translation seems successful (not just original text returned), use it
      if (result !== text || targetLang === 'en') {
        return result
      }
    } catch (error) {
      console.warn('Primary translation service failed, trying fallback...')
    }

    // Try fallback service
    try {
      return await this.fallbackService.translate(text, targetLang)
    } catch (error) {
      console.warn('All translation services failed, returning original text')
      return text
    }
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