import { LayoutDashboard, Users, Building, PlusCircle, MessageSquareQuote, User, Settings, LifeBuoy } from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavLink[];
};

export const studentNavLinks: NavLink[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/recommendations', label: 'Recommendations', icon: MessageSquareQuote },
  { href: '#', label: 'Profile', icon: User },
  { href: '#', label: 'Help', icon: LifeBuoy },
];

export const providerNavLinks: NavLink[] = [
  { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/provider/listings/new', label: 'Add Listing', icon: PlusCircle },
  { href: '#', label: 'Profile', icon: User },
  { href: '#', label: 'Settings', icon: Settings },
];

export const adminNavLinks: NavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '#', label: 'Users', icon: Users },
  { href: '#', label: 'Listings', icon: Building },
  { href: '#', label: 'Settings', icon: Settings },
];
