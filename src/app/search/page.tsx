"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";

// Prisma types
import type {
  Listing as DbListing,
  University as DbUniversity,
} from "@prisma/client";

// Server actions
import {
  getRandomListings,
  getUniversities,
  getListingsNearUniversity,
} from "@/lib/actions";

// Shared types
import type { Listing, University, MarkerData } from "@/lib/types";

// --- Adapter: DB → UI ---
function toUiListing(db: DbListing): Listing {
  return {
    ...db,
    location: db.city,
    roomType: db.roomType as "single" | "shared",
    status: db.status.toLowerCase() as "pending" | "approved" | "rejected",
  };
}

function toUiUniversity(db: DbUniversity): University {
  return {
    name: db.name,
    lat: db.lat,
    lng: db.lng,
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [distance, setDistance] = useState(5); // ✅ default distance filter
  const [listings, setListings] = useState<Listing[]>([]);
  const [allUniversities, setAllUniversities] = useState<DbUniversity[]>([]);
  const [suggestions, setSuggestions] = useState<DbUniversity[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    7.8731, 80.7718,
  ]); // Sri Lanka
  const [mapZoom, setMapZoom] = useState(8);
  const [isPending, startTransition] = useTransition();

  // Dynamic Leaflet map (client-only)
  const LeafletMap = useMemo(
    () =>
      dynamic(() => import("@/components/leaflet-map"), {
        ssr: false,
        loading: () => <div className="h-full w-full bg-muted animate-pulse" />,
      }),
    []
  );

  // 🔹 1. Load random listings + universities at startup
  useEffect(() => {
    (async () => {
      try {
        const [randomListings, universities] = await Promise.all([
          getRandomListings(),
          getUniversities(),
        ]);
        setListings(randomListings.map(toUiListing));
        setAllUniversities(universities);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load listings or universities.");
      }
    })();
  }, []);

  // 🔹 2. Filter suggestions for autocomplete
  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allUniversities
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.city && u.city.toLowerCase().includes(q))
      )
      .slice(0, 8);
    setSuggestions(filtered);
  }, [query, allUniversities]);

  // 🔹 3. Build markers for map
  const markers: MarkerData[] = useMemo(
    () => [
      // Universities
      ...allUniversities.map((uni) => ({
        position: [uni.lat, uni.lng] as [number, number],
        popupContent: <h3>{uni.name}</h3>,
        item: toUiUniversity(uni),
        type: "university" as const,
      })),
      // Listings
      ...listings.map((listing) => ({
        position: [listing.lat, listing.lng] as [number, number],
        popupContent: (
          <div>
            <h3>{listing.title}</h3>
            <p>LKR {listing.price.toLocaleString()} / month</p>
          </div>
        ),
        item: listing,
        type: "listing" as const,
      })),
    ],
    [allUniversities, listings]
  );

  // 🔹 4. Marker and card handlers
  const handleMarkerClick = (item: Listing | University) => {
    if ("price" in item) setSelectedListing(item as Listing);
    setMapCenter([item.lat, item.lng]);
    setMapZoom(15);
  };

  const handleCardClick = (listing: Listing) => {
    setSelectedListing(listing);
    setMapCenter([listing.lat, listing.lng]);
    setMapZoom(15);
  };

  const handlePopupClose = () => setSelectedListing(null);

  // 🔹 5. Search logic (by university + distance)
  const handleSearch = () => {
    const q = query.trim();
    if (!q) {
      toast.info("Type a university name to search.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await getListingsNearUniversity(q, distance);
        if (!result.university) {
          toast.info("No university found matching that name.");
          return;
        }

        const uiResults = result.listings.map(toUiListing);
        setListings(uiResults);

        // ✅ Keep all universities visible
        setAllUniversities((prev) => {
          const exists = prev.some((u) => u.id === result.university.id);
          return exists ? prev : [...prev, result.university];
        });

        setMapCenter([result.university.lat, result.university.lng]);
        setMapZoom(13);

        if (uiResults.length === 0) {
          toast.info("No nearby listings found around this university.");
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to perform search.");
      }
    });
  };

  // 🔹 6. Suggestion click
  const handleSuggestionClick = (uni: DbUniversity) => {
    setQuery(uni.name);
    setSuggestions([]);
    setMapCenter([uni.lat, uni.lng]);
    setMapZoom(13);
    handleSearch();
  };

  // 🔹 7. Reset map (restore all)
  const handleReset = async () => {
    try {
      const [randomListings, universities] = await Promise.all([
        getRandomListings(),
        getUniversities(),
      ]);
      setListings(randomListings.map(toUiListing));
      setAllUniversities(universities);
      setMapCenter([7.8731, 80.7718]);
      setMapZoom(8);
      setQuery("");
      setSuggestions([]);
      setSelectedListing(null);
      toast.success("Map reset to default view.");
    } catch (error) {
      console.error("Error resetting map:", error);
      toast.error("Failed to reset map.");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* 🔹 Left Panel */}
        <aside className="w-full overflow-y-auto border-r md:w-1/3 lg:w-1/3">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              {/* Search Section */}
              <div>
                <h2 className="font-headline text-xl font-semibold">
                  Find a Place
                </h2>
                <div className="relative mt-2">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by university or city..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleSearch}
                    disabled={isPending}
                  >
                    Search
                  </Button>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-2 rounded-md border bg-background shadow-sm">
                    {suggestions.map((uni) => (
                      <div
                        key={uni.id}
                        className="cursor-pointer px-3 py-2 hover:bg-muted"
                        onClick={() => handleSuggestionClick(uni)}
                      >
                        <div className="text-sm font-medium">{uni.name}</div>
                        {uni.city && (
                          <div className="text-xs text-muted-foreground">
                            {uni.city}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Distance Filter */}
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">
                    Search Radius (km)
                  </label>
                  <select
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="
    w-full rounded-md border px-2 py-1 text-sm
    bg-background text-foreground
    dark:bg-gray-800 dark:text-white
    focus:ring-2 focus:ring-primary focus:outline-none
  "
                  >
                    <option
                      value={3}
                      className="bg-white text-black dark:bg-gray-800 dark:text-white"
                    >
                      3 km
                    </option>
                    <option
                      value={5}
                      className="bg-white text-black dark:bg-gray-800 dark:text-white"
                    >
                      5 km
                    </option>
                    <option
                      value={7}
                      className="bg-white text-black dark:bg-gray-800 dark:text-white"
                    >
                      7 km
                    </option>
                    <option
                      value={10}
                      className="bg-white text-black dark:bg-gray-800 dark:text-white"
                    >
                      10 km
                    </option>
                  </select>
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={handleReset}
                >
                  Reset Map
                </Button>
              </div>

              {/* Results List */}
              <div>
                <h3 className="font-semibold">
                  {listings.length} Result{listings.length === 1 ? "" : "s"}
                </h3>
                <div className="mt-4 space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => handleCardClick(listing)}
                    >
                      <Card className="cursor-pointer hover:shadow-md">
                        <div className="p-4">
                          <h4 className="font-semibold">{listing.title}</h4>
                          <p className="text-sm text-primary">
                            LKR {listing.price.toLocaleString()} / month
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {listing.location}
                          </p>
                        </div>
                      </Card>
                    </div>
                  ))}
                  {listings.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No listings to show yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* 🔹 Right Panel: Map */}
        <main className="hidden flex-1 bg-muted/30 md:block">
          <LeafletMap
            center={mapCenter}
            zoom={mapZoom}
            markers={markers}
            selectedListing={selectedListing}
            onMarkerClick={handleMarkerClick}
            onPopupClose={handlePopupClose}
          />
        </main>
      </div>
    </div>
  );
}
