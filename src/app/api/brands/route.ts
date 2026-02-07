
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { Brand } from '@/lib/models';
import { z } from 'zod';

const createBrandSchema = z.object({
    name: z.string().min(1, 'Brand name is required'),
    description: z.string().optional(),
    image: z.string().optional(),
});

export async function GET() {
    try {
        const brands = await Brand.find({}).sort({ createdAt: -1 });
        return ApiResponse.success(brands);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to fetch brands');
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createBrandSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.error('Invalid input', 400, validation.error.format());
        }

        const { name, description, image } = validation.data;

        // Generate slug from name
        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        // Check availability
        const existing = await Brand.findOne({ id });
        if (existing) {
            return ApiResponse.error('Brand with this name already exists', 409);
        }

        const newBrand = await Brand.create({
            id,
            name,
            description,
            image
        });

        return ApiResponse.success(newBrand, 201);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to create brand');
    }
}
