// src/app/provider/listings/new/NewListingForm.tsx
"use client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Amenity } from "@prisma/client";
import { useTransition } from "react"; // Removed useState and useEffect
import { createListing } from "@/lib/actions";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// --- This dynamically imports the map to prevent SSR errors ---
const LocationPicker = dynamic(
  () =>
    import("@/components/ui/LocationPicker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <p className="h-96 w-full animate-pulse rounded-md bg-muted">
        Loading map...
      </p>
    ),
  }
);

// This schema MUST match the one in your server action
const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  price: z.coerce.number().min(1, "Price is required"),
  roomType: z.string({ required_error: "Room type is required." }),
  amenities: z.array(z.string()).optional(),
  lat: z.number().min(-90).max(90, "Invalid latitude"),
  lng: z.number().min(-180).max(180, "Invalid longitude"),
  photos: z
    .array(
      z
        .string()
        .url({ message: "Invalid URL" })
        .min(1, { message: "Photo URL cannot be empty" })
    )
    .min(1, "At least one photo URL is required.")
    .max(3, "You can upload a maximum of 3 photos."),
});

// FIX 1: This component now accepts 'amenities' as a prop
export function NewListingForm({ amenities }: { amenities: Amenity[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // FIX 2: We REMOVED the broken getAmenities() and useEffect
  // The 'amenities' prop now comes from the server page

  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      price: 0,
      roomType: undefined,
      amenities: [],
      lat: 7.8731, // Default to Sri Lanka center
      lng: 80.7718,
      photos: ["", "", ""],
    },
  });

  const onSubmit = (values: z.infer<typeof listingSchema>) => {
    const validValues = {
      ...values,
      photos: values.photos.filter((url) => url.trim() !== ""),
    };

    startTransition(async () => {
      const result = await createListing(validValues);
      if (result.success) {
        toast.success("Listing created successfully! Awaiting admin approval.");
        router.push("/provider/dashboard");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* This is a CLIENT component ('use client').
        The form, map, and user interactions are all here.
      */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Cozy Single Room with A/C"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the room, facilities, and surroundings."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123, Galle Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Colombo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Price (LKR)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="20000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Leaflet Map Component --- */}
              <div className="space-y-2">
                <FormLabel>Set Location on Map</FormLabel>
                <CardDescription>
                  Search or click to set the pin.
                </CardDescription>
                <LocationPicker
                  onChange={(lat, lng) => {
                    form.setValue("lat", lat, { shouldValidate: true });
                    form.setValue("lng", lng, { shouldValidate: true });
                  }}
                />
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="lat"
                    render={({ field }) => (
                      <Input {...field} disabled placeholder="Latitude" />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lng"
                    render={({ field }) => (
                      <Input {...field} disabled placeholder="Longitude" />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room Details & Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Amenities</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {/* FIX 3: This now uses the 'amenities' prop */}
                      {amenities.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Add links to your photos (max 3). The first photo will be the
                cover image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="photos.0"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo 1 (Cover)</FormLabel>
                    <FormControl>
                      <Input placeholder="http://.../photo1.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photos.1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo 2</FormLabel>
                    <FormControl>
                      <Input placeholder="http://.../photo2.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photos.2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo 3</FormLabel>
                    <FormControl>
                      <Input placeholder="http://.../photo3.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Save and Submit for Review"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
