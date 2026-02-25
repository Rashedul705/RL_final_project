import { NextRequest } from 'next/server';
import { AbandonedCart } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, name, products } = body;

        if (!phone || !name || !products || !Array.isArray(products)) {
            return ApiResponse.error("Missing required fields", 400);
        }

        await dbConnect();

        // Update existing or create new abandoned cart for this phone number
        const result = await AbandonedCart.findOneAndUpdate(
            { phone },
            {
                phone,
                name,
                products
            },
            { new: true, upsert: true }
        );

        return ApiResponse.success({ message: "Cart saved", id: result._id });

    } catch (error: any) {
        console.error("Error saving abandoned cart:", error);
        return ApiResponse.error("Failed to save cart", 500);
    }
}
