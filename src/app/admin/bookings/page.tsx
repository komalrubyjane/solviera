import React from "react";
import BookingsClient from "./BookingsClient";

export const revalidate = 0;

export default async function AdminBookingsPage() {
  // ─── DEMO MODE ─── Static mock bookings for deployment demo
  const now = new Date();
  const bookings = [
    {
      id: "1",
      ref: "SLV-WK-104821",
      customerName: "Priya Sharma",
      customerEmail: "priya@example.com",
      customerPhone: "+91 98765 43210",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString(),
      timeSlot: "10:00 AM – 1:00 PM",
      bagColor: "Ivory White",
      style: "Brush Painting",
      participants: 1,
      amount: 4130,
      status: "CONFIRMED",
      attendance: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      ref: "SLV-WK-209345",
      customerName: "Ananya Mehta",
      customerEmail: "ananya@example.com",
      customerPhone: "+91 87654 32109",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10).toISOString(),
      timeSlot: "2:00 PM – 5:00 PM",
      bagColor: "Noir Black",
      style: "Block Printing",
      participants: 2,
      amount: 8968,
      status: "CONFIRMED",
      attendance: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      ref: "SLV-WK-318472",
      customerName: "Rohan Kapoor",
      customerEmail: "rohan@example.com",
      customerPhone: "+91 76543 21098",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString(),
      timeSlot: "10:00 AM – 1:00 PM",
      bagColor: "Ivory White",
      style: "Brush + Block Printing",
      participants: 1,
      amount: 6490,
      status: "CONFIRMED",
      attendance: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return <BookingsClient bookings={bookings} />;
}
