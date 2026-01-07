
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Phone, MessageCircle, Home } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function OrderAssistancePage() {
    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                    <CardHeader>
                        <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-2 dark:bg-amber-900/40">
                            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <CardTitle className="text-xl text-amber-900 dark:text-amber-100">Action Required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-amber-800 dark:text-amber-200">
                            We are unable to process this order automatically. Please contact our customer support for assistance.
                        </p>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button variant="outline" className="w-full gap-2 border-amber-200 hover:bg-amber-100 text-amber-900 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-900/40" asChild>
                                <a href="tel:+8801776180359">
                                    <Phone className="h-4 w-4" /> Call Support
                                </a>
                            </Button>
                            <Button variant="outline" className="w-full gap-2 border-amber-200 hover:bg-amber-100 text-amber-900 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-900/40" asChild>
                                <a href="https://wa.me/8801776180359" target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4" /> WhatsApp Support
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Return to Home
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
