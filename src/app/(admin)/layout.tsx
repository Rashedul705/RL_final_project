
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
           <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 md:hidden">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                  </Button>
              </SidebarTrigger>
          </header>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
