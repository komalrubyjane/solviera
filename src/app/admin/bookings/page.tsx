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
    customerName: b.user.name,
    customerEmail: b.user.email,
    customerPhone: b.user.phone || "",
    date: b.workshopDate.date.toISOString(),
    timeSlot: b.workshopDate.timeSlot,
    bagColor: b.bagColor,
    style: b.style,
    participants: b.participants,
    amount: b.totalAmount,
    status: b.status,
    attendance: b.attendance,
    createdAt: b.createdAt.toISOString(),
  }));

  return <BookingsClient bookings={bookings} />;
}
