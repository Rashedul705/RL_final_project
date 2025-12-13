'use client';

import { useState, useEffect, use } from 'react';
import { products } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { ZoomableImage } from '@/components/ui/zoomable-image';
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
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Even in a client component, params can be a promise.
// We can use `React.use` to unwrap it.
type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Asynchronously get the slug from the params promise.
  const { id: slug } = use(params);

  const product = products.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === slug);

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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(newQuantity);
    }
  };

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
            <div className="w-3/4 mx-auto flex gap-4">
              {/* Thumbnails - Left Side */}
              <div className="flex flex-col gap-2 w-[20%]">
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    className={`aspect-[3/4] relative rounded-md overflow-hidden border-2 ${index === current ? 'border-primary' : 'border-transparent'
                      } cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  </div>
                ))}
              </div>



              {/* Main Image - Right Side */}
              <div className="w-[80%]">
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {galleryImages.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-[3/4] relative rounded-lg overflow-hidden border">
                          <ZoomableImage
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
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
              <div className="mt-4">
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <p className="mt-4 text-3xl font-bold text-primary">
                BDT {product.price.toLocaleString()}
              </p>

              {product.stock > 0 ? (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">Quantity:</Label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min={1}
                        max={product.stock}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">(in stock)</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <AddToCartButton
                      product={product}
                      quantity={quantity}
                      variant="outline"
                      className="w-full flex-1 text-lg py-6"
                    >
                      Add to Cart
                    </AddToCartButton>
                    <AddToCartButton
                      product={product}
                      quantity={quantity}
                      redirectToCheckout
                      className="w-full flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                    >
                      Order Now
                    </AddToCartButton>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <p className="font-semibold text-red-600 text-lg">Out of Stock</p>
                </div>
              )}


              <div className="mt-8">
                <h2 className="text-xl font-semibold">Product Highlights:</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground mt-2">
                  <p>{product.description}</p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-16">
            <Separator />
            <div className="py-12">
              <h2 className="text-2xl font-bold mb-4">Product Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{product.description}</p>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
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
