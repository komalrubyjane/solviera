"use client";

import React, { useState } from "react";
import { markAttendanceAction, markAttendanceByRefAction, cancelBookingAction } from "@/app/actions/admin";

interface BookingItem {
  id: string;
  ref: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  bagColor: string;
  style: string;
  participants: number;
  amount: number;
  status: string;
  attendance: boolean;
  createdAt: string;
}

interface Props {
  bookings: BookingItem[];
}

export default function BookingsClient({ bookings }: Props) {
  const [search, setSearch] = useState("");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // QR Scan simulator input
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.ref.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStyle = filterStyle ? b.style === filterStyle : true;
    const matchesColor = filterColor ? b.bagColor.includes(filterColor) : true;
    const matchesStatus = filterStatus ? b.status === filterStatus : true;

    return matchesSearch && matchesStyle && matchesColor && matchesStatus;
  });

  const handleScanCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;
    setIsSubmitting(true);

    const res = await markAttendanceByRefAction(qrCodeInput.trim());
    if (res.success) {
      showToast(`Check-in Success: Reference ${res.name} marked as present!`);
      setQrCodeInput("");
      // Reload page to update UI
      setTimeout(() => window.location.reload(), 1500);
    } else {
      showToast(res.message || "Failed to process scan.", );
    }
    setIsSubmitting(false);
  };

  const handleToggleAttendance = async (bookingId: string, current: boolean) => {
    const res = await markAttendanceAction(bookingId, !current);
    if (res.success) {
      showToast(`Attendance updated successfully.`);
      window.location.reload();
    } else {
      showToast("Failed to update attendance.");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking and initiate refund?")) return;
    const res = await cancelBookingAction(bookingId);
    if (res.success) {
      showToast("Booking cancelled and payment marked as REFUNDED.");
      window.location.reload();
    } else {
      showToast("Failed to cancel booking.");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Booking ID",
      "Customer Name",
      "Email",
      "Phone",
      "Date",
      "Time Slot",
      "Bag Color",
      "Style",
      "Seats",
      "Paid",
      "Status",
      "Attendance",
      "Created At",
    ];

    const rows = filteredBookings.map((b) => [
      b.ref,
      b.customerName,
      b.customerEmail,
      b.customerPhone,
      new Date(b.date).toLocaleDateString(),
      b.timeSlot,
      b.bagColor,
      b.style,
      b.participants,
      b.amount,
      b.status,
      b.attendance ? "Present" : "Absent",
      new Date(b.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((x) => `"${x}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `solviera_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file exported successfully.");
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-serif text-3xl text-white font-light">Bookings Ledger</h1>
          <p className="text-xs font-light text-soft-brown mt-1">
            Audit reservations, process cancellations, and manage check-ins.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-sand/60 border border-mocha/30 text-mocha hover:text-white py-3 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300"
        >
          Export CSV Reports
        </button>
      </div>

      {/* QR CODE SCAN SIMULATOR */}
      <div className="bg-gradient-to-r from-sand/80 to-cream/95 border border-mocha/30 rounded-2xl p-6 shadow-md">
        <h3 className="font-serif text-lg text-white mb-2">QR Code Check-In Scanner</h3>
        <p className="text-[10px] text-soft-brown font-light mb-4">
          Simulate a camera scanner by typing or pasting the customer's Booking Reference Code (e.g. SLV-WK-XXXXXX).
        </p>
        <form onSubmit={handleScanCheckIn} className="flex gap-4 max-w-[500px]">
          <input
            type="text"
            placeholder="Paste booking reference code..."
            className="form-input"
            value={qrCodeInput}
            onChange={(e) => setQrCodeInput(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300"
          >
            Check In
          </button>
        </form>
      </div>

      {/* FILTERS AND SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-sand/30 border border-mocha/10 rounded-2xl p-5 shadow-md">
        <div>
          <label className="form-label text-[9px] mb-1">Search Ledger</label>
          <input
            type="text"
            placeholder="ID, Name, Email..."
            className="form-input text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label text-[9px] mb-1">Filter Style</label>
          <select
            className="form-input text-xs"
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
          >
            <option value="">All Styles</option>
            <option value="Brush Painting">Brush Painting</option>
            <option value="Block Printing">Block Printing</option>
            <option value="Brush + Block Printing">Dual Craft</option>
          </select>
        </div>
        <div>
          <label className="form-label text-[9px] mb-1">Filter Canvas</label>
          <select
            className="form-input text-xs"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            <option value="">All Colors</option>
            <option value="White">Ivory White</option>
            <option value="Black">Noir Black</option>
          </select>
        </div>
        <div>
          <label className="form-label text-[9px] mb-1">Filter Status</label>
          <select
            className="form-input text-xs"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md overflow-x-auto">
        {filteredBookings.length === 0 ? (
          <p className="text-xs text-soft-brown font-light text-center py-6">
            No bookings found matching filters.
          </p>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-mocha/15 text-[10px] tracking-wider text-mocha uppercase">
                <th className="py-3 px-4 font-light">Ref ID</th>
                <th className="py-3 px-4 font-light">Customer</th>
                <th className="py-3 px-4 font-light">Date &amp; Time</th>
                <th className="py-3 px-4 font-light">Style</th>
                <th className="py-3 px-4 font-light">Canvas</th>
                <th className="py-3 px-4 font-light">Seats</th>
                <th className="py-3 px-4 font-light">Paid</th>
                <th className="py-3 px-4 font-light">Status</th>
                <th className="py-3 px-4 font-light">Attendance</th>
                <th className="py-3 px-4 font-light" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha/5 font-light text-soft-brown">
              {filteredBookings.map((b) => {
                const dateStr = new Date(b.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <tr key={b.id} className="hover:bg-sand/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">{b.ref}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{b.customerName}</div>
                      <div className="text-[10px] text-soft-brown mt-0.5">{b.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{dateStr}</div>
                      <div className="text-[10px] text-soft-brown mt-0.5">{b.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">{b.style}</td>
                    <td className="py-3.5 px-4">{b.bagColor}</td>
                    <td className="py-3.5 px-4">{b.participants}</td>
                    <td className="py-3.5 px-4 text-white">₹{b.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider py-1 px-3 rounded-full ${
                          b.status === "CONFIRMED"
                            ? "bg-green-400/10 text-green-400 border border-green-400/30"
                            : "bg-red-400/10 text-red-400 border border-red-400/30"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAttendance(b.id, b.attendance)}
                        disabled={b.status === "CANCELLED"}
                        className={`text-[9px] uppercase tracking-wider py-1 px-3 rounded-full border transition-all duration-300 ${
                          b.attendance
                            ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                        } disabled:opacity-40`}
                      >
                        {b.attendance ? "Checked In" : "Absent"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4" style={{ textAlign: "right" }}>
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-red-400 hover:text-red-300 font-light"
                        >
                          Cancel/Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div id="toast" className="text-white text-xs font-light rounded-xl"></div>
    </div>
  );
}
