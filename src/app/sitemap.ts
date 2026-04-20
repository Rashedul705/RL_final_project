import { MetadataRoute } from 'next';
import { ProductService } from '@/lib/services/product.service';
import dbConnect from '@/lib/db';
import { Category } from '@/lib/models';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rodelaslifestyle.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    await dbConnect();

    // Fetch all products
    const products = await ProductService.getProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug || product.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Fetch all categories
    const categories = await Category.find({}).lean();
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.id}`, // the category model uses 'id' for its slug
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return base routes if fetching fails
    return routes;
  }
}
