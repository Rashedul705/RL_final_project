
import { NextResponse } from 'next/server';
import { OTP } from '@/lib/models';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json(
                { success: false, message: 'Phone and OTP are required' },
                { status: 400 }
            );
        }

        const record = await OTP.findOne({ phone });

        if (!record) {
            return NextResponse.json(
                { success: false, message: 'Invalid OTP or Expired' },
                { status: 400 }
            );
        }

        // Check expiry (though Mongo expires index should handle cleanup, explicit check is safer)
        if (new Date() > record.expiresAt) {
            return NextResponse.json(
                { success: false, message: 'OTP Expired' },
                { status: 400 }
            );
        }

        if (record.otp === otp) {
            // Success! Delete the used OTP to prevent replay
            await OTP.deleteOne({ _id: record._id });
            return NextResponse.json({ success: true, message: 'OTP Verified' });
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid OTP' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
