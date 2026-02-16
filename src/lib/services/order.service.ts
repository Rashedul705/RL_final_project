
import { Order, IOrder, Product, Blacklist } from '@/lib/models';
import dbConnect from '@/lib/db';

import { CustomerService } from './customer.service';

export class OrderService {
    static async getOrders(filter: any = {}) {
        await dbConnect();
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        return orders;
    }

    static async getOrderById(id: string) {
        await dbConnect();
        const order = await Order.findOne({ id });
        return order;
    }

    static async createOrder(data: Partial<IOrder>) {
        await dbConnect();

        // Check Blacklist
        if (data.phone) {
            const blacklisted = await Blacklist.findOne({ phone: data.phone });
            if (blacklisted) {
                // Formatting the error message for the frontend to catch
                throw new Error(`Order blocked: This phone number is blacklisted. Reason: ${blacklisted.reason || 'N/A'}`);
            }
        }

        // Stock Check & Decrease
        if (data.products && data.products.length > 0) {
            for (const item of data.products) {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    // 1. Variant Stock Check & Decrease
                    if (item.variantId && product.variants && product.variants.length > 0) {
                        const variantIndex = product.variants.findIndex((v: any) => v.id === item.variantId);
                        if (variantIndex > -1) {
                            const variant = product.variants[variantIndex];
                            if (variant.stock < item.quantity) {
                                throw new Error(`Insufficient stock for ${product.name} (Variant: ${item.variantName})`);
                            }
                            product.variants[variantIndex].stock -= item.quantity;
                        }
                    }

                    // 2. Global Stock Check & Decrease
                    if (product.stock < item.quantity) {
                        // Optional: Allow global stock to go negative if variants are tracked primarily? 
                        // For now, STRICT check on global too as requested "keep the global Inventory"
                        throw new Error(`Insufficient global stock for ${product.name}`);
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        const order = await Order.create(data);

        // Sync with Customer Database
        try {
            await CustomerService.syncCustomerFromOrder(order);
        } catch (error) {
            console.error("Failed to sync customer data:", error);
            // Don't fail the order if customer sync fails, just log it
        }

        return order;
    }

    static async updateOrder(id: string, data: Partial<IOrder>) {
        await dbConnect();
        const currentOrder = await Order.findOne({ id });
        if (!currentOrder) return null;

        // Simple Stock Restoration Logic for Cancellation
        if (data.status === 'Cancelled' && currentOrder.status !== 'Cancelled') {
            for (const item of currentOrder.products) {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    // Restore Variant Stock
                    if (item.variantId && product.variants) {
                        const variantIndex = product.variants.findIndex((v: any) => v.id === item.variantId);
                        if (variantIndex > -1) {
                            product.variants[variantIndex].stock += item.quantity;
                        }
                    }
                    // Restore Global Stock
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }
        // Logic for Re-opening Cancelled Order? 
        // If changing FROM Cancelled TO Processing/Pending etc
        if (currentOrder.status === 'Cancelled' && data.status && data.status !== 'Cancelled') {
            for (const item of currentOrder.products) {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    // Check & Decrease Variant Stock
                    if (item.variantId && product.variants) {
                        const variantIndex = product.variants.findIndex((v: any) => v.id === item.variantId);
                        if (variantIndex > -1) {
                            if (product.variants[variantIndex].stock < item.quantity) {
                                throw new Error(`Insufficient stock for variant ${product.variants[variantIndex].name}`);
                            }
                            product.variants[variantIndex].stock -= item.quantity;
                        }
                    }

                    // Check & Decrease Global Stock
                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock to restore order for ${product.name}`);
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        const order = await Order.findOneAndUpdate({ id }, data, { new: true });
        return order;
    }

    static async deleteOrder(id: string) {
        await dbConnect();
        const order = await Order.findOne({ id });
        if (order) {
            // Restore stock if deleting a non-cancelled order
            if (order.status !== 'Cancelled') {
                for (const item of order.products) {
                    const product = await Product.findOne({ id: item.productId });
                    if (product) {
                        // Restore Variant Stock
                        if (item.variantId && product.variants) {
                            const variantIndex = product.variants.findIndex((v: any) => v.id === item.variantId);
                            if (variantIndex > -1) {
                                product.variants[variantIndex].stock += item.quantity;
                            }
                        }
                        // Restore Global Stock
                        product.stock += item.quantity;
                        await product.save();
                    }
                }
            }
            await Order.findOneAndDelete({ id });
        }
        return order;
    }
}
