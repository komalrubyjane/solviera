import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCheckInMetricsAction } from "@/app/actions/admin";
import CheckInClient from "./CheckInClient";

export const revalidate = 0;

export default async function AdminCheckInPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const res = await getCheckInMetricsAction();
  
  const initialMetrics = res.success && res.metrics ? res.metrics : {
    total: 0,
    checkedIn: 0,
    percent: 0,
    recent: [],
  };

  return <CheckInClient initialMetrics={initialMetrics} />;
}
