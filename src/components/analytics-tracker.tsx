
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const initialized = useRef(false);

    useEffect(() => {
        // Debounce or ensure we only track once per navigation if strict mode is on
        const handleTracking = async () => {
            try {
                const isNewSession = !sessionStorage.getItem('analytics_session');
                if (isNewSession) {
                    sessionStorage.setItem('analytics_session', 'true');
                }

                // Basic Device Detection
                const userAgent = navigator.userAgent;
                let device = 'Desktop';
                if (/Mobi|Android/i.test(userAgent)) {
                    device = 'Mobile';
                } else if (/iPad|Tablet/i.test(userAgent)) {
                    device = 'Tablet';
                }

                // Prepare payload
                const payload = {
                    page: pathname || '/',
                    referrer: document.referrer,
                    isNewSession: isNewSession,
                    device: device,
                    // For location, we are not integrating a 3rd party IP API on client for now 
                    // to avoid CORS/RateLimits in dev, utilizing server-side defaults or random for demo
                    location: { city: 'Dhaka', country: 'BD' }
                };

                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

            } catch (error) {
                console.error('Analytics tracking failed', error);
            }
        };

        handleTracking();

    }, [pathname, searchParams]); // Re-run on route change

    return null; // Component renders nothing
}
