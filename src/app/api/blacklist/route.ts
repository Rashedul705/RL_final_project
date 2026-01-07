
import { NextRequest } from 'next/server';
import { Blacklist } from '@/lib/models';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const blacklist = await Blacklist.find({}).sort({ createdAt: -1 });
        return ApiResponse.success(blacklist);
    } catch (error) {
        return ApiResponse.error('Failed to fetch blacklist', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, reason } = body;

        if (!phone) {
            return ApiResponse.error('Phone number is required', 400);
        }

        await dbConnect();

        // Check if already exists
        const existing = await Blacklist.findOne({ phone });
        if (existing) {
            return ApiResponse.error('Phone number is already blacklisted', 409);
        }

        const newEntry = await Blacklist.create({ phone, reason });
        return ApiResponse.success(newEntry);
    } catch (error) {
        return ApiResponse.error('Failed to add to blacklist', 500);
    }
}
