'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { adminNavLinks } from "@/lib/nav-links";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Ensure the user is an admin, though middleware should handle this primarily.
  if (session?.user?.role !== 'ADMIN') {
    // This is a fallback. Middleware is the primary guard.
    redirect('/'); 
  }
  
  const user = session?.user ?? { name: 'Admin', email: 'admin@example.com' };

  return (
    <DashboardLayout navLinks={adminNavLinks} user={user}>
      {children}
    </DashboardLayout>
  );
}
