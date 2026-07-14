import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard']
const authRoutes = ['/login', '/register']
const publicRoutes = ['/', '/main']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const path = request.nextUrl.pathname

  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))


  if (isPublicRoute) {
    return NextResponse.next()
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
