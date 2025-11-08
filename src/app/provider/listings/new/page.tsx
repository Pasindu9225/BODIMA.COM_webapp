// src/app/provider/listings/new/page.tsx
import { prisma } from "@/lib/prisma";
import { NewListingForm } from "./NewListingForm"; // We will create this file next

// This is now an async Server Component (no 'use client')
export default async function NewListingPage() {
  // 1. Fetch real amenities from the database ON THE SERVER
  const amenities = await prisma.amenity.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Add New Listing</h1>
        <p className="text-muted-foreground">
          Fill in the details of the accommodation you want to list.
        </p>
      </div>

      {/* 2. Pass the server-fetched amenities to the Client Component */}
      <NewListingForm amenities={amenities} />
    </div>
  );
}
