
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { Brand } from '@/lib/models';
import { z } from 'zod';

const updateBrandSchema = z.object({
    name: z.string().min(1, 'Brand name is required').optional(),
    description: z.string().optional(),
    image: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validation = updateBrandSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.error('Invalid input', 400, validation.error.format());
        }

        const brand = await Brand.findOne({ id });
        if (!brand) {
            return ApiResponse.error('Brand not found', 404);
        }

        // Update fields
        if (validation.data.name) brand.name = validation.data.name;
        if (validation.data.description !== undefined) brand.description = validation.data.description;
        if (validation.data.image !== undefined) brand.image = validation.data.image;

        await brand.save();

        return ApiResponse.success(brand);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to update brand');
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await Brand.findOneAndDelete({ id });

        if (!result) {
            return ApiResponse.error('Brand not found', 404);
        }

        return ApiResponse.success({ message: 'Brand deleted successfully' });
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to delete brand');
    }
}
