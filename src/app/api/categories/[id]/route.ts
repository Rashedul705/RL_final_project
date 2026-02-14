
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


        // handle position change with reordering
        if (body.position !== undefined) {
            const newPosition = parseInt(body.position);
            if (isNaN(newPosition)) return ApiResponse.error('Invalid position', 400);

            // 1. Get all categories sorted by position
            const allCategories = await Category.find({}).sort({ position: 1 });

            // 2. Find current category index
            const currentIndex = allCategories.findIndex(c => c.id === id);
            if (currentIndex === -1) return ApiResponse.error('Category not found', 404);

            const categoryToMove = allCategories[currentIndex];

            // Update other fields
            if (body.name) categoryToMove.name = body.name;
            if (body.description) categoryToMove.description = body.description;
            if (body.image) categoryToMove.image = body.image;

            // 3. Remove from list
            allCategories.splice(currentIndex, 1);

            // 4. Insert at new position (ensure bounds)
            // 1-based position from user, convert to 0-based index
            // But actually, let's treat input as "target rank".
            // If user wants it to be 1st, input 1. Index 0.
            let targetIndex = newPosition - 1;
            if (targetIndex < 0) targetIndex = 0;
            if (targetIndex > allCategories.length) targetIndex = allCategories.length;

            allCategories.splice(targetIndex, 0, categoryToMove);

            // 5. Update positions strictly 1, 2, 3...
            const updates = allCategories.map((cat, index) => {
                cat.position = index + 1;
                return cat.save();
            });

            await Promise.all(updates);

            return ApiResponse.success(categoryToMove);
        }

        // Standard update if no position change
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
