import React from "react";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // ─── DEMO MODE ─── Static mock data for deployment demo (no database required)
  const metrics = {
    totalRevenue: 248500,
    pendingRevenue: 12300,
    bookingsCount: 47,
    upcomingWorkshops: 6,
    availableSeats: 38,
    customersCount: 42,
  };

  const recentActivity = [
    { id: "1", ref: "SLV-WK-104821", customerName: "Priya Sharma", amount: 4130, participants: 1, dateStr: "Jun 10, 2026", status: "CONFIRMED" },
    { id: "2", ref: "SLV-WK-209345", customerName: "Ananya Mehta", amount: 8260, participants: 2, dateStr: "Jun 9, 2026", status: "CONFIRMED" },
    { id: "3", ref: "SLV-WK-318472", customerName: "Rohan Kapoor", amount: 4130, participants: 1, dateStr: "Jun 8, 2026", status: "CONFIRMED" },
    { id: "4", ref: "SLV-WK-423681", customerName: "Sneha Iyer", amount: 6490, participants: 2, dateStr: "Jun 7, 2026", status: "CONFIRMED" },
    { id: "5", ref: "SLV-WK-531029", customerName: "Kavya Nair", amount: 4130, participants: 1, dateStr: "Jun 6, 2026", status: "CONFIRMED" },
  ];

  const revenueChartData = [
    { name: "Jan", revenue: 18500 },
    { name: "Feb", revenue: 22000 },
    { name: "Mar", revenue: 31500 },
    { name: "Apr", revenue: 28000 },
    { name: "May", revenue: 41200 },
    { name: "Jun", revenue: 38800 },
  ];

  const bookingsChartData = [
    { date: "Jun 1", seats: 3 },
    { date: "Jun 3", seats: 5 },
    { date: "Jun 5", seats: 2 },
    { date: "Jun 7", seats: 8 },
    { date: "Jun 9", seats: 4 },
    { date: "Jun 10", seats: 6 },
  ];

  const bagColorData = [
    { name: "Ivory White", value: 28 },
    { name: "Noir Black", value: 19 },
  ];

  const stylePrefData = [
    { name: "Brush Painting", value: 22 },
    { name: "Block Printing", value: 15 },
    { name: "Dual Craft", value: 10 },
  ];

  return (
    <DashboardClient
      metrics={metrics}
      recentActivity={recentActivity}
      revenueChartData={revenueChartData}
      bookingsChartData={bookingsChartData}
      bagColorData={bagColorData}
      stylePrefData={stylePrefData}
    />
  );
}
