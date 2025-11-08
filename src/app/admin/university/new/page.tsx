"use client";

import { useState, useTransition, FormEvent, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addUniversity } from "@/lib/actions";

// Small helper component for picking a point on the map
function LocationPicker({
  onChange,
  initialCenter,
}: {
  onChange: (coords: LatLngLiteral) => void;
  initialCenter: LatLngLiteral;
}) {
  const [position, setPosition] = useState<LatLngLiteral | null>(null);

  // Register click handler
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng);
    },
  });

  return position ? (
    <Marker position={position} />
  ) : (
    <Marker position={initialCenter} />
  );
}

export default function NewUniversityPage() {
  const [isPending, startTransition] = useTransition();
  const [coords, setCoords] = useState<LatLngLiteral | null>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid SSR issues with Leaflet by only rendering map after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const initialCenter: LatLngLiteral = {
    lat: 6.9271, // Colombo as a default, change if you want
    lng: 79.8612,
  };

  function handleMapClick(newCoords: LatLngLiteral) {
    setCoords(newCoords);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!coords) {
      toast.error("Please select a location on the map.");
      return;
    }

    formData.set("lat", coords.lat.toString());
    formData.set("lng", coords.lng.toString());

    startTransition(async () => {
      const res = await addUniversity(formData);
      if (res.success) {
        toast.success(res.message);
        form.reset();
        setCoords(null);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New University</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required />
            </div>

            <div className="space-y-2">
              <Label>Select Location on Map</Label>
              <p className="text-xs text-muted-foreground">
                Click on the map to set the university location.
              </p>
              <div className="h-80 w-full overflow-hidden rounded-lg border">
                {mounted && (
                  <MapContainer
                    center={initialCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker
                      onChange={handleMapClick}
                      initialCenter={initialCenter}
                    />
                  </MapContainer>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {coords ? (
                  <>
                    Selected:{" "}
                    <span className="font-mono">
                      Lat {coords.lat.toFixed(5)}
                    </span>
                    ,{" "}
                    <span className="font-mono">
                      Lng {coords.lng.toFixed(5)}
                    </span>
                  </>
                ) : (
                  "No location selected yet."
                )}
              </div>
            </div>

            {/* Hidden fields just for clarity; they are set in FormData in JS too */}
            <input type="hidden" name="lat" />
            <input type="hidden" name="lng" />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save University"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
