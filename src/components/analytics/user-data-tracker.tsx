"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { pushUserData } from '@/lib/data-layer';

export function UserDataTracker() {
    const { user } = useAuth();
    const lastUserRef = useRef<string | null>(null);

    useEffect(() => {
        if (user) {
            const userSignature = `${user.email}-${user.phone}`;
            // Avoid duplicate pushes for the same session/user unless data changes
            if (lastUserRef.current !== userSignature) {
                pushUserData({
                    email: user.email,
                    phone: user.phone,
                    name: user.name
                });
                lastUserRef.current = userSignature;
            }
        }
    }, [user]);

    return null;
}
