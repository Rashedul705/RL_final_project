'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuthState, useUpdateProfile, useUpdatePassword, useSignOut } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, User } from 'lucide-react';

export default function ProfilePage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();
    const [signOut] = useSignOut(auth);

    // Update Profile Hooks
    const [updateProfile, updatingProfile, profileError] = useUpdateProfile(auth);
    const [updatePassword, updatingPassword, passwordError] = useUpdatePassword(auth);

    // Local state for form inputs
    const [displayName, setDisplayName] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user, loading, router]);

    const handleUpdateProfile = async () => {
        try {
            const success = await updateProfile({ displayName });
            if (success) {
                toast({ title: 'Profile Updated', description: 'Your display name has been updated.' });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
            return;
        }
        try {
            const success = await updatePassword(newPassword);
            if (success) {
                toast({ title: 'Password Updated', description: 'Your password has been changed.' });
                setNewPassword('');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) return null; // Redirecting in useEffect

    return (
        <div className="container mx-auto max-w-2xl py-10 px-4">
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={user.email || ''} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <div className="flex gap-2">
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your Name"
                            />
                            <Button onClick={handleUpdateProfile} disabled={updatingProfile}>
                                {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <Label>Change Password</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                            />
                            <Button onClick={handleUpdatePassword} disabled={updatingPassword} variant="secondary">
                                {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                            </Button>
                        </div>
                    </div>

                    {(profileError || passwordError) && (
                        <div className="text-red-500 text-sm">
                            {profileError?.message || passwordError?.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <div className="text-xs text-muted-foreground">
                        User ID: {user.uid}
                    </div>
                    <Button variant="destructive" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
