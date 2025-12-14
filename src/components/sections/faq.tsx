import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs as defaultFaqs } from "@/lib/data";

export function Faq() {
  const faqs = defaultFaqs;

  return (
    <section id="faq" className="pt-8 pb-16 md:pt-12 md:pb-12 bg-background scroll-mt-20">
      <div className="container max-w-4xl">
        <h2 className="text-3xl md:text-4xl mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq: any, index: number) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
