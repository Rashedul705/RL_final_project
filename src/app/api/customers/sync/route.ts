
import { NextRequest } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { OrderService } from '@/lib/services/order.service';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        // Fetch all orders
        const orders = await OrderService.getOrders({});

        let syncedCount = 0;
        // Process sequentially to ensure accuracy
        for (const order of orders) {
            await CustomerService.syncCustomerFromOrder(order);
            syncedCount++;
        }

        return ApiResponse.success({ message: `Successfully synced ${syncedCount} orders to customers.` });
    } catch (error) {
        console.error("Sync error:", error);
        return ApiResponse.error('Failed to sync customers', 500);
    }
}
