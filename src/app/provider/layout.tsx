import { DashboardLayout } from "@/components/dashboard-layout";
import { providerNavLinks } from "@/lib/nav-links";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const user = { name: 'Sunil Properties', email: 'provider@example.com' };
  return (
    <DashboardLayout navLinks={providerNavLinks} user={user}>
      {children}
    </DashboardLayout>
  );
}
