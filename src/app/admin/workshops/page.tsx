import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import db from "@/lib/db";
import WorkshopManagerClient from "./WorkshopManagerClient";

export const revalidate = 0;

export default async function AdminWorkshopsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const workshops = await db.workshop.findMany({
    include: {
      dates: {
        orderBy: { date: "asc" },
      },
    },
  });

  return (
    <WorkshopManagerClient
      workshops={workshops.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        price: w.price,
        capacity: w.capacity,
        banner: w.banner,
        status: w.status,
        featured: w.featured,
        tags: w.tags || "",
        dates: w.dates.map((d) => ({
          id: d.id,
          date: d.date.toISOString(),
          timeSlot: d.timeSlot,
          capacity: d.capacity,
          booked: d.booked,
          status: d.status,
        })),
      }))}
    />
  );
}
