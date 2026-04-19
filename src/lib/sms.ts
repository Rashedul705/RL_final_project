
interface SMSResponse {
    response_code: number;
    success_message: string;
    error_message: string;
}

const API_KEY = process.env.BULKSMSBD_API_KEY || '';
const SENDER_ID = process.env.BULKSMSBD_SENDER_ID || '';
const API_URL = process.env.BULKSMSBD_API_URL || 'http://bulksmsbd.net/api/smsapi';

if (!API_KEY || !SENDER_ID) {
    console.warn("BulkSMSBD credentials are not set in environment variables.");
}

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
        const url = new URL(API_URL);
        url.searchParams.append('api_key', API_KEY);
        url.searchParams.append('type', 'text');
        // Ensure Bangladeshi numbers start with 88 for better delivery success with BulkSMSBD
        const formattedPhone = phone.startsWith('88') ? phone : (phone.startsWith('01') ? `88${phone}` : phone);

        url.searchParams.append('number', formattedPhone);
        url.searchParams.append('senderid', SENDER_ID);
        url.searchParams.append('message', message);

        const response = await fetch(url.toString(), {
            method: 'GET',
        });

        const data = await response.json();

        console.log('SMS Response:', data);

        if (data.response_code === 202 || data.success_message) {
            return { success: true };
        }
        return { success: false, error: data.error_message || 'Unknown SMS API Error' };
    } catch (error: any) {
        console.error('Failed to send SMS:', error);
        return { success: false, error: error.message || 'Network Error' };
    }
}
