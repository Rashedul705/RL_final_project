
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
