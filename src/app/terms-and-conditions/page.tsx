import { Metadata } from 'next';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
    title: 'Terms & Conditions - Rodelas Lifestyle',
    description: 'Rodelas Lifestyle Terms and Conditions',
};

export default function TermsAndConditionsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container py-16 md:py-24 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>

                    <div className="space-y-6 text-muted-foreground text-lg">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Acceptance of Terms:</h2>
                            <p>By visiting our website and/or purchasing from us, you agree to be bound by these Terms & Conditions.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Intellectual Property:</h2>
                            <p>All content, product images, logos, and designs on this website are the property of Rodela's Lifestyle. Unauthorized use, reproduction, or distribution is strictly prohibited.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Order Management:</h2>
                            <p>We reserve the right to refuse, update, or cancel any order at any time for reasons including, but not limited to, product unavailability or errors in pricing.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Governing Law:</h2>
                            <p>These terms and your use of this website are governed by the laws of Bangladesh.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
