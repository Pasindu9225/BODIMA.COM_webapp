// src/app/admin/listings/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { approveListing, rejectListing } from "@/lib/actions"; // Import our new actions

// Make the component async to fetch data
export default async function AdminListingsPage() {
  // Fetch all listings, and include the provider's name
  const listings = await prisma.listing.findMany({
    orderBy: [
      { status: "asc" }, // Show PENDING listings first
      { createdAt: "desc" },
    ],
    include: {
      provider: true, // Get the 'User' data for the provider
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Listing Management</h1>
        <p className="text-muted-foreground">
          Review, approve, or reject all property listings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>
            A list of all listings, sorted by status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Listing</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Price (LKR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="font-medium">{listing.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {listing.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{listing.provider.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {listing.provider.email}
                      </div>
                    </TableCell>
                    <TableCell>{listing.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          listing.status === "APPROVED"
                            ? "default"
                            : listing.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          listing.status === "APPROVED"
                            ? "bg-green-700 text-green-100"
                            : listing.status === "PENDING"
                            ? "bg-yellow-700 text-yellow-100"
                            : "bg-red-700 text-red-100"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>

                    {/* ACTION BUTTONS */}
                    <TableCell className="text-right">
                      {listing.status === "PENDING" && (
                        <div className="flex gap-2 justify-end">
                          <form action={approveListing.bind(null, listing.id)}>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                          </form>
                          <form action={rejectListing.bind(null, listing.id)}>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
