import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAdminEmail } from '@/lib/admin/config'
import { DEFAULT_PUBLIC_LOCALE, PUBLIC_SITE_LOCALES } from '@/lib/i18n/messages'
import { LOCALE_COOKIE_NAME } from '@/lib/context/LocaleContext'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/opengraph-image' ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  const isAdminPath = pathname.startsWith('/admin')
  const isApiPath = pathname.startsWith('/api')
  const localeFromPath = PUBLIC_SITE_LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (!isAdminPath && !isApiPath && !isStaticAsset) {
    if (!localeFromPath) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname =
        pathname === '/'
          ? `/${DEFAULT_PUBLIC_LOCALE}`
          : `/${DEFAULT_PUBLIC_LOCALE}${pathname}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  let response = NextResponse.next({ request })

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginRoute = pathname === '/admin/login'
  const isAuthorizedAdmin = Boolean(user?.email && isAdminEmail(user.email))

  if (localeFromPath) {
    request.cookies.set(LOCALE_COOKIE_NAME, localeFromPath)
    response.cookies.set(LOCALE_COOKIE_NAME, localeFromPath, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
  }

  if (pathname.startsWith('/admin') && !isLoginRoute && !isAuthorizedAdmin) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/api/admin') && !isAuthorizedAdmin) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  if (isLoginRoute && isAuthorizedAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
