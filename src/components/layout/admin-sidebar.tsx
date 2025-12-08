
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { LayoutDashboard, ShoppingCart, Package, Users, Pencil, Home, Menu, Bot, Shapes, AreaChart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebar, SidebarTrigger, SidebarClose } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/admin/analytics", label: "Analytics", icon: <AreaChart /> },
  { href: "/admin/products", label: "Products", icon: <Package /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingCart /> },
  { href: "/admin/categories", label: "Categories", icon: <Shapes /> },
  { href: "/admin/customers", label: "Customers", icon: <Users /> },
  { href: "/admin/content", label: "Content", icon: <Pencil /> },
];

function AdminNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {adminNavItems.map((item) => (
        <SidebarClose key={item.href} asChild>
          <Link
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                ? 'bg-muted text-primary'
                : ''
            }`}
          >
            {React.cloneElement(item.icon, { className: "h-4 w-4" })}
            {item.label}
          </Link>
        </SidebarClose>
      ))}
    </nav>
  );
}

function SidebarContent() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Bot className="h-6 w-6 text-primary" />
            <span className="">Admin Panel</span>
          </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <AdminNavLinks />
      </div>
      <div className="mt-auto border-t p-4">
        <SidebarClose asChild>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Storefront
          </Link>
        </SidebarClose>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:border-r">
          <SidebarContent />
      </aside>
      <AdminMobileSidebar />
    </>
  );
}

function AdminMobileSidebar() {
    const { isOpen, setIsOpen } = useSidebar();
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="left" className="p-0 w-64 flex flex-col">
                <SheetHeader className="h-16 items-center border-b px-6 flex flex-row justify-between">
                  <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="">Admin Panel</span>
                  </Link>
                <SheetTitle className="sr-only">Admin Menu</SheetTitle>
              </SheetHeader>
               <div className="flex-1 overflow-y-auto py-2">
                <AdminNavLinks />
              </div>
              <div className="mt-auto border-t p-4">
                <SidebarClose asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Home className="h-4 w-4" />
                    Storefront
                  </Link>
                </SidebarClose>
              </div>
            </SheetContent>
        </Sheet>
    );
}

export function AdminMobileHeader() {
  const pathname = usePathname();
  const currentNavItem = adminNavItems.find(item => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)));
  const title = currentNavItem ? currentNavItem.label : "Admin Panel";


    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
            <SidebarTrigger asChild>
                <Button size="icon" variant="outline">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SidebarTrigger>
            <h1 className="flex-1 text-lg font-semibold">
                {title}
            </h1>
        </header>
    );
}
