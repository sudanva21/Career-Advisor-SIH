'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translationService, SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/translation-service'
import { defaultTranslations, TranslationData } from '@/lib/translations'

interface LanguageContextType {
  currentLanguage: SupportedLanguage
  translations: TranslationData
  setLanguage: (lang: SupportedLanguage) => Promise<void>
  isTranslating: boolean
  availableLanguages: typeof SUPPORTED_LANGUAGES
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

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY)
    if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
      setLanguage(savedLanguage as SupportedLanguage)
    }
  }, [])

  // Function to translate all text content
  const translateContent = async (targetLang: SupportedLanguage): Promise<TranslationData> => {
    if (targetLang === 'en') {
      return defaultTranslations
    }

    setIsTranslating(true)
    
    try {
      const translatedContent: TranslationData = {
        nav: {
          home: await translationService.translate(defaultTranslations.nav.home, targetLang),
          colleges: await translationService.translate(defaultTranslations.nav.colleges, targetLang),
          features: await translationService.translate(defaultTranslations.nav.features, targetLang),
          pricing: await translationService.translate(defaultTranslations.nav.pricing, targetLang),
          dashboard: await translationService.translate(defaultTranslations.nav.dashboard, targetLang),
          signIn: await translationService.translate(defaultTranslations.nav.signIn, targetLang),
          signOut: await translationService.translate(defaultTranslations.nav.signOut, targetLang),
          profile: await translationService.translate(defaultTranslations.nav.profile, targetLang),
          settings: await translationService.translate(defaultTranslations.nav.settings, targetLang)
        },
        
        features: {
          careerQuiz: {
            name: await translationService.translate(defaultTranslations.features.careerQuiz.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.careerQuiz.description, targetLang)
          },
          collegeFinder: {
            name: await translationService.translate(defaultTranslations.features.collegeFinder.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.collegeFinder.description, targetLang)
          },
          aiRoadmap: {
            name: await translationService.translate(defaultTranslations.features.aiRoadmap.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.aiRoadmap.description, targetLang)
          },
          jobHunting: {
            name: await translationService.translate(defaultTranslations.features.jobHunting.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.jobHunting.description, targetLang)
          },
          careerTree: {
            name: await translationService.translate(defaultTranslations.features.careerTree.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.careerTree.description, targetLang)
          },
          learningResources: {
            name: await translationService.translate(defaultTranslations.features.learningResources.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.learningResources.description, targetLang)
          },
          subscriptionPlans: {
            name: await translationService.translate(defaultTranslations.features.subscriptionPlans.name, targetLang),
            description: await translationService.translate(defaultTranslations.features.subscriptionPlans.description, targetLang)
          },
          signInRequired: await translationService.translate(defaultTranslations.features.signInRequired, targetLang)
        },
        
        common: {
          loading: await translationService.translate(defaultTranslations.common.loading, targetLang),
          error: await translationService.translate(defaultTranslations.common.error, targetLang),
          success: await translationService.translate(defaultTranslations.common.success, targetLang),
          save: await translationService.translate(defaultTranslations.common.save, targetLang),
          cancel: await translationService.translate(defaultTranslations.common.cancel, targetLang),
          continue: await translationService.translate(defaultTranslations.common.continue, targetLang),
          back: await translationService.translate(defaultTranslations.common.back, targetLang),
          next: await translationService.translate(defaultTranslations.common.next, targetLang),
          submit: await translationService.translate(defaultTranslations.common.submit, targetLang),
          search: await translationService.translate(defaultTranslations.common.search, targetLang),
          filter: await translationService.translate(defaultTranslations.common.filter, targetLang),
          clear: await translationService.translate(defaultTranslations.common.clear, targetLang),
          close: await translationService.translate(defaultTranslations.common.close, targetLang),
          open: await translationService.translate(defaultTranslations.common.open, targetLang),
          language: await translationService.translate(defaultTranslations.common.language, targetLang)
        },
        
        hero: {
          title: await translationService.translate(defaultTranslations.hero.title, targetLang),
          subtitle: await translationService.translate(defaultTranslations.hero.subtitle, targetLang),
          ctaExplore: await translationService.translate(defaultTranslations.hero.ctaExplore, targetLang),
          ctaQuiz: await translationService.translate(defaultTranslations.hero.ctaQuiz, targetLang),
          scrollDown: await translationService.translate(defaultTranslations.hero.scrollDown, targetLang)
        },
        
        featureCards: {
          personalizedQuiz: {
            title: await translationService.translate(defaultTranslations.featureCards.personalizedQuiz.title, targetLang),
            description: await translationService.translate(defaultTranslations.featureCards.personalizedQuiz.description, targetLang)
          },
          collegeRecommendations: {
            title: await translationService.translate(defaultTranslations.featureCards.collegeRecommendations.title, targetLang),
            description: await translationService.translate(defaultTranslations.featureCards.collegeRecommendations.description, targetLang)
          },
          careerVisualization: {
            title: await translationService.translate(defaultTranslations.featureCards.careerVisualization.title, targetLang),
            description: await translationService.translate(defaultTranslations.featureCards.careerVisualization.description, targetLang)
          }
        },
        
        footer: {
          description: await translationService.translate(defaultTranslations.footer.description, targetLang),
          quickLinks: await translationService.translate(defaultTranslations.footer.quickLinks, targetLang),
          features: await translationService.translate(defaultTranslations.footer.features, targetLang),
          support: await translationService.translate(defaultTranslations.footer.support, targetLang),
          legal: await translationService.translate(defaultTranslations.footer.legal, targetLang),
          about: await translationService.translate(defaultTranslations.footer.about, targetLang),
          contact: await translationService.translate(defaultTranslations.footer.contact, targetLang),
          help: await translationService.translate(defaultTranslations.footer.help, targetLang),
          team: await translationService.translate(defaultTranslations.footer.team, targetLang),
          blog: await translationService.translate(defaultTranslations.footer.blog, targetLang),
          press: await translationService.translate(defaultTranslations.footer.press, targetLang),
          privacy: await translationService.translate(defaultTranslations.footer.privacy, targetLang),
          terms: await translationService.translate(defaultTranslations.footer.terms, targetLang),
          copyright: await translationService.translate(defaultTranslations.footer.copyright, targetLang)
        },
        
        auth: {
          signIn: await translationService.translate(defaultTranslations.auth.signIn, targetLang),
          signUp: await translationService.translate(defaultTranslations.auth.signUp, targetLang),
          email: await translationService.translate(defaultTranslations.auth.email, targetLang),
          password: await translationService.translate(defaultTranslations.auth.password, targetLang),
          confirmPassword: await translationService.translate(defaultTranslations.auth.confirmPassword, targetLang),
          firstName: await translationService.translate(defaultTranslations.auth.firstName, targetLang),
          lastName: await translationService.translate(defaultTranslations.auth.lastName, targetLang),
          forgotPassword: await translationService.translate(defaultTranslations.auth.forgotPassword, targetLang),
          rememberMe: await translationService.translate(defaultTranslations.auth.rememberMe, targetLang),
          noAccount: await translationService.translate(defaultTranslations.auth.noAccount, targetLang),
          haveAccount: await translationService.translate(defaultTranslations.auth.haveAccount, targetLang),
          createAccount: await translationService.translate(defaultTranslations.auth.createAccount, targetLang),
          signInToAccount: await translationService.translate(defaultTranslations.auth.signInToAccount, targetLang),
          resetPassword: await translationService.translate(defaultTranslations.auth.resetPassword, targetLang)
        },
        
        dashboard: {
          welcome: await translationService.translate(defaultTranslations.dashboard.welcome, targetLang),
          overview: await translationService.translate(defaultTranslations.dashboard.overview, targetLang),
          recentActivity: await translationService.translate(defaultTranslations.dashboard.recentActivity, targetLang),
          recommendations: await translationService.translate(defaultTranslations.dashboard.recommendations, targetLang),
          profile: await translationService.translate(defaultTranslations.dashboard.profile, targetLang),
          settings: await translationService.translate(defaultTranslations.dashboard.settings, targetLang),
          subscription: await translationService.translate(defaultTranslations.dashboard.subscription, targetLang),
          support: await translationService.translate(defaultTranslations.dashboard.support, targetLang)
        }
      }

      return translatedContent
    } catch (error) {
      console.error('Translation failed:', error)
      return defaultTranslations // Fallback to English
    } finally {
      setIsTranslating(false)
    }
  }

  const setLanguage = async (lang: SupportedLanguage) => {
    setCurrentLanguage(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    
    const translatedContent = await translateContent(lang)
    setTranslations(translatedContent)
  }

  const value: LanguageContextType = {
    currentLanguage,
    translations,
    setLanguage,
    isTranslating,
    availableLanguages: SUPPORTED_LANGUAGES
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