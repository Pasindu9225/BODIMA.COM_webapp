"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Amenity } from "@prisma/client";
import { createListing } from "@/lib/actions";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// dynamic import for map (avoids SSR errors)
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
  photos: z.array(z.string().url()).max(5).optional(),
});

export function NewListingForm({ amenities }: { amenities: Amenity[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
      lat: 7.8731,
      lng: 80.7718,
      photos: [],
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (files.length + previewUrls.length > 5) {
      toast.error("You can upload a maximum of 5 photos");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("photos", f));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      toast.error("Upload failed");
      return;
    }

    const { urls } = await res.json();
    const updated = [...previewUrls, ...urls];
    setPreviewUrls(updated);
    form.setValue("photos", updated);
    toast.success(`${urls.length} photo(s) uploaded`);
  };

  const onSubmit = (values: z.infer<typeof listingSchema>) => {
    const validValues = {
      ...values,
      photos: previewUrls,
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Basic Information --- */}
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

          {/* --- Location & Pricing --- */}
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

          {/* --- Room Details & Amenities --- */}
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
                      {amenities.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                                            (v) => v !== item.id
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

          {/* --- Modern Photo Upload --- */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Upload up to 5 photos (first becomes the cover).
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                  uploading
                    ? "opacity-50 cursor-wait"
                    : "hover:bg-muted/40 hover:border-muted-foreground/50"
                }`}
                onClick={() =>
                  !uploading && document.getElementById("photoInput")?.click()
                }
              >
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />

                {previewUrls.length === 0 ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (Max 5 images, JPG or PNG)
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                      {previewUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-lg overflow-hidden border bg-muted/10 group"
                        >
                          <img
                            src={url}
                            alt={`Uploaded photo ${idx + 1}`}
                            className="h-40 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = previewUrls.filter(
                                (_, i) => i !== idx
                              );
                              setPreviewUrls(updated);
                              form.setValue("photos", updated);
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {previewUrls.length < 5 && (
                      <div className="mt-4 text-sm text-muted-foreground text-center">
                        Click anywhere here to add more photos
                      </div>
                    )}
                  </>
                )}

                {uploading && (
                  <p className="mt-3 text-sm text-muted-foreground animate-pulse">
                    Uploading...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- Submit --- */}
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
