'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type FacebookPixelProps = {
    eventId?: string;
};

export const FacebookPixel = ({ eventId }: FacebookPixelProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const loaded = useRef(false);

    useEffect(() => {
        // Initialize Pixel if not already present (Assuming GTM handles it, but fallback logic here)
        // Note: Code snippet assumes standard FB Pixel installation. 
        // If GTM is active, strict initialization might cause duplicates if not careful.
        // But for "PageView" with deduplication, we explicitly track it here.

        if (!loaded.current) {
            // Only track the initial PageView if eventId is provided (server-side generated)
            if (eventId) {
                // @ts-ignore
                if (window.fbq) {
                    // @ts-ignore
                    window.fbq('track', 'PageView', {}, { eventID: eventId });
                    loaded.current = true;
                }
            }
        }
    }, [eventId]);

    // Handle subsequent client-side navigation (Optional: disable if standard Pixel handles it, 
    // but standard pixel won't have deduplication IDs for client navs unless generated.
    // For this specific task, user asked for deduplication. 
    // Usually subsequent navigations don't have server-side counterparts unless we use server actions.
    // We will stick to the requested scope: Initial server load deduplication.)

    return null;
};
