"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const [isOtpEnabled, setIsOtpEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiClient.get<any>('/settings');
                if (data) {
                    // Check if it's returning the setting directly, or wrapped in a data object
                    const enabled = data.isOtpEnabled ?? true;
                    console.log("[Settings Page] Fetched settings data:", data, "-> enabled resolved to:", enabled);
                    setIsOtpEnabled(enabled);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
                toast({
                    title: "Error",
                    description: "Failed to load settings.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post('/settings', { isOtpEnabled });
            toast({
                title: "Settings Saved",
                description: "Global settings have been updated successfully.",
            });
        } catch (error) {
            console.error("Failed to save settings", error);
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Global Settings</h1>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Checkout & Security</CardTitle>
                        <CardDescription>
                            Manage global checkout verification requirements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Require OTP Verification</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enforce SMS/Email verification before a customer can place an order.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isOtpEnabled}
                                    onChange={(e) => setIsOtpEnabled(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
