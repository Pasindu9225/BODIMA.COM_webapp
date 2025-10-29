import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const pendingProviders = [
    { id: 'P001', name: 'Kamal Real Estate', contact: 'Kamal Perera', date: '2023-10-26' },
    { id: 'P002', name: 'Nimali Hostels', contact: 'Nimali Silva', date: '2023-10-25' },
];

const pendingListings = [
    { id: 'LST003', provider: 'Sunil Properties', title: 'Annex with Kitchenette', date: '2023-10-27' },
    { id: 'LST005', provider: 'City Apartments', title: 'Luxury Studio', date: '2023-10-26' },
];

export default function AdminDashboard() {
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
                            {pendingProviders.map((provider) => (
                                <TableRow key={provider.id}>
                                    <TableCell className="font-medium">{provider.name}</TableCell>
                                    <TableCell>{provider.contact}</TableCell>
                                    <TableCell>{provider.date}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm">View</Button>
                                        <Button size="sm">Approve</Button>
                                        <Button variant="destructive" size="sm">Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="listings">
            <Card>
                <CardHeader>
                    <CardTitle>Pending Listing Submissions</CardTitle>
                    <CardDescription>Review the details and approve or reject new listings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Listing Title</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Submission Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingListings.map((listing) => (
                                <TableRow key={listing.id}>
                                    <TableCell className="font-medium">{listing.title}</TableCell>
                                    <TableCell>{listing.provider}</TableCell>
                                    <TableCell>{listing.date}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm">View</Button>
                                        <Button size="sm">Approve</Button>
                                        <Button variant="destructive" size="sm">Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
