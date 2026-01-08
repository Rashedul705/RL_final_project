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
});

export async function GET() {
    try {
        const products = await ProductService.getProducts();
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
