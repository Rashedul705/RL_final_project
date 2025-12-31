
import { NextRequest } from 'next/server';
import { Category } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params; // This matches the dynamic route segment [id]
        const body = await request.json();

        // If we are looking up by our custom 'id' field, we should use findOneAndUpdate
        // But if [id] is the mongoose _id, we use findByIdAndUpdate.
        // My POST implementation creates a custom 'id' (slug). 
        // Let's assume the frontend passes the custom `id` in the URL but maybe we want to support both or stick to one.
        // Given models.ts has 'id' as unique slug, let's use that.

        const category = await Category.findOneAndUpdate({ id: id }, body, { new: true });

        if (!category) {
            // Try by _id just in case
            const catById = await Category.findByIdAndUpdate(id, body, { new: true });
            if (catById) return ApiResponse.success(catById);

            return ApiResponse.error('Category not found', 404);
        }

        return ApiResponse.success(category);
    } catch (error: any) {
        return ApiResponse.error('Failed to update category', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const category = await Category.findOneAndDelete({ id: id });
        if (!category) {
            // Try by _id just in case
            const catById = await Category.findByIdAndDelete(id);
            if (catById) return ApiResponse.success({ message: 'Deleted successfully' });

            return ApiResponse.error('Category not found', 404);
        }

        return ApiResponse.success({ message: 'Deleted successfully' });
    } catch (error: any) {
        return ApiResponse.error('Failed to delete category', 500);
    }
}
