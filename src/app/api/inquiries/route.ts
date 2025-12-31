
import { NextRequest } from 'next/server';
import { Inquiry } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

const inquirySchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(5),
});

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const parseResult = inquirySchema.safeParse(body);

        if (!parseResult.success) {
            return ApiResponse.error('Invalid input', 400);
        }

        const inquiry = await Inquiry.create(parseResult.data);
        return ApiResponse.success(inquiry, 201);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to submit inquiry', 500);
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        // Check admin auth here if implemented properly, for now public/open for admin panel usage
        const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
        return ApiResponse.success(inquiries);
    } catch (error) {
        return ApiResponse.error('Failed to fetch inquiries', 500);
    }
}
