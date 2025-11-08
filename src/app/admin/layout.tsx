"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { adminNavLinks } from "@/lib/nav-links";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // 🔹 Show loading skeleton while the session is loading
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-sm w-full rounded-md border border-gray-200 p-4 animate-pulse space-y-4">
        <div className="flex space-x-4">
          <div className="size-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 rounded bg-gray-200 w-3/4" />
            <div className="h-2 rounded bg-gray-200 w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-2 rounded bg-gray-200" />
          <div className="h-2 rounded bg-gray-200 w-5/6" />
          <div className="h-2 rounded bg-gray-200 w-4/6" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const user = session?.user ?? { name: "Admin", email: "admin@example.com" };

  return (
    <DashboardLayout navLinks={adminNavLinks} user={user}>
      {children}
    </DashboardLayout>
  );
}
