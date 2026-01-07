import { NextRequest } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const filter = email ? { email } : {};

        const orders = await OrderService.getOrders(filter);
        return ApiResponse.success(orders);
    } catch (error) {
        return ApiResponse.error('Failed to fetch orders', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.id) {
            body.id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
        if (!body.date) {
            body.date = new Date().toISOString();
        }
        const order = await OrderService.createOrder(body);
        return ApiResponse.success(order);
    } catch (error: any) {
        // console.log(error);
        return ApiResponse.error(error.message || 'Failed to create order', 500);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return ApiResponse.error('Order ID is required', 400);
        }

        const order = await OrderService.updateOrder(id, updateData);
        if (!order) {
            return ApiResponse.error('Order not found', 404);
        }
        return ApiResponse.success(order);
    } catch (error) {
        return ApiResponse.error('Failed to update order', 500);
    }
}
