// src/app/admin/listings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminListingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Listing Management</h1>
        <p className="text-muted-foreground">Review, approve, or reject all property listings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">A comprehensive table of all listings will be available here soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
