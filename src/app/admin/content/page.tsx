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

  try {
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
  } catch (error: any) {
    console.error("ADMIN CONTENT PAGE RENDER ERROR:", error);
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-800 max-w-4xl mx-auto my-12">
        <h2 className="font-serif text-xl text-red-700 font-bold mb-2">Content Manager Load Error</h2>
        <p className="text-xs text-[#706353] mb-4">
          An error occurred in the Server Component render process. The system failed to query the database or resolve dependencies:
        </p>
        <pre className="text-xs font-mono bg-white/60 p-4 rounded-xl border border-red-200 overflow-x-auto whitespace-pre-wrap text-red-900 leading-relaxed">
          {error?.stack || error?.message || String(error)}
        </pre>
      </div>
    );
  }
}
