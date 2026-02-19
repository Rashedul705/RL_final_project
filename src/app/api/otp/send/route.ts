
import { NextResponse } from 'next/server';
import { OTP } from '@/lib/models';
import { sendSMS } from '@/lib/sms';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { phone } = await req.json();

        if (!phone || !/^01[0-9]{9}$/.test(phone)) {
            return NextResponse.json(
                { success: false, message: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Generate 4-digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 5 minutes expiry
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save or Update OTP
        // upsert: true creates if not exists
        await OTP.findOneAndUpdate(
            { phone },
            { otp: otpCode, expiresAt },
            { upsert: true, new: true }
        );

        // Send SMS
        const message = `Your Rodela's Lifestyle OTP is ${otpCode}`;
        const smsResult = await sendSMS(phone, message);

        if (smsResult.success) {
            return NextResponse.json({ success: true, message: 'OTP sent successfully' });
        } else {
            // If SMS starts failing, we should not fail silently with 500.
            return NextResponse.json(
                { success: false, message: `Failed to send SMS: ${smsResult.error}` },
                { status: 502 } // Bad Gateway / Upstream Error
            );
        }

    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
