'use client'

import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useGlobalTranslations } from '@/lib/global-translation-manager'

interface TranslationWrapperProps {
  children: React.ReactNode
}

export default function TranslationWrapper({ children }: TranslationWrapperProps) {
  const { forceUpdateKey, currentLanguage } = useLanguage()
  const globalState = useGlobalTranslations()
  const [mounted, setMounted] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for global language changes
  useEffect(() => {
    const handleGlobalChange = () => {
      console.log('🔄 TranslationWrapper: Global language change detected')
      setRefreshKey(prev => prev + 1)
    }

    const handleForceUpdate = () => {
      console.log('🔄 TranslationWrapper: Forcing refresh')
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('globalLanguageChange', handleGlobalChange)
    window.addEventListener('forceGlobalUpdate', handleForceUpdate)
    
    return () => {
      window.removeEventListener('globalLanguageChange', handleGlobalChange)
      window.removeEventListener('forceGlobalUpdate', handleForceUpdate)
    }
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-space-dark" />
  }

  // Force re-render when language, forceUpdateKey, or global state changes
  const combinedKey = `${forceUpdateKey}-${currentLanguage}-${globalState.language}-${refreshKey}`
  
  return (
    <div key={combinedKey} data-language={currentLanguage} data-global-lang={globalState.language}>
      {children}
    </div>
  )
}