export type FacebookEventName = 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';

type FacebookUserData = {
    em?: string; // email (lowercase, hashed) or plain (CAPI will hash)
    ph?: string; // phone
    fn?: string; // first name
    ln?: string; // last name
    ct?: string; // city
    st?: string; // state
    zp?: string; // zip
    country?: string; // country
    external_id?: string;
    client_user_agent?: string;
    client_ip_address?: string;
    fbc?: string; // click id from cookie
    fbp?: string; // browser id from cookie
};

type FacebookCustomData = {
    currency?: string;
    value?: number;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    contents?: { id: string; quantity: number }[];
    content_category?: string;
    order_id?: string;
    [key: string]: any;
};

export async function sendFbEvent(
    eventName: FacebookEventName,
    eventId: string,
    eventSourceUrl: string,
    userData: FacebookUserData,
    customData?: FacebookCustomData
) {
    const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.warn('Missing Facebook Pixel ID or Access Token. Event dropped:', eventName);
        return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const payload = {
        data: [
            {
                event_name: eventName,
                event_time: currentTimestamp,
                event_id: eventId,
                event_source_url: eventSourceUrl,
                action_source: 'website',
                user_data: userData,
                custom_data: customData,
            },
        ],
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to send Facebook CAPI event:', JSON.stringify(errorData, null, 2));
        } else {
            // console.log(`Successfully sent FB CAPI event: ${eventName} (${eventId})`);
        }
    } catch (error) {
        console.error('Error sending Facebook CAPI event:', error);
    }
}
