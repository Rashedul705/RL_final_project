'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { cn } from '@/lib/utils';
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
  const [fetchedProduct, setFetchedProduct] = useState<any>(null); // Use any or specific type if possible

  // Asynchronously get the slug from the params promise.
  const { id: slug } = use(params);

  // Use state for product and related products instead of derived static/fetched mix
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  // Derived state for variants
  const activeVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    if (!selectedVariantId) return product.variants[0]; // Default to first
    return product.variants.find((v: any) => v._id === selectedVariantId) || product.variants[0];
  }, [product, selectedVariantId]);

  const activeSize = useMemo(() => {
    if (!activeVariant) return null;
    // If a specific size is selected, use it
    if (selectedSizeId) {
      return activeVariant.sizes.find((s: any) => s._id === selectedSizeId);
    }
    // Otherwise, auto-select first available (in stock) or first one
    if (activeVariant.sizes && activeVariant.sizes.length > 0) {
      const firstAvailable = activeVariant.sizes.find((s: any) => s.stock > 0);
      return firstAvailable || activeVariant.sizes[0];
    }
    return null;
  }, [activeVariant, selectedSizeId]);

  const currentPrice = useMemo(() => {
    if (activeSize) return activeSize.price > 0 ? activeSize.price : product?.price;
    return product?.price;
  }, [activeSize, product]);

  const currentStock = useMemo(() => {
    if (activeSize) return activeSize.stock;
    if (product?.variants?.length > 0 && !activeSize) return 0; // If variable but no size selected
    return product?.stock;
  }, [activeSize, product]);

  // Gallery images based on selection
  const galleryImages = useMemo(() => {
    if (!product) return [];
    let images = [];
    if (activeVariant) {
      if (activeVariant.image) images.push(activeVariant.image);
      if (activeVariant.images) images.push(...activeVariant.images);
    } else {
      if (product.image) images.push(product.image);
      if (product.images) images.push(...product.images);
    }
    // Deduplicate
    return images.filter((img, index, self) => img && self.indexOf(img) === index);
  }, [product, activeVariant]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch the specific product
        const productData = await apiClient.get<IProduct>(`/products/${slug}`);

        if (productData) {
          setProduct(productData);

          // Track view_item event
          sendGTMEvent({
            event: 'view_item',
            content_name: productData.name,
            content_ids: [productData.id], // Using 'id' field as consistent with other parts
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

  // Reset quantity when variant/size changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId, selectedSizeId]);

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
              <p className="mt-4 text-3xl font-bold text-primary">
                BDT {currentPrice?.toLocaleString()}
              </p>

              {/* Variable Product Options */}
              {product.variants && product.variants.length > 0 ? (
                <div className='mt-6 space-y-6'>
                  {/* Colors */}
                  <div>
                    <Label className='text-base mb-3 block'>Select Color: <span className='font-normal text-muted-foreground'>{activeVariant?.color}</span></Label>
                    <div className='flex flex-wrap gap-3'>
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant._id || variant.color} // Fallback to color if no ID
                          onClick={() => {
                            setSelectedVariantId(variant._id);
                            setSelectedSizeId(null); // Reset size when color changes
                          }}
                          className={cn(
                            "relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            (activeVariant?._id === variant._id || (!selectedVariantId && variant === product.variants[0]))
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-transparent"
                          )}
                          title={variant.color}
                        >
                          <Image
                            src={variant.image}
                            alt={variant.color}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <Label className='text-base mb-3 block'>Select Size: {activeSize && <span className='font-normal text-muted-foreground'>{activeSize.size}</span>}</Label>
                    <div className='flex flex-wrap gap-3'>
                      {activeVariant?.sizes?.map((sizeObj: any) => {
                        // Highlight if explicitly selected OR if matching the activeSize (derived default)
                        const isSelected = selectedSizeId === sizeObj._id || (!selectedSizeId && activeSize?._id === sizeObj._id);
                        const isOutOfStock = sizeObj.stock <= 0;
                        return (
                          <button
                            key={sizeObj._id}
                            disabled={isOutOfStock}
                            onClick={() => setSelectedSizeId(sizeObj._id)}
                            className={cn(
                              "min-w-[3rem] h-10 px-3 rounded-md border text-sm font-medium transition-colors hover:border-primary",
                              isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground",
                              isOutOfStock && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground decoration-slate-500 line-through"
                            )}
                          >
                            {sizeObj.size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Simple Product Size Badge */
                product.size && (
                  <div className="mt-4">
                    <Badge className="text-base px-3 py-1 font-normal bg-[#ff3399] text-white hover:bg-[#ff3399]/90">
                      Size: {product.size}
                    </Badge>
                  </div>
                )
              )}

              {currentStock > 0 ? (
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
                        disabled={quantity >= currentStock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentStock > 5 ? (
                        <span className="text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-orange-600 font-medium">Only {currentStock} left!</span>
                      )}
                    </p>
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
                      color={activeVariant?.color}
                      size={activeSize?.size}
                      variantId={activeSize?._id}
                      image={activeVariant?.image}
                      variant="outline"
                      className="w-full flex-1 text-lg py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </AddToCartButton>
                    <AddToCartButton
                      product={product}
                      quantity={quantity}
                      redirectToCheckout
                      color={activeVariant?.color}
                      size={activeSize?.size}
                      variantId={activeSize?._id}
                      image={activeVariant?.image}
                      className="w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>
      <Footer />
    </div>
  );
}
