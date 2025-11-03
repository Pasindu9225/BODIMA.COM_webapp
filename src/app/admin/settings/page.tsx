// src/app/admin/settings/page.tsx
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
  TableRow, // <-- Make sure TableRow is imported
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { createAmenity, deleteAmenity } from "@/lib/actions";

export default async function AdminSettingsPage() {
  const amenities = await prisma.amenity.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure global settings for the application.
        </p>
      </div>

      {/* --- Create Amenity Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Amenity Manager</CardTitle>
          <CardDescription>
            Add or remove amenities that providers can add to their listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* This form action is now valid */}
          <form action={createAmenity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Amenity Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Wi-Fi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="e.g. wifi (for icon library)"
                  required
                />
              </div>
              <div className="self-end">
                <Button type="submit" className="w-full md:w-auto">
                  Add Amenity
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --- Existing Amenities Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                {/* --- FIX 3: This is the typo location --- */}
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Name</TableHead>
                  <TableHead>Icon Tag</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                {/* ^-- Was </row>, now </TableRow> (or just <TableRow> as it's self-closing in some libs) */}
                {/* Editor might prefer the opening tag is not self-closed, so I'll write it out fully. */}
              </TableHeader>
              <TableBody>
                {amenities.map((amenity) => (
                  <TableRow key={amenity.id}>
                    <TableCell className="font-medium">
                      {amenity.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {amenity.icon}
                    </TableCell>
                    <TableCell>
                      {new Date(amenity.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* This form action is now valid */}

                      <form action={deleteAmenity.bind(null, amenity.id)}>
                        <Button type="submit" size="sm" variant="destructive">
                          Delete
                        </Button>
                      </form>
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
