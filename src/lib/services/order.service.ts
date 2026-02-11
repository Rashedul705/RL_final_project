
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
                    if (item.variantId) {
                        // Variant Specific Logic
                        let variantFound = false;
                        if (product.variants) {
                            for (const variant of product.variants) {
                                const sizeOption = variant.sizes.find((s: any) => s._id.toString() === item.variantId);
                                if (sizeOption) {
                                    if (sizeOption.stock < item.quantity) {
                                        throw new Error(`Insufficient stock for ${product.name} (${variant.color} - ${sizeOption.size})`);
                                    }
                                    sizeOption.stock -= item.quantity;
                                    // Keep total stock in sync
                                    if (product.stock >= item.quantity) {
                                        product.stock -= item.quantity;
                                    }
                                    variantFound = true;
                                    break;
                                }
                            }
                        }
                        if (!variantFound) {
                            throw new Error(`Variant not found for ${product.name}`);
                        }
                    } else {
                        // Legacy / Simple Product Logic
                        if (product.stock < item.quantity) {
                            throw new Error(`Insufficient stock for ${product.name}`);
                        }
                        product.stock -= item.quantity;
                    }
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
                    if (item.variantId && product.variants) {
                        for (const variant of product.variants) {
                            const sizeOption = variant.sizes.find((s: any) => s._id.toString() === item.variantId);
                            if (sizeOption) {
                                sizeOption.stock += item.quantity;
                                // Keep total stock in sync
                                product.stock += item.quantity;
                                break;
                            }
                        }
                    } else {
                        product.stock += item.quantity;
                    }
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
                    if (item.variantId && product.variants) {
                        for (const variant of product.variants) {
                            const sizeOption = variant.sizes.find((s: any) => s._id.toString() === item.variantId);
                            if (sizeOption) {
                                if (sizeOption.stock < item.quantity) {
                                    throw new Error(`Insufficient stock to restore order for ${product.name}`);
                                }
                                sizeOption.stock -= item.quantity;
                                // Keep total stock in sync
                                if (product.stock >= item.quantity) {
                                    product.stock -= item.quantity;
                                }
                                break;
                            }
                        }
                    } else {
                        if (product.stock < item.quantity) {
                            throw new Error(`Insufficient stock to restore order for ${product.name}`);
                        }
                        product.stock -= item.quantity;
                    }
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
                        if (item.variantId && product.variants) {
                            for (const variant of product.variants) {
                                const sizeOption = variant.sizes.find((s: any) => s._id.toString() === item.variantId);
                                if (sizeOption) {
                                    sizeOption.stock += item.quantity;
                                    // Keep total stock in sync
                                    product.stock += item.quantity;
                                    break;
                                }
                            }
                        } else {
                            product.stock += item.quantity;
                        }
                        await product.save();
                    }
                }
            }
            await Order.findOneAndDelete({ id });
        }
        return order;
    }
}
