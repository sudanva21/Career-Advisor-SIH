'use client'

import React from 'react'
import { SupportedLanguage } from './translation-service'
import { TranslationData } from './translations'

class GlobalTranslationManager {
  private subscribers: Set<(language: SupportedLanguage, translations: TranslationData) => void> = new Set()
  private currentLanguage: SupportedLanguage = 'en'
  private currentTranslations: TranslationData | null = null

  subscribe(callback: (language: SupportedLanguage, translations: TranslationData) => void) {
    this.subscribers.add(callback)
    
    // Immediately call with current state if available
    if (this.currentTranslations) {
      callback(this.currentLanguage, this.currentTranslations)
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  updateLanguage(language: SupportedLanguage, translations: TranslationData) {
    console.log(`🌐 GlobalTranslationManager: Language updated to ${language}`)
    this.currentLanguage = language
    this.currentTranslations = translations

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(language, translations)
      } catch (error) {
        console.error('Error in translation subscriber:', error)
      }
    })

    // Also dispatch DOM events for non-React components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('globalLanguageChange', {
        detail: { language, translations, timestamp: Date.now() }
      }))
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  getCurrentTranslations(): TranslationData | null {
    return this.currentTranslations
  }

  // Force all components to re-render
  forceGlobalUpdate() {
    if (this.currentTranslations) {
      console.log('🔄 Forcing global translation update')
      this.updateLanguage(this.currentLanguage, this.currentTranslations)
    }
  }
}

export const globalTranslationManager = new GlobalTranslationManager()

// Hook for components to use global translation updates
export function useGlobalTranslations() {
  const [state, setState] = React.useState<{
    language: SupportedLanguage
    translations: TranslationData | null
  }>({
    language: globalTranslationManager.getCurrentLanguage(),
    translations: globalTranslationManager.getCurrentTranslations()
  })

  React.useEffect(() => {
    const unsubscribe = globalTranslationManager.subscribe((language, translations) => {
      setState({ language, translations })
    })

    return unsubscribe
  }, [])

  return state
}

// Helper to trigger global translation refresh from anywhere
export function refreshAllTranslations() {
  globalTranslationManager.forceGlobalUpdate()
}