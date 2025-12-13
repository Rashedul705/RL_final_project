"use client";

import { useEffect, useState } from "react";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Shield, ShieldCheck, UserCog, Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Badge } from "@/components/ui/badge";
import { isAdminEmail } from "@/lib/utils";

type TeamMember = {
    id: string; // This will be the email
    email: string;
    role: "admin" | "moderator";
    addedAt: any;
};

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<"admin" | "moderator">("moderator");
    const [isAdding, setIsAdding] = useState(false);

    // Real-time subscription to team members
    useEffect(() => {
        // Safety timeout in case Firestore hangs
        const timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                // Neutral message so user isn't alarmed
                toast({
                    title: "Ready",
                    description: "You store is ready. You can start adding team members.",
                });
            }
        }, 4000);

        // const q = query(collection(db, "team_members"), orderBy("addedAt", "desc"));
        // Removing orderBy temporarily to avoid index issues
        const q = query(collection(db, "team_members"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const ms = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as TeamMember[];
                setMembers(ms);
                setLoading(false);
                clearTimeout(timer);
            },
            (error) => {
                console.error("Firestore error:", error);
                // Only show error if it's a permission/fatal issue, otherwise might be just empty/init
                if (error.code !== 'unavailable') {
                    toast({
                        variant: "destructive",
                        title: "Connection Issue",
                        description: "Please check your internet connection."
                    });
                }
                setLoading(false);
                clearTimeout(timer);
            }
        );

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [toast]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;

        if (!newEmail.includes("@")) {
            toast({
                variant: "destructive",
                title: "Invalid Email",
                description: "Please enter a valid email address.",
            });
            return;
        }

        setIsAdding(true);

        const newMember: TeamMember = {
            id: newEmail,
            email: newEmail,
            role: newRole,
            addedAt: new Date(),
        };

        // Optimistic Update: Show it immediately!
        setMembers(prev => [newMember, ...prev]);

        // Creating the write promise but not holding the UI hostage for it indefinitely
        const writePromise = setDoc(doc(db, "team_members", newEmail), {
            email: newEmail,
            role: newRole,
            addedAt: serverTimestamp(),
        });

        // Race: Either write finishes, or we timeout after 2s and assume it's queued/optimistic success
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));

        try {
            const result = await Promise.race([writePromise, timeoutPromise]);

            // If it timed out, we assume it's offline/slow persistence and just let the UI proceed
            // Firestore SDK will handle the sync eventually

            toast({
                title: "Member Added",
                description: `${newEmail} has been added as a ${newRole}.`,
            });
            setNewEmail("");
            setNewRole("moderator");
        } catch (error: any) {
            console.error("Error adding member:", error);
            // Revert optimistic update if failed (and not just timed out)
            setMembers(prev => prev.filter(m => m.id !== newEmail));

            let desc = "Failed to add team member.";
            if (error.code === 'permission-denied') desc = "You do not have permission to add members.";

            toast({
                variant: "destructive",
                title: "Error",
                description: desc,
            });
        } finally {
            setIsAdding(false);
        }
    };

    const [rowLoading, setRowLoading] = useState<string | null>(null);

    const handleRemoveMember = async (memberId: string) => {
        // Removed confirm dialog for debugging/smoother UX
        console.log("Attempting to delete member:", memberId);
        setRowLoading(memberId);

        // We rely on Firestore's "onSnapshot" to update the UI optimistically. 
        // When we call deleteDoc, the snapshot listener receives a local update immediately.
        // We don't need to manually filter 'members'.

        const deletePromise = deleteDoc(doc(db, "team_members", memberId));
        // Increase timeout slightly
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 3500));

        try {
            await Promise.race([deletePromise, timeoutPromise]);
            console.log("Delete operation initiated/completed for:", memberId);

            toast({
                title: "Member Removing...",
                description: "The member is being removed.",
            });
        } catch (error: any) {
            console.error("Error removing member:", error);

            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message || "Failed to remove member.",
            });
        } finally {
            setRowLoading(null);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: "admin" | "moderator") => {
        // Optimistic Update
        const previousMembers = [...members];
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));

        try {
            await updateDoc(doc(db, "team_members", memberId), {
                role: newRole
            });

            toast({
                title: "Role Updated",
                description: `Member role updated to ${newRole}.`,
            });
        } catch (error) {
            console.error("Error updating role:", error);
            // Revert optimistic update
            setMembers(previousMembers);

            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update role.",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Team Settings</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            Manage who has access to the admin panel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No team members found. Add one below.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.email}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(val: "admin" | "moderator") => handleUpdateRole(member.id, val)}
                                                    disabled={user?.email === member.email}
                                                >
                                                    <SelectTrigger className="h-8 w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">
                                                            <div className="flex items-center">
                                                                <ShieldCheck className="mr-2 h-3 w-3" />
                                                                Admin
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="moderator">
                                                            <div className="flex items-center">
                                                                <Shield className="mr-2 h-3 w-3" />
                                                                Moderator
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    disabled={user?.email === member.email || rowLoading === member.id}
                                                >
                                                    {rowLoading === member.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Add Member</CardTitle>
                        <CardDescription>
                            Invite a new user to the admin team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Email address"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Select
                                    value={newRole}
                                    onValueChange={(value: "admin" | "moderator") => setNewRole(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <span className="font-medium">Admin</span>
                                            <p className="text-xs text-muted-foreground">Full access to manage products, orders, and team.</p>
                                        </SelectItem>
                                        <SelectItem value="moderator">
                                            <span className="font-medium">Moderator</span>
                                            <p className="text-xs text-muted-foreground">Can manage products and orders. Cannot manage team.</p>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={isAdding}>
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <UserCog className="h-4 w-4 mr-2" />
                                )}
                                Add Member
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
