import { DashboardLayout } from "@/components/dashboard-layout";
import { adminNavLinks } from "@/lib/nav-links";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = { name: 'Admin User', email: 'admin@bordima.com' };
  return (
    <DashboardLayout navLinks={adminNavLinks} user={user}>
      {children}
    </DashboardLayout>
  );
}
