
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing from .env');
    process.exit(1);
}

console.log('Testing MongoDB Connection...');
// Mask the password in logs
console.log(`URI: ${MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);

async function testConnection() {
    try {
        await mongoose.connect(MONGODB_URI!, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected Successfully!');

        // List collections
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('Collections:', collections?.map(c => c.name).join(', '));

        // Check specific 'products' collection count
        const count = await mongoose.connection.db?.collection('products').countDocuments();
        console.log(`Count of products: ${count}`);

        const catCount = await mongoose.connection.db?.collection('categories').countDocuments();
        console.log(`Count of categories: ${catCount}`);

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('❌ Connection Failed:', error);
        process.exit(1);
    }
}

testConnection();
