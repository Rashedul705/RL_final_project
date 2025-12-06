
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { LayoutDashboard, ShoppingCart, Package, FileText, Home, Tags, Truck, MessageSquare } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/admin/products", label: "Products", icon: <Package /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingCart /> },
  { href: "/admin/categories", label: "Categories", icon: <Tags /> },
  { href: "/admin/shipping", label: "Shipping", icon: <Truck /> },
  { href: "/admin/inquiries", label: "Inquiries", icon: <MessageSquare /> },
  { href: "/admin/content", label: "Content", icon: <FileText /> },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="lg:w-64 border-r bg-background hidden md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="">Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                  (pathname.startsWith(item.href) && (item.href !== "/admin" || pathname === "/admin")) ? 'bg-muted text-primary' : ''
                }`}
              >
                {React.cloneElement(item.icon, { className: "h-4 w-4" })}
                {item.label}
              </Link>
            ))}
             <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Storefront
              </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
