
import { NextRequest } from 'next/server';
import { Blacklist } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { id } = params;
        await dbConnect();

        const deleted = await Blacklist.findByIdAndDelete(id);

        if (!deleted) {
            return ApiResponse.error('Entry not found', 404);
        }

        return ApiResponse.success({ message: 'Removed from blacklist' });
    } catch (error) {
        return ApiResponse.error('Failed to remove from blacklist', 500);
    }
}
