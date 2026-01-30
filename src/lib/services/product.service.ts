import { Product, IProduct } from '@/lib/models';
import dbConnect from '@/lib/db';
// import { FilterQuery } from 'mongoose'; // causing issues

export const runtime = 'nodejs';

export class ProductService {
    static async getProducts(filter: any = {}) {
        try {
            await dbConnect();
            const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
            // Convert _id to string manually if needed, or rely on frontend to handle both.
            // Mongoose lean returns _id as ObjectId, need to make sure we serialize it safely or rely on nextjs to not choke.
            // Actually, best is to map it.
            return JSON.parse(JSON.stringify(products));
        } catch (error) {
            console.error("ProductService.getProducts failed:", error);
            // Return empty array so page can render with "No products found"
            return [];
        }
    }

    static async createProduct(data: Partial<IProduct>) {
        await dbConnect();

        // Generate slug from name
        if (data.name && !data.slug) {
            data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const product = await Product.create(data);
        return product;
    }

    static async getProductById(id: string) {
        try {
            await dbConnect();
            // Try to find by custom string id, slug, or MongoDB _id
            const query: any = {
                $or: [
                    { id: id },
                    { slug: id }
                ]
            };

            // If it looks like a valid ObjectId, add it to the query
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                query.$or.push({ _id: id });
            }

            const product = await Product.findOne(query);
            return product;
        } catch (error) {
            console.error(`ProductService.getProductById(${id}) failed:`, error);
            return null;
        }
    }

    static async updateProduct(id: string, data: Partial<IProduct>) {
        try {
            await dbConnect();

            // Find first to handle slug logic
            const product = await Product.findOne({ id });
            if (!product) return null;

            // 1. If product doesn't have a slug (legacy), lock it in using the CURRENT name
            if (!product.slug) {
                product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            // 2. Apply updates (this might change the name, but slug remains from step 1 or existing)
            Object.assign(product, data);

            await product.save();
            return product;
        } catch (error) {
            console.error(`ProductService.updateProduct(${id}) failed:`, error);
            throw error; // Re-throw for admin to see error
        }
    }

    static async deleteProduct(id: string) {
        await dbConnect();
        const result = await Product.findOneAndDelete({ id });
        return result;
    }
}
