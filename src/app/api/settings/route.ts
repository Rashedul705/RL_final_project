import { NextRequest } from 'next/server';
import { Setting } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        let setting = await Setting.findOne({ key: 'global' });

        // Return default if not found
        if (!setting) {
            return ApiResponse.success({ isOtpEnabled: true });
        }

        return ApiResponse.success(setting);
    } catch (error: any) {
        console.error("Error fetching settings:", error);
        return ApiResponse.error("Failed to fetch settings", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (typeof body.isOtpEnabled !== 'boolean') {
            return ApiResponse.error("Invalid property: isOtpEnabled must be a boolean", 400);
        }

        await dbConnect();

        const setting = await Setting.findOneAndUpdate(
            { key: 'global' },
            { isOtpEnabled: body.isOtpEnabled },
            { new: true, upsert: true }
        );

        return ApiResponse.success(setting);
    } catch (error: any) {
        console.error("Error updating settings:", error);
        return ApiResponse.error("Failed to update settings", 500);
    }
}
