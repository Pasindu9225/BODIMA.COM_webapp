import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BordimaLogo } from './bordima-logo';

export function Header() {
  return (
    <header className="absolute top-0 z-20 w-full bg-transparent py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <BordimaLogo className="text-white drop-shadow-lg" />
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
