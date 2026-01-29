export const runtime = 'nodejs';
import { NextRequest } from "next/server";
import { Coupon } from "@/lib/models";
import { ApiResponse } from "@/lib/api-response";
import dbConnect from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
        if (!coupon) {
            return ApiResponse.error("Coupon not found", 404);
        }

        return ApiResponse.success(coupon);
    } catch (error: any) {
        return ApiResponse.error("Failed to update coupon", 500);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            return ApiResponse.error("Coupon not found", 404);
        }

        return ApiResponse.success({ message: "Coupon deleted successfully" });
    } catch (error: any) {
        return ApiResponse.error("Failed to delete coupon", 500);
    }
}
