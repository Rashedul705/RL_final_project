export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const start = Date.now();
        await dbConnect();
        const duration = Date.now() - start;

        const state = mongoose.connection.readyState;
        const stateName = ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown';

        return NextResponse.json({
            status: 'ok',
            database: {
                status: stateName,
                latency: `${duration}ms`,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            },
            env: {
                // Do NOT return the full URI for security, just check if it exists
                hasMongoUri: !!process.env.MONGODB_URI,
                nodeEnv: process.env.NODE_ENV,
                match: process.env.MONGODB_URI === process.env.MONGODB_URI // sanity check
            }
        });
    } catch (error: any) {
        console.error('Health Check Failed:', error);
        return NextResponse.json({
            status: 'error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            env: {
                hasMongoUri: !!process.env.MONGODB_URI
            }
        }, { status: 500 });
    }
}
