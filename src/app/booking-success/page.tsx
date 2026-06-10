import React from "react";
import db from "@/lib/db";
import SuccessClient from "./SuccessClient";

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function BookingSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const ref = params.ref;

  if (!ref) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0814] text-white">
        <div className="text-center max-w-[400px] p-6">
          <h1 className="font-serif text-2xl mb-4 text-red-400">Missing Reference</h1>
          <p className="text-xs text-soft-brown font-light">
            Please check your email booking confirmation or contact Solviera hosts.
          </p>
        </div>
      </div>
    );
  }

  const booking = await db.booking.findUnique({
    where: { bookingRef: ref },
    include: {
      user: true,
      workshop: true,
      workshopDate: true,
    },
  });

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0814] text-white">
        <div className="text-center max-w-[400px] p-6">
          <h1 className="font-serif text-2xl mb-4 text-red-400">Reservation Not Found</h1>
          <p className="text-xs text-soft-brown font-light">
            Booking reference: <code className="text-mocha">{ref}</code> could not be located in our records.
          </p>
        </div>
      </div>
    );
  }

  const venue = await db.venue.findFirst() || {
    name: "Solviera Cafe & Atelier",
    address: "12, Via de' Tornabuoni, Florence, Italy",
  };

  return (
    <SuccessClient
      booking={{
        ref: booking.bookingRef,
        name: booking.user.name,
        email: booking.user.email,
        workshopTitle: booking.workshop.title,
        date: booking.workshopDate.date.toISOString(),
        timeSlot: booking.workshopDate.timeSlot,
        bagColor: booking.bagColor,
        style: booking.style,
        participants: booking.participants,
        amount: booking.totalAmount,
        qrCode: booking.qrCode || "",
        status: booking.status,
      }}
      venue={venue}
    />
  );
}
