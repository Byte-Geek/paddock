import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = [
  '/antrenori',
  '/grupe',
  '/sportivi',
  '/statistici',
  '/competitii',
]
const authRoutes = ['/login', '/register']
const publicRoutes = ['/', '/main', '/dashboard', '/evenimente', '/protocoale', '/calculator']

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof decoded.exp !== 'number') return true
    return decoded.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const path = request.nextUrl.pathname

  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))

  const hasValidToken = !!token && !isTokenExpired(token)

  if (isPublicRoute) {
    return NextResponse.next()
  }

  if (isProtectedRoute && !hasValidToken) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    if (token) response.cookies.delete('access_token')
    return response
  }

  if (isAuthRoute && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
