import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductService } from "@/lib/services/product.service";
import { Category } from "@/lib/models"; // Import Model
import { ProductCard } from "@/components/sections/product-card";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import { IProduct } from "@/lib/models";

// Define the interface for the props
interface PageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: PageProps) {
    // Await params object before accessing properties
    const { slug } = await params;

    await dbConnect();
    const category = await Category.findOne({ id: slug });

    if (!category) {
        notFound();
    }

    // Fetch products for this category
    const rawProducts = await ProductService.getProducts({ category: slug });
    const products: IProduct[] = JSON.parse(JSON.stringify(rawProducts));

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-background pt-20 md:pt-24 pb-16">
                <div className="container">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{category.name}</h1>
                        {category.description && (
                            <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
                        )}
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>No products found in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                            {products.map((product) => (
                                // @ts-ignore
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
