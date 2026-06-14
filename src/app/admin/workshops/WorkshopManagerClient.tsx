"use client";

import React, { useState } from "react";
import {
  createWorkshopDateAction,
  updateWorkshopDateAction,
  deleteWorkshopDateAction,
  updateWorkshopAction,
} from "@/app/actions/admin";

interface DateItem {
  id: string;
  date: string;
  timeSlot: string;
  capacity: number;
  booked: number;
  status: string;
}

interface WorkshopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  capacity: number;
  banner: string;
  status: string;
  featured: boolean;
  tags: string;
  dates: DateItem[];
}

interface Props {
  workshops: WorkshopItem[];
}

export default function WorkshopManagerClient({ workshops }: Props) {
  const [activeWorkshopIdx, setActiveWorkshopIdx] = useState(0);
  const workshop = workshops[activeWorkshopIdx];

  // Forms states
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("Morning (10:00 - 13:00)");
  const [newCapacity, setNewCapacity] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workshop Edit fields
  const [editPrice, setEditPrice] = useState(workshop?.price || 3500);
  const [editCapacity, setEditCapacity] = useState(workshop?.capacity || 12);
  const [editDesc, setEditDesc] = useState(workshop?.description || "");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !workshop) return;
    setIsSubmitting(true);

    const res = await createWorkshopDateAction({
      workshopId: workshop.id,
      date: newDate,
      timeSlot: newTimeSlot,
      capacity: newCapacity,
    });

    if (res.success) {
      showToast("Session date added successfully!");
      setNewDate("");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to add session date.");
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (dateId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await updateWorkshopDateAction(dateId, { status: nextStatus });
    if (res.success) {
      showToast(`Session status updated to ${nextStatus}.`);
      window.location.reload();
    } else {
      showToast(res.message || "Failed to update session status.");
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled session date?")) return;
    const res = await deleteWorkshopDateAction(dateId);
    if (res.success) {
      showToast("Session date deleted.");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to delete date.");
    }
  };

  const handleUpdateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop) return;
    setIsSubmitting(true);

    const res = await updateWorkshopAction(workshop.id, {
      price: Number(editPrice),
      capacity: Number(editCapacity),
      description: editDesc,
    });

    if (res.success) {
      showToast("Workshop parameters updated successfully!");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to update parameters.");
    }
    setIsSubmitting(false);
  };

  if (!workshop) {
    return (
      <div className="text-center text-xs font-light text-soft-brown py-12">
        No workshops found. Create a workshop in the seed script or admin interface.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-dark-mocha font-light">Workshops &amp; Schedules</h1>
        <p className="text-xs font-light text-soft-brown mt-1">
          Configure workshop pricing, capacity, and active session dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: WORKSHOP EDIT CARD */}
        <div className="lg:col-span-1 bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-fit">
          <h3 className="font-serif text-lg text-dark-mocha mb-6">Atelier Parameters</h3>
          <form onSubmit={handleUpdateWorkshop} className="space-y-5">
            <div>
              <label className="form-label text-[10px]">Workshop Title</label>
              <input
                type="text"
                className="form-input opacity-70 cursor-not-allowed"
                value={workshop.title}
                disabled
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Base Price (INR)</label>
              <input
                type="number"
                className="form-input"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Standard Seat Capacity</label>
              <input
                type="number"
                className="form-input"
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Experience Description</label>
              <textarea
                className="form-input text-xs"
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3.5 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102"
            >
              Save Parameters
            </button>
          </form>
        </div>

        {/* RIGHT: SCHEDULES MANAGER & ADD DATE FORM */}
        <div className="lg:col-span-2 space-y-8">
          {/* Add Date Form */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">Schedule New Session Date</h3>
            <form onSubmit={handleAddDate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="form-label text-[10px]" htmlFor="date">Session Date</label>
                <input
                  type="date"
                  id="date"
                  className="form-input"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label text-[10px]" htmlFor="time">Time Slot</label>
                <select
                  id="time"
                  className="form-input"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                >
                  <option value="Morning (10:00 - 13:00)">Morning (10:00 - 13:00)</option>
                  <option value="Afternoon (14:30 - 17:30)">Afternoon (14:30 - 17:30)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102"
              >
                Add Session
              </button>
            </form>
          </div>

          {/* Active Dates Ledger */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">Scheduled Sessions</h3>
            {workshop.dates.length === 0 ? (
              <p className="text-xs text-soft-brown font-light text-center py-6">
                No active session dates scheduled. Set one above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-mocha/15 text-[10px] tracking-wider text-mocha uppercase">
                      <th className="py-3 px-4 font-light">Calendar Date</th>
                      <th className="py-3 px-4 font-light">Time Slot</th>
                      <th className="py-3 px-4 font-light">Capacity</th>
                      <th className="py-3 px-4 font-light">Booked</th>
                      <th className="py-3 px-4 font-light">Status</th>
                      <th className="py-3 px-4 font-light" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mocha/5 font-light text-soft-brown">
                    {workshop.dates.map((d) => {
                      const dateStr = new Date(d.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      return (
                        <tr key={d.id} className="hover:bg-sand/20 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-dark-mocha">{dateStr}</td>
                          <td className="py-3.5 px-4">{d.timeSlot}</td>
                          <td className="py-3.5 px-4">{d.capacity}</td>
                          <td className="py-3.5 px-4">
                            <span className={d.booked >= d.capacity ? "text-red-400 font-medium" : "text-soft-brown"}>
                              {d.booked} / {d.capacity}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(d.id, d.status)}
                              className={`text-[9px] uppercase tracking-wider py-1 px-3 rounded-full border ${
                                d.status === "ACTIVE"
                                  ? "bg-green-400/10 text-green-400 border-green-400/30"
                                  : "bg-red-400/10 text-red-400 border-red-400/30"
                              }`}
                            >
                              {d.status}
                            </button>
                          </td>
                          <td className="py-3.5 px-4" style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteDate(d.id)}
                              className="text-red-400 hover:text-red-300 font-light mr-2"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      <div id="toast" className="text-dark-mocha text-xs font-light rounded-xl"></div>
    </div>
  );
}
