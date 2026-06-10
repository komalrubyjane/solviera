"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdminAction } from "@/app/actions/admin";

interface SidebarProps {
  session: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/solviera/admin/login");
    router.refresh();
  };

  const menuItems = [
    { name: "Dashboard Overview", path: "/solviera/admin" },
    { name: "Workshops & Dates", path: "/solviera/admin/workshops" },
    { name: "Bookings Ledger", path: "/solviera/admin/bookings" },
    { name: "Content CMS", path: "/solviera/admin/content" },
  ];

  return (
    <aside className="w-64 border-r border-mocha/10 bg-gradient-to-b from-sand to-cream flex flex-col justify-between p-6">
      <div className="space-y-10">
        {/* Logo */}
        <div className="text-center md:text-left">
          <Link href="/" className="font-serif text-2xl tracking-widest text-white uppercase hover:text-mocha transition-colors">
            Solviera
          </Link>
          <p className="text-[8px] tracking-[0.2em] text-mocha uppercase font-light mt-1">
            Studio Admin Panel
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`py-3 px-4 rounded-xl text-xs font-light tracking-wide uppercase transition-all duration-300 ${
                  isActive
                    ? "bg-beige/40 text-white border-l-2 border-mocha"
                    : "text-soft-brown hover:bg-sand/40 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User controls */}
      <div className="border-t border-mocha/10 pt-6 space-y-4">
        <div className="flex flex-col text-xs font-light">
          <span className="text-white truncate">{session.name}</span>
          <span className="text-[9px] text-mocha uppercase mt-0.5 tracking-wider">{session.role}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white py-2.5 px-4 rounded-xl uppercase text-[10px] tracking-wider transition-all duration-300 text-center"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
