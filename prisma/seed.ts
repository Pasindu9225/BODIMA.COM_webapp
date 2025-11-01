// Import the necessary tools
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

// The number of "salt rounds" for hashing the password
const SALT_ROUNDS = 10;

// The main function that will run
async function main() {
  console.log('Seeding database with new schema...');

  // --- YOUR ADMIN ACCOUNT ---
  const adminEmail = 'admin@bordima.lk';
  const adminPassword = 'your-very-strong-password-123';
  // --------------------------

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  // Use "upsert" to find and update/create the admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    // Update the existing admin user if found
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
    },
    // ...or create them if they don't exist
    create: {
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.APPROVED, // Explicitly set status
    },
  });
  console.log('✅ Admin user created/updated successfully!');

  // --- Seed amenities ---
  // (This part is compatible with your new schema)
  await prisma.amenity.upsert({
    where: { name: 'Wi-Fi' },
    update: {},
    create: { name: 'Wi-Fi', icon: 'wifi' },
  });
  
  await prisma.amenity.upsert({
    where: { name: 'Attached Bathroom' },
    update: {},
    create: { name: 'Attached Bathroom', icon: 'bath' },
  });
  
  await prisma.amenity.upsert({
    where: { name: 'A/C' },
    update: {},
    create: { name: 'A/C', icon: 'ac' },
  });
  console.log('✅ Basic amenities created/updated!');

  console.log('Seeding finished.');
}

// Run the main function and handle success or errors
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma
    await prisma.$disconnect();
  });