"use client";

import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────
   FloralDecor — real photorealistic flowers, petals & leaves
   Uses the user's uploaded transparent background PNG assets.
   Provides clean, native transparency with no blend-mode issues.
───────────────────────────────────────────────────────────────── */

type FlowerType = "peony" | "rose" | "lily" | "lotus" | "baby";

// ── Flower Render Helper using User's Transparent Images ──────────
function renderFlower(type: FlowerType, size: number, opacity: number) {
  let src = "";
  switch (type) {
    case "peony":
      src = "/assets/flowers/trans_chatgpt_1.png";
      break;
    case "rose":
      src = "/assets/flowers/trans_chatgpt_2.png";
      break;
    case "lily":
      src = "/assets/flowers/trans_flower.png";
      break;
    case "lotus":
      src = "/assets/flowers/trans_chatgpt_1.png"; // Reusing high-quality peony/lotus look
      break;
    case "baby":
      src = "/assets/flowers/trans_baby_breath.png";
      break;
  }

  return (
    <img
      src={src}
      alt=""
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        opacity: opacity * 0.85, // Native transparency looks clean, can be slightly more visible
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

// ── Petal Render Helper (using trans_chatgpt_3.png) ──────────────
function Petal({ size, opacity }: { size: number; opacity: number }) {
  return (
    <img
      src="/assets/flowers/trans_chatgpt_3.png"
      alt=""
      style={{
        width: size * 1.2,
        height: size * 1.8,
        objectFit: "contain",
        opacity: opacity * 0.85,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

// ── Leaf Render Helper (using trans_chatgpt_4.png) ───────────────
function Leaf({ size, opacity }: { size: number; opacity: number }) {
  return (
    <img
      src="/assets/flowers/trans_chatgpt_4.png"
      alt=""
      style={{
        width: size * 1.5,
        height: size,
        objectFit: "contain",
        opacity: opacity * 0.80,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

// ── Placement data (balanced left and right) ──────────────────────
const FLOWERS: {
  type: FlowerType; top: string; left?: string; right?: string;
  size: number; opacity: number; rotate: number; delay: string; anim: string;
}[] = [
  // LEFT edge
  { type: "peony", top: "4vh",  left: "0%",  size: 115, opacity: 0.65, rotate: -18, delay: "0s",   anim: "fl-float-a" },
  { type: "lily",  top: "18vh", left: "0%",  size: 90,  opacity: 0.60, rotate: 12,  delay: "1.2s", anim: "fl-float-b" },
  { type: "lotus", top: "34vh", left: "0%",  size: 100, opacity: 0.62, rotate: -8,  delay: "0.5s", anim: "fl-float-c" },
  { type: "baby",  top: "52vh", left: "0%",  size: 85,  opacity: 0.55, rotate: 22,  delay: "1.8s", anim: "fl-float-a" },
  { type: "rose",  top: "68vh", left: "0%",  size: 95,  opacity: 0.62, rotate: -14, delay: "0.8s", anim: "fl-float-b" },
  { type: "peony", top: "85vh", left: "0%",  size: 85,  opacity: 0.60, rotate: 28,  delay: "0.3s", anim: "fl-float-c" },
  // RIGHT edge
  { type: "lotus", top: "6vh",  right: "0%", size: 110, opacity: 0.62, rotate: 20,  delay: "0.6s", anim: "fl-float-b" },
  { type: "rose",  top: "22vh", right: "0%", size: 90,  opacity: 0.60, rotate: -25, delay: "1.4s", anim: "fl-float-c" },
  { type: "peony", top: "38vh", right: "0%", size: 105, opacity: 0.65, rotate: 10,  delay: "0.9s", anim: "fl-float-a" },
  { type: "baby",  top: "55vh", right: "0%", size: 85,  opacity: 0.58, rotate: -30, delay: "0.2s", anim: "fl-float-b" },
  { type: "lily",  top: "72vh", right: "0%", size: 100, opacity: 0.62, rotate: 18,  delay: "1.6s", anim: "fl-float-c" },
  { type: "lotus", top: "88vh", right: "0%", size: 90,  opacity: 0.60, rotate: -12, delay: "0.7s", anim: "fl-float-a" },
  // Centre-left accents (smaller)
  { type: "baby",  top: "12vh", left: "22%", size: 65,  opacity: 0.45, rotate: 35,  delay: "1.0s", anim: "fl-float-c" },
  { type: "rose",  top: "44vh", left: "18%", size: 70,  opacity: 0.48, rotate: -20, delay: "0.4s", anim: "fl-float-a" },
  { type: "lily",  top: "76vh", left: "20%", size: 60,  opacity: 0.42, rotate: 15,  delay: "1.3s", anim: "fl-float-b" },
  // Centre-right accents (smaller)
  { type: "lotus", top: "8vh",  left: "75%", size: 68,  opacity: 0.45, rotate: -22, delay: "0.7s", anim: "fl-float-b" },
  { type: "peony", top: "48vh", left: "72%", size: 72,  opacity: 0.48, rotate: 30,  delay: "1.5s", anim: "fl-float-c" },
  { type: "baby",  top: "80vh", left: "74%", size: 60,  opacity: 0.42, rotate: -10, delay: "0.1s", anim: "fl-float-a" },
];

const PETALS = [
  { top: "9vh",  left: "8%",  s: 22, opacity: 0.60, r: 30,  d: "0s"   },
  { top: "9vh",  left: "88%", s: 20, opacity: 0.55, r: -40, d: "0.9s" },
  { top: "16vh", left: "35%", s: 18, opacity: 0.50, r: 55,  d: "0.4s" },
  { top: "16vh", left: "62%", s: 22, opacity: 0.55, r: -15, d: "1.3s" },
  { top: "27vh", left: "12%", s: 20, opacity: 0.50, r: 70,  d: "0.6s" },
  { top: "27vh", left: "82%", s: 26, opacity: 0.60, r: -60, d: "1.7s" },
  { top: "38vh", left: "45%", s: 16, opacity: 0.45, r: 35,  d: "1.0s" },
  { top: "46vh", left: "28%", s: 24, opacity: 0.55, r: -25, d: "0.2s" },
  { top: "46vh", left: "70%", s: 18, opacity: 0.50, r: 80,  d: "1.4s" },
  { top: "58vh", left: "15%", s: 22, opacity: 0.55, r: -50, d: "0.7s" },
  { top: "58vh", left: "85%", s: 20, opacity: 0.50, r: 45,  d: "1.1s" },
  { top: "67vh", left: "52%", s: 28, opacity: 0.60, r: -30, d: "0.3s" },
  { top: "78vh", left: "32%", s: 16, opacity: 0.45, r: 65,  d: "1.8s" },
  { top: "78vh", left: "70%", s: 22, opacity: 0.55, r: -10, d: "0.8s" },
  { top: "90vh", left: "48%", s: 20, opacity: 0.50, r: 40,  d: "1.2s" },
  { top: "90vh", left: "18%", s: 18, opacity: 0.45, r: -20, d: "0.5s" },
  { top: "90vh", left: "80%", s: 24, opacity: 0.55, r: 25,  d: "1.6s" },
] as const;

const LEAVES = [
  { top: "7vh",  left: "42%", s: 34, opacity: 0.50, r: -20, d: "0s"   },
  { top: "7vh",  left: "55%", s: 30, opacity: 0.45, r: 35,  d: "0.8s" },
  { top: "20vh", left: "10%", s: 38, opacity: 0.55, r: -55, d: "1.5s" },
  { top: "20vh", left: "88%", s: 32, opacity: 0.48, r: 15,  d: "0.3s" },
  { top: "33vh", left: "32%", s: 36, opacity: 0.52, r: -40, d: "1.1s" },
  { top: "33vh", left: "65%", s: 40, opacity: 0.55, r: 28,  d: "0.6s" },
  { top: "50vh", left: "5%",  s: 34, opacity: 0.50, r: 50,  d: "1.9s" },
  { top: "50vh", left: "92%", s: 36, opacity: 0.52, r: -65, d: "1.0s" },
  { top: "63vh", left: "48%", s: 38, opacity: 0.55, r: 20,  d: "0.4s" },
  { top: "75vh", left: "22%", s: 32, opacity: 0.48, r: -15, d: "1.3s" },
  { top: "75vh", left: "75%", s: 36, opacity: 0.52, r: 42,  d: "0.2s" },
  { top: "88vh", left: "38%", s: 30, opacity: 0.45, r: -30, d: "1.6s" },
  { top: "88vh", left: "60%", s: 34, opacity: 0.48, r: 18,  d: "0.9s" },
] as const;

// ── Main Component ─────────────────────────────────────────────
export default function FloralDecor() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* ── Generated/Uploaded Flowers ── */}
      {FLOWERS.map((f, i) => (
        <div
          key={`fl-${i}`}
          className={f.anim}
          style={{
            position: "absolute",
            top: f.top,
            ...(f.right !== undefined ? { right: f.right } : { left: f.left }),
            animationDelay: f.delay,
            transform: `rotate(${f.rotate}deg)`,
            pointerEvents: "none",
          }}
        >
          {renderFlower(f.type, f.size, f.opacity)}
        </div>
      ))}

      {/* ── Generated/Uploaded Petals ── */}
      {PETALS.map((p, i) => (
        <div
          key={`pt-${i}`}
          className="fl-drift-a"
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            transform: `rotate(${p.r}deg)`,
            animationDelay: p.d,
            pointerEvents: "none",
          }}
        >
          <Petal size={p.s} opacity={p.opacity} />
        </div>
      ))}

      {/* ── Generated/Uploaded Leaves ── */}
      {LEAVES.map((l, i) => (
        <div
          key={`lf-${i}`}
          className="fl-sway-a"
          style={{
            position: "absolute",
            top: l.top,
            left: l.left,
            transform: `rotate(${l.r}deg)`,
            animationDelay: l.d,
            pointerEvents: "none",
          }}
        >
          <Leaf size={l.s} opacity={l.opacity} />
        </div>
      ))}
    </div>
  );
}
