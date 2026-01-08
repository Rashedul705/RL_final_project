
import { NextRequest } from 'next/server';
import { Inquiry } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

import { sendMail } from '@/lib/mail';

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

        // Send Email
        try {
            await sendMail({
                to: inquiry.email,
                subject: `Re: ${inquiry.subject || 'Inquiry'} - Rodelas lifestyle`,
                body: `
                    <p>Dear ${inquiry.name},</p>
                    <p>Thank you for contacting us. Here is our reply to your inquiry:</p>
                    <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; color: #555;">
                        ${message}
                    </blockquote>
                    <br/>
                    <p>Best Regards,</p>
                    <p>Rodelas lifestyle Team</p>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Don't fail the request, just log it.
        }

        return ApiResponse.success(inquiry);
    } catch (error: any) {
        return ApiResponse.error(error.message || 'Failed to send reply', 500);
    }
}
