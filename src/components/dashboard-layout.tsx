'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { BordimaLogo } from './bordima-logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import type { NavLink } from '@/lib/nav-links';
import { iconMap } from '@/lib/nav-links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

type DashboardLayoutProps = {
  children: React.ReactNode;
  navLinks: NavLink[];
  user: { name?: string | null; email?: string | null; image?: string | null };
};

export function DashboardLayout({ children, navLinks, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? 'No email';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <BordimaLogo className="text-sidebar-foreground" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => {
              const Icon = iconMap[link.iconName];
              return (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton isActive={pathname === link.href} tooltip={link.label}>
                      <Icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-14 w-full justify-start px-2">
                 <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {user?.image && <AvatarImage src={user.image} />}
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left group-data-[collapsible=icon]:hidden">
                    <p className="font-semibold">{userName}</p>
                    <p className="text-xs text-sidebar-foreground/70">{userEmail}</p>
                  </div>
                 </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6">{children}</main>
    </SidebarProvider>
  );
}
