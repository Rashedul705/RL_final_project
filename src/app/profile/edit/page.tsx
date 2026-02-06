"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    gender: string;
    birthday: string;
    image?: string;
}

export default function EditProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birthday: '',
        image: ''
    });

    useEffect(() => {
        if (user?.email) {
            fetchProfile(user.email);
        }
    }, [user]);

    const fetchProfile = async (email: string) => {
        try {
            const data = await apiClient.get<UserProfile>(`/profile?email=${email}`);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                gender: data.gender || '',
                birthday: data.birthday || '',
                image: data.image || ''
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenderChange = (value: string) => {
        setFormData({ ...formData, gender: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.data.url }));
                toast({
                    title: "Image Uploaded",
                    description: "Profile picture uploaded successfully.",
                });
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload Failed",
                description: "Failed to upload image. Please try again.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put('/profile', formData);
            toast({
                title: "Profile Updated",
                description: "Your profile information has been updated successfully.",
            });
            router.push('/profile');
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl bg-white p-6 shadow-sm rounded-lg">
            <h1 className="text-xl font-bold mb-6 text-gray-800">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                        {formData.image ? (
                            <Image
                                src={formData.image}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="profile-image-upload"
                            className={`cursor-pointer text-sm text-cyan-500 font-medium hover:text-cyan-600 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploading ? 'Uploading...' : 'Change Profile Picture'}
                        </label>
                        <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <Input
                            name="email"
                            value={formData.email}
                            readOnly
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400">Email cannot be changed.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Birthday</label>
                        <Input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Gender</label>
                        <Select onValueChange={handleGenderChange} value={formData.gender}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" className="px-8 bg-cyan-500 hover:bg-cyan-600" disabled={loading || uploading}>
                        {loading ? "SAVING..." : "SAVE CHANGES"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
