// src/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role, UserStatus, User } from '@prisma/client';
import { authConfig } from './auth.config'; // Ensure your auth.config.ts exports 'authConfig'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });
                if (!user || !user.password) return null;

                const isPasswordCorrect = await bcryptjs.compare(
                    credentials.password as string,
                    user.password
                );
                if (isPasswordCorrect) return user;

                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                const dbUser = user as User;
                token.id = dbUser.id;
                token.role = dbUser.role;
                token.status = dbUser.status;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.status = token.status as UserStatus;
            }
            return session;
        },
    },
});