import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ProductsManagerClient from "./ProductsManagerClient";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return <ProductsManagerClient initialProducts={products} />;
}
