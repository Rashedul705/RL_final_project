import { NextRequest } from "next/server";
import { Coupon } from "@/lib/models";
import { ApiResponse } from "@/lib/api-response";
import dbConnect from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { code, cartTotal, customerPhone } = await request.json();

        if (!code) {
            return ApiResponse.error("Coupon code is required", 400);
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return ApiResponse.error("Invalid coupon code", 404);
        }

        // Check Expiry
        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            return ApiResponse.error("Coupon has expired", 400);
        }

        // Check Usage Limit
        if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
            return ApiResponse.error("Coupon usage limit exceeded", 400);
        }

        // Check Per User Usage Limit
        if (customerPhone && coupon.usageLimitPerUser) {
            // Import Order model dynamically to avoid circular dependency issues if any, though here models.ts exports both.
            // But we need to check how many orders this user has with this coupon
            const { Order } = await import("@/lib/models");

            // We need to count orders where:
            // 1. phone matches customerPhone
            // 2. couponCode matches coupon.code
            // 3. status is NOT 'Cancelled' (usually returned/cancelled orders shouldn't count, or maybe they should depending on policy. Let's assume Cancelled doesn't count)

            const userUsageCount = await Order.countDocuments({
                phone: customerPhone,
                couponCode: coupon.code,
                status: { $ne: 'Cancelled' }
            });

            if (userUsageCount >= coupon.usageLimitPerUser) {
                return ApiResponse.error(`You have already used this coupon ${userUsageCount} times. Limit is ${coupon.usageLimitPerUser}.`, 400);
            }
        }

        // Check Minimum Order Value
        if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
            return ApiResponse.error(`Minimum order value of BDT ${coupon.minOrderValue} required`, 400);
        }

        // Calculate Discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total
        if (discount > cartTotal) {
            discount = cartTotal;
        }

        return ApiResponse.success({
            valid: true,
            discount: Math.round(discount), // Rounding for simplicity
            code: coupon.code,
            type: coupon.discountType
        });

    } catch (error: any) {
        console.error("Coupon validation error:", error);
        return ApiResponse.error("Failed to validate coupon", 500);
    }
}
