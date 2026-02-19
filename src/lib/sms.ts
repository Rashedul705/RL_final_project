
interface SMSResponse {
    response_code: number;
    success_message: string;
    error_message: string;
}

const API_KEY = 'wD66rUdSwEWvl4WcwVRX';
const SENDER_ID = '8809648906383';
const API_URL = 'http://bulksmsbd.net/api/smsapi';

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
        const url = new URL(API_URL);
        url.searchParams.append('api_key', API_KEY);
        url.searchParams.append('type', 'text');
        url.searchParams.append('number', phone);
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
