// src/app/admin/users/page.tsx
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
import { prisma } from "@/lib/prisma"; // Make sure this path is correct

// 1. Make the component async so we can fetch data
export default async function AdminUsersPage() {
  // 2. Fetch all users from the database
  // AFTER:
  const users = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {/* 3. Update the description */}A list of all users who have
            registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 4. Replace the placeholder with the real table */}
          <div className="w-full overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "APPROVED"
                            ? "default"
                            : user.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          user.status === "APPROVED"
                            ? "bg-green-700 text-green-100"
                            : user.status === "PENDING"
                            ? "bg-yellow-700 text-yellow-100"
                            : "bg-red-700 text-red-100"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
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
