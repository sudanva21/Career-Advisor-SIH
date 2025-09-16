/**
 * Environment Variables Validation
 * Validates all required environment variables at startup
 */

interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  ai: {
    huggingfaceKey?: string
    cohereKey?: string
    ollamaBaseUrl?: string
    defaultProvider: string
  }
  app: {
    url: string
    nodeEnv: string
  }
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentValidationError'
  }
}

export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = []

  // Supabase Configuration (Required)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required and must be a valid HTTPS URL')
  }
  
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  if (!supabaseServiceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations')
  }

  // Free AI Configuration (At least one is required)
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY
  const cohereKey = process.env.COHERE_API_KEY
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'huggingface'

  if (!huggingfaceKey && !cohereKey && !ollamaBaseUrl) {
    errors.push('At least one free AI provider is required: HUGGINGFACE_API_KEY, COHERE_API_KEY, or OLLAMA_BASE_URL')
  }

  if (!['huggingface', 'cohere', 'ollama'].includes(defaultProvider)) {
    errors.push('DEFAULT_AI_PROVIDER must be one of: huggingface, cohere, ollama')
  }

  // App Configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const nodeEnv = process.env.NODE_ENV || 'development'

  if (!appUrl) {
    errors.push('NEXT_PUBLIC_APP_URL is required for payment flows and callbacks')
  }

  if (errors.length > 0) {
    throw new EnvironmentValidationError(
      'Environment validation failed:\n' + errors.map(err => `  - ${err}`).join('\n')
    )
  }

  return {
    supabase: {
      url: supabaseUrl!,
      anonKey: supabaseAnonKey!,
      serviceRoleKey: supabaseServiceRoleKey!
    },
    ai: {
      huggingfaceKey,
      cohereKey,
      ollamaBaseUrl,
      defaultProvider
    },
    app: {
      url: appUrl!,
      nodeEnv
    }
  }
}

// Validate on module load for server-side operations
let config: EnvironmentConfig | null = null

export function getValidatedConfig(): EnvironmentConfig {
  if (!config) {
    config = validateEnvironment()
    console.log('✅ Environment validation successful')
  }
  return config
}

// For client-side validation (limited to public vars)
export function validateClientEnvironment() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!supabaseUrl || !supabaseAnonKey || !appUrl) {
    console.error('❌ Client environment validation failed')
    return false
  }

  console.log('✅ Client environment validation successful')
  return true
}