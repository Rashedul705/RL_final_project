import { Metadata } from 'next';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
    title: 'Contact Us - Rodelas Lifestyle',
    description: 'Contact Rodelas Lifestyle',
};

export default function ContactUsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 mt-12 md:mt-24 mb-16">
                <ContactForm />
            </main>
            <Footer />
        </div>
    );
}
