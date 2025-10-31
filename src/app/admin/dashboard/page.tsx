// src/app/admin/dashboard/page.tsx
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderActions } from './provider-actions';

const pendingListings: any[] = [
    // { id: 'LST003', provider: 'Sunil Properties', title: 'Annex with Kitchenette', date: '2023-10-27' },
    // { id: 'LST005', provider: 'City Apartments', title: 'Luxury Studio', date: '2023-10-26' },
];

async function getPendingProviders() {
    const providers = await prisma.user.findMany({
        where: {
            role: 'PROVIDER',
            status: 'PENDING',
        },
        include: {
            providerProfile: true, // Include the related provider profile
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return providers;
}


export default async function AdminDashboard() {
  const pendingProviders = await getPendingProviders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Review and approve new submissions.</p>
      </div>
      <Tabs defaultValue="providers">
        <TabsList>
            <TabsTrigger value="providers">
                Provider Approvals <Badge className="ml-2">{pendingProviders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="listings">
                Listing Approvals <Badge className="ml-2">{pendingListings.length}</Badge>
            </TabsTrigger>
        </TabsList>
        <TabsContent value="providers">
            <Card>
                <CardHeader>
                    <CardTitle>Pending Provider Registrations</CardTitle>
                    <CardDescription>Review the details and approve or reject new providers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Provider Name</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Submission Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {pendingProviders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    No pending approvals.
                                    </TableCell>
                                </TableRow>
                                ) : (
                                    pendingProviders.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.providerProfile?.name ?? 'N/A'}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <ProviderActions userId={user.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="listings">
             <Card>
                <CardHeader>
                    <CardTitle>Pending Listing Submissions</CardTitle>
                    <CardDescription>This section is under construction.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground">Listing approvals will be managed here soon.</p>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
