'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { universities, listings } from '@/lib/data';
import { AccommodationCard } from '@/components/accommodation-card';
import { MapPin, Search } from 'lucide-react';

type University = {
  name: string;
  lat: number;
  lng: number;
};

type Listing = (typeof listings)[0];

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  const filteredUniversities = useMemo(() => {
    if (!searchTerm) return [];
    return universities.filter((uni) =>
      uni.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleUniversitySelect = (uni: University) => {
    setSelectedUniversity(uni);
    setSearchTerm(uni.name);
  };

  return (
    <div className="relative h-[calc(100vh-theme(spacing.14))] w-full">
      <div className="absolute inset-0 bg-muted">
        {/* This is a mock map background. In a real app, this would be a map component like Google Maps or Leaflet. */}
        <Image
          src="https://images.unsplash.com/photo-1593348987823-45422dee0a58?q=80&w=2070&auto=format&fit=crop"
          alt="Abstract map"
          fill
          className="object-cover opacity-20"
        />

        {/* Mock university markers */}
        {universities.map(uni => (
           <button
             key={uni.name}
             className="absolute -translate-x-1/2 -translate-y-1/2 transform"
             style={{ top: `${(uni.lat - 5.9) * 25}%`, left: `${(uni.lng - 79.8) * 150}%` }}
             onClick={() => handleUniversitySelect(uni)}
             title={uni.name}
           >
             <MapPin className="h-5 w-5 text-red-500" />
           </button>
        ))}

        {/* Mock listing markers */}
        {listings.map(listing => (
            <button
                key={listing.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 transform"
                style={{ top: `${(listing.lat - 5.9) * 25}%`, left: `${(listing.lng - 79.8) * 150}%` }}
                onClick={() => setSelectedListing(listing)}
                title={listing.title}
            >
                <MapPin className="h-6 w-6 text-primary" />
            </button>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md">
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
              {searchTerm && filteredUniversities.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                  <ul>
                    {filteredUniversities.map((uni) => (
                      <li
                        key={uni.name}
                        onClick={() => handleUniversitySelect(uni)}
                        className="cursor-pointer px-4 py-2 hover:bg-accent"
                      >
                        {uni.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold">Suggestions</h3>
                <div className="grid grid-cols-1 gap-4">
                    {listings.map(listing => (
                        <AccommodationCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {selectedListing && (
         <div className="absolute bottom-4 right-4 z-10">
            <AccommodationCard listing={selectedListing} />
         </div>
      )}
    </div>
  );
}
