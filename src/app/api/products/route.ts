export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

const createProductSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    image: z.string(),
    images: z.array(z.string()).optional(),
    category: z.string(),
    stock: z.number().optional(),
    highlights: z.string().optional(),
    size: z.string().optional(),
    sizeGuide: z.string().optional(),
    brand: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const exclude = searchParams.get('exclude');

        const filter: any = {};
        if (category) {
            filter.category = category;
        }
        const brand = searchParams.get('brand');
        if (brand) {
            filter.brand = brand;
        }
        if (exclude) {
            // Need to handle exclude logic. 
            // Since ProductService.getProducts takes a direct mongoose filter,
            // we can add {_id: {$ne: exclude}} or {id: {$ne: exclude}}
            // But let's verify ProductService implementation first.
            // For now, let's just pass the category filter and handle limit/exclude in the service or here.
        }

        // Ideally, we should refactor ProductService.getProducts to accept an options object
        // But for minimal disturbance, let's just use the filter for category.

        let products = await ProductService.getProducts(filter);

        if (exclude) {
            products = products.filter((p: any) => p.id !== exclude && p.slug !== exclude && p._id.toString() !== exclude);
        }

        if (limit && limit > 0) {
            products = products.slice(0, limit);
        }

        return ApiResponse.success(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return ApiResponse.error('Failed to fetch products');
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const parseResult = createProductSchema.safeParse(body);
        if (!parseResult.success) {
            console.error('Validation Error:', JSON.stringify(parseResult.error.format(), null, 2));
            return ApiResponse.error('Invalid input', 400, parseResult.error.format());
        }

        const productData = {
            ...body,
            id: body.id || `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };

        const product = await ProductService.createProduct(productData);
        return ApiResponse.success(product, 201);
    } catch (error: any) {
        console.error('Error creating product:', error);
        // Check for specific Mongoose/MongoDB errors
        if (error.code === 11000) {
            return ApiResponse.error('Product with this name/slug already exists', 409);
        }
        return ApiResponse.error(`Failed to create product: ${error.message}`);
    }
}
