// src/app/provider/listings/edit/[id]/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { updateListing } from "@/lib/actions";
import { auth } from '@/auth';
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listingId = params.id;

  // 1. Get the session for security
  const session = await auth();
  const providerId = session?.user?.id;

  // 2. Fetch the listing AND all available amenities in parallel
  const [listing, allAmenities] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        amenities: true, // Get the amenities this listing HAS
        photos: true, // Get the photos this listing HAS
      },
    }),
    prisma.amenity.findMany(), // Get ALL possible amenities
  ]);

  // 3. Security Checks
  if (!listing) {
    notFound(); // 404 if listing doesn't exist
  }
  if (!providerId || listing.providerId !== providerId) {
    redirect("/provider/dashboard"); // Not their listing, send them away
  }

  // 4. Create a quick lookup Set for pre-checking amenities
  const listingAmenityIds = new Set(listing.amenities.map((a) => a.amenityId));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Listing: {listing.title}</CardTitle>
          <CardDescription>
            Update your property details. Any changes will be re-submitted for
            admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* This form binds the listingId to the server action */}
          <form
            action={updateListing.bind(null, listing.id)}
            className="space-y-8"
          >
            {/* --- Basic Info --- */}
            <div className="space-y-2">
              <Label htmlFor="title">Listing Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={listing.title} // Pre-fill data
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={listing.description} // Pre-fill data
                required
              />
            </div>

            {/* --- Location & Price --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={listing.address} // Pre-fill data
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={listing.city} // Pre-fill data
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (LKR / month)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={listing.price} // Pre-fill data
                  required
                />
              </div>
            </div>

            {/* --- Room Type --- */}
            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Select
                name="roomType"
                defaultValue={listing.roomType} // Pre-fill data
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Shared (2 person)">
                    Shared (2 person)
                  </SelectItem>
                  <SelectItem value="Shared (3+ person)">
                    Shared (3+ person)
                  </SelectItem>
                  <SelectItem value="House / Annex">
                    Entire House / Annex
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* --- Amenities --- */}
            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      name="amenities"
                      value={amenity.id}
                      // Pre-check the box if the listing has this amenity
                      defaultChecked={listingAmenityIds.has(amenity.id)}
                    />
                    <Label
                      htmlFor={`amenity-${amenity.id}`}
                      className="font-normal"
                    >
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Photo Uploads (Simplified) --- */}
            <div className="space-y-4">
              <Label>Photos</Label>
              <CardDescription>
                Add links to your photos. The first link will be the cover
                photo.
              </CardDescription>
              <div className="space-y-2">
                <Input
                  name="photos"
                  placeholder="http://.../photo1.jpg"
                  defaultValue={listing.photos[0]?.url || ""} // Pre-fill data
                />
                <Input
                  name="photos"
                  placeholder="http://.../photo2.jpg"
                  defaultValue={listing.photos[1]?.url || ""} // Pre-fill data
                />
                <Input
                  name="photos"
                  placeholder="http://.../photo3.jpg"
                  defaultValue={listing.photos[2]?.url || ""} // Pre-fill data
                />
              </div>
            </div>

            {/* --- Form Actions --- */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/provider/dashboard">Cancel</Link>
              </Button>
              <Button type="submit">Save Changes & Resubmit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
