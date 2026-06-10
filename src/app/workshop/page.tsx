import React from "react";
import db from "@/lib/db";
import WorkshopClient from "./WorkshopClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function WorkshopPage() {
  const venue = await db.venue.findFirst();
  const faqs = await db.faq.findMany({ orderBy: { order: "asc" } });
  const testimonials = await db.testimonial.findMany();

  // Seeding defaults fallback if DB queries are empty
  const defaultVenue = venue || {
    name: "Solviera Cafe & Atelier",
    address: "12, Via de' Tornabuoni, Florence, Italy",
    mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2881.0827618218153!2d11.250552776829777!3d43.771141344795325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132a56a6442657ab%3A0x8cf25e79ff39e14a!2sVia%20de&#39;%20Tornabuoni%2C%2050123%20Firenze%20FI%2C%20Italy!5e0!3m2!1sen!2sin!4v1718029000000!5m2!1sen!2sin",
    parkingInfo: "Valet parking available at the Tornabuoni garage. Public parking within 200m walking distance.",
    contactInfo: "+39 055 123 4567 | atelier@solviera.com",
  };

  return (
    <WorkshopClient
      venue={defaultVenue}
      faqs={faqs}
      testimonials={testimonials}
    />
  );
}
