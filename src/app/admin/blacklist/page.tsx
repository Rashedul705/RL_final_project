'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Ban, Trash2, Plus, Search, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlacklistEntry {
    _id: string;
    phone: string;
    reason?: string;
    createdAt: string;
}

export default function BlacklistPage() {
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { toast } = useToast();

    const fetchBlacklist = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/blacklist');
            const data = await res.json();
            if (data.success) {
                setBlacklist(data.data);
            } else {
                toast({ title: "Error", description: "Failed to fetch blacklist", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch blacklist", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlacklist();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, reason }),
            });
            const data = await res.json();

            if (data.success) {
                toast({ title: "Success", description: "Number added to blacklist" });
                setIsAddDialogOpen(false);
                setPhone('');
                setReason('');
                fetchBlacklist();
            } else {
                toast({ title: "Error", description: data.message || "Failed to add number", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/blacklist/${deleteId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                toast({ title: "Success", description: "Number removed from blacklist" });
                fetchBlacklist();
            } else {
                toast({ title: "Error", description: data.message || "Failed to delete", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setDeleteId(null);
        }
    };

    const filteredList = blacklist.filter(item =>
        item.phone.includes(searchTerm) || (item.reason && item.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Blacklist Management</h1>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Number
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Block Customer</DialogTitle>
                            <DialogDescription>
                                Add a phone number to the blacklist to prevent them from placing orders.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="e.g. 01700000000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g. Fake orders, Refused delivery"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Adding..." : "Add to Blacklist"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search phone or reason..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Blocked Numbers</CardTitle>
                    <CardDescription>Manage customers who are restricted from ordering.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Phone</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : filteredList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredList.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell className="font-medium">{item.phone}</TableCell>
                                        <TableCell>{item.reason || <span className="text-muted-foreground italic">None</span>}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item._id)} className="text-destructive hover:text-destructive/90">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-4 text-destructive-foreground">
                <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive" />
                <div className="text-sm">
                    <p className="font-semibold text-destructive">How this works</p>
                    <p className="text-muted-foreground">
                        Customers with phone numbers listed here will be blocked from placing new orders.
                        Existing orders are not affected.
                    </p>
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will convert the customer back to a regular customer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
