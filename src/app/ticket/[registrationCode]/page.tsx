import React from "react";
import { getBookingByRefAction } from "@/app/actions/booking";
import TicketClient from "./TicketClient";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    registrationCode: string;
  }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { registrationCode } = await params;
  const res = await getBookingByRefAction(registrationCode);

  if (!res.success || !res.booking) {
    return (
      <div className="min-h-screen bg-[#F7F1E7] flex flex-col items-center justify-center p-4 text-[#4A4035] font-sans">
        <div className="bg-[#FAF6EE] border border-[#E8DFC8] rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <span className="font-serif tracking-[0.25em] text-xs text-[#B69AC7] uppercase font-semibold">Solviera</span>
          <h1 className="font-serif text-2xl text-[#4A4035] font-light mt-2 mb-4">Ticket Not Found</h1>
          <p className="text-xs text-[#A1917C] leading-relaxed mb-6">
            We couldn't find a workshop registration with code <span className="font-mono font-semibold text-[#4A4035]">{registrationCode}</span>. Please double-check your code or contact support.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#4A4035] text-[#FAF6EE] py-3 px-6 rounded-xl text-xs uppercase tracking-wider font-semibold hover:scale-102 transition-transform"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <TicketClient booking={res.booking} />;
}
