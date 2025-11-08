// src/app/provider/profile/page.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config"; // ✅ Import from your NextAuth config
import { updateProviderProfile } from "@/lib/actions"; // ✅ Server action
import { notFound, redirect } from "next/navigation";

export default async function ProviderProfilePage() {
  // 1. Get the server-side session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login"); // Safety check — middleware should handle this
  }

  // 2. Fetch the provider's full details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      providerProfile: true, // Include related Provider model
    },
  });

  if (!user || !user.providerProfile) {
    // This happens if the user is not a provider
    notFound();
  }

  // 3. Render the provider profile
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your contact and account information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Editable Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ✅ Form calls our new server action */}
            <form action={updateProviderProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={user.providerProfile.phone || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={user.providerProfile.address || ""}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card 2: Account Status (Read-only) */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">NIC</Label>
              <p className="font-medium">{user.providerProfile.nic}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Verification
              </Label>
              <div className="flex">
                <Badge
                  variant={
                    user.providerProfile.isVerified ? "default" : "destructive"
                  }
                  className={
                    user.providerProfile.isVerified
                      ? "bg-green-700 text-green-100"
                      : "bg-yellow-700 text-yellow-100"
                  }
                >
                  {user.providerProfile.isVerified
                    ? "Verified"
                    : "Pending Review"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
