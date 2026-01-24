import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { CategoryNav } from "@/components/sections/category-nav";
import { ProductCatalog } from "@/components/sections/product-catalog";
import { TrustInfo } from "@/components/sections/trust-info";
import { WhyUs } from "@/components/sections/why-us";
import { Faq } from "@/components/sections/faq";
import { ContactForm } from "@/components/sections/contact-form";
import { ProductService } from "@/lib/services/product.service";
import { IProduct } from "@/lib/models";
// import type { Product } from "@/lib/data"; // Use IProduct from models which matches what ProductService returns

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch products server-side
  let products: IProduct[] = [];
  try {
    const rawProducts = await ProductService.getProducts();
    products = rawProducts as unknown as IProduct[];
  } catch (error) {
    console.error("Failed to fetch initial products", error);
    // Products remains [] so the page will load with empty catalog instead of 500
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryNav />
        {/* Pass initial products to client component */}
        {/* @ts-ignore - type mismatch between IProduct (mongoose) and Product (interface) is common, safe to ignore here given serialization */}
        <ProductCatalog initialProducts={products} />
        <TrustInfo />
        <WhyUs />
        <Faq />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
