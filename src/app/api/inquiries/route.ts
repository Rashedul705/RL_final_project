
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { Inquiry } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { sendMail } from '@/lib/mail';
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

        // Send Admin Notification
        try {
            await sendMail({
                to: "rashedul.afl@gmail.com",
                subject: `New Inquiry: ${inquiry.subject || 'No Subject'} - ${inquiry.name}`,
                body: `
                    <p>You have received a new inquiry.</p>
                    <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
                    <p><strong>Subject:</strong> ${inquiry.subject || 'N/A'}</p>
                    <p><strong>Message:</strong></p>
                    <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; color: #555;">
                        ${inquiry.message}
                    </blockquote>
                    <br/>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/inquiries">Reply in Admin Panel</a>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send admin inquiry notification:", emailError);
        }

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
