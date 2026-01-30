'use server';

import { sendFbEvent } from '@/lib/fb-events';
import { generateEventId } from '@/lib/utils';
import { headers } from 'next/headers';

export async function trackViewContent(product: any) {
    const eventId = generateEventId();
    const headersList = await headers();
    const referer = headersList.get('referer') || '';
    // In a real app, you might want to get IP and User Agent from headers here to improve CAPI match quality
    // e.g., headersList.get('x-forwarded-for'), headersList.get('user-agent')

    // Send CAPI Event asynchronously (don't block UI)
    sendFbEvent(
        'ViewContent',
        eventId,
        referer,
        {
            // Pass user data if available (e.g., from session)
        },
        {
            content_name: product.name,
            content_ids: [product._id || product.id],
            content_type: 'product',
            value: product.price,
            currency: 'BDT',
        }
    );

    return eventId;
}
