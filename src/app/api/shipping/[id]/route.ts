
import { NextRequest } from 'next/server';
import { ShippingMethod } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const method = await ShippingMethod.findByIdAndUpdate(id, body, { new: true });
        if (!method) {
            return ApiResponse.error('Shipping method not found', 404);
        }

        return ApiResponse.success(method);
    } catch (error: any) {
        return ApiResponse.error('Failed to update shipping method', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const method = await ShippingMethod.findByIdAndDelete(id);
        if (!method) {
            return ApiResponse.error('Shipping method not found', 404);
        }

        return ApiResponse.success({ message: 'Deleted successfully' });
    } catch (error: any) {
        return ApiResponse.error('Failed to delete shipping method', 500);
    }
}
