'use client';

import { useState, useEffect, use } from 'react';
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
  type CarouselApi,
} from '@/components/ui/carousel';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductCard } from '@/components/sections/product-card';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Even in a client component, params can be a promise.
// We can use `React.use` to unwrap it.
type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  // Asynchronously get the id from the params promise.
  const { id } = use(params);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // For gallery, we'll just use the main product image multiple times as placeholders
  const galleryImages = [
    product.image,
    product.image.replace(/seed\/\w+/, `seed/${product.id}A`),
    product.image.replace(/seed\/\w+/, `seed/${product.id}B`),
    product.image.replace(/seed\/\w+/, `seed/${product.id}C`),
  ];

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <Carousel setApi={setApi} className="w-full">
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
              <div className="grid grid-cols-4 gap-2 mt-4">
                {galleryImages.map((img, index) => (
                   <div
                    key={index}
                    className={`aspect-square relative rounded-md overflow-hidden border-2 ${
                      index === current ? 'border-primary' : 'border-transparent'
                    } cursor-pointer`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
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
                  <p>
                    In Stock:{' '}
                    <span className="font-semibold text-green-600">
                      {product.stock} items available
                    </span>
                  </p>
                ) : (
                  <p className="font-semibold text-red-600">Out of Stock</p>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-2">
                <AddToCartButton
                  product={product}
                  variant="outline"
                  className="w-full flex-1 text-lg py-6"
                >
                  Add to Cart
                </AddToCartButton>
                <AddToCartButton
                  product={product}
                  redirectToCheckout
                  className="w-full flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                >
                  Order Now
                </AddToCartButton>
              </div>
                <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold">Product Highlights:</h2>
                    <p className="text-muted-foreground">{product.description}</p>
                </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <Separator />
              <h2 className="text-3xl md:text-4xl mt-16 mb-8 text-center">
                Related Products
              </h2>
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
