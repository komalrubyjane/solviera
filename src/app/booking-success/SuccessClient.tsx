"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface BookingData {
  ref: string;
  name: string;
  email: string;
  workshopTitle: string;
  date: string;
  timeSlot: string;
  bagColor: string;
  style: string;
  participants: number;
  amount: number;
  qrCode: string;
  status: string;
}

interface VenueData {
  name: string;
  address: string;
}

interface Props {
  booking: BookingData;
  venue: VenueData;
}

export default function SuccessClient({ booking, venue }: Props) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice);
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    let frameId: number;
    const updateRing = () => {
      setRingPos((prev) => {
        const dx = cursorPos.x - prev.x;
        const dy = cursorPos.y - prev.y;
        return { x: prev.x + dx * 0.15, y: prev.y + dy * 0.15 };
      });
      frameId = requestAnimationFrame(updateRing);
    };
    frameId = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(frameId);
  }, [cursorPos, isTouch]);

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    const title = "Solviera Tote Bag Painting Atelier";
    const description = `Atelier Workshop reservation details:
Style: ${booking.style}
Canvas base: ${booking.bagColor}
Participants: ${booking.participants} seat(s)
Booking Reference ID: ${booking.ref}`;
    
    const location = `${venue.name}, ${venue.address}`;
    
    const dateObj = new Date(booking.date);
    const pad = (num: number) => num.toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    
    // Default morning time slots: 10:00 AM - 13:00 PM UTC
    const startStr = `${year}${month}${day}T100000Z`;
    const endStr = `${year}${month}${day}T130000Z`;
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Solviera//Workshop Booking System//EN",
      "BEGIN:VEVENT",
      `UID:booking-${booking.ref}@solviera.com`,
      `DTSTAMP:${startStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `solviera_atelier_${booking.ref}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`relative min-h-screen pb-24 overflow-hidden ${!isTouch ? "custom-cursor-active" : ""}`}>
      {/* CUSTOM CURSOR */}
      {!isTouch && (
        <>
          <div
            id="cursor"
            className="fixed w-3 h-3 bg-warm-brown rounded-full pointer-events-none z-[9999] transition-transform duration-150 ease-out"
            style={{
              left: `${cursorPos.x - 6}px`,
              top: `${cursorPos.y - 6}px`,
              transform: isHovered ? "scale(2.5)" : "scale(1)",
              boxShadow: "0 0 12px var(--warm-brown)",
            }}
          />
          <div
            id="cursor-ring"
            className="fixed w-10 h-10 border border-mocha rounded-full pointer-events-none z-[9998] opacity-80"
            style={{
              left: `${ringPos.x - 20}px`,
              top: `${ringPos.y - 20}px`,
              opacity: isHovered ? 0.2 : 0.8,
            }}
          />
        </>
      )}

      {/* NAV */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-48px)] max-w-[900px] print:hidden">
        <div className="flex items-center justify-between bg-sand/75 backdrop-blur-2xl border border-mocha/20 rounded-full py-3 px-7 shadow-2xl">
          <Link
            href="/"
            className="font-serif text-lg tracking-widest uppercase text-white hover:text-mocha transition-colors"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Solviera
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button
                className="nav-cta"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* SUCCESS CONFIRMATION CONTAINER */}
      <section className="relative max-w-[650px] mx-auto pt-36 px-6 z-10 print:pt-6">
        <div className="text-center mb-10 print:hidden">
          <div className="w-16 h-16 bg-gradient-to-r from-warm-brown to-nude rounded-full flex items-center justify-center text-cream font-serif text-2xl mx-auto mb-4 shadow-xl">
            ✔
          </div>
          <h2 className="font-serif text-4xl font-light text-white">Booking Confirmed</h2>
          <p className="text-xs text-soft-brown font-light mt-2">
            Your seat at the atelier has been successfully reserved. A confirmation email was sent.
          </p>
        </div>

        {/* GLASS CARD DETAILS */}
        <div className="bg-gradient-to-br from-sand/80 to-cream/95 border border-mocha/20 rounded-3xl p-8 md:p-12 shadow-2xl relative print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-mocha/20 pb-6 mb-6 print:border-black">
            <div>
              <p className="text-[10px] tracking-widest text-mocha uppercase mb-1 font-light print:text-black">
                Reservation ID
              </p>
              <h3 className="font-serif text-2xl text-white font-light tracking-wide print:text-black">
                {booking.ref}
              </h3>
            </div>
            <div className="mt-3 md:mt-0 bg-warm-brown/15 border border-warm-brown/40 text-[9px] tracking-widest text-warm-brown uppercase py-1 px-3 rounded-full print:border-black print:text-black">
              Payment Successful
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4 text-xs font-light text-soft-brown print:text-black">
              <div>
                <strong className="text-white block print:text-black">Workshop Experience</strong>
                {booking.workshopTitle}
              </div>
              <div>
                <strong className="text-white block print:text-black">Date &amp; Time</strong>
                {formattedDate} ({booking.timeSlot})
              </div>
              <div>
                <strong className="text-white block print:text-black">Venue Location</strong>
                {venue.name}
                <br />
                {venue.address}
              </div>
              <div>
                <strong className="text-white block print:text-black">Customization</strong>
                Canvas: {booking.bagColor}
                <br />
                Medium: {booking.style}
              </div>
              <div>
                <strong className="text-white block print:text-black">Participants</strong>
                {booking.participants} Seat(s) reserved
              </div>
            </div>

            {/* Check-in QR code */}
            <div className="flex flex-col items-center justify-center bg-sand/30 border border-mocha/10 rounded-2xl p-6 print:border-black">
              {booking.qrCode ? (
                <div className="relative w-[180px] h-[180px] bg-white p-2 rounded-xl border border-mocha/20">
                  <img src={booking.qrCode} alt="Atelier check-in QR" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="text-xs font-light text-soft-brown">No QR code generated.</div>
              )}
              <span className="text-[9px] tracking-wider text-mocha uppercase mt-3 font-light print:text-black">
                Check-in scan code
              </span>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-mocha/20 pt-6 space-y-2 text-xs font-light text-soft-brown print:border-black print:text-black">
            <div className="flex justify-between">
              <span>Paid:</span>
              <span className="text-white font-serif font-light print:text-black">
                ₹{booking.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-8 print:hidden">
            <button
              onClick={handleAddToCalendar}
              className="border border-mocha/30 text-mocha hover:border-warm-brown hover:text-white py-2.5 px-6 rounded-full uppercase text-[10px] tracking-wider transition-all duration-300"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Add to Calendar
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="bg-gradient-to-r from-warm-brown to-nude text-cream font-semibold py-2.5 px-6 rounded-full uppercase text-[10px] tracking-wider transition-all duration-300 hover:scale-104"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Print Receipt
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
