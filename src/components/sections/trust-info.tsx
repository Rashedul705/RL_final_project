import { Truck, ShieldCheck, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trustPoints = [
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: "Shipping & Returns",
    description: "Fast shipping and easy returns on all orders.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Shop with Confidence",
    description: "Your security and privacy are our priority.",
  },
  {
    icon: <Banknote className="h-8 w-8 text-primary" />,
    title: "COD Available",
    description: "Pay with cash upon delivery, nationwide.",
  },
];

export function TrustInfo() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex flex-col items-center text-center gap-4">
              {point.icon}
              <div>
                <h3 className="text-xl font-bold">{point.title}</h3>
                <p className="text-muted-foreground mt-1">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
