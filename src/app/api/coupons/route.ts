export const runtime = 'nodejs';
import { NextRequest } from "next/server";
import { Coupon } from "@/lib/models";
import { ApiResponse } from "@/lib/api-response";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return ApiResponse.success(coupons);
    } catch (error: any) {
        return ApiResponse.error("Failed to fetch coupons", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Check if code exists
        const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
        if (existing) {
            return ApiResponse.error("Coupon code already exists", 400);
        }

        const coupon = await Coupon.create(body);
        return ApiResponse.success(coupon);
    } catch (error: any) {
        return ApiResponse.error(error.message || "Failed to create coupon", 500);
    }
}
