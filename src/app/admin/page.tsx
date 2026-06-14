import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  try {
    // Fetch all bookings with user and payment details
    const dbBookings = await db.booking.findMany({
      include: {
        user: true,
        payment: true,
        workshopDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate Metrics
    const bookingsCount = dbBookings.filter((b) => b.status === "CONFIRMED").length;
    const totalRevenue = dbBookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingRevenue = dbBookings
      .filter((b) => b.payment?.status === "PENDING" && b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const customersCount = new Set(dbBookings.map((b) => b.userId)).size;

    const now = new Date();
    const dbUpcomingDates = await db.workshopDate.findMany({
      where: {
        date: {
          gte: now,
        },
        status: "ACTIVE",
      },
    });
    const upcomingWorkshops = dbUpcomingDates.length;
    const availableSeats = dbUpcomingDates.reduce(
      (sum, d) => sum + Math.max(0, d.capacity - d.booked),
      0
    );

    const metrics = {
      totalRevenue,
      pendingRevenue,
      bookingsCount,
      upcomingWorkshops,
      availableSeats,
      customersCount,
    };

    // Recent Activity log (last 5)
    const recentActivity = dbBookings.slice(0, 5).map((b) => ({
      id: b.id,
      ref: b.bookingRef,
      customerName: b.user?.name || "Guest",
      amount: b.totalAmount,
      participants: b.participants,
      dateStr: b.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: b.status,
    }));

    // Revenue Growth Chart Data (Last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueChartData = Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - idx));
      return { name: monthNames[d.getMonth()], revenue: 0 };
    });

    dbBookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((b) => {
        const bMonthName = monthNames[b.createdAt.getMonth()];
        const match = revenueChartData.find((c) => c.name === bMonthName);
        if (match) {
          match.revenue += b.totalAmount;
        }
      });

    // Bookings Chart Data (Last 7 days)
    const bookingsChartData = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { date: label, seats: 0 };
    });

    dbBookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((b) => {
        const bDateLabel = b.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const match = bookingsChartData.find((c) => c.date === bDateLabel);
        if (match) {
          match.seats += b.participants;
        }
      });

    // Bag Color Preferences
    let whiteCount = dbBookings
      .filter((b) => b.status === "CONFIRMED" && ((b.bagColor || '').toLowerCase().includes("white") || (b.bagColor || '').toLowerCase().includes("ivory")))
      .reduce((sum, b) => sum + b.participants, 0);
    let blackCount = dbBookings
      .filter((b) => b.status === "CONFIRMED" && ((b.bagColor || '').toLowerCase().includes("black") || (b.bagColor || '').toLowerCase().includes("noir")))
      .reduce((sum, b) => sum + b.participants, 0);

    const bagColorData = [
      { name: "Ivory White", value: whiteCount },
      { name: "Noir Black", value: blackCount },
    ];
    if (whiteCount === 0 && blackCount === 0) {
      bagColorData[0].value = 1;
      bagColorData[1].value = 1;
    }

    // Style Preferences
    let brushCount = dbBookings.filter((b) => b.status === "CONFIRMED" && (b.style || '').toLowerCase().includes("brush")).length;
    let blockCount = dbBookings.filter((b) => b.status === "CONFIRMED" && (b.style || '').toLowerCase().includes("block")).length;
    let dualCount = dbBookings.filter((b) => b.status === "CONFIRMED" && ((b.style || '').toLowerCase().includes("both") || (b.style || '').toLowerCase().includes("dual") || (b.style || '').toLowerCase().includes("+"))).length;

    const stylePrefData = [
      { name: "Brush Painting", value: brushCount },
      { name: "Block Printing", value: blockCount },
      { name: "Dual Craft", value: dualCount },
    ];
    if (brushCount === 0 && blockCount === 0 && dualCount === 0) {
      stylePrefData[0].value = 1;
      stylePrefData[1].value = 1;
      stylePrefData[2].value = 1;
    }

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
  } catch (error: any) {
    console.error("ADMIN DASHBOARD RENDER ERROR:", error);
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-800 max-w-4xl mx-auto my-12">
        <h2 className="font-serif text-xl text-red-700 font-bold mb-2">Admin Dashboard Load Error</h2>
        <p className="text-xs text-[#706353] mb-4">
          An error occurred in the Server Component render process. The system failed to query the database or resolve dependencies:
        </p>
        <pre className="text-xs font-mono bg-white/60 p-4 rounded-xl border border-red-200 overflow-x-auto whitespace-pre-wrap text-red-900 leading-relaxed">
          {error?.stack || error?.message || String(error)}
        </pre>
        <div className="mt-6">
          <a
            href="/admin"
            className="inline-block bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-2.5 px-6 rounded-xl uppercase text-[10px] tracking-wider transition-all duration-300 hover:scale-102"
          >
            Retry Loading
          </a>
        </div>
      </div>
    );
  }
}
