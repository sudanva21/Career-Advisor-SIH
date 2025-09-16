'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Languages, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, isTranslating, availableLanguages, translations } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = async (langCode: string) => {
    if (langCode !== currentLanguage) {
      await setLanguage(langCode as keyof typeof availableLanguages)
    }
    setIsOpen(false)
  }

  const currentLanguageInfo = availableLanguages[currentLanguage]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-neon-pink/10 border border-neon-cyan/30 text-white hover:border-neon-cyan hover:shadow-lg hover:shadow-neon-cyan/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${translations.common.language} - ${currentLanguageInfo.nativeName}`}
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Languages className="w-4 h-4" />
        )}
        <span className="hidden sm:block text-sm font-medium">
          {currentLanguageInfo.nativeName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-64 bg-space-dark/95 backdrop-blur-lg border border-neon-cyan/20 rounded-xl shadow-2xl shadow-neon-cyan/10 z-50"
            role="menu"
            aria-label="Language selection menu"
          >
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-700/50">
                {translations.common.language}
              </div>
              {Object.entries(availableLanguages).map(([code, info], index) => (
                <motion.button
                  key={code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full p-3 rounded-lg transition-colors text-left flex items-center justify-between group ${
                    currentLanguage === code
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {info.nativeName}
                    </span>
                    <span className="text-xs opacity-70">
                      {info.name}
                    </span>
                  </div>
                  {currentLanguage === code && (
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Translation service info */}
            <div className="px-3 py-2 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">
                Powered by LibreTranslate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}