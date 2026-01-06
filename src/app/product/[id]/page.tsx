'use client';

import { useState, useEffect, use } from 'react';
import { products as staticProducts } from '@/lib/data';
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
import { Plus, Minus, Ruler, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from '@/lib/api-client';
import { IProduct } from '@/lib/models'; // Assuming IProduct is compatible or we map it

// Even in a client component, params can be a promise.
// We can use `React.use` to unwrap it.
type ProductPageProps = {
  params: Promise<{ id: string }>;
};

const DEFAULT_SIZE_GUIDE = "Small: Chest 36, Length 40\nMedium: Chest 38, Length 42\nLarge: Chest 40, Length 44\nXL: Chest 42, Length 46\nXXL: Chest 44, Length 48";

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedProduct, setFetchedProduct] = useState<any>(null); // Use any or specific type if possible

  // Asynchronously get the slug from the params promise.
  const { id: slug } = use(params);

  // First try static products
  const staticProduct = staticProducts.find((p) => (p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) === slug);
  const product = staticProduct || fetchedProduct;

  useEffect(() => {
    const loadProduct = async () => {
      if (staticProduct) {
        setIsLoading(false);
        return;
      }

      try {
        // Fallback: Fetch all products and find by slug
        // Note: Ideally API should support slug lookup
        const allProducts = await apiClient.get<IProduct[]>('/products');
        const found = allProducts.find((p: IProduct) =>
          (p.slug === slug) || (!p.slug && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === slug)
        );

        if (found) {
          setFetchedProduct(found);
        }
      } catch (error) {
        console.error("Failed to fetch product from API", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [slug, staticProduct]);


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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  // For related products, we can mix static and dynamic if needed, 
  // but for now let's use static products as related items fallback or fetch from API if we want full dynamic
  // Keeping simple: use static products + fetched product category matching if possible
  // If product is from API, we might not readily have all other API products here unless we keep them.
  // We'll proceed with static related products for now for simplicity, or filter from the same API list if we cached it.
  // To match original behavior:
  const relatedProducts = staticProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Ensure the main image is always first in the gallery
  const galleryImages = [
    product.image,
    ...(product.images || [])
  ].filter((img, index, self) => img && self.indexOf(img) === index);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="w-full mx-auto flex gap-4">
              {/* Thumbnails - Left Side (Only show if > 1 image) */}
              {galleryImages.length > 1 && (
                <div className="flex flex-col gap-2 w-[20%]">
                  {galleryImages.map((img: string, index: number) => (
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
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}



              {/* Main Image - Right Side */}
              <div className={galleryImages.length > 1 ? "w-[80%]" : "w-full"}>
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {galleryImages.map((img: string, index: number) => (
                      <CarouselItem key={index}>
                        <div className="aspect-[3/4] relative rounded-lg overflow-hidden border">
                          <ZoomableImage
                            src={img}
                            alt={`${product.name} - view ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {galleryImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
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

              {product.size && (
                <div className="mt-4">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    Size: {product.size}
                  </Badge>
                </div>
              )}

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

                  <div className="mb-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto font-semibold mb-2 flex items-center gap-2 text-primary hover:text-primary/80 hover:no-underline">
                          <Ruler className="w-4 h-4" />
                          Size Guide
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Size Guide</DialogTitle>
                          <DialogDescription>
                            Measurements for {product.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed mt-4">
                          {product.sizeGuide || DEFAULT_SIZE_GUIDE}
                        </div>
                      </DialogContent>
                    </Dialog>
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
                  <p className="whitespace-pre-line">{product.highlights}</p>
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
                  <ProductCard key={p.id} product={p as any} />
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
