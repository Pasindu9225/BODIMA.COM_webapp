import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BedDouble, MapPin, Wifi } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AccommodationCard } from '@/components/accommodation-card';

const featuredListings = [
  {
    id: '1',
    title: 'Cozy Room near University',
    location: 'Colombo',
    price: 15000,
    imageUrl: PlaceHolderImages.find(p => p.id === 'accommodation-1')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find(p => p.id === 'accommodation-1')?.imageHint,
    features: [
      { icon: Wifi, label: 'Wi-Fi' },
      { icon: BedDouble, label: 'Furnished' },
    ],
  },
  {
    id: '2',
    title: 'Modern Apartment with A/C',
    location: 'Kandy',
    price: 25000,
    imageUrl: PlaceHolderImages.find(p => p.id === 'accommodation-2')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find(p => p.id === 'accommodation-2')?.imageHint,
    features: [
      { icon: Wifi, label: 'Wi-Fi' },
      { icon: BedDouble, label: 'A/C' },
    ],
  },
  {
    id: '3',
    title: 'Quiet Studio in Galle',
    location: 'Galle',
    price: 20000,
    imageUrl: PlaceHolderImages.find(p => p.id === 'accommodation-3')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find(p => p.id === 'accommodation-3')?.imageHint,
    features: [
      { icon: Wifi, label: 'Wi-Fi' },
      { icon: MapPin, label: 'Near Beach' },
    ],
  },
];

const testimonials = [
  {
    name: 'Nimali Perera',
    role: 'University Student',
    avatar: PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageHint,
    comment:
      'Bordima helped me find the perfect place near my campus in just a few clicks. The map feature is a lifesaver!',
  },
  {
    name: 'Kasun Rathnayake',
    role: 'Boarding Provider',
    avatar: PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageHint,
    comment:
      'Listing my property was so easy. I got verified quickly and started receiving inquiries from students almost immediately.',
  },
  {
    name: 'Fathima Rizwan',
    role: 'Medical Student',
    avatar: PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageUrl ?? '',
    imageHint: PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageHint,
    comment:
      'The AI recommendation tool was surprisingly accurate. It suggested places I hadn\'t considered that fit my budget and were close to my hospital.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="Background image of a cozy living space"
              fill
              className="object-cover object-center"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-primary/80" />
          <div className="container relative z-10 mx-auto px-4 text-center text-primary-foreground">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Home Away From Home
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl">
              Discover the best boarding places for students across Sri Lanka. Safe, affordable, and close to your campus.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/map">
                  Find a Place <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-accent bg-transparent text-accent hover:bg-accent hover:text-white">
                <Link href="/provider/register">
                  Become a Provider
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-background py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Featured Accommodations</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
                Handpicked selections that offer the best in comfort, safety, and convenience.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <AccommodationCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
                Real stories from students and providers who love our platform.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col">
                  <CardContent className="flex-1 p-6">
                    <p className="text-foreground/80">"{testimonial.comment}"</p>
                  </CardContent>
                  <CardHeader className="flex flex-row items-center gap-4 p-6 pt-0">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} data-ai-hint={testimonial.imageHint} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-bold">{testimonial.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
