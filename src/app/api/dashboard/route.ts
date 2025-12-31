
import { NextRequest } from 'next/server';
import { Order, Product } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Fetch all orders and products for client-side stats calculation
        // In a real app with many records, we should use aggregation here,
        // but to match the current frontend implementation which expects arrays:
        const orders = await Order.find({}).sort({ date: -1 });
        const products = await Product.find({});

        return ApiResponse.success({
            orders,
            products
        });
    } catch (error) {
        return ApiResponse.error('Failed to fetch dashboard data', 500);
    }
}
