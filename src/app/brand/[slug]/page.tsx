import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductService } from "@/lib/services/product.service";
import { Brand } from "@/lib/models";
import { ProductCard } from "@/components/sections/product-card";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import { IProduct } from "@/lib/models";
import Image from "next/image";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function BrandPage({ params }: PageProps) {
    const { slug } = await params;

    await dbConnect();
    const brand = await Brand.findOne({ id: slug });

    if (!brand) {
        notFound();
    }

    // Fetch products for this brand
    const rawProducts = await ProductService.getProducts({ brand: slug });
    const products: IProduct[] = JSON.parse(JSON.stringify(rawProducts));

    // Sort: In-stock first
    products.sort((a, b) => {
        const aStock = a.stock > 0 ? 1 : 0;
        const bStock = b.stock > 0 ? 1 : 0;
        return bStock - aStock;
    });

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-background pt-20 md:pt-24 pb-16">
                <div className="container">
                    <div className="mb-8 text-center">
                        {brand.image && (
                            <div className="mb-6 relative w-32 h-32 mx-auto">
                                <Image
                                    src={brand.image}
                                    alt={brand.name}
                                    fill
                                    className="object-cover rounded-full border-4 border-white shadow-lg"
                                />
                            </div>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{brand.name}</h1>
                        {brand.description && (
                            <p className="text-muted-foreground max-w-2xl mx-auto">{brand.description}</p>
                        )}
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>No products found for this brand.</p>
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
