
import { NextRequest } from 'next/server';
import { Inquiry } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return ApiResponse.error('Reply message is required', 400);
        }

        const inquiry = await Inquiry.findById(id);

        if (!inquiry) {
            return ApiResponse.error('Inquiry not found', 404);
        }

        inquiry.reply = message;
        inquiry.status = 'replied';
        inquiry.repliedAt = new Date();

        await inquiry.save();

        return ApiResponse.success(inquiry);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to send reply', 500);
    }
}
