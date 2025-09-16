'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { efficientTranslationService, SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/efficient-translation-service'
import { defaultTranslations, TranslationData } from '@/lib/translations'
import { globalTranslationManager } from '@/lib/global-translation-manager'

interface LanguageContextType {
  currentLanguage: SupportedLanguage
  translations: TranslationData
  setLanguage: (lang: SupportedLanguage) => Promise<void>
  isTranslating: boolean
  availableLanguages: typeof SUPPORTED_LANGUAGES
  forceUpdateKey: number
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'preferred-language'

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en')
  const [translations, setTranslations] = useState<TranslationData>(defaultTranslations)
  const [isTranslating, setIsTranslating] = useState(false)
  const [forceUpdateKey, setForceUpdateKey] = useState(0)

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY)
    if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
      setLanguage(savedLanguage as SupportedLanguage)
    }
  }, [])

  // Function to get translations for the target language
  const translateContent = async (targetLang: SupportedLanguage): Promise<TranslationData> => {
    console.log(`🌍 Getting translations for ${targetLang}`)
    setIsTranslating(true)
    
    try {
      const { translations, isOffline } = await efficientTranslationService.translateContent(targetLang)
      
      if (isOffline) {
        console.log(`✅ ${targetLang} translations loaded instantly (offline)`)
      } else {
        console.log(`✅ ${targetLang} translations loaded via API`)
      }
      
      return translations
    } catch (error) {
      console.error(`❌ Translation to ${targetLang} failed:`, error)
      return defaultTranslations // Fallback to English
    } finally {
      console.log(`🏁 Translation process for ${targetLang} finished`)
      setIsTranslating(false)
    }
  }

  const setLanguage = async (lang: SupportedLanguage) => {
    console.log(`🎯 Switching to language: ${lang}`)
    setCurrentLanguage(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    
    const translatedContent = await translateContent(lang)
    setTranslations(translatedContent)
    
    // Force re-render of all components using this context
    setForceUpdateKey(prev => prev + 1)
    
    // Update global translation manager to notify all subscribers
    globalTranslationManager.updateLanguage(lang, translatedContent)
    
    // Trigger a global event for components that need to re-render
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang, translations: translatedContent } 
      }))
    }
    
    console.log(`🎉 Language successfully switched to ${lang}`)
  }

  const value: LanguageContextType = {
    currentLanguage,
    translations,
    setLanguage,
    isTranslating,
    availableLanguages: SUPPORTED_LANGUAGES,
    forceUpdateKey
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}