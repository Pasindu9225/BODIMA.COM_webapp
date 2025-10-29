import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { Button } from './ui/button';
import Link from 'next/link';

interface AccommodationCardProps {
  listing: Partial<Listing> & { id: string; title: string; imageUrl?: string; imageHint?: string };
}

export function AccommodationCard({ listing }: AccommodationCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video w-full">
        {listing.imageUrl && (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
            data-ai-hint={listing.imageHint}
          />
        )}
        <Badge className="absolute right-2 top-2" variant="secondary">
          Verified
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1 font-headline text-xl">{listing.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 pt-1">
          <MapPin className="h-4 w-4" />
          {listing.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-lg font-bold">
          LKR {listing.price?.toLocaleString() ?? 'N/A'} <span className="text-sm font-normal text-muted-foreground">/ month</span>
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href="#">View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
