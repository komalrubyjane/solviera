import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import db from "@/lib/db";
import ContentManagerClient from "./ContentManagerClient";

export const revalidate = 0;

export default async function AdminContentPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const venue = await db.venue.findFirst();
  const faqs = await db.faq.findMany({ orderBy: { order: "asc" } });
  const testimonials = await db.testimonial.findMany();

  const defaultVenue = venue || {
    id: "",
    name: "Solviera Cafe & Atelier",
    address: "12, Via de' Tornabuoni, Florence, Italy",
    mapsEmbed: "",
    parkingInfo: "",
    contactInfo: "",
  };

  return (
    <ContentManagerClient
      venue={defaultVenue}
      faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
      testimonials={testimonials.map((t) => ({ id: t.id, name: t.name, review: t.review, rating: t.rating }))}
    />
  );
}
