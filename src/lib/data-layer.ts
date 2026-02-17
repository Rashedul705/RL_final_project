import { sendGTMEvent } from './gtm';

export const cleanEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const cleanPhone = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If it starts with '880', it's likely already formatted or user typed 880...
    if (cleaned.startsWith('880')) {
        return cleaned;
    }

    // If it starts with '01', prepend '88'
    if (cleaned.startsWith('01')) {
        return `88${cleaned}`;
    }

    // If it's just a local number without 0 (unlikely but possible), prepend 880
    // But safely, if we don't recognize the format, we might just return it or try to format.
    // Requirement says: "Phone: Should include the country code (e.g., 8801XXXXXXXX)"
    // Assuming BD numbers primarily.

    return cleaned;
};

export const pushUserData = (user: { email?: string; phone?: string; name?: string }) => {
    const userData: Record<string, any> = {};

    if (user.email) {
        userData.email = cleanEmail(user.email);
    }
    if (user.phone) {
        userData.phone_number = cleanPhone(user.phone);
    }
    // GTM often looks for 'user_data' object inside the layer 
    // or flat properties depending on configuration. 
    // Standard Google Ads/Analytics often uses 'user_data' key for enhanced conversions.
    // Let's push both a flat event and a robust structure if needed.
    // For now, following "send these details to the window.dataLayer".

    if (Object.keys(userData).length > 0) {
        sendGTMEvent({
            event: 'user_data_available',
            user_data: userData
        });
    }
};
