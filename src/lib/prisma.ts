import { PrismaClient } from '@prisma/client';

// This is the new, crucial part.
// We declare a global variable to hold the prisma client.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// We check if the prisma client already exists on the global object.
// If not, we create a new one.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: Log all database queries to the console
    // log: ['query'], 
  });

// In development, we save the new client to the global object
// so it can be reused on the next hot-reload.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}