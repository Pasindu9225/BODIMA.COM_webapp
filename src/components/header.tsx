// src/components/header.tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BordimaLogo } from './bordima-logo';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LayoutDashboard, LogOut } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Find a Place' },
  ];
  
  const getDashboardHref = () => {
    if (session?.user?.role === 'ADMIN') return '/admin/dashboard';
    if (session?.user?.role === 'PROVIDER') return '/provider/dashboard';
    return '/login'; // Fallback for students or other roles
  };


  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <BordimaLogo />
        <nav className="ml-10 hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
           {status === 'loading' ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ''} />
                      <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   {(session.user.role === 'ADMIN' || session.user.role === 'PROVIDER') && (
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardHref()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <>
                <Button asChild variant="ghost">
                    <Link href="/register/provider">Become a Provider</Link>
                </Button>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
