import { AccommodationCard } from '@/components/accommodation-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BedDouble, Sparkles, Wifi } from 'lucide-react';
import Link from 'next/link';

const listings = [
  {
    id: '1',
    title: 'Cozy Room near University of Colombo',
    location: 'Colombo',
    price: 15000,
    imageUrl: PlaceHolderImages.find((p) => p.id === 'accommodation-1')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find((p) => p.id === 'accommodation-1')?.imageHint,
  },
  {
    id: '2',
    title: 'Modern Apartment with A/C',
    location: 'Kandy',
    price: 25000,
    imageUrl: PlaceHolderImages.find((p) => p.id === 'accommodation-2')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find((p) => p.id === 'accommodation-2')?.imageHint,
  },
  {
    id: '3',
    title: 'Quiet Studio in Galle',
    location: 'Galle',
    price: 20000,
    imageUrl: PlaceHolderImages.find((p) => p.id === 'accommodation-3')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find((p) => p.id === 'accommodation-3')?.imageHint,
  },
  {
    id: '4',
    title: 'Shared Room for Two, Nugegoda',
    location: 'Nugegoda',
    price: 12000,
    imageUrl: PlaceHolderImages.find((p) => p.id === 'accommodation-4')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find((p) => p.id === 'accommodation-4')?.imageHint,
  },
];

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Find Your Place</h1>
          <p className="text-muted-foreground">Browse available rooms and apartments.</p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/student/recommendations">
            <Sparkles className="mr-2 h-4 w-4" /> Get AI Recommendation
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colombo">Colombo</SelectItem>
              <SelectItem value="kandy">Kandy</SelectItem>
              <SelectItem value="galle">Galle</SelectItem>
              <SelectItem value="nugegoda">Nugegoda</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">LKR 10k - 15k</SelectItem>
              <SelectItem value="2">LKR 15k - 20k</SelectItem>
              <SelectItem value="3">LKR 20k+</SelectItem>
            </SelectContent>
          </Select>
           <Select>
            <SelectTrigger>
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full md:w-auto">Search</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <AccommodationCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
