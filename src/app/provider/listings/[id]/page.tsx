// src/app/listing/[id]/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Phone, Check, Building, User } from "lucide-react";
import Image from "next/image";
import { ListingStatus } from "@prisma/client";

// ✅ Main page component
export default async function ListingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const listingId = params.id;

  // 1️⃣ Increment views safely (non-blocking)
  prisma.listing
    .update({
      where: { id: listingId },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.warn("Failed to increment view count:", err));

  // 2️⃣ Fetch the listing with all related data
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      provider: {
        include: {
          providerProfile: true, // get verified status, phone, etc.
        },
      },
      photos: true,
      amenities: {
        include: { amenity: true },
      },
    },
  });

  // 3️⃣ Handle missing / unapproved listings
  if (!listing || listing.status !== ListingStatus.APPROVED) {
    notFound();
  }

  // 4️⃣ Get cover photo or fallback
  const coverPhoto =
    listing.photos.find((p) => p.isCover)?.url ||
    listing.photos[0]?.url ||
    "/placeholder-images/placeholder.png";

  // 5️⃣ Render
  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="space-y-8">
        {/* --- Header --- */}
        <div>
          <h1 className="font-headline text-4xl font-bold">{listing.title}</h1>
          <p className="flex items-center text-lg text-muted-foreground mt-2">
            <MapPin className="mr-2 h-5 w-5" />
            {listing.address || "No address"}, {listing.city || ""}
          </p>
        </div>

        {/* --- Image Gallery --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Image */}
          <div className="h-96 w-full">
            <Image
              src={coverPhoto}
              alt={listing.title}
              width={800}
              height={600}
              className="h-full w-full rounded-lg object-cover"
            />
          </div>

          {/* Secondary images */}
          {listing.photos.length > 1 && (
            <div className="hidden md:grid grid-cols-2 gap-4">
              {listing.photos.slice(1, 5).map((photo) => (
                <div key={photo.id} className="h-full w-full">
                  <Image
                    src={photo.url}
                    alt={listing.title}
                    width={400}
                    height={300}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-lg">
                  <Building className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span>
                    Room Type:{" "}
                    <span className="font-semibold">
                      {listing.roomType || "N/A"}
                    </span>
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {listing.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Amenities</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {listing.amenities.map(({ amenity }) => (
                    <div key={amenity.id} className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Location on Map</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  Map will be here soon
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  LKR {listing.price?.toLocaleString() ?? "0"}
                  <span className="text-lg font-normal text-muted-foreground">
                    / month
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Provided by:</h3>
                <div className="flex items-center gap-3">
                  <User className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <div className="font-bold">{listing.provider.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {listing.provider.providerProfile?.isVerified
                        ? "✅ Verified Provider"
                        : "⚠️ Unverified Provider"}
                    </div>
                  </div>
                </div>

                {listing.provider.providerProfile?.phone && (
                  <Button size="lg" className="w-full" asChild>
                    <a href={`tel:${listing.provider.providerProfile.phone}`}>
                      <Phone className="mr-2 h-5 w-5" /> Contact Provider
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
