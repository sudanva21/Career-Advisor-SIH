import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    url && 
    key && 
    url !== 'https://your-project-id.supabase.co' && 
    key !== 'your-anon-key-here' &&
    url.startsWith('https://') &&
    key.startsWith('eyJ') // JWT should start with eyJ
  )
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Protected routes that require authentication
  // Temporarily disabled for testing - allowing dashboard and quiz access
  const protectedRoutes = ['/profile'] // ['/dashboard', '/quiz', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Auth routes
  const authRoutes = ['/auth/signin', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Skip middleware only if Supabase is not properly configured
  if (!isSupabaseConfigured()) {
    // If Supabase is not configured, allow access to all routes
    // The client-side auth context will handle the authentication logic
    return res
  }

  // Use Supabase authentication for production
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // If user is not logged in and trying to access protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    redirectUrl.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    const next = req.nextUrl.searchParams.get('next')
    redirectUrl.pathname = next || '/dashboard'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}