import Link from 'next/link';
import { BordimaLogo } from './bordima-logo';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t bg-card">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <BordimaLogo />
          <p className="text-sm text-muted-foreground">
            Connecting students with the best boarding places in Sri Lanka.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
          <div>
            <h3 className="font-headline font-semibold text-foreground">For Students</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/student/dashboard" className="text-sm text-muted-foreground hover:text-primary">Find a Place</Link></li>
              <li><Link href="/student/recommendations" className="text-sm text-muted-foreground hover:text-primary">Get Recommendations</Link></li>
              <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold text-foreground">For Providers</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/provider/register" className="text-sm text-muted-foreground hover:text-primary">List Your Property</Link></li>
              <li><Link href="/provider/dashboard" className="text-sm text-muted-foreground hover:text-primary">Dashboard</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Log In</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Bordima. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
