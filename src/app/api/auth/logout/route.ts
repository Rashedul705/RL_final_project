import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    // Since we are using client-side storage (localStorage) for now,
    // the server doesn't strictly need to do anything for logout.
    // But if we moved to cookies, here is where we would clear them.

    // For now, just return success.
    return ApiResponse.success({ message: 'Logged out successfully' });
}
