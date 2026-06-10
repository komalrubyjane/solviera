"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { loginAdminAction } from "@/app/actions/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setErrorMsg("");
    setIsSubmitting(true);
    
    const res = await loginAdminAction(data);
    if (res.success) {
      router.push("/admin");
    } else {
      setErrorMsg(res.message || "Invalid credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0814] px-6 py-12 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-gradient-to-br from-sand/80 to-cream/95 border border-mocha/25 rounded-3xl p-8 md:p-10 shadow-2xl relative">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-widest text-white uppercase mb-2">Solviera</h1>
          <p className="text-[10px] tracking-widest text-mocha uppercase font-light">
            Administrative Access
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-xl mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              {...register("email", { required: "Please enter your admin email" })}
              type="email"
              className="form-input"
              placeholder="admin@solviera.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              {...register("password", { required: "Please enter your admin password" })}
              type="password"
              className="form-input"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3.5 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102 hover:shadow-[0_8px_15px_rgba(244,114,182,0.4)]"
          >
            {isSubmitting ? "Authenticating..." : "Login to Dashboard →"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] tracking-widest text-soft-brown hover:text-white uppercase transition-colors">
            ← Return to Solviera Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
