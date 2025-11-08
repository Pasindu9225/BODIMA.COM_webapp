"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getUniversities, deleteUniversity } from "@/lib/actions";

type University = {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
};

export default function AdminUniversityPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      const res = await getUniversities();
      setUniversities(res as University[]);
    }
    fetchData();
  }, []);

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteUniversity(id);
      if (res.success) {
        toast.success(res.message);
        setUniversities((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">Universities</h1>
        <Button asChild>
          <Link href="/admin/university/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add University
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No universities found.
                  </TableCell>
                </TableRow>
              ) : (
                universities.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.city}</TableCell>
                    <TableCell>{u.address}</TableCell>
                    <TableCell>{u.lat.toFixed(5)}</TableCell>
                    <TableCell>{u.lng.toFixed(5)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
