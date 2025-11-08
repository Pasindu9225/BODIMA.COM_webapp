import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // ✅ 1. Seed Admin User (if not exists)
  const adminEmail = "admin@bodima.com";
  const adminPassword = "Admin@123"; // change if needed

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  console.log("✅ Admin user ensured.");

  // ✅ 2. Seed Universities (Government + Private)
  const universities = [
    // --- Government ---
    {
      name: "University of Colombo",
      city: "Colombo",
      address: "94 Cumaratunga Munidasa Mawatha, Colombo 03",
      lat: 6.9,
      lng: 79.858,
    },
    {
      name: "University of Peradeniya",
      city: "Peradeniya",
      address: "Galaha Road, Peradeniya",
      lat: 7.2636,
      lng: 80.596,
    },
    {
      name: "University of Kelaniya",
      city: "Kelaniya",
      address: "Dalugama, Kelaniya",
      lat: 6.9721,
      lng: 79.915,
    },
    {
      name: "University of Moratuwa",
      city: "Moratuwa",
      address: "Katubedda, Moratuwa",
      lat: 6.7967,
      lng: 79.9009,
    },
    {
      name: "University of Jaffna",
      city: "Jaffna",
      address: "Thirunelvely, Jaffna",
      lat: 9.6848,
      lng: 80.022,
    },
    {
      name: "University of Sri Jayewardenepura",
      city: "Nugegoda",
      address: "Gangodawila, Nugegoda",
      lat: 6.853,
      lng: 79.9056,
    },
    {
      name: "University of Ruhuna",
      city: "Matara",
      address: "Wellamadama, Matara",
      lat: 5.9381,
      lng: 80.575,
    },
    {
      name: "Eastern University, Sri Lanka",
      city: "Vantharumoolai",
      address: "Vantharumoolai, Chenkalady",
      lat: 7.7976,
      lng: 81.582,
    },
    {
      name: "Sabaragamuwa University of Sri Lanka",
      city: "Belihuloya",
      address: "P.O. Box 02, Belihuloya",
      lat: 6.715,
      lng: 80.785,
    },
    {
      name: "Rajarata University of Sri Lanka",
      city: "Mihintale",
      address: "Mihintale, Anuradhapura",
      lat: 8.361,
      lng: 80.491,
    },
    {
      name: "Wayamba University of Sri Lanka",
      city: "Kuliyapitiya",
      address: "Kuliyapitiya",
      lat: 7.5994,
      lng: 79.9464,
    },
    {
      name: "Uva Wellassa University",
      city: "Badulla",
      address: "Passara Road, Badulla",
      lat: 6.983,
      lng: 81.071,
    },
    {
      name: "South Eastern University of Sri Lanka",
      city: "Oluvil",
      address: "University Park, Oluvil",
      lat: 7.301,
      lng: 81.8553,
    },
    {
      name: "Open University of Sri Lanka",
      city: "Nawala",
      address: "Nawala, Nugegoda",
      lat: 6.8833,
      lng: 79.886,
    },
    {
      name: "University of the Visual & Performing Arts",
      city: "Colombo",
      address: "21, Albert Crescent, Colombo 07",
      lat: 6.9115,
      lng: 79.8625,
    },

    // --- Private ---
    {
      name: "NSBM Green University",
      city: "Homagama",
      address: "Pitipana, Homagama",
      lat: 6.8206,
      lng: 80.0411,
    },
    {
      name: "SLIIT (Sri Lanka Institute of Information Technology)",
      city: "Malabe",
      address: "New Kandy Road, Malabe",
      lat: 6.9145,
      lng: 79.972,
    },
    {
      name: "ICBT Campus",
      city: "Colombo",
      address: "No.36, De Kretser Place, Colombo 04",
      lat: 6.8935,
      lng: 79.8588,
    },
    {
      name: "CINEC Campus",
      city: "Malabe",
      address: "Millennium Drive, IT Park, Malabe",
      lat: 6.9127,
      lng: 79.9745,
    },
    {
      name: "Horizon Campus",
      city: "Malabe",
      address: "Knowledge City, Malabe",
      lat: 6.9115,
      lng: 79.9725,
    },
    {
      name: "NIBM (National Institute of Business Management)",
      city: "Colombo",
      address: "120/5, Wijerama Mawatha, Colombo 07",
      lat: 6.9048,
      lng: 79.869,
    },
    {
      name: "APIIT (Asia Pacific Institute of Information Technology)",
      city: "Colombo",
      address: "No 388, Union Place, Colombo 02",
      lat: 6.9185,
      lng: 79.856,
    },
    {
      name: "Aquinas College of Higher Studies",
      city: "Colombo",
      address: "Maradana Road, Colombo 08",
      lat: 6.916,
      lng: 79.87,
    },
    {
      name: "IIT (Informatics Institute of Technology)",
      city: "Colombo",
      address: "57, Ramakrishna Road, Colombo 06",
      lat: 6.8745,
      lng: 79.861,
    },
    {
      name: "Saegis Campus",
      city: "Nugegoda",
      address: "135, S. De S. Jayasinghe Mawatha, Nugegoda",
      lat: 6.868,
      lng: 79.894,
    },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { name: uni.name },
      update: {},
      create: uni,
    });
  }

  console.log("✅ Universities seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
