"use client";

import { useEffect } from "react";

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

  useEffect(() => {
    // Force scroll to top on mount to avoid stuck-at-bottom issues on reload
    window.scrollTo(0, 0);
  }, []);

  // existing imports needed: useEffect from "react", Link from "next/link" (already verified imports)
  // Wait, imports are at top. I need to make sure I don't break them.
  // The file imports: Image, Carousel..., Button. 
  // I need to ADD imports if replacing the whole function body or verify they are there.
  // 'next/link' is NOT imported. I should use multi_replace or include imports.
  // I'll replace the whole file content to be safe and clean.

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
                <div className="mt-8">
                  <a href="#categories">
                    <Button variant="outline" className="bg-transparent text-white border-[#FE45A0] hover:bg-[#FE45A0] hover:text-white hover:border-[#FE45A0] rounded-none px-8 py-6 text-lg tracking-wider">
                      Shop Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>
  );
}
