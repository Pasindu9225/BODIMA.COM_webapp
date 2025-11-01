
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProviderPath = pathname.startsWith('/provider');
  const isAdminPath = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // If user is not authenticated
  if (!token) {
    if (isProviderPath || isAdminPath) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If user is authenticated, handle role-based redirects
  const { role, status } = token;

  // Redirect away from auth pages if logged in
  if (isAuthPage) {
     const url = req.nextUrl.clone();
     if (role === 'ADMIN') {
        url.pathname = '/admin/dashboard';
     } else if (role === 'PROVIDER') {
        url.pathname = '/provider/dashboard';
     } else {
        url.pathname = '/';
     }
     return NextResponse.redirect(url);
  }

  // Handle provider-specific logic
  if (role === 'PROVIDER') {
    // If provider is trying to access admin pages, redirect them
    if (isAdminPath) {
      const url = req.nextUrl.clone();
      url.pathname = '/provider/dashboard';
      return NextResponse.redirect(url);
    }
    // If provider is pending, lock them to the pending page
    if (status === 'PENDING' && pathname !== '/provider/pending') {
      const url = req.nextUrl.clone();
      url.pathname = '/provider/pending';
      return NextResponse.redirect(url);
    }
     // If provider is approved and tries to access pending page, redirect them
    if (status === 'APPROVED' && pathname === '/provider/pending') {
      const url = req.nextUrl.clone();
      url.pathname = '/provider/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Handle admin-specific logic
  if (role === 'ADMIN') {
    // If admin is trying to access provider pages, redirect them
    if (isProviderPath) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  // Handle student-specific logic (or lack thereof)
  if (role === 'STUDENT') {
     // If a student tries to access admin or provider pages, redirect to home
    if (isAdminPath || isProviderPath) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    // We remove /register here to prevent ChunkLoadError
    // '/register', 
    '/provider/:path*',
    '/admin/:path*',
  ],
};
