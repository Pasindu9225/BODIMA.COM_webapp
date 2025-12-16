import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Home,
  MoreHorizontal,
  PlusCircle,
  Trash,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth"; // ✅ Correct v5 import
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";
import { deleteListing } from "@/lib/actions";

const getStatusVariant = (status: ListingStatus) => {
  switch (status) {
    case ListingStatus.APPROVED:
      return "default";
    case ListingStatus.PENDING:
      return "secondary";
    case ListingStatus.REJECTED:
      return "destructive";
    default:
      return "outline";
  }
};

export default async function ProviderDashboard() {
  // ✅ V5 Auth
  const session = await auth();

  if (!session?.user || session.user.role !== "PROVIDER") {
    return <p>Access Denied. You must be a logged-in provider.</p>;
  }

  const providerId = session.user.id;

  const listings = await prisma.listing.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });

  const totalListings = listings.length;
  const approvedCount = listings.filter(
    (l) => l.status === ListingStatus.APPROVED
  ).length;
  const pendingCount = listings.filter(
    (l) => l.status === ListingStatus.PENDING
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Provider Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your listings and view your performance.
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/provider/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Listing
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Listings
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {approvedCount} approved, {pendingCount} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    You haven&apos;t created any listings yet.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      {listing.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(listing.status)}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/provider/listings/${listing.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Public Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/provider/listings/edit/${listing.id}`}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <form action={deleteListing.bind(null, listing.id)}>
                            <DropdownMenuItem asChild>
                              <Button
                                type="submit"
                                variant="ghost"
                                className="w-full justify-start px-2 py-1.5 text-destructive hover:text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </DropdownMenuItem>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}