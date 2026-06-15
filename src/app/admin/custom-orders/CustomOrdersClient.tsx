"use client";

import React, { useState } from "react";
import { updateCustomOrderStatusAction, deleteCustomOrderAction } from "@/app/actions/admin";

interface CustomOrder {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  eventType: string | null;
  quantity: string | null;
  color: string | null;
  method: string | null;
  date: string | null;
  description: string | null;
  budget: string | null;
  status: string;
  createdAt: Date;
}

interface Props {
  initialOrders: any[];
}

export default function CustomOrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState<CustomOrder[]>(
    initialOrders.map((o) => ({
      ...o,
      createdAt: new Date(o.createdAt),
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const showToast = (msg: string) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.innerText = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsSubmitting(true);
    const res = await updateCustomOrderStatusAction(id, newStatus);
    if (res.success) {
      showToast(`Custom order status updated to ${newStatus}.`);
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    } else {
      showToast("Failed to update custom order status.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom order request?")) return;
    setIsSubmitting(true);
    const res = await deleteCustomOrderAction(id);
    if (res.success) {
      showToast("Custom order request deleted.");
      setOrders(orders.filter((o) => o.id !== id));
    } else {
      showToast("Failed to delete request.");
    }
    setIsSubmitting(false);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      (o.company && o.company.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filterStatus ? o.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-dark-mocha font-light">Custom Order Requests</h1>
        <p className="text-xs font-light text-soft-brown mt-1">
          Review bulk order queries, brand collaborations, and bespoke canvas painting quotes submitted by clients.
        </p>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-sand/30 border border-mocha/10 rounded-2xl p-5 shadow-md">
        <div>
          <label className="form-label text-[9px] mb-1">Search Requests</label>
          <input
            type="text"
            placeholder="Name, Email, Company..."
            className="form-input text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label text-[9px] mb-1">Filter Status</label>
          <select
            className="form-input text-xs"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* LIST OR CARDS VIEW */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <p className="text-xs text-soft-brown font-light text-center py-12">
            No custom order queries found matching filters.
          </p>
        ) : (
          filteredOrders.map((o) => (
            <div key={o.id} className="bg-sand/20 border border-mocha/10 rounded-2xl p-6 shadow-sm space-y-4 hover:border-mocha/20 transition-all duration-300">
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-mocha/5 pb-4">
                <div>
                  <h3 className="font-serif text-lg text-dark-mocha">{o.name}</h3>
                  <p className="text-xs text-soft-brown font-light mt-1">
                    {o.company ? `Company: ${o.company} | ` : ""}
                    Email: <a href={`mailto:${o.email}`} className="text-indigo-600 font-medium">{o.email}</a>
                    {o.phone ? ` | Phone: ${o.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="form-input text-xs py-1.5 px-3 rounded-xl border border-mocha/15 bg-white w-36"
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <button
                    onClick={() => handleDelete(o.id)}
                    disabled={isSubmitting}
                    className="text-xs text-red-400 hover:text-red-300 font-medium border border-red-400/20 bg-red-400/5 py-1.5 px-4 rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* REQUEST METADATA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-light text-soft-brown bg-beige/10 p-4 rounded-xl">
                <div>
                  <span className="font-semibold text-dark-mocha block text-[10px] uppercase opacity-75">Event Type</span>
                  {o.eventType || "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-dark-mocha block text-[10px] uppercase opacity-75">Quantity</span>
                  {o.quantity || "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-dark-mocha block text-[10px] uppercase opacity-75">Color / Method</span>
                  {o.color && o.method ? `${o.color} (${o.method})` : o.color || o.method || "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-dark-mocha block text-[10px] uppercase opacity-75">Est. Date / Budget</span>
                  {o.date && o.budget ? `${o.date} / ${o.budget}` : o.date || o.budget || "N/A"}
                </div>
              </div>

              {/* DESCRIPTION / MESSAGE */}
              {o.description && (
                <div className="text-xs font-light text-soft-brown leading-relaxed bg-white/40 p-4 rounded-xl border border-mocha/5">
                  <span className="font-semibold text-dark-mocha block text-[10px] uppercase opacity-75 mb-1.5">Project Brief / Message</span>
                  {o.description}
                </div>
              )}

              <div className="text-[10px] text-right font-light text-warm-brown opacity-60">
                Submitted on {o.createdAt.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div id="toast" className="text-dark-mocha text-xs font-light rounded-xl"></div>
    </div>
  );
}
