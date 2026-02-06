"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import type { IUser } from '@/lib/models'; // Import type for frontend usage if needed, or define local
import Image from 'next/image';

interface Order {
    _id: string; // or id based on what backend returns
    id: string;
    date: string;
    amount: number;
    status: string;
    products: any[];
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    gender?: string;
    birthday?: string;
    addressBook?: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        postcode?: string;
        isDefaultShipping?: boolean;
        isDefaultBilling?: boolean;
    }[];
}

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            fetchData(user.email);
        }
    }, [user]);

    const fetchData = async (email: string) => {
        try {
            const [profileData, ordersData] = await Promise.all([
                apiClient.get<UserProfile>(`/profile?email=${email}`),
                apiClient.get<Order[]>(`/orders?email=${email}`)
            ]);
            setProfile(profileData);
            setOrders(ordersData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div>Loading...</div>;

    const defaultAddress = profile?.addressBook?.find(a => a.isDefaultShipping) || profile?.addressBook?.[0];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Profile */}
                <Card className="shadow-sm border-0 bg-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="font-medium text-gray-700">Personal Profile</h2>
                            <Link href="/profile/edit" className="text-sm text-cyan-500 hover:underline">EDIT</Link>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                {profile?.image ? (
                                    <Image
                                        src={profile.image}
                                        alt={profile.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1 flex-1">
                                <p className="font-medium text-gray-900">{profile?.name}</p>
                                <p>{profile?.email}</p>
                                {profile?.phone && <p>Phone: {profile.phone}</p>}
                                {profile?.birthday && <p>Birthday: {profile.birthday}</p>}
                                {profile?.gender && <p className="capitalize">Gender: {profile.gender}</p>}

                                <div className="mt-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded text-cyan-500" />
                                        Receive marketing SMS
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded text-cyan-500" />
                                        Receive marketing emails
                                    </label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Book */}
                <Card className="shadow-sm border-0 bg-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="font-medium text-gray-700">Address Book</h2>
                            <Link href="/profile/address-book" className="text-sm text-cyan-500 hover:underline">EDIT</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Default Shipping Address</h3>
                                {defaultAddress ? (
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-medium text-gray-900">{defaultAddress.fullName}</p>
                                        <p>{defaultAddress.address}</p>
                                        <p>{defaultAddress.city} - {defaultAddress.postcode}</p>
                                        <p>{defaultAddress.phone}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No default shipping address loaded.</p>
                                )}
                            </div>
                            <div className="border-l pl-4">
                                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Default Billing Address</h3>
                                {defaultAddress ? ( // Assuming same for now as mockup usually mirrors
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-medium text-gray-900">{defaultAddress.fullName}</p>
                                        <p>{defaultAddress.address}</p>
                                        <p>{defaultAddress.city} - {defaultAddress.postcode}</p>
                                        <p>{defaultAddress.phone}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No default billing address loaded.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-0">
                    <div className="p-4 border-b">
                        <h2 className="font-medium text-gray-700">Recent Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Order #</th>
                                    <th className="px-6 py-3">Placed On</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order._id || order.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{order.id}</td>
                                        <td className="px-6 py-4">{order.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {/* Placeholder for product images - would need proper data structure */}
                                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">৳ {order.amount}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/profile/orders/${order.id}`} className="text-cyan-500 font-medium hover:underline">
                                                MANAGE
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No recent orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
