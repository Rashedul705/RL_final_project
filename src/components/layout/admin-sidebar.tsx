
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarContent,
} from "@/components/ui/sidebar";
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
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarMenu>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  icon={item.icon}
                >
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
             <Link href="/">
              <SidebarMenuButton icon={<Home />}>
                Storefront
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
