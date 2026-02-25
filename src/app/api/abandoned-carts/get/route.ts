import { NextRequest } from 'next/server';
import { AbandonedCart } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const carts = await AbandonedCart.find().sort({ updatedAt: -1 }).lean();
        return ApiResponse.success(carts);
    } catch (error: any) {
        console.error("Error fetching abandoned carts:", error);
        return ApiResponse.error("Failed to fetch abandoned carts", 500);
    }
}
