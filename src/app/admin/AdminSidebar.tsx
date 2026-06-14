"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdminAction } from "@/app/actions/admin";

interface SidebarProps {
  session: {
    name: string;
    email: string;
    role: string;
  };
}

const navItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: "Workshops",
    path: "/admin/workshops",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: "Bookings",
    path: "/admin/bookings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    name: "Content",
    path: "/admin/content",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="14" y2="17" />
      </svg>
    ),
  },
  {
    name: "Check-In",
    path: "/admin/checkin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="7" y="7" width="3" height="3" />
        <rect x="14" y="7" width="3" height="3" />
        <rect x="7" y="14" width="3" height="3" />
        <path d="M14 14h3v3h-3z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Clear navigating state when pathname changes (page loaded)
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleNavClick = (path: string) => {
    if (path !== pathname) {
      setNavigatingTo(path);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <Link href="/" className="admin-logo-link">
          <Image src="/logo.png" alt="Solviera" width={32} height={32} className="admin-logo-img" />
          <div>
            <div className="admin-logo-name">Solviera</div>
            <div className="admin-logo-sub">Admin Studio</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-label">Navigation</div>
        {navItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.path);
          const isNavigating = navigatingTo === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""} ${isNavigating ? "admin-nav-item--loading" : ""}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-text">{item.name}</span>
              {isNavigating ? (
                <span className="admin-nav-spinner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </span>
              ) : isActive ? (
                <span className="admin-nav-active-dot" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="admin-sidebar-divider" />

      {/* Quick link to public site */}
      <Link href="/" className="admin-nav-item admin-nav-item--ghost" target="_blank">
        <span className="admin-nav-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        <span className="admin-nav-text">View Public Site</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto", opacity: 0.4 }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15,3 21,3 21,9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </Link>

      {/* Footer / User profile */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{session.name}</span>
            <span className="admin-sidebar-user-role">{session.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="admin-logout-btn"
          title="Sign out"
        >
          {isLoggingOut ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-spin">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
}
