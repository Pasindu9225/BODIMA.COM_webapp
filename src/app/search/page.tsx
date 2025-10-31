// src/app/search/page.tsx
'use client';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search as SearchIcon } from 'lucide-react';

// Mock data for demonstration purposes
const mockListings = [
  { id: 1, title: 'Cozy Room near University of Colombo', price: '15,000' },
  { id: 2, title: 'Modern Apartment in Malabe', price: '25,000' },
  { id: 3, title: 'Quiet Studio in Peradeniya', price: '20,000' },
  { id: 4, title: 'Shared Room for Two, Nugegoda', price: '12,000' },
  { id: 5, title: 'Annex with A/C, Moratuwa', price: '18,000' },
  { id: 6, title: 'Upstairs Room with Balcony', price: '22,000' },
];

export default function SearchPage() {
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
                <h3 className="font-semibold">Results</h3>
                <div className="mt-2 space-y-4">
                  {mockListings.map((listing) => (
                    <Card key={listing.id} className="cursor-pointer hover:shadow-md">
                      <div className="p-4">
                        <h4 className="font-semibold">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          LKR {listing.price} / month
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Right Panel: Map */}
        <main className="hidden flex-1 bg-muted/30 md:block">
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Google Map Component</p>
          </div>
        </main>
      </div>
    </div>
  );
}
