"use client";

import React, { useState } from "react";
import {
  createWorkshopDateAction,
  updateWorkshopDateAction,
  deleteWorkshopDateAction,
  updateWorkshopAction,
  createCustomQuestionAction,
  updateCustomQuestionAction,
  deleteCustomQuestionAction,
} from "@/app/actions/admin";

interface DateItem {
  id: string;
  date: string;
  timeSlot: string;
  capacity: number;
  booked: number;
  status: string;
  price?: number | null;
}

interface CustomQuestionItem {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string;
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
  showPaintingStyle: boolean;
  showDietary: boolean;
  showSpecialRequests: boolean;
  showCanvasColor: boolean;
  showPhone: boolean;
  showCity: boolean;
  dates: DateItem[];
  questions?: CustomQuestionItem[];
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
  const [newCapacity, setNewCapacity] = useState(workshop?.capacity || 12);
  const [newPrice, setNewPrice] = useState<string>(""); // Custom session price
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline editing state for scheduled sessions
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState("");
  const [editingCapacity, setEditingCapacity] = useState(12);
  const [editingPrice, setEditingPrice] = useState<string>("");

  // Workshop Edit fields
  const [editPrice, setEditPrice] = useState(workshop?.price || 599);
  const [editCapacity, setEditCapacity] = useState(workshop?.capacity || 12);
  const [editDesc, setEditDesc] = useState(workshop?.description || "");
  const [toastMsg, setToastMsg] = useState("");

