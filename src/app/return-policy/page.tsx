import { Metadata } from 'next';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
    title: 'Return Policy - Rodelas Lifestyle',
    description: 'Rodelas Lifestyle Return Policy',
};

export default function ReturnPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container py-16 md:py-24 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Return Policy</h1>

                    <div className="space-y-6 text-muted-foreground text-lg">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">ডেলিভারি ও রিটার্ন:</h2>
                            <p>পণ্য ডেলিভারি পাওয়ার সময় অবশ্যই রাইডারের সামনে চেক করে রিসিভ করবেন। যদি পণ্যে কোনো ত্রুটি থাকে, ছবির সাথে মিল না থাকে বা কোনো কারণে পছন্দ না হয়, তবে রাইডার থাকা অবস্থাতেই তা ফেরত দিতে পারবেন।</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">ডেলিভারি চার্জ:</h2>
                            <p>রাইডারের মাধ্যমে সাথে সাথে রিটার্ন করার ক্ষেত্রে আপনাকে শুধুমাত্র ডেলিভারি চার্জটি (রিটার্ন চার্জ হিসেবে) প্রদান করতে হবে।</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">শর্ত:</h2>
                            <p>রাইডার চলে আসার পর পণ্য সম্পর্কিত কোনো প্রকার অভিযোগ, রিটার্ন বা এক্সচেঞ্জ গ্রহণ করা হবে ঘন না।</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
