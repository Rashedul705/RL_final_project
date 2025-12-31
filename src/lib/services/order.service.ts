
import { Order, IOrder, Product } from '@/lib/models';
import dbConnect from '@/lib/db';

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

        // Stock Check & Decrease
        if (data.products && data.products.length > 0) {
            for (const item of data.products) {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name}`);
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        const order = await Order.create(data);
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
