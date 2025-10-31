import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';
import prisma from '@/lib/prisma';
import { Role, UserStatus } from '@prisma/client';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user || !user.password) {
          console.log('No user found or user has no password');
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          // Return the user object, which will be encoded in the JWT
          console.log('Passwords match, returning user:', user);
          return user;
        }

        console.log('Passwords do not match');
        return null;
      },
    }),
  ],
  session: {
    // Use JSON Web Tokens for session management
    strategy: 'jwt',
  },
  callbacks: {
    // This callback is called whenever a JWT is created (i.e., at sign in).
    async jwt({ token, user }) {
      // When the user first signs in, the `user` object is available.
      // We add our custom properties to the token here.
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.status = user.status as UserStatus;
      }
      return token;
    },
    // This callback is called whenever a session is checked.
    async session({ session, token }) {
      // The session callback receives the token from the `jwt` callback.
      // We can use it to add our custom properties to the `session.user` object.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.status = token.status as UserStatus;
      }
      return session;
    },
  },
  pages: {
    // Redirect users to our custom login page
    signIn: '/login',
  }
};

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
