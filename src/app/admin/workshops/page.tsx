import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import WorkshopManagerClient from "./WorkshopManagerClient";

export const revalidate = 0;

export default async function AdminWorkshopsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // ─── DEMO MODE ─── Static mock workshops for deployment demo
  const now = new Date();
  const workshops = [
    {
      id: "workshop-1",
      title: "Solviera Craft Workshop",
      description: "Create your own premium hand-crafted tote bag using brush painting or block printing techniques.",
      price: 3500,
      capacity: 12,
      banner: "/tote_kitty.png",
      status: "PUBLISHED",
      featured: true,
      tags: "craft,tote,painting",
      dates: [
        {
          id: "date-1",
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0).toISOString(),
          timeSlot: "10:00 AM – 1:00 PM",
          capacity: 12,
          booked: 4,
          status: "ACTIVE",
        },
        {
          id: "date-2",
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 14, 0).toISOString(),
          timeSlot: "2:00 PM – 5:00 PM",
          capacity: 12,
          booked: 8,
          status: "ACTIVE",
        },
        {
          id: "date-3",
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 10, 0).toISOString(),
          timeSlot: "10:00 AM – 1:00 PM",
          capacity: 12,
          booked: 2,
          status: "ACTIVE",
        },
      ],
    },
  ];

  return <WorkshopManagerClient workshops={workshops} />;
}
