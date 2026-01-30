import { NextRequest } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { ApiResponse } from '@/lib/api-response';
import { sendMail } from '@/lib/mail';
import { Coupon } from '@/lib/models';
import dbConnect from '@/lib/db';

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

        // Send Email Notification to Admin
        try {
            await sendMail({
                to: "rashedul.afl@gmail.com",
                subject: `New Order Received - ${body.id}`,
                body: `
                    <p>A new order has been placed on Rodelas lifestyle.</p>
                    <p><strong>Order ID:</strong> ${body.id}</p>
                    <p><strong>Customer:</strong> ${body.customer}</p>
                    <p><strong>Amount:</strong> BDT ${body.amount}</p>
                    <p><strong>Phone:</strong> ${body.phone}</p>
                    <br/>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders">View Order</a>
                `,
            });
        } catch (emailError) {
            console.warn("Failed to send admin order notification (non-fatal):", emailError);
        }

        // Update Coupon Usage if applicable
        if (body.couponCode) {
            try {
                await dbConnect();
                await Coupon.findOneAndUpdate(
                    { code: body.couponCode },
                    { $inc: { usedCount: 1 } }
                );
            } catch (couponError) {
                console.error("Failed to update coupon usage:", couponError);
            }
        }

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
