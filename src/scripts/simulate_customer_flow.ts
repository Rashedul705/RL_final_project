
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch'; // using node-fetch for HTTP requests in script
import dbConnect from '../lib/db';
import { Product } from '../lib/models';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_BASE_URL = 'http://localhost:9002/api';

async function simulateCustomerFlow() {
    console.log('--- Starting Customer Journey Simulation ---');

    try {
        // Step 1: Browse Products (Fetch from DB to simulate "Viewing" and getting data)
        await dbConnect();
        const product = await Product.findOne({});

        if (!product) {
            console.error('❌ No products found in database. Cannot proceed.');
            process.exit(1);
        }

        console.log(`✅ [View Product] Viewed product: "${product.name}" (ID: ${product.id}, Price: ${product.price})`);

        // Step 2: "Add to Cart" (Simulated by holding data in memory)
        const quantity = 1;
        const cartItem = {
            productId: product.id,
            name: product.name,
            quantity: quantity,
            price: product.price,
            image: product.image
        };
        console.log(`✅ [Add to Cart] Added 1x "${product.name}" to cart.`);

        // Step 3: Checkout - Fill Details
        const customerDetails = {
            fullName: "Test Customer",
            phoneNumber: "01712345678",
            city: "Dhaka",
            fullAddress: "House 10, Road 5, Dhanmondi"
        };
        console.log(`✅ [Checkout] Filled details for ${customerDetails.fullName}.`);

        // Step 4: Calculate Totals
        const subtotal = cartItem.price * cartItem.quantity;
        const shippingCharge = 80; // Inside Dhaka
        const discount = 0;
        const total = subtotal + shippingCharge - discount;

        // Step 5: Place Order (POST /api/orders)
        const orderId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
        const orderPayload = {
            id: orderId,
            customer: customerDetails.fullName,
            email: "test@example.com",
            phone: customerDetails.phoneNumber,
            address: `${customerDetails.fullAddress}, ${customerDetails.city}`,
            amount: total.toString(),
            status: 'Pending',
            products: [cartItem], // API expects array of products with specific fields
            date: new Date().toISOString(),
            shippingInfo: {
                ...customerDetails,
                methodName: 'Standard Delivery',
                estimatedTime: '2-3 Days',
            },
            subtotal,
            shippingCharge,
            discount,
            couponCode: undefined
        };

        console.log(`⏳ [Place Order] Submitting order ${orderId} to API...`);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ [Order Complete] Order placed successfully!`);
            console.log(`   Response:`, result);
        } else {
            console.error(`❌ [Order Failed] Server returned ${response.status}: ${response.statusText}`);
            const errorText = await response.text();
            console.error(`   Error details:`, errorText);
        }

    } catch (error) {
        console.error('❌ [Simulation Error] An unexpected error occurred:', error);
    } finally {
        process.exit(0);
    }
}

simulateCustomerFlow();
