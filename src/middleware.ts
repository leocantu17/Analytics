import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user) {
    const { data: profile } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.rol === 'admin';
    const path = request.nextUrl.pathname;

    if (isAdmin && path === '/dashboard') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    }

    if (!isAdmin && path.startsWith('/dashboard/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (path === '/') {
      return NextResponse.redirect(new URL(isAdmin ? '/dashboard/admin' : '/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}