// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Initialize Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Fetch Active Session User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 3. PROTECT ADMIN ROUTES (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Check if user is logged in
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    // Extract role from user metadata (or profile)
    const role = user.user_metadata?.role || 'buyer'

    // If logged in but NOT an admin -> Gate them out!
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized' // Or redirect to home '/'
      return NextResponse.redirect(url)
    }
  }

  // 4. PROTECT BUYER CHECKOUT/ACCOUNT ROUTES
  if (pathname.startsWith('/checkout') || pathname.startsWith('/account')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

// 5. Matcher configuration to define which routes middleware executes on
export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/account/:path*',
  ],
}