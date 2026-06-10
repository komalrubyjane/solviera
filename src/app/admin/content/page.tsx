import React from "react";
import ContentManagerClient from "./ContentManagerClient";

export const revalidate = 0;

export default async function AdminContentPage() {
  // ─── DEMO MODE ─── Static mock content for deployment demo
  const venue = {
    id: "venue-1",
    name: "Solviera Cafe & Atelier",
    address: "12, Via de' Tornabuoni, Florence, Italy",
    mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2881.0827618218153!2d11.250552776829777!3d43.771141344795325",
    parkingInfo: "Valet parking available at the Tornabuoni garage.",
    contactInfo: "+91 98765 43210 | atelier@solviera.com",
  };

  const faqs = [
    { id: "1", question: "What will I make in the workshop?", answer: "You'll create your own hand-crafted tote bag using brush painting or block printing techniques." },
    { id: "2", question: "Do I need prior experience?", answer: "Not at all! Our workshops are designed for all skill levels." },
    { id: "3", question: "How long is the workshop?", answer: "Each session is approximately 3 hours long." },
  ];

  const testimonials = [
    { id: "1", name: "Priya Sharma", review: "Absolutely magical experience!", rating: 5 },
    { id: "2", name: "Ananya Mehta", review: "Came with friends and we all had a blast!", rating: 5 },
    { id: "3", name: "Rohan Kapoor", review: "Gifted this to my wife and she loved it!", rating: 5 },
  ];

  return (
    <ContentManagerClient
      venue={venue}
      faqs={faqs}
      testimonials={testimonials}
    />
  );
}
