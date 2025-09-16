// Enhanced translation service with API support for Telugu and Kashmiri
// This provides instant translations for major languages and API translations for others

import { TranslationData, defaultTranslations } from './translations'
import { offlineTranslations, OfflineLanguage } from './offline-translations'
import { SUPPORTED_LANGUAGES, translationService } from './translation-service'
import type { SupportedLanguage } from './translation-service'

class EfficientTranslationService {
  private loadingStates: Map<SupportedLanguage, boolean> = new Map()
  private translationCache: Map<SupportedLanguage, TranslationData> = new Map()

  async translateContent(targetLang: SupportedLanguage): Promise<{
    translations: TranslationData,
    isOffline: boolean
  }> {
    // Return English immediately
    if (targetLang === 'en') {
      return {
        translations: defaultTranslations,
        isOffline: true
      }
    }

    console.log(`🌍 Getting translations for ${targetLang}`)

    // Check if we have cached translations
    const cachedTranslation = this.translationCache.get(targetLang)
    if (cachedTranslation) {
      console.log(`⚡ Using cached translations for ${targetLang}`)
      return {
        translations: cachedTranslation,
        isOffline: true
      }
    }

    // Check if we have offline translations
    const offlineTranslation = offlineTranslations[targetLang as OfflineLanguage]
    if (offlineTranslation) {
      console.log(`✅ Using offline translations for ${targetLang}`)
      this.translationCache.set(targetLang, offlineTranslation)
      return {
        translations: offlineTranslation,
        isOffline: true
      }
    }

    // For Telugu and Kashmiri, prefer API but fallback to offline
    if (targetLang === 'te' || targetLang === 'ks') {
      console.log(`🌐 Trying API translations for ${targetLang}`)
      this.setTranslatingState(targetLang, true)
      
      try {
        const apiTranslations = await this.translateToLanguageAPI(targetLang)
        this.translationCache.set(targetLang, apiTranslations)
        console.log(`✅ API translations generated for ${targetLang}`)
        return {
          translations: apiTranslations,
          isOffline: false
        }
      } catch (error) {
        console.error(`❌ API translation failed for ${targetLang}, using offline fallback:`, error)
        
        // Try to load the offline versions we created
        try {
          if (targetLang === 'te') {
            const { teluguTranslations } = await import('./offline-translations')
            this.translationCache.set(targetLang, teluguTranslations)
            return {
              translations: teluguTranslations,
              isOffline: true
            }
          } else if (targetLang === 'ks') {
            const { kashmiriTranslations } = await import('./offline-translations')
            this.translationCache.set(targetLang, kashmiriTranslations)
            return {
              translations: kashmiriTranslations,
              isOffline: true
            }
          }
        } catch (importError) {
          console.error(`❌ Failed to load offline translations for ${targetLang}:`, importError)
        }
        
        return {
          translations: defaultTranslations,
          isOffline: true
        }
      } finally {
        this.setTranslatingState(targetLang, false)
      }
    }

    // For other languages, return English with a note
    console.log(`⚠️ ${targetLang} not supported, using English`)
    return {
      translations: defaultTranslations,
      isOffline: true
    }
  }

  private async translateToLanguageAPI(targetLang: SupportedLanguage): Promise<TranslationData> {
    const translateSection = async (section: any): Promise<any> => {
      if (typeof section === 'string') {
        return await translationService.translate(section, targetLang)
      } else if (typeof section === 'object' && section !== null) {
        const translatedSection: any = {}
        for (const [key, value] of Object.entries(section)) {
          translatedSection[key] = await translateSection(value)
        }
        return translatedSection
      }
      return section
    }

    return await translateSection(defaultTranslations)
  }

  isTranslating(lang: SupportedLanguage): boolean {
    return this.loadingStates.get(lang) || false
  }

  setTranslatingState(lang: SupportedLanguage, isTranslating: boolean) {
    this.loadingStates.set(lang, isTranslating)
  }

  // Clear cache for a specific language
  clearCache(lang?: SupportedLanguage) {
    if (lang) {
      this.translationCache.delete(lang)
    } else {
      this.translationCache.clear()
    }
  }
}

export const efficientTranslationService = new EfficientTranslationService()

// Language information
export { SUPPORTED_LANGUAGES }
export type { SupportedLanguage }