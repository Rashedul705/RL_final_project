export const runtime = 'nodejs';
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/components/cart/cart-context";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rodelas lifestyle",
  description: "A premium online boutique for lifestyle products.",
};

import { AnalyticsTracker } from "@/components/analytics-tracker";
import { generateEventId } from "@/lib/utils";
import { sendFbEvent } from "@/lib/fb-events";
import { FacebookPixel } from "@/components/facebook-pixel";
import { headers } from "next/headers";

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side: Generate ID and send CAPI event
  const eventId = generateEventId();
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const url = `${protocol}://${host}`;

  // Fire and forget CAPI event
  sendFbEvent('PageView', eventId, url, {});

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TRDKCWNL');`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TRDKCWNL"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <FacebookPixel eventId={eventId} />

        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
