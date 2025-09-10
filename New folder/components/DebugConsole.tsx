'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugConsole() {
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const { user, loading, session } = useAuth()

  useEffect(() => {
    // Override console methods to capture logs
    const originalConsoleLog = console.log
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.log = (...args) => {
      setLogs(prev => [...prev.slice(-20), `LOG: ${args.join(' ')}`])
      originalConsoleLog(...args)
    }

    console.error = (...args) => {
      setLogs(prev => [...prev.slice(-20), `ERROR: ${args.join(' ')}`])
      originalConsoleError(...args)
    }

    console.warn = (...args) => {
      setLogs(prev => [...prev.slice(-20), `WARN: ${args.join(' ')}`])
      originalConsoleWarn(...args)
    }

    return () => {
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-red-700 transition-colors"
      >
        Debug {isVisible ? '📱' : '🔍'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-80 max-h-96 bg-black/90 border border-gray-600 rounded-lg p-4 font-mono text-xs overflow-auto">
          <div className="mb-4 text-green-400">
            <div><strong>Auth State:</strong></div>
            <div>User: {user ? '✅ Logged in' : '❌ Not logged in'}</div>
            <div>Loading: {loading ? '⏳ Loading...' : '✅ Ready'}</div>
            <div>Session: {session ? '✅ Active' : '❌ None'}</div>
            <div>Email: {user?.email || 'None'}</div>
          </div>
          
          <div className="text-cyan-400">
            <div><strong>Environment:</strong></div>
            <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</div>
            <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</div>
          </div>
          
          <div className="mt-4">
            <div className="text-yellow-400"><strong>Console Logs:</strong></div>
            <div className="max-h-32 overflow-auto text-gray-300">
              {logs.map((log, i) => (
                <div key={i} className="text-xs break-words">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}