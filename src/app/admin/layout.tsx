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
    return <div className="min-h-screen admin-bg">{children}</div>;
  }

  return (
    <div className="admin-shell">
      {/* Ambient background */}
      <div className="admin-ambient" />

      {/* Sidebar navigation */}
      <AdminSidebar session={session} />

      {/* Dashboard Main Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-live-dot" />
            <span className="admin-live-label">Live Dashboard</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-user">
              <div className="admin-user-avatar">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{session.name}</span>
                <span className="admin-user-role">{session.role}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