  // Custom Questions states
  const [newQuestionLabel, setNewQuestionLabel] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("TEXT");
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const [newQuestionOptions, setNewQuestionOptions] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionLabel, setEditingQuestionLabel] = useState("");
  const [editingQuestionType, setEditingQuestionType] = useState("TEXT");
  const [editingQuestionRequired, setEditingQuestionRequired] = useState(false);
  const [editingQuestionOptions, setEditingQuestionOptions] = useState("");

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionLabel.trim() || !workshop) return;
    setIsSubmitting(true);
    const res = await createCustomQuestionAction({
      workshopId: workshop.id,
      label: newQuestionLabel.trim(),
      type: newQuestionType,
      required: newQuestionRequired,
      options: newQuestionType === "SELECT" ? newQuestionOptions : undefined,
    });
    if (res.success) {
      showToast("Custom question added!");
      setNewQuestionLabel("");
      setNewQuestionOptions("");
      setNewQuestionRequired(false);
      window.location.reload();
    } else {
      showToast(res.message || "Failed to add question.");
    }
    setIsSubmitting(false);
  };

  const handleUpdateQuestion = async (id: string) => {
    if (!editingQuestionLabel.trim()) return;
    setIsSubmitting(true);
    const res = await updateCustomQuestionAction(id, {
      label: editingQuestionLabel.trim(),
      type: editingQuestionType,
      required: editingQuestionRequired,
      options: editingQuestionType === "SELECT" ? editingQuestionOptions : "",
    });
    if (res.success) {
      showToast("Question updated successfully!");
      setEditingQuestionId(null);
      window.location.reload();
    } else {
      showToast(res.message || "Failed to update question.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom question?")) return;
    setIsSubmitting(true);
    const res = await deleteCustomQuestionAction(id);
    if (res.success) {
      showToast("Question deleted.");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to delete question.");
    }
    setIsSubmitting(false);
  };

  const startEditingQuestion = (q: CustomQuestionItem) => {
    setEditingQuestionId(q.id);
    setEditingQuestionLabel(q.label);
    setEditingQuestionType(q.type);
    setEditingQuestionRequired(q.required);
    setEditingQuestionOptions(q.options || "");
  };

  const showToast = (msg: string) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  const startEditing = (d: DateItem) => {
    setEditingDateId(d.id);
    setEditingTimeSlot(d.timeSlot);
    setEditingCapacity(d.capacity);
    setEditingPrice(d.price !== undefined && d.price !== null ? String(d.price) : "");
  };

  const handleSaveEdit = async (dateId: string) => {
    setIsSubmitting(true);
    const res = await updateWorkshopDateAction(dateId, {
      timeSlot: editingTimeSlot,
      capacity: Number(editingCapacity),
      price: editingPrice.trim() === "" ? null : Number(editingPrice),
    });

    if (res.success) {
      showToast("Session details updated successfully!");
      setEditingDateId(null);
      window.location.reload();
    } else {
      showToast(res.message || "Failed to update session details.");
    }
    setIsSubmitting(false);
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
      price: newPrice.trim() === "" ? undefined : Number(newPrice),
    });

    if (res.success) {
      showToast("Session date added successfully!");
      setNewDate("");
      setNewPrice("");
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

  const handleToggleFormField = async (field: string, currentValue: boolean) => {
    if (!workshop) return;
    setIsSubmitting(true);
    const res = await updateWorkshopAction(workshop.id, {
      [field]: !currentValue,
    });
    if (res.success) {
      showToast("Booking form configurator updated!");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to update form layout.");
    }
    setIsSubmitting(false);
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
        
        {/* LEFT COLUMN: PARAMETERS & FIELD BUILDER */}
        <div className="lg:col-span-1 space-y-8">
          {/* Atelier Parameters */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-fit">
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

        {/* WORKSHOP BOOKING FORM BUILDER CARD */}
        <div className="lg:col-span-1 bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-fit">
          <h3 className="font-serif text-lg text-dark-mocha mb-3">Booking Form Configurator</h3>
          <p className="text-[11px] font-light text-soft-brown mb-6">
            Enable or disable checkout form inputs. Changes apply to the customer booking form in real-time.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Full Name Field</h4>
                <p className="text-[10px] text-soft-brown font-light">Mandatory personal detail</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-green-500 bg-green-500/10 py-1 px-3.5 rounded-full border border-green-500/20">
                Required
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Email Address Field</h4>
                <p className="text-[10px] text-soft-brown font-light">Razorpay & Ticket delivery</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-green-500 bg-green-500/10 py-1 px-3.5 rounded-full border border-green-500/20">
                Required
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Tote Bag Canvas Color</h4>
                <p className="text-[10px] text-soft-brown font-light">White or Black canvas option</p>
              </div>
              <button
                onClick={() => handleToggleFormField("showCanvasColor", workshop.showCanvasColor)}
                disabled={isSubmitting}
                className={`text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-full border transition-all duration-300 ${
                  workshop.showCanvasColor
                    ? "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                }`}
              >
                {workshop.showCanvasColor ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Choose Painting Style</h4>
                <p className="text-[10px] text-soft-brown font-light">Brush Painting style step</p>
              </div>
              <button
                onClick={() => handleToggleFormField("showPaintingStyle", workshop.showPaintingStyle)}
                disabled={isSubmitting}
                className={`text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-full border transition-all duration-300 ${
                  workshop.showPaintingStyle
                    ? "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                }`}
              >
                {workshop.showPaintingStyle ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Dietary Preferences</h4>
                <p className="text-[10px] text-soft-brown font-light">For studio refreshments</p>
              </div>
              <button
                onClick={() => handleToggleFormField("showDietary", workshop.showDietary)}
                disabled={isSubmitting}
                className={`text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-full border transition-all duration-300 ${
                  workshop.showDietary
                    ? "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                }`}
              >
                {workshop.showDietary ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Special Requests Box</h4>
                <p className="text-[10px] text-soft-brown font-light">Custom group requests notes</p>
              </div>
              <button
                onClick={() => handleToggleFormField("showSpecialRequests", workshop.showSpecialRequests)}
                disabled={isSubmitting}
                className={`text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-full border transition-all duration-300 ${
                  workshop.showSpecialRequests
                    ? "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                }`}
              >
                {workshop.showSpecialRequests ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">Phone Number Field</h4>
                <p className="text-[10px] text-soft-brown font-light">Customer contact phone</p>
              </div>
              <button
                onClick={() => handleToggleFormField("showPhone", workshop.showPhone)}
                disabled={isSubmitting}
                className={`text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-full border transition-all duration-300 ${
                  workshop.showPhone
                    ? "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                }`}
              >
                {workshop.showPhone ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-beige/15 rounded-xl border border-mocha/5">
              <div>
                <h4 className="text-xs font-semibold text-dark-mocha">City Field</h4>
                <p className="text-[10px] text-soft-brown font-light">Customer origin city</p>
              </div>
              <button
                onClick={() => handleToggleFormField("showCity", workshop.showCity)}
                disabled={isSubmitting}
                className={`text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-full border transition-all duration-300 ${
                  workshop.showCity
                    ? "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                }`}
              >
                {workshop.showCity ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        {/* CUSTOM QUESTIONS MANAGER */}
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-fit">
          <h3 className="font-serif text-lg text-dark-mocha mb-3">Custom Form Questions</h3>
          <p className="text-[11px] font-light text-soft-brown mb-6">
            Configure, edit, and add custom fields for the customer details checkout step.
          </p>

          {/* List existing custom questions */}
          <div className="space-y-4 mb-6">
            {workshop.questions && workshop.questions.length > 0 ? (
              workshop.questions.map((q) => {
                const isEditing = editingQuestionId === q.id;
                return (
                  <div key={q.id} className="p-4 bg-beige/15 rounded-xl border border-mocha/5 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="form-label text-[9px] mb-1">Question Label</label>
                          <input
                            type="text"
                            className="form-input text-xs"
                            value={editingQuestionLabel}
                            onChange={(e) => setEditingQuestionLabel(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="form-label text-[9px] mb-1">Field Type</label>
                            <select
                              className="form-input text-xs"
                              value={editingQuestionType}
                              onChange={(e) => setEditingQuestionType(e.target.value)}
                            >
                              <option value="TEXT">Short Answer Text</option>
                              <option value="SELECT">Dropdown Selection</option>
                            </select>
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 text-[10px] text-dark-mocha cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingQuestionRequired}
                                onChange={(e) => setEditingQuestionRequired(e.target.checked)}
                                className="rounded border-mocha/30 text-mocha focus:ring-mocha"
                              />
                              Required?
                            </label>
                          </div>
                        </div>
                        {editingQuestionType === "SELECT" && (
                          <div>
                            <label className="form-label text-[9px] mb-1">Options (comma-separated)</label>
                            <input
                              type="text"
                              className="form-input text-xs"
                              placeholder="e.g. Medium, Large, Extra Large"
                              value={editingQuestionOptions}
                              onChange={(e) => setEditingQuestionOptions(e.target.value)}
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-1 text-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(q.id)}
                            className="bg-mocha text-cream px-3 py-1.5 rounded-lg font-medium hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="bg-sand/50 text-soft-brown px-3 py-1.5 rounded-lg border border-mocha/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-dark-mocha">{q.label}</h4>
                            {q.required && (
                              <span className="text-[8px] tracking-wider uppercase bg-amber-400/10 text-amber-500 border border-amber-400/20 px-1.5 py-0.5 rounded-md">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-warm-brown mt-1">
                            Type: {q.type} {q.type === "SELECT" && `(${q.options})`}
                          </p>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => startEditingQuestion(q)}
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] text-center py-4 text-soft-brown font-light">
                No custom questions configured yet. Add one below!
              </p>
            )}
          </div>

          {/* Add custom question form */}
          <form onSubmit={handleAddQuestion} className="border-t border-mocha/10 pt-5 space-y-4">
            <h4 className="text-xs font-semibold text-dark-mocha uppercase tracking-wider">Add Custom Question</h4>
            <div>
              <label className="form-label text-[10px]" htmlFor="q-label">Question Label</label>
              <input
                type="text"
                id="q-label"
                className="form-input text-xs"
                placeholder="e.g. What is your Instagram handle?"
                value={newQuestionLabel}
                onChange={(e) => setNewQuestionLabel(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label text-[10px]" htmlFor="q-type">Input Type</label>
                <select
                  id="q-type"
                  className="form-input text-xs"
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                >
                  <option value="TEXT">Short Answer Text</option>
                  <option value="SELECT">Dropdown Options</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-[10px] text-dark-mocha cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="rounded border-mocha/30 text-mocha focus:ring-mocha"
                  />
                  Required Field
                </label>
              </div>
            </div>
            {newQuestionType === "SELECT" && (
              <div>
                <label className="form-label text-[10px]" htmlFor="q-options">Select Choices (comma separated)</label>
                <input
                  type="text"
                  id="q-options"
                  className="form-input text-xs"
                  placeholder="e.g. Yes, No, Maybe"
                  value={newQuestionOptions}
                  onChange={(e) => setNewQuestionOptions(e.target.value)}
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-mocha text-cream font-bold py-2.5 px-4 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102"
            >
              Add Question
            </button>
          </form>
        </div>
      </div>

        {/* RIGHT: SCHEDULES MANAGER & ADD DATE FORM */}
        <div className="lg:col-span-2 space-y-8">
          {/* Add Date Form */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">Schedule New Session Date</h3>
            <form onSubmit={handleAddDate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
              <div>
                <label className="form-label text-[10px]" htmlFor="time">Time Slot</label>
                <input
                  type="text"
                  id="time"
                  className="form-input"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  list="time-slots"
                  placeholder="e.g. Morning (10:00 - 13:00)"
                  required
                />
                <datalist id="time-slots">
                  <option value="Morning (10:00 - 13:00)" />
                  <option value="Afternoon (14:30 - 17:30)" />
                </datalist>
              </div>
              <div>
                <label className="form-label text-[10px]" htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  className="form-input"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="form-label text-[10px]" htmlFor="sessionPrice">Session Cost (INR)</label>
                <input
                  type="number"
                  id="sessionPrice"
                  className="form-input"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder={`Default (₹${workshop.price})`}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102 w-full text-center"
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
                      <th className="py-3 px-4 font-light">Cost</th>
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
                      
                      const isEditing = editingDateId === d.id;

                      if (isEditing) {
                        return (
                          <tr key={d.id} className="bg-sand/10 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-dark-mocha">{dateStr}</td>
                            <td className="py-3.5 px-4">
                              <input
                                type="text"
                                className="form-input text-xs py-1 px-2 w-full"
                                value={editingTimeSlot}
                                onChange={(e) => setEditingTimeSlot(e.target.value)}
                                required
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <input
                                type="number"
                                className="form-input text-xs py-1 px-2 w-20"
                                value={editingCapacity}
                                onChange={(e) => setEditingCapacity(Number(e.target.value))}
                                min={1}
                                required
                              />
                            </td>
                            <td className="py-3.5 px-4 text-soft-brown">
                              {d.booked} / {editingCapacity}
                            </td>
                            <td className="py-3.5 px-4">
                              <input
                                type="number"
                                className="form-input text-xs py-1 px-2 w-24"
                                value={editingPrice}
                                onChange={(e) => setEditingPrice(e.target.value)}
                                placeholder={`Default (₹${workshop.price})`}
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[9px] uppercase tracking-wider py-1 px-3 rounded-full border bg-gray-400/10 text-gray-400 border-gray-400/30">
                                {d.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              <button
                                onClick={() => handleSaveEdit(d.id)}
                                disabled={isSubmitting}
                                className="text-green-600 hover:text-green-500 font-medium mr-3"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingDateId(null)}
                                className="text-soft-brown hover:text-dark-mocha font-light"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      }

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
                          <td className="py-3.5 px-4 text-dark-mocha font-medium">
                            {d.price !== undefined && d.price !== null ? `₹${d.price}` : `₹${workshop.price} (default)`}
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
                          <td className="py-3.5 px-4" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <button
                              onClick={() => startEditing(d)}
                              className="text-indigo-600 hover:text-indigo-500 font-light mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDate(d.id)}
                              className="text-red-400 hover:text-red-300 font-light"
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
