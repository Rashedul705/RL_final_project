
import { Customer, ICustomer } from '@/lib/models';
import dbConnect from '@/lib/db';

export class CustomerService {
    static async getCustomers(filter: any = {}) {
        await dbConnect();
        const customers = await Customer.find(filter).sort({ lastOrderDate: -1 });
        return customers;
    }

    static async getCustomerByPhone(phone: string) {
        await dbConnect();
        return await Customer.findOne({ phone });
    }

    static async syncCustomerFromOrder(orderData: any) {
        await dbConnect();

        // We identify customers primarily by phone number
        let customer = await Customer.findOne({ phone: orderData.phone });
        const orderAmount = parseFloat(orderData.amount) || 0;

        if (customer) {
            // Update existing customer
            customer.totalOrders += 1;
            customer.totalSpent += orderAmount;

            const newOrderDate = new Date(orderData.date);
            if (!customer.lastOrderDate || newOrderDate > customer.lastOrderDate) {
                customer.lastOrderDate = newOrderDate;
            }

            // Update latest info if changed
            if (orderData.customer) customer.name = orderData.customer; // Prioritize latest name
            if (orderData.email) customer.email = orderData.email;
            if (orderData.address) customer.address = orderData.address;

            await customer.save();
        } else {
            // Create new customer
            customer = await Customer.create({
                id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: orderData.customer,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address,
                totalOrders: 1,
                totalSpent: orderAmount,
                lastOrderDate: new Date(orderData.date),
                joinedAt: new Date(orderData.date)
            });
        }
        return customer;
    }
}
