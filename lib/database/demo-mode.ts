// Centralized demo mode and database error handling
let permissionWarningLogged = false
let lastWarningTime = 0
const WARNING_COOLDOWN = 5000 // 5 seconds

export function logDatabasePermissionOnce(context: string = 'API'): void {
  const now = Date.now()
  
  // Only log once per cooldown period to avoid spam
  if (!permissionWarningLogged || (now - lastWarningTime) > WARNING_COOLDOWN) {
    console.log(`Database permission denied, using demo mode (${context})`)
    permissionWarningLogged = true
    lastWarningTime = now
  }
}

export function isDemoMode(): boolean {
  // Check if we're in development or if database is unavailable
  return process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL
}

export function getDemoUserId(): string {
  return 'demo-user'
}

// Reset warning state (useful for testing)
export function resetWarningState(): void {
  permissionWarningLogged = false
  lastWarningTime = 0
}