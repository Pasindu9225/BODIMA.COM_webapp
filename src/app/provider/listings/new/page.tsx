import { prisma } from "@/lib/prisma";
import { NewListingForm } from "./NewListingForm"; // We will create this file next

export default async function NewListingPage() {
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
