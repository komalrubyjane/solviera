import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import WorkshopManagerClient from "./WorkshopManagerClient";

export const revalidate = 0;

export default async function AdminWorkshopsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  try {
    const dbWorkshops = await db.workshop.findMany({
      include: {
        dates: {
          orderBy: {
            date: "asc",
          },
        },
        questions: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const workshops = dbWorkshops.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      price: w.price,
      capacity: w.capacity,
      banner: w.banner,
      status: w.status,
      featured: w.featured,
      tags: w.tags || "",
      showPaintingStyle: w.showPaintingStyle,
      showDietary: w.showDietary,
      showSpecialRequests: w.showSpecialRequests,
      showCanvasColor: w.showCanvasColor,
      showPhone: w.showPhone,
      showCity: w.showCity,
      questions: w.questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        options: q.options || "",
      })),
      dates: w.dates.map((d) => ({
        id: d.id,
        date: d.date.toISOString(),
        timeSlot: d.timeSlot,
        capacity: d.capacity,
        booked: d.booked,
        status: d.status,
        price: d.price,
      })),
    }));

    return <WorkshopManagerClient workshops={workshops} />;
  } catch (error: any) {
    console.error("ADMIN WORKSHOPS PAGE RENDER ERROR:", error);
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-800 max-w-4xl mx-auto my-12">
        <h2 className="font-serif text-xl text-red-700 font-bold mb-2">Workshops Manager Load Error</h2>
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
