import { ProductService } from '../src/lib/services/product.service';
import { OrderService } from '../src/lib/services/order.service';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runTest() {
    console.log('--- Starting Variable Product Flow Test ---');

    // Connect to DB
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('DB Connection Failed:', err);
        process.exit(1);
    }

    const testProductId = `TEST-PROD-${Date.now()}`;
    const testVariantSizeId = new mongoose.Types.ObjectId();

    try {
        // 1. Create Variable Product
        console.log('\n1. Creating Variable Product...');
        const productData = {
            id: testProductId,
            name: "Test Variable T-Shirt",
            description: "A test shirt for variable flow verification",
            price: 1000,
            image: "http://example.com/main.jpg",
            category: "Men",
            stock: 0, // Should be auto-calculated
            variants: [
                {
                    color: "Blue",
                    image: "http://example.com/blue.jpg",
                    images: [],
                    sizes: [
                        { _id: testVariantSizeId.toString(), size: "M", stock: 10, price: 1000 },
                        { _id: new mongoose.Types.ObjectId().toString(), size: "L", stock: 5, price: 1000 }
                    ]
                }
            ]
        };

        // We use service directly to test logic, but in real app API calls service
        const createdProduct: any = await ProductService.createProduct(productData);

        if (!createdProduct) {
            throw new Error('Product creation failed');
        }
        console.log('Product Created:', createdProduct.name);
        console.log('Total Stock (Auto-calculated):', createdProduct.stock);

        if (createdProduct.stock !== 15) {
            console.error('FAIL: Stock calculation incorrect. Expected 15, got', createdProduct.stock);
        } else {
            console.log('PASS: Stock calculation correct.');
        }

        // 2. Place Order for specific variant
        console.log('\n2. Placing Order for Blue - M (Qty: 2)...');
        const orderData = {
            id: `TEST-ORD-${Date.now()}`,
            customer: "Test User",
            phone: "01700000000",
            address: "Test Address",
            amount: "2000",
            products: [
                {
                    productId: createdProduct.id,
                    name: createdProduct.name,
                    quantity: 2,
                    price: 1000,
                    variantId: testVariantSizeId.toString(),
                    color: "Blue",
                    size: "M"
                }
            ],
            date: new Date().toISOString()
        };

        const createdOrder = await OrderService.createOrder(orderData);
        console.log('Order Created:', createdOrder.id);

        // 3. Verify Stock Deduction
        console.log('\n3. Verifying Stock Deduction...');
        const updatedProduct: any = await ProductService.getProductById(testProductId);

        const blueVariant = updatedProduct.variants.find((v: any) => v.color === "Blue");
        const mSize = blueVariant.sizes.find((s: any) => s._id.toString() === testVariantSizeId.toString());

        console.log('Updated Stock for Blue-M:', mSize.stock);
        console.log('Updated Total Stock:', updatedProduct.stock);

        if (mSize.stock !== 8) {
            console.error('FAIL: Variant stock not deducted correctly. Expected 8, got', mSize.stock);
        } else {
            console.log('PASS: Variant stock deducted correctly.');
        }

        if (updatedProduct.stock !== 13) {
            console.error('FAIL: Total product stock not synced. Expected 13, got', updatedProduct.stock);
        } else {
            console.log('PASS: Total product stock synced correctly.');
        }

        // Cleanup
        console.log('\nCleaning up test data...');
        await ProductService.deleteProduct(testProductId);
        await OrderService.deleteOrder(createdOrder.id);
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nTest Finished');
    }
}

runTest();
