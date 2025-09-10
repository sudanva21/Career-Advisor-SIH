'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { createDevUser, getSupabaseDevInstructions } from '@/lib/dev-setup'

export default function DevSetup() {
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleCreateDevUser = async () => {
    setIsCreatingUser(true)
    const result = await createDevUser()
    setResult(result)
    setIsCreatingUser(false)
  }

  const instructions = getSupabaseDevInstructions()

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Development Setup</h2>
          <p className="text-sm text-gray-400">Configure Supabase authentication for development</p>
        </div>
      </div>

      {/* Quick Setup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-600">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-neon-cyan" />
            <div>
              <p className="font-medium text-white">Create Test User</p>
              <p className="text-sm text-gray-400">Creates a confirmed user for testing</p>
            </div>
          </div>
          <button
            onClick={handleCreateDevUser}
            disabled={isCreatingUser}
            className="px-4 py-2 bg-neon-cyan text-space-dark rounded-lg font-medium hover:bg-neon-pink transition-colors disabled:opacity-50"
          >
            {isCreatingUser ? 'Creating...' : 'Create User'}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {result.success ? 'Success!' : 'Error'}
              </span>
            </div>
            {result.success ? (
              <div className="text-sm">
                {result.needsConfirmation ? (
                  <p>User created but email confirmation is required. Check setup instructions below.</p>
                ) : (
                  <p>Test user is ready! You can now sign in with dev@test.com / dev123456</p>
                )}
              </div>
            ) : (
              <p className="text-sm">{result.error?.message || 'Failed to create user'}</p>
            )}
          </motion.div>
        )}

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full p-4 bg-black/20 rounded-lg border border-gray-600 text-left hover:border-neon-cyan transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-neon-cyan" />
              <div>
                <p className="font-medium text-white">Setup Instructions</p>
                <p className="text-sm text-gray-400">Disable email confirmation in Supabase</p>
              </div>
            </div>
            <div className={`transform transition-transform ${showInstructions ? 'rotate-180' : ''}`}>
              ↓
            </div>
          </div>
        </button>

        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-black/40 rounded-lg border border-gray-600"
          >
            <h4 className="font-medium text-white mb-3">{instructions.title}</h4>
            <div className="space-y-2 mb-4">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-neon-cyan font-mono">{index + 1}.</span>
                  <span>{step.substring(2)}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-neon-cyan/10 rounded border border-neon-cyan/30">
              <p className="text-sm font-medium text-neon-cyan mb-2">Test Credentials:</p>
              <p className="text-sm text-gray-300">
                Email: <code className="bg-black/30 px-2 py-1 rounded">{instructions.testCredentials.email}</code>
              </p>
              <p className="text-sm text-gray-300">
                Password: <code className="bg-black/30 px-2 py-1 rounded">{instructions.testCredentials.password}</code>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}