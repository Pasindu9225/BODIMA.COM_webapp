import { DashboardLayout } from "@/components/dashboard-layout";
import { studentNavLinks } from "@/lib/nav-links";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = { name: 'Amaya Silva', email: 'amaya.s@example.com' };
  return (
    <DashboardLayout navLinks={studentNavLinks} user={user}>
      {children}
    </DashboardLayout>
  );
}
