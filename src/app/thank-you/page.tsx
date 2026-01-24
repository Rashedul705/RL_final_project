'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { apiClient } from '@/lib/api-client';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            const fetchOrder = async () => {
                try {
                    const orderData = await apiClient.get<any>(`/orders/${orderId}`);
                    if (orderData) {
                        setOrder(orderData);

                        // Facebook Pixel Purchase
                        // @ts-ignore
                        if (typeof window !== 'undefined' && window.fbq) {
                            // @ts-ignore
                            window.fbq('track', 'Purchase', {
                                value: orderData.totalAmount || orderData.total, // Adjust field name based on API response
                                currency: 'BDT',
                                order_id: orderId, // unique order ID
                            });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch order for pixel tracking', error);
                }
            };
            fetchOrder();
        }
    }, [orderId]);

    return (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-4">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#1a1a1a]">Thank You for Your Order!</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Your order has been placed successfully.
            </p>

            {orderId && (
                <div className="bg-muted/50 p-6 rounded-lg mb-8 border border-border w-full max-w-sm">
                    <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                    <p className="text-xl font-mono font-bold text-[#00846E]">{orderId}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={() => router.push('/')}
                    className="bg-[#00846E] hover:bg-[#00846E]/90 text-white min-w-[200px]"
                >
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto flex items-center justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                    <ThankYouContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
