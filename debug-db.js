
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
// or .env
require('dotenv').config();

const productSchema = new mongoose.Schema({}, { strict: false });
const categorySchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("No MONGODB_URI");
        return;
    }

    await mongoose.connect(uri);
    console.log("Connected to DB");

    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products`);
    products.forEach(p => console.log(`Product: ${p.name}, Category: '${p.category}'`));

    const categories = await Category.find({}).lean();
    console.log(`Found ${categories.length} categories`);
    categories.forEach(c => console.log(`Category: ${c.name}, ID: '${c.id}'`));

    mongoose.disconnect();
}

run();
