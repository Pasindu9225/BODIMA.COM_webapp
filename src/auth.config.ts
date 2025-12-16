// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login', // Redirect here if not logged in
  },
  providers: [], // Providers are defined in auth.ts, not here
  callbacks: {
    // This 'authorized' callback runs on every request in Middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const role = auth?.user?.role;
      const status = auth?.user?.status;

      // 1. Redirect logged-in users away from auth pages (login/register)
      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (isLoggedIn) {
          if (role === 'ADMIN') return Response.redirect(new URL('/admin/dashboard', nextUrl));
          if (role === 'PROVIDER') return Response.redirect(new URL('/provider/dashboard', nextUrl));
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // 2. Protect Admin Routes
      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn || role !== 'ADMIN') {
          return Response.redirect(new URL('/login', nextUrl));
        }
        return true;
      }

      // 3. Protect Provider Routes
      if (pathname.startsWith('/provider')) {
        if (!isLoggedIn || role !== 'PROVIDER') {
          return Response.redirect(new URL('/login', nextUrl));
        }
        // Lock pending providers to the pending page
        if (status === 'PENDING' && pathname !== '/provider/pending') {
          return Response.redirect(new URL('/provider/pending', nextUrl));
        }
        // Kick approved providers out of the pending page
        if (status === 'APPROVED' && pathname === '/provider/pending') {
          return Response.redirect(new URL('/provider/dashboard', nextUrl));
        }
        return true;
      }

      // 4. Public Routes (Map, Home, Search, Listing Details)
      return true;
    },

    // These help TypeScript, but the real logic is in auth.ts
    async jwt({ token, user }) {
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
} satisfies NextAuthConfig;