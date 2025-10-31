// src/app/search/page.tsx
'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search as SearchIcon } from 'lucide-react';
import { listings, universities } from '@/lib/data';
import type { Listing, University, MarkerData } from '@/lib/types';
import { AccommodationCard } from '@/components/accommodation-card';

export default function SearchPage() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]); // Default center of Sri Lanka
  const [mapZoom, setMapZoom] = useState(8);

  const LeafletMap = useMemo(() => dynamic(
    () => import('@/components/leaflet-map'),
    { 
      ssr: false,
      loading: () => <div className="h-full w-full bg-muted animate-pulse" />
    }
  ), []);

  const markers: MarkerData[] = [
    ...universities.map(uni => ({
      position: [uni.lat, uni.lng] as [number, number],
      popupContent: <h3>{uni.name}</h3>,
      item: uni,
      type: 'university' as const,
    })),
    ...listings.map(listing => ({
      position: [listing.lat, listing.lng] as [number, number],
      popupContent: (
        <div>
          <h3>{listing.title}</h3>
          <p>LKR {listing.price.toLocaleString()} / month</p>
        </div>
      ),
      item: listing,
      type: 'listing' as const,
    })),
  ];

  const handleMarkerClick = (item: Listing | University) => {
    if ('price' in item) { // It's a Listing
      setSelectedListing(item);
    }
    setMapCenter([item.lat, item.lng]);
    setMapZoom(15);
  };
  
  const handleCardClick = (listing: Listing) => {
    setSelectedListing(listing);
    setMapCenter([listing.lat, listing.lng]);
    setMapZoom(15);
  };

  const handlePopupClose = () => {
    setSelectedListing(null);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Left Panel: Search and Results */}
        <aside className="w-full overflow-y-auto border-r md:w-1/3 lg:w-1/3">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              {/* Search Bar */}
              <div>
                <h2 className="font-headline text-xl font-semibold">Find a Place</h2>
                <div className="relative mt-2">
                  <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by university, city..." className="pl-10" />
                </div>
              </div>

              {/* Filters Placeholder */}
              <div>
                <h3 className="font-semibold">Filters</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    Price Range
                  </Button>
                  <Button variant="outline" className="w-full">
                    Room Type
                  </Button>
                  <Button variant="outline" className="w-full">
                    Amenities
                  </Button>
                  <Button variant="outline" className="w-full">
                    More Filters
                  </Button>
                </div>
              </div>

              {/* Result List */}
              <div>
                <h3 className="font-semibold">{listings.length} Results</h3>
                <div className="mt-4 space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} onClick={() => handleCardClick(listing)}>
                      <Card className="cursor-pointer hover:shadow-md">
                        <div className="p-4">
                          <h4 className="font-semibold">{listing.title}</h4>
                          <p className="text-sm text-primary">
                            LKR {listing.price.toLocaleString()} / month
                          </p>
                          <p className="text-xs text-muted-foreground">{listing.location}</p>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Right Panel: Map */}
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
