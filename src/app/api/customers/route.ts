
import { NextRequest } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');
        const search = searchParams.get('search');

        let filter: any = {};
        if (phone) {
            filter.phone = { $regex: phone, $options: 'i' };
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await CustomerService.getCustomers(filter);
        return ApiResponse.success(customers);
    } catch (error) {
        return ApiResponse.error('Failed to fetch customers', 500);
    }
}
