// Import the necessary tools
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize Prisma Client
const prisma = new PrismaClient();

// The number of "salt rounds" for hashing the password
const SALT_ROUNDS = 10;

// The main function that will run
async function main() {
  console.log('Seeding database...');

  // --- YOUR ADMIN ACCOUNT ---
  // !!! CHANGE THESE VALUES !!!
  const adminEmail = 'admin@bordima.lk';
  const adminPassword = 'your-very-strong-password-123';
  // --------------------------

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping...');
  } else {
    // Create the new admin user
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,         // This sets them as an Admin
        status: UserStatus.APPROVED, // This makes them 'Approved'
      },
    });
    console.log('✅ Admin user created successfully!');
  }
  
  // Add any other seed data here (like Universities or Amenities)
  // For example:
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
  
  console.log('✅ Basic amenities created!');

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