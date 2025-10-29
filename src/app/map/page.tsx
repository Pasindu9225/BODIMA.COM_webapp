
'use client';

import { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { universities, listings } from '@/lib/data';
import { AccommodationCard } from '@/components/accommodation-card';
import { MapPin, Search, Loader2, Menu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type University = {
  name: string;
  lat: number;
  lng: number;
};

type Listing = (typeof listings)[0];

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapCenter = {
  lat: 7.8731,
  lng: 80.7718,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  ],
};


export default function MapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const filteredUniversities = useMemo(() => {
    if (!searchTerm) return [];
    return universities.filter((uni) =>
      uni.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleUniversitySelect = (uni: University) => {
    setSelectedUniversity(uni);
    setSearchTerm(uni.name);
    if (map) {
      map.panTo({ lat: uni.lat, lng: uni.lng });
      map.setZoom(14);
    }
  };
  
  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
     if (map) {
      map.panTo({ lat: listing.lat, lng: listing.lng });
    }
  }

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };
  
  const onUnmount = () => {
    setMap(null);
  };

  return (
    <div className="relative h-[calc(100vh-theme(spacing.14))] w-full">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={8}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {universities.map(uni => (
            <Marker 
              key={uni.name}
              position={{ lat: uni.lat, lng: uni.lng }}
              title={uni.name}
              onClick={() => handleUniversitySelect(uni)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#FF0000',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 6
              }}
            />
          ))}

          {listings.map(listing => (
            <Marker 
              key={listing.id}
              position={{ lat: listing.lat, lng: listing.lng }}
              title={listing.title}
              onClick={() => handleListingSelect(listing)}
            />
          ))}
          
          {selectedListing && (
            <InfoWindow
              position={{ lat: selectedListing.lat, lng: selectedListing.lng }}
              onCloseClick={() => setSelectedListing(null)}
            >
              <div className="w-64">
                <AccommodationCard listing={selectedListing} />
              </div>
            </InfoWindow>
          )}

        </GoogleMap>
      ) : loadError ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <p className="text-destructive-foreground">Error loading map. Please check your API key.</p>
        </div>
      ) : (
        <Skeleton className="h-full w-full" />
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="absolute top-4 left-4 z-10 sm:hidden">
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
                          className="cursor-pointer px-4 py-2 hover:bg-accent"
                        >
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
                <div className="grid grid-cols-1 gap-4">
                    {listings.map(listing => (
                        <div key={listing.id} onClick={() => handleListingSelect(listing)} className="cursor-pointer">
                          <AccommodationCard  listing={listing} />
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

