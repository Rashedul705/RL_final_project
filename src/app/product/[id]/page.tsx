import { products } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductCard } from '@/components/sections/product-card';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);
  
  // For gallery, we'll just use the main product image multiple times as placeholders
  const galleryImages = [
      product.image,
      product.image.replace(/seed\/\w+/, `seed/${product.id}A`),
      product.image.replace(/seed\/\w+/, `seed/${product.id}B`),
      product.image.replace(/seed\/\w+/, `seed/${product.id}C`),
  ];


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <Carousel className="w-full">
                <CarouselContent>
                  {galleryImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative rounded-lg overflow-hidden border">
                        <Image
                          src={img}
                          alt={`${product.name} - view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
              <div className="mt-4">
                 <Badge variant="outline">{product.category}</Badge>
              </div>
              <p className="mt-4 text-3xl font-bold text-primary">
                BDT {product.price.toLocaleString()}
              </p>
              
              <div className="mt-4 text-sm text-muted-foreground">
                {product.stock > 0 ? (
                  <p>In Stock: <span className="font-semibold text-green-600">{product.stock} items available</span></p>
                ) : (
                  <p className="font-semibold text-red-600">Out of Stock</p>
                )}
              </div>

              <div className="mt-6 prose prose-stone max-w-none text-muted-foreground">
                  <p>This is a placeholder description for the {product.name}. A more detailed and compelling description will be available soon, highlighting its unique features, materials, and why it's a must-have item.</p>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-2">
                <AddToCartButton product={product} variant="outline" className="w-full flex-1 text-lg py-6">
                  Add to Cart
                </AddToCartButton>
                <AddToCartButton product={product} redirectToCheckout className="w-full flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                  Order Now
                </AddToCartButton>
              </div>
            </div>
          </div>
          
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <Separator />
              <h2 className="text-3xl md:text-4xl mt-16 mb-8 text-center">Related Products</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
