import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import placeholderData from '@/lib/placeholder-images.json';

const { placeholderImages } = placeholderData;

const heroImage = placeholderImages.find(img => img.id === 'hero-banner') || { imageUrl: 'https://picsum.photos/seed/placeholder/1920/800', imageHint: 'fashion' };

export function Hero() {
  return (
    <section className="w-full">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="relative h-[50vh] md:h-[70vh] w-full">
              <Image
                src={heroImage.imageUrl}
                alt="Promotional banner"
                fill
                priority
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl md:text-6xl font-headline drop-shadow-lg">
                  Elegance in Every Thread
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl font-body drop-shadow">
                  Discover our exclusive collection of premium apparel and lifestyle products.
                </p>
                <Button variant="outline" className="mt-8 bg-transparent text-white border-white hover:bg-white hover:text-black">
                  Shop Now
                </Button>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>
  );
}
