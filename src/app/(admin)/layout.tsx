
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex min-h-screen w-full">
        <div className="hidden border-r bg-background md:block">
            <AdminSidebar />
        </div>
        <div className="flex flex-col flex-1">
           <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                        >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <AdminSidebar isMobile={true} />
                    </SheetContent>
                </Sheet>
                <div className="flex-1">
                  <h1 className="font-semibold text-lg md:hidden">Admin Panel</h1>
                </div>
                <Link href="/" passHref>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="/">
                        <Home className="h-5 w-5" />
                        <span className="sr-only">Go to Storefront</span>
                      </Link>
                    </Button>
                </Link>
            </header>
          {children}
        </div>
      </div>
  );
}
