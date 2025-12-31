
import { NextRequest } from 'next/server';
import { ShippingMethod } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

const shippingSchema = z.object({
    name: z.string().min(2),
    cost: z.number().min(0),
    estimatedTime: z.string().min(2),
    status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const methods = await ShippingMethod.find({}).sort({ cost: 1 });
        return ApiResponse.success(methods);
    } catch (error) {
        return ApiResponse.error('Failed to fetch shipping methods', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const parseResult = shippingSchema.safeParse(body);

        if (!parseResult.success) {
            return ApiResponse.error('Invalid input', 400);
        }

        const method = await ShippingMethod.create(parseResult.data);
        return ApiResponse.success(method, 201);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to create shipping method', 500);
    }
}
