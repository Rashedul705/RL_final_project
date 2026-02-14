
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { Category } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    image: z.string().optional(),
    position: z.number().optional(),
});

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const categories = await Category.find({}).sort({ position: 1 });
        return ApiResponse.success(categories);
    } catch (error) {
        return ApiResponse.error('Failed to fetch categories', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const parseResult = categorySchema.safeParse(body);

        if (!parseResult.success) {
            return ApiResponse.error('Invalid input', 400);
        }

        const { name, position } = parseResult.data;
        const id = name.toLowerCase().replace(/\s+/g, '-');

        // Check uniqueness
        const existing = await Category.findOne({ id });
        if (existing) {
            return ApiResponse.error('Category slug already exists', 409);
        }

        let finalPosition = position;
        if (finalPosition === undefined) {
            const lastCategory = await Category.findOne({}).sort({ position: -1 });
            finalPosition = (lastCategory?.position || 0) + 1;
        }

        const category = await Category.create({
            ...parseResult.data,
            id,
            position: finalPosition
        });

        return ApiResponse.success(category, 201);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to create category', 500);
    }
}
