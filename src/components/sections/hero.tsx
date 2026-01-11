"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export function Hero() {
  const imageUrl = '/images/hero-banner.png';
  const heading = "Elegance in Every Thread";
  const description = "Discover our exclusive collection of premium apparel and lifestyle products.";

  return (
    <section className="w-full">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="relative h-[30vh] md:h-[40vh] w-full">
              <Image
                src={imageUrl}
                alt="Promotional banner"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl md:text-6xl drop-shadow-lg font-bold">
                  {heading}
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow">
                  {description}
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
