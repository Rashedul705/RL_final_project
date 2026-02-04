
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { steadfastService } from '@/lib/services/steadfast.service';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const order = await Order.findOne({ id: orderId });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Call Steadfast Service
        const steadfastResponse = await steadfastService.createOrder(order);

        // Update Order Status on success and save Consignment details
        order.status = 'Handed Over to Courier';

        if (steadfastResponse.consignment) {
            order.consignment_id = steadfastResponse.consignment.consignment_id.toString();
            order.tracking_code = steadfastResponse.consignment.tracking_code;
        }

        await order.save();

        return NextResponse.json({
            data: {
                success: true,
                message: 'Order sent to Steadfast successfully',
                data: steadfastResponse
            }
        });

    } catch (error: any) {
        console.error('Steadfast API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
