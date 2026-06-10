import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import db from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // 1. Fetch data
  const bookings = await db.booking.findMany({
    include: {
      workshopDate: true,
      user: true,
    },
  });

  const payments = await db.payment.findMany();
  const usersCount = await db.user.count();
  const dates = await db.workshopDate.findMany({
    where: { date: { gte: new Date() } },
  });

  // 2. Calculate analytics
  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = payments
    .filter((p) => p.status === "PENDING")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBookingsCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  const totalCapacity = dates.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalBookedSeats = dates.reduce((acc, curr) => acc + curr.booked, 0);
  const availableSeats = Math.max(0, totalCapacity - totalBookedSeats);

  // Recent activity log
  const recentBookings = await db.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, workshopDate: true },
  });

  const recentActivity = recentBookings.map((b) => ({
    id: b.id,
    ref: b.bookingRef,
    customerName: b.user.name,
    amount: b.totalAmount,
    participants: b.participants,
    dateStr: new Date(b.createdAt).toLocaleDateString(),
    status: b.status,
  }));

  // 3. Recharts chart groupings
  // Monthly Revenue Grouping
  const revenueByMonthMap: { [key: string]: number } = {};
  payments
    .filter((p) => p.status === "SUCCESSFUL")
    .forEach((p) => {
      const month = new Date(p.createdAt).toLocaleString("en-US", { month: "short" });
      revenueByMonthMap[month] = (revenueByMonthMap[month] || 0) + p.amount;
    });

  const revenueChartData = Object.keys(revenueByMonthMap).map((m) => ({
    name: m,
    revenue: revenueByMonthMap[m],
  }));

  // Bag color preferences
  const bagColors = { White: 0, Black: 0 };
  bookings.forEach((b) => {
    if (b.bagColor.toLowerCase().includes("white")) bagColors.White += b.participants;
    if (b.bagColor.toLowerCase().includes("black")) bagColors.Black += b.participants;
  });

  const bagColorData = [
    { name: "Ivory White", value: bagColors.White },
    { name: "Noir Black", value: bagColors.Black },
  ];

  // Style preferences
  const stylePrefs = { Brush: 0, Block: 0, Both: 0 };
  bookings.forEach((b) => {
    if (b.style === "Brush Painting") stylePrefs.Brush += b.participants;
    else if (b.style === "Block Printing") stylePrefs.Block += b.participants;
    else stylePrefs.Both += b.participants;
  });

  const stylePrefData = [
    { name: "Brush Painting", value: stylePrefs.Brush },
    { name: "Block Printing", value: stylePrefs.Block },
    { name: "Dual Craft", value: stylePrefs.Both },
  ];

  // Bookings graph over time (grouped by date)
  const bookingsByDateMap: { [key: string]: number } = {};
  bookings.forEach((b) => {
    const dStr = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    bookingsByDateMap[dStr] = (bookingsByDateMap[dStr] || 0) + b.participants;
  });

  const bookingsChartData = Object.keys(bookingsByDateMap).map((k) => ({
    date: k,
    seats: bookingsByDateMap[k],
  }));

  const metrics = {
    totalRevenue,
    pendingRevenue,
    bookingsCount: totalBookingsCount,
    upcomingWorkshops: dates.length,
    availableSeats,
    customersCount: usersCount,
  };

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
