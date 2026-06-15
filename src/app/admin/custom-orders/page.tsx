import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CustomOrdersClient from "./CustomOrdersClient";

export const revalidate = 0;

export default async function AdminCustomOrdersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const orders = await db.customOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return <CustomOrdersClient initialOrders={orders} />;
}
