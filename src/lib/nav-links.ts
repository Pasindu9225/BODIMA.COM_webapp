import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, Building, PlusCircle, MessageSquareQuote, User, Settings, LifeBuoy, Map } from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  iconName: keyof typeof iconMap;
  children?: NavLink[];
};

export const iconMap = {
  LayoutDashboard,
  Users,
  Building,
  PlusCircle,
  MessageSquareQuote,
  User,
  Settings,
  LifeBuoy,
  Map,
};

// studentNavLinks is no longer needed as there is no student dashboard
export const studentNavLinks: NavLink[] = [];

export const providerNavLinks: NavLink[] = [
  { href: '/provider/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { href: '/provider/listings/new', label: 'Add Listing', iconName: 'PlusCircle' },
  { href: '/provider/profile', label: 'Profile', iconName: 'User' },
  { href: '/provider/settings', label: 'Settings', iconName: 'Settings' },
];

export const adminNavLinks: NavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { href: '/admin/users', label: 'Users', iconName: 'Users' },
  { href: '/admin/listings', label: 'Listings', iconName: 'Building' },
  { href: '/admin/settings', label: 'Settings', iconName: 'Settings' },
];
