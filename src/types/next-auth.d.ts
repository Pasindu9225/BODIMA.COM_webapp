import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'provider' | 'admin';
      status: 'pending' | 'approved' | 'rejected';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'student' | 'provider' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'student' | 'provider' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
  }
}
