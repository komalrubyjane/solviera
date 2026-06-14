"use client";

import React from "react";
import Link from "next/link";

interface TicketData {
  ref: string;
  name: string;
  email: string;
  phone: string;
  workshopTitle: string;
  date: string;
  timeSlot: string;
  bagColor: string;
  style: string;
  participants: number;
  amount: number;
  qrCode: string;
  status: string;
  venueName: string;
  venueAddress: string;
}

interface Props {
  booking: TicketData;
}

export default function TicketClient({ booking }: Props) {
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F7F1E7] py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden font-sans text-[#4A4035]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 bg-no-repeat bg-contain pointer-events-none" style={{ backgroundImage: "url('/assets/flowers/trans_flower.png')", transform: "scaleX(-1)" }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 opacity-10 bg-no-repeat bg-contain pointer-events-none" style={{ backgroundImage: "url('/assets/flowers/trans_flower.png')", transform: "scaleY(-1)" }} />

      {/* Main Ticket Container */}
      <div className="w-full max-w-lg print-card-container">
        
        {/* Invitation Card */}
        <div id="solviera-ticket-card" className="relative bg-[#FAF6EE] border border-[#E8DFC8] rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden print:shadow-none print:border print:rounded-none">
          
          {/* Floral Corner Decorations */}
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 opacity-30 pointer-events-none print:opacity-40 select-none">
            <img 
              src="/assets/flowers/trans_chatgpt_1.png" 
              alt="" 
              className="w-full h-full object-contain origin-top-left"
              style={{ transform: "rotate(90deg) scaleX(-1)" }}
            />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 opacity-30 pointer-events-none print:opacity-40 select-none">
            <img 
              src="/assets/flowers/trans_chatgpt_1.png" 
              alt="" 
              className="w-full h-full object-contain origin-top-right"
              style={{ transform: "rotate(180deg)" }}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-28 sm:h-28 opacity-30 pointer-events-none print:opacity-40 select-none">
            <img 
              src="/assets/flowers/trans_chatgpt_1.png" 
              alt="" 
              className="w-full h-full object-contain origin-bottom-left"
              style={{ transform: "scaleY(-1) scaleX(-1)" }}
            />
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-28 sm:h-28 opacity-30 pointer-events-none print:opacity-40 select-none">
            <img 
              src="/assets/flowers/trans_chatgpt_1.png" 
              alt="" 
              className="w-full h-full object-contain origin-bottom-right"
              style={{ transform: "scaleY(-1)" }}
            />
          </div>

          {/* Invitation Content */}
          <div className="text-center mt-6 sm:mt-8 mb-4">
            <span className="font-serif tracking-[0.25em] text-xs text-[#B69AC7] uppercase font-semibold">Solviera Atelier</span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#4A4035] font-light mt-1 tracking-wide">Workshop Invitation</h1>
            <div className="w-16 h-[1px] bg-[#E8DFC8] mx-auto my-4" />
          </div>

          <div className="space-y-6 my-6 text-sm">
            <div className="text-center px-4">
              <span className="text-[10px] uppercase tracking-wider text-[#A1917C] block mb-0.5">Guest Name</span>
              <span className="font-serif text-lg text-[#4A4035] font-medium">{booking.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#F0E6D2] py-5 px-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A1917C] block mb-0.5">Workshop</span>
                <span className="font-medium block text-xs sm:text-sm text-[#4A4035]">{booking.workshopTitle}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A1917C] block mb-0.5">Date &amp; Time</span>
                <span className="font-medium block text-xs sm:text-sm text-[#4A4035]">{formattedDate}</span>
                <span className="text-xs text-[#A1917C]">{booking.timeSlot}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-[#F0E6D2] pb-5 px-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A1917C] block mb-0.5">Venue</span>
                <span className="font-medium block text-xs text-[#4A4035]">{booking.venueName}</span>
                <span className="text-[11px] text-[#A1917C] block mt-0.5 leading-snug">{booking.venueAddress}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A1917C] block mb-0.5">Selections</span>
                <span className="text-xs text-[#4A4035] block">Bag: {booking.bagColor}</span>
                <span className="text-xs text-[#4A4035] block">Medium: {booking.style}</span>
                <span className="text-xs text-[#4A4035] block">Seats: {booking.participants}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center py-4 bg-white/40 rounded-2xl border border-[#F0E6D2]/60 p-4 max-w-[240px] mx-auto">
              {booking.qrCode ? (
                <img 
                  src={booking.qrCode} 
                  alt={`QR code for registration ${booking.ref}`} 
                  className="w-40 h-40 object-contain print:w-48 print:h-48"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-xs text-gray-500">QR Code Error</div>
              )}
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#A1917C] mt-3 block">Registration ID</span>
              <span className="font-mono text-sm text-[#4A4035] font-semibold mt-0.5">{booking.ref}</span>
            </div>

            <div className="text-center px-6 text-xs text-[#A1917C] italic leading-relaxed">
              🌸 Present this QR code at the entrance for seamless check-in.
            </div>
          </div>
          
          <div className="text-center pt-2 border-t border-[#F0E6D2] mt-4">
            <span className="font-serif italic text-xs text-[#A1917C]">We look forward to welcoming you.</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md mx-auto justify-center print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-[#4A4035] to-[#635547] text-[#FAF6EE] py-3.5 px-6 rounded-xl hover:scale-102 transition-transform duration-300 font-medium text-sm text-center shadow-md cursor-pointer"
          >
            🖨️ Print Ticket
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 border border-[#4A4035] text-[#4A4035] py-3.5 px-6 rounded-xl hover:bg-[#FAF6EE] hover:scale-102 transition-all duration-300 font-medium text-sm text-center cursor-pointer"
          >
            📥 Download Ticket (PDF)
          </button>
        </div>

        <div className="text-center mt-6 print:hidden">
          <Link href="/" className="text-xs text-[#A1917C] hover:text-[#4A4035] transition-colors underline underline-offset-4">
            Return to Homepage
          </Link>
        </div>

      </div>

      {/* Inline styles for Print Layout formatting */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-card-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #solviera-ticket-card {
            border: 1px solid #e2d8c0 !important;
            background: #FAF6EE !important;
            box-shadow: none !important;
            border-radius: 16px !important;
            width: 100% !important;
            max-width: 450px !important;
            margin: 20px auto !important;
            padding: 30px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden, button, a {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
