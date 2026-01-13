
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listProducts() {
    try {
        const dbConnect = (await import('../lib/db')).default;
        const { Product } = await import('../lib/models');
        await dbConnect();
        const products = await Product.find({}, 'name slug id _id');
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`- Name: ${p.name}`);
            console.log(`  Slug: ${p.slug}`);
            console.log(`  ID: ${p.id}`);
            console.log(`  _ID: ${p._id}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        process.exit(0);
    }
}

listProducts();
