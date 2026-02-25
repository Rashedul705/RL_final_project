import { Metadata } from 'next';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
    title: 'Privacy Policy - Rodelas Lifestyle',
    description: 'Rodelas Lifestyle Privacy Policy',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container py-16 md:py-24 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                    <div className="space-y-6 text-muted-foreground text-lg">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Information We Collect:</h2>
                            <p>When you place an order, we collect essential details such as your name, delivery address, and phone number.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">How We Use Your Data:</h2>
                            <p>The information you provide is used strictly to process your orders, ensure smooth delivery, and offer customer support.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Data Protection:</h2>
                            <p>We highly value your privacy. We do not sell, trade, or share your personal information with any third parties under any circumstances.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
