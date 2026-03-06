import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) =>
    request.cookies.set(name, value)
  )
  supabaseResponse = NextResponse.next({
    request,
  })
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if accessing admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                       request.nextUrl.pathname === '/'

  if (isAdminRoute) {
    // Redirect to login if not authenticated
    if (!user && request.nextUrl.pathname !== '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Check superadmin status
    if (user && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/unauthorized') {
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

      // If query fails or profile not found, deny access
      if (error || !profile) {
        console.error('Profile lookup failed - BLOCKING ACCESS:', error)
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }

      // If not superadmin, deny access
      if (!profile.is_superadmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect to admin if authenticated and trying to access login
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/login',
    '/unauthorized',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
}