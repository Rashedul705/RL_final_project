'use client';

import { useState, useEffect, use, useMemo } from 'react';
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
import type { IProduct } from '@/lib/models';
import { sendGTMEvent } from '@/lib/gtm';


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

  // Asynchronously get the slug from the params promise.
  const { id: slug } = use(params);

  // Use state for product and related products
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Variant State
  const [selectedSize, setSelectedSize] = useState<any>(null);

  // Ensure the main image is always first in the gallery
  const galleryImages = useMemo<string[]>(() => {
    if (!product) return [];
    const images: string[] = [product.image, ...(product.images || [])];
    return images.filter((img: string, index: number, self: string[]) => img && self.indexOf(img) === index);
  }, [product]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch the specific product
        const productData = await apiClient.get<IProduct>(`/products/${slug}`);

        if (productData) {
          // Legacy Migration
          if (!productData.productType && productData.variants && productData.variants.length > 0) {
            productData.productType = 'variant';
            productData.sizes = productData.variants.map((v: any) => ({
              id: v.id || v._id,
              name: v.name,
              price: v.price,
              stock: v.stock,
              discountPrice: v.discountPrice || 0
            }));
          } else if (!productData.productType) {
             productData.productType = 'simple';
          }

          setProduct(productData);

          // Initialize default size if there is only one size
          if (productData.productType === 'variant' && productData.sizes && productData.sizes.length === 1) {
            setSelectedSize(productData.sizes[0]);
          }


          // Track view_item event
          sendGTMEvent({
            event: 'view_item',
            content_name: productData.name,
            content_ids: [productData.id],
            content_type: 'product',
            value: productData.price,
            currency: 'BDT',
          });

          // 2. Fetch related products separately
          if (productData.category) {
            try {
              const related = await apiClient.get<IProduct[]>(`/products?category=${encodeURIComponent(productData.category)}&limit=4&exclude=${slug}`);
              setRelatedProducts(related || []);
            } catch (relatedError) {
              console.warn("Failed to fetch related products", relatedError);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch product from API", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug]);





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

  // Derived Display Values
  const currentPrice = selectedSize ? selectedSize.price : product.price;
  const currentStock = selectedSize ? selectedSize.stock : product.stock;

  // A variant is out of stock if its specific stock is <= 0
  const isVariantOutOfStock = selectedSize ? selectedSize.stock <= 0 : false;

  // The global product is out of stock if simple product stock <= 0 OR all variants <= 0
  const isProductCompletelyOutOfStock = product.productType === 'variant' && product.sizes && product.sizes.length > 0
    ? product.sizes.every((s: any) => s.stock <= 0)
    : product.stock <= 0;

  // Check if variants are present but not fully selected
  const needsVariantSelection = product.productType === 'variant' && product.sizes && product.sizes.length > 0 && !selectedSize;

  // What disables the button/shows stock warning currently
  const isOutOfStock = product.productType === 'variant' && product.sizes && product.sizes.length > 0 ? (needsVariantSelection ? false : isVariantOutOfStock) : isProductCompletelyOutOfStock;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > currentStock) {
      setQuantity(currentStock);
    } else {
      setQuantity(newQuantity);
    }
  };




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
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-primary">
                    BDT {currentPrice.toLocaleString()}
                  </p>
                  {selectedSize && (
                    <span className="text-sm text-muted-foreground mb-1">
                      (Size: {selectedSize.name})
                    </span>
                  )}
                </div>
                {needsVariantSelection && (
                  <p className="text-lg font-bold text-destructive mt-1">
                    আপনার সাইজ বেছে নিন
                  </p>
                )}
              </div>

              {/* Size Selection */}
              {product.productType === 'variant' && product.sizes && product.sizes.length > 0 ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Size</Label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sizeObj: any) => {
                        const isSelected = selectedSize?.name === sizeObj.name;
                        const isOptionOutOfStock = sizeObj.stock <= 0;

                        return (
                          <Button
                            key={sizeObj.name}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={isOptionOutOfStock && !isSelected}
                            onClick={() => setSelectedSize(sizeObj)}
                            className={`
                              ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
                              ${isOptionOutOfStock ? "opacity-50 line-through cursor-not-allowed" : ""}
                            `}
                          >
                            {sizeObj.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                product.size && (
                  <div className="mt-4">
                    <Badge className="text-base px-3 py-1 font-normal bg-[#ff3399] text-white hover:bg-[#ff3399]/90">
                      Size: {product.size}
                    </Badge>
                  </div>
                )
              )}


              {!isOutOfStock ? (
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
                        max={currentStock}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= currentStock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-primary">
                      {isOutOfStock ? (
                        <span className="text-red-600">Out of Stock</span>
                      ) : needsVariantSelection ? (
                        <span className="text-muted-foreground">Select options to see stock</span>
                      ) : (
                        `${currentStock} items in stock`
                      )}
                    </p>
                    {selectedSize && (
                      <p className="text-xs text-muted-foreground">
                        Selected: Size: {selectedSize.name}
                      </p>
                    )}
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
                      variantId={selectedSize?._id || selectedSize?.name}
                      variantName={selectedSize?.name}
                      attributes={selectedSize ? { Size: selectedSize.name } : undefined}
                      disabled={needsVariantSelection || isOutOfStock}
                      variant="outline"
                      className="w-full flex-1 text-lg py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {needsVariantSelection ? 'Select Options' : 'Add to Cart'}
                    </AddToCartButton>
                    <AddToCartButton
                      product={product}
                      quantity={quantity}
                      variantId={selectedSize?._id || selectedSize?.name}
                      variantName={selectedSize?.name}
                      attributes={selectedSize ? { Size: selectedSize.name } : undefined}
                      disabled={needsVariantSelection || isOutOfStock}
                      redirectToCheckout
                      className="w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                    >
                      {needsVariantSelection ? 'Select Options' : 'Order Now'}
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
                <p className="whitespace-pre-wrap">{product.description}</p>
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
      </main >
      <Footer />
    </div >
  );
}
