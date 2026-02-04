
import { IOrder } from '@/lib/models';

interface SteadfastCreateOrderResponse {
    status: number;
    message: string;
    consignment: {
        consignment_id: number;
        invoice: string;
        tracking_code: string;
    };
    errors?: any;
}

export const steadfastService = {
    async createOrder(order: IOrder): Promise<SteadfastCreateOrderResponse> {
        const apiKey = process.env.STEADFAST_API_KEY;
        const secretKey = process.env.STEADFAST_SECRET_KEY;
        const baseUrl = process.env.STEADFAST_BASE_URL;

        if (!apiKey || !secretKey || !baseUrl) {
            throw new Error('Steadfast API credentials are not configured.');
        }

        const payload = {
            invoice: order.id,
            recipient_name: order.customer,
            recipient_phone: order.phone,
            recipient_address: order.address,
            cod_amount: parseInt(order.amount), // Ensure number
            note: 'Order from Website'
        };

        try {
            const response = await fetch(`${baseUrl}/create_order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': apiKey,
                    'Secret-Key': secretKey
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.status !== 200) {
                console.error('Steadfast API Error:', data);
                throw new Error(data.message || 'Failed to create order in Steadfast');
            }

            return data;
        } catch (error: any) {
            console.error('Steadfast Service Error:', error);
            throw new Error(error.message || 'Network error connecting to Steadfast');
        }
    }
};
