import { products, categories } from "@/lib/data";
import { ProductCard } from "./product-card";

export function ProductCatalog() {
  return (
    <div className="bg-background">
      <div className="container pt-8 pb-16 md:pt-12 md:pb-24 space-y-16">
        {categories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-20">
            <h2 className="text-3xl md:text-4xl font-headline mb-8 text-center">{category.name}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {products
                .filter((product) => product.category === category.id)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
