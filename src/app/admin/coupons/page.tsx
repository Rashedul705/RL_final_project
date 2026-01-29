"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CouponForm } from "@/components/admin/coupon-form";
import { format } from "date-fns";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCoupons = async () => {
        try {
            const data = await apiClient.get<any[]>('/coupons');
            setCoupons(data || []);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (values: any) => {
        setIsSubmitting(true);
        try {
            await apiClient.post('/coupons', values);
            toast({ title: "Success", description: "Coupon created successfully." });
            setIsFormOpen(false);
            fetchCoupons();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to create coupon.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingCoupon) return;
        setIsSubmitting(true);
        try {
            await apiClient.put(`/coupons/${editingCoupon._id}`, values);
            toast({ title: "Success", description: "Coupon updated successfully." });
            setIsFormOpen(false);
            setEditingCoupon(null);
            fetchCoupons();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to update coupon.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await apiClient.delete(`/coupons/${id}`);
            toast({ title: "Deleted", description: "Coupon deleted successfully." });
            fetchCoupons();
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to delete coupon.", variant: "destructive" });
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setCoupons(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
            await apiClient.put(`/coupons/${id}`, { isActive: !currentStatus });
        } catch (error) {
            // Revert on error
            setCoupons(prev => prev.map(c => c._id === id ? { ...c, isActive: currentStatus } : c));
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
    }

    const openCreateForm = () => {
        setEditingCoupon(null);
        setIsFormOpen(true);
    };

    const openEditForm = (coupon: any) => {
        setEditingCoupon(coupon);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                <Button onClick={openCreateForm}>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manage Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Usage (Used/Total)</TableHead>
                                    <TableHead>Limit/User</TableHead>
                                    <TableHead>Min Order</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.map((coupon) => (
                                    <TableRow key={coupon._id}>
                                        <TableCell className="font-medium font-mono">{coupon.code}</TableCell>
                                        <TableCell>
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `BDT ${coupon.discountValue}`}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.usageLimitPerUser}
                                        </TableCell>
                                        <TableCell>BDT {coupon.minOrderValue}</TableCell>
                                        <TableCell>
                                            {coupon.expiryDate ? format(new Date(coupon.expiryDate), 'dd MMM yyyy') : 'No Expiry'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={coupon.isActive}
                                                    onCheckedChange={() => toggleStatus(coupon._id, coupon.isActive)}
                                                />
                                                <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                                    {coupon.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditForm(coupon)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(coupon._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {coupons.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No coupons found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CouponForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={editingCoupon ? handleUpdate : handleCreate}
                initialData={editingCoupon}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
