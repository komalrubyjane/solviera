import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ContentManagerClient from "./ContentManagerClient";

export const revalidate = 0;

export default async function AdminContentPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const dbVenue = await db.venue.findFirst();
  const venue = dbVenue
    ? {
        id: dbVenue.id,
        name: dbVenue.name,
        address: dbVenue.address,
        mapsEmbed: dbVenue.mapsEmbed,
        parkingInfo: dbVenue.parkingInfo,
        contactInfo: dbVenue.contactInfo,
      }
    : {
        id: "temp",
        name: "Solviera Cafe & Atelier",
        address: "12, Via de' Tornabuoni, Florence, Italy",
        mapsEmbed: "https://www.google.com/maps/embed?pb=...",
        parkingInfo: "Valet parking available.",
        contactInfo: "atelier@solviera.com",
      };

  const dbFaqs = await db.faq.findMany({
    orderBy: {
      order: "asc",
    },
  });
  const faqs = dbFaqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));

  const dbTestimonials = await db.testimonial.findMany();
  const testimonials = dbTestimonials.map((t) => ({
    id: t.id,
    name: t.name,
    review: t.review,
    rating: t.rating,
  }));

  return (
    <ContentManagerClient
      venue={venue}
      faqs={faqs}
      testimonials={testimonials}
    />
  );
}
