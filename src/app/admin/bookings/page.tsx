import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import BookingsClient from "./BookingsClient";

export const revalidate = 0;

export default async function AdminBookingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  try {
    const dbBookings = await db.booking.findMany({
      include: {
        user: true,
        workshopDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const bookings = dbBookings.map((b) => ({
      id: b.id,
      ref: b.bookingRef,
      customerName: b.user?.name || "Guest",
      customerEmail: b.user?.email || "",
      customerPhone: b.user?.phone || "",
      date: b.workshopDate?.date ? b.workshopDate.date.toISOString() : new Date().toISOString(),
      timeSlot: b.workshopDate?.timeSlot || "N/A",
      bagColor: b.bagColor || "",
      style: b.style || "",
      participants: b.participants,
      amount: b.totalAmount,
      status: b.status,
      attendance: b.attendance,
      createdAt: b.createdAt.toISOString(),
      customAnswers: b.customAnswers ? (b.customAnswers as Record<string, string>) : null,
    }));

    return <BookingsClient bookings={bookings} />;
  } catch (error: any) {
    console.error("ADMIN BOOKINGS PAGE RENDER ERROR:", error);
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-800 max-w-4xl mx-auto my-12">
        <h2 className="font-serif text-xl text-red-700 font-bold mb-2">Bookings Ledger Load Error</h2>
        <p className="text-xs text-[#706353] mb-4">
          An error occurred in the Server Component render process. The system failed to query the database or resolve dependencies:
        </p>
        <pre className="text-xs font-mono bg-white/60 p-4 rounded-xl border border-red-200 overflow-x-auto whitespace-pre-wrap text-red-900 leading-relaxed">
          {error?.stack || error?.message || String(error)}
        </pre>
      </div>
    );
  }
}
