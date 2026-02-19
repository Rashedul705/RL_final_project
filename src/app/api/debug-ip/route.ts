
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return NextResponse.json({
            ip: data.ip,
            message: "Please add this IP to your BulkSMSBD Whitelist"
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch IP", details: error.message }, { status: 500 });
    }
}
