
'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { universities, listings } from '@/lib/data';
import { AccommodationCard } from '@/components/accommodation-card';
import { Search, Menu, University as UniversityIcon, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type University = {
  name: string;
  lat: number;
  lng: number;
};

type Listing = (typeof listings)[0];

const MapPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]);
  const [mapZoom, setMapZoom] = useState(8);

  const LeafletMap = useMemo(() => dynamic(() => import('@/components/leaflet-map'), { 
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />
  }), []);

  const filteredUniversities = useMemo(() => {
    if (!searchTerm) return [];
    return universities.filter((uni) =>
      uni.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleUniversitySelect = (uni: University) => {
    setSelectedUniversity(uni);
    setSearchTerm(uni.name);
    setMapCenter([uni.lat, uni.lng]);
    setMapZoom(14);
    setSelectedListing(null); 
  };
  
  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setMapCenter([listing.lat, listing.lng]);
    setMapZoom(15);
  }

  const handleMarkerClick = (item: Listing | University) => {
    if ('price' in item) { // It's a listing
      handleListingSelect(item);
    } else { // It's a university
      handleUniversitySelect(item);
    }
  };

  const universityMarkers = universities.map(uni => ({
    position: [uni.lat, uni.lng] as [number, number],
    popupContent: uni.name,
    item: uni,
    type: 'university' as const,
  }));

  const listingMarkers = listings.map(listing => ({
    position: [listing.lat, listing.lng] as [number, number],
    popupContent: (
      <div className="w-64">
        <AccommodationCard listing={listing} />
      </div>
    ),
    item: listing,
    type: 'listing' as const,
  }));

  const allMarkers = [...universityMarkers, ...listingMarkers];

  return (
    <div className="relative h-[calc(100vh-theme(spacing.14))] w-full">
      <LeafletMap 
        center={mapCenter}
        zoom={mapZoom}
        markers={allMarkers}
        selectedListing={selectedListing}
        onMarkerClick={handleMarkerClick}
        onPopupClose={() => setSelectedListing(null)}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="absolute top-4 left-4 z-[1000] sm:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-sm sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader>
            <SheetTitle className="font-headline text-2xl">Find Accommodations</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                  {filteredUniversities.length > 0 ? (
                    <ul>
                      {filteredUniversities.map((uni) => (
                        <li
                          key={uni.name}
                          onClick={() => {
                            handleUniversitySelect(uni)
                            if (window.innerWidth < 640) setIsSheetOpen(false)
                          }}
                          className="cursor-pointer px-4 py-2 hover:bg-accent flex items-center gap-2"
                        >
                          <UniversityIcon className="h-4 w-4 text-muted-foreground" />
                          {uni.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="p-4 text-sm text-muted-foreground">No universities found.</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold">Suggestions</h3>
                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100vh-18rem)] pr-2">
                    {listings.map(listing => (
                        <div key={listing.id} onClick={() => {
                            handleListingSelect(listing)
                            if (window.innerWidth < 640) setIsSheetOpen(false)
                          }} className="cursor-pointer">
                          <AccommodationCard listing={listing} />
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MapPage;
