"use client";

import React, { useState } from "react";
import {
  updateVenueAction,
  createFaqAction,
  deleteFaqAction,
  createTestimonialAction,
  deleteTestimonialAction,
} from "@/app/actions/admin";

interface VenueItem {
  id?: string;
  name: string;
  address: string;
  mapsEmbed: string;
  parkingInfo: string;
  contactInfo: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  review: string;
  rating: number;
}

interface Props {
  venue: VenueItem;
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
}

export default function ContentManagerClient({ venue, faqs, testimonials }: Props) {
  // Venue States
  const [venueName, setVenueName] = useState(venue.name);
  const [venueAddress, setVenueAddress] = useState(venue.address);
  const [venueEmbed, setVenueEmbed] = useState(venue.mapsEmbed);
  const [venueParking, setVenueParking] = useState(venue.parkingInfo);
  const [venueContact, setVenueContact] = useState(venue.contactInfo);

  // FAQ States
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // Testimonial States
  const [testName, setTestName] = useState("");
  const [testReview, setTestReview] = useState("");
  const [testRating, setTestRating] = useState(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateVenueAction({
      name: venueName,
      address: venueAddress,
      mapsEmbed: venueEmbed,
      parkingInfo: venueParking,
      contactInfo: venueContact,
    });
    if (res.success) {
      showToast("Venue details updated successfully!");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to update venue.");
    }
    setIsSubmitting(false);
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) return;
    setIsSubmitting(true);

    const res = await createFaqAction(faqQuestion, faqAnswer);
    if (res.success) {
      showToast("FAQ entry created successfully!");
      setFaqQuestion("");
      setFaqAnswer("");
      window.location.reload();
    } else {
      showToast(res.message || "Failed to create FAQ.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ entry?")) return;
    const res = await deleteFaqAction(id);
    if (res.success) {
      showToast("FAQ entry deleted.");
      window.location.reload();
    } else {
      showToast("Failed to delete FAQ.");
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testReview) return;
    setIsSubmitting(true);

    const res = await createTestimonialAction(testName, testReview, testRating);
    if (res.success) {
      showToast("Testimonial review added successfully!");
      setTestName("");
      setTestReview("");
      setTestRating(5);
      window.location.reload();
    } else {
      showToast(res.message || "Failed to add testimonial.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const res = await deleteTestimonialAction(id);
    if (res.success) {
      showToast("Testimonial deleted.");
      window.location.reload();
    } else {
      showToast("Failed to delete testimonial.");
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-dark-mocha font-light">Content Management System</h1>
        <p className="text-xs font-light text-soft-brown mt-1">
          Customize website details, venue location maps, FAQs, and reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUMN 1: VENUE DETAILS CMS */}
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-fit">
          <h3 className="font-serif text-lg text-dark-mocha mb-6">Studio Venue Details</h3>
          <form onSubmit={handleUpdateVenue} className="space-y-5">
            <div>
              <label className="form-label text-[10px]">Venue Name</label>
              <input
                type="text"
                className="form-input"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Atelier Address</label>
              <input
                type="text"
                className="form-input"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Google Maps Embed URL</label>
              <input
                type="text"
                className="form-input text-xs"
                value={venueEmbed}
                onChange={(e) => setVenueEmbed(e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Parking Details</label>
              <textarea
                className="form-input text-xs"
                rows={2}
                value={venueParking}
                onChange={(e) => setVenueParking(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]">Contact Information</label>
              <input
                type="text"
                className="form-input"
                value={venueContact}
                onChange={(e) => setVenueContact(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3.5 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102"
            >
              Update Venue Info
            </button>
          </form>
        </div>

        {/* COLUMN 2: FAQ AND TESTIMONIAL CMS */}
        <div className="space-y-8">
          
          {/* FAQ ADD & LIST */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">FAQ Management</h3>
            <form onSubmit={handleAddFaq} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="FAQ Question..."
                  className="form-input text-xs"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="FAQ Answer..."
                  className="form-input text-xs"
                  rows={2}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-2.5 px-5 rounded-xl uppercase text-[10px] tracking-wider transition-all duration-300 hover:scale-102"
              >
                Add FAQ Entry
              </button>
            </form>

            {/* List */}
            <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="flex justify-between items-start bg-sand/40 border border-mocha/5 p-4 rounded-xl text-xs">
                  <div className="space-y-1 max-w-[80%]">
                    <h4 className="font-serif text-dark-mocha">{faq.question}</h4>
                    <p className="font-light text-soft-brown leading-relaxed">{faq.answer}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIALS ADD & LIST */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">Review Testimonials</h3>
            <form onSubmit={handleAddTestimonial} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name..."
                  className="form-input text-xs"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                />
                <select
                  className="form-input text-xs"
                  value={testRating}
                  onChange={(e) => setTestRating(Number(e.target.value))}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                </select>
              </div>
              <div>
                <textarea
                  placeholder="Review review text..."
                  className="form-input text-xs"
                  rows={2}
                  value={testReview}
                  onChange={(e) => setTestReview(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-2.5 px-5 rounded-xl uppercase text-[10px] tracking-wider transition-all duration-300 hover:scale-102"
              >
                Add Testimonial
              </button>
            </form>

            {/* List */}
            <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2">
              {testimonials.map((t) => (
                <div key={t.id} className="flex justify-between items-start bg-sand/40 border border-mocha/5 p-4 rounded-xl text-xs">
                  <div className="space-y-1 max-w-[80%]">
                    <div className="text-yellow-500 mb-1">{"★".repeat(t.rating)}</div>
                    <p className="font-light text-soft-brown leading-relaxed">"{t.review}"</p>
                    <h4 className="font-serif text-dark-mocha">{t.name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteTestimonial(t.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div id="toast" className="text-dark-mocha text-xs font-light rounded-xl"></div>
    </div>
  );
}
