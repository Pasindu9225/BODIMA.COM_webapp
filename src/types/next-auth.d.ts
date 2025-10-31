import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { Role, UserStatus } from '@prisma/client';

declare module 'next-auth' {
  /**
   * Extends the built-in session.user object to include our custom fields.
   */
  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
    } & DefaultSession['user'];
  }

  /**
   * Extends the built-in user object to include our custom fields.
   */
  interface User extends DefaultUser {
    role: Role;
    status: UserStatus;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT object to include our custom fields.
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    status: UserStatus;
  }
}
