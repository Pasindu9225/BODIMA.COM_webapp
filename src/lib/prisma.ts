import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance
// This is to avoid creating a new PrismaClient on every hot reload in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// If 'prisma' is not on the global object, create a new instance
// Otherwise, use the existing global instance
const prisma = global.prisma || new PrismaClient();

// In development, assign the prisma instance to the global object
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;
