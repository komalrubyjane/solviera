import React from "react";
import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no session exists, render login page container (unauthenticated)
  if (!session) {
    return <div className="min-h-screen bg-[#0D0814]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0D0814]">
      {/* Sidebar navigation */}
      <AdminSidebar session={session} />
      
      {/* Dashboard Main Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-20 border-b border-mocha/10 flex items-center justify-between px-8 bg-sand/30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] tracking-widest text-mocha uppercase font-light">
              Solviera Atelier Workspace ({session.role})
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-soft-brown font-light">Welcome,</span>
            <span className="text-white font-medium">{session.name}</span>
          </div>
        </header>
        <main className="p-8 flex-grow">{children}</main>
      </div>
    </div>
  );
}
