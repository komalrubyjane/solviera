"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/*
 * SolveriaIntro — Mobile-first, performance-optimised intro screen.
 *
 * Architecture decisions for mobile perf:
 * ─────────────────────────────────────────────────────────────────
 * • NO canvas pixel-loops  — envelope PNGs are pre-processed server-side
 * • NO GSAP for petals      — CSS @keyframes run on the compositor thread (GPU), not JS thread
 * • GSAP only for envelope  — 2 tiny tweens, no real cost
 * • Petal count: 18 mobile / 30 desktop — well within 60fps budget
 * • Auto-skip at 6s         — hard safety net so mobile never gets stuck
 * • Tap anywhere to open    — large touch target, no tiny button misses
 * • Responsive sizes        — envelope adapts to small screens
 */

// ─── Transparent flower assets ───────────────────────────────────
const FLOWER_SRCS = [
  "/assets/flowers/trans_chatgpt_1.png",   // peony
  "/assets/flowers/trans_chatgpt_2.png",   // rose
  "/assets/flowers/trans_flower.png",      // lily
  "/assets/flowers/trans_baby_breath.png", // baby breath
  "/assets/flowers/trans_chatgpt_3.png",   // petal
  "/assets/flowers/trans_chatgpt_4.png",   // leaf
];

// ─── Static petal/flower positions ───────────────────────────────
interface PetalConfig {
  src: string;
  size: number;       // px
  left: string;       // CSS left
  top: string;        // CSS top
  rotate: number;     // initial rotation degrees
  animDuration: string;
  animDelay: string;
  animName: string;   // CSS keyframe name
}

function buildPetals(count: number): PetalConfig[] {
  const anims = ["petal-drift-a", "petal-drift-b", "petal-drift-c", "petal-sway"];
  const petals: PetalConfig[] = [];
  for (let i = 0; i < count; i++) {
    petals.push({
      src: FLOWER_SRCS[i % FLOWER_SRCS.length],
      size: 48 + (i % 5) * 14,
      left: `${5 + (i * 37) % 90}%`,
      top: `${5 + (i * 23) % 88}%`,
      rotate: (i * 47) % 360,
      animDuration: `${4 + (i % 4)}s`,
      animDelay: `${(i * 0.18) % 2}s`,
      animName: anims[i % anims.length],
    });
  }
  return petals;
}

// ─── Burst petals (after envelope opens) ─────────────────────────
interface BurstPetal {
  id: number;
  src: string;
  angle: number;  // 0-360
  dist: number;   // vw distance
  size: number;
  delay: string;
  duration: string;
  rotate: number;
}

function buildBurst(count: number): BurstPetal[] {
  const burst: BurstPetal[] = [];
  for (let i = 0; i < count; i++) {
    burst.push({
      id: i,
      src: FLOWER_SRCS[i % FLOWER_SRCS.length],
      angle: (i / count) * 360 + Math.random() * 20,
      dist: 30 + Math.random() * 40,
      size: 60 + Math.random() * 80,
      delay: `${(i * 0.04).toFixed(2)}s`,
      duration: `${0.8 + Math.random() * 0.6}s`,
      rotate: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
    });
  }
  return burst;
}

// ─── Component ───────────────────────────────────────────────────
export default function SolveriaIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "burst" | "fading">("idle");
  const [isMobile, setIsMobile] = useState(false);
  const autoSkipRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile once on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Auto-skip safety net: if user doesn't tap within 6s, skip automatically
  useEffect(() => {
    autoSkipRef.current = setTimeout(() => {
      handleSkip();
    }, 6000);
    return () => {
      if (autoSkipRef.current) clearTimeout(autoSkipRef.current);
    };
  }, []);

  const handleSkip = useCallback(() => {
    if (autoSkipRef.current) clearTimeout(autoSkipRef.current);
    setPhase("fading");
    setTimeout(onComplete, 800);
  }, [onComplete]);

  const handleOpen = useCallback(() => {
    if (phase !== "idle") return;
    if (autoSkipRef.current) clearTimeout(autoSkipRef.current);
    setPhase("opening");
    // After envelope opens, trigger burst then fade
    setTimeout(() => setPhase("burst"), 600);
    setTimeout(() => setPhase("fading"), 3200);
    setTimeout(onComplete, 4000);
  }, [phase, onComplete]);

  const petalCount = isMobile ? 16 : 28;
  const burstCount = isMobile ? 16 : 28;

  const ambientPetals = useMemo(() => buildPetals(petalCount), [petalCount]);
  const burstPetals = useMemo(() => buildBurst(burstCount), [burstCount]);

  const envelopeSize = isMobile ? 200 : 280;

  return (
    <>
      {/* ── Inline CSS animations ─────────────────────────────────
          All on the compositor thread — zero JS involvement */}
      <style>{`
        @keyframes petal-drift-a {
          0%   { transform: translateY(0px) rotate(0deg); }
          33%  { transform: translateY(-12px) translateX(6px) rotate(8deg); }
          66%  { transform: translateY(-6px) translateX(-4px) rotate(-4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes petal-drift-b {
          0%   { transform: translateY(0px) rotate(0deg); }
          40%  { transform: translateY(-18px) translateX(-8px) rotate(-10deg); }
          80%  { transform: translateY(-8px) translateX(5px) rotate(6deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes petal-drift-c {
          0%   { transform: translateY(0px) scale(1) rotate(0deg); }
          50%  { transform: translateY(-10px) scale(1.04) rotate(12deg); }
          100% { transform: translateY(0px) scale(1) rotate(0deg); }
        }
        @keyframes petal-sway {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(8deg); }
          75%  { transform: rotate(-6deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes envelope-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes burst-fly {
          0%   { opacity: 0; transform: translate(var(--bx), var(--by)) scale(0.1) rotate(0deg); }
          30%  { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(var(--bx) * 2.5), calc(var(--by) * 2.5)) scale(1) rotate(var(--br)); }
        }
        @keyframes intro-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gold-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes envelope-open-bounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.12); }
          60%  { transform: scale(0.94); }
          100% { transform: scale(1) translateY(-30px); opacity: 0; }
        }
      `}</style>

      {/* ── Root layer ─────────────────────────────────────────── */}
      <div
        ref={containerRef}
        onClick={phase === "idle" ? handleOpen : undefined}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "linear-gradient(160deg, #FAF6EE 0%, #F0E6D3 60%, #EAD9C0 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          opacity: phase === "fading" ? 0 : 1,
          transition: phase === "fading" ? "opacity 0.8s ease-out" : "none",
          cursor: phase === "idle" ? "pointer" : "default",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Skip button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleSkip(); }}
          style={{
            position: "absolute",
            top: "max(20px, env(safe-area-inset-top, 20px))",
            right: 20,
            zIndex: 100,
            padding: "8px 20px",
            border: "1px solid rgba(139,115,85,0.4)",
            borderRadius: 100,
            background: "rgba(250,246,238,0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontSize: 12,
            letterSpacing: "0.12em",
            color: "#8B7355",
            fontFamily: "Georgia, serif",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Skip
        </button>

        {/* ── Ambient floating petals (CSS-only, always present) ── */}
        {ambientPetals.map((p, i) => (
          <div
            key={`ambient-${i}`}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: 0.35,
              pointerEvents: "none",
              animation: `${p.animName} ${p.animDuration} ${p.animDelay} ease-in-out infinite`,
              transform: `rotate(${p.rotate}deg)`,
              willChange: "transform",
            }}
          >
            <img
              src={p.src}
              alt=""
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        ))}

        {/* ── Burst petals (after open) ───────────────────────── */}
        {phase === "burst" && burstPetals.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const bx = `${Math.cos(rad) * p.dist}vw`;
          const by = `${Math.sin(rad) * p.dist}vh`;
          return (
            <div
              key={`burst-${p.id}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                pointerEvents: "none",
                opacity: 0,
                // CSS custom properties for the keyframe
                ["--bx" as string]: bx,
                ["--by" as string]: by,
                ["--br" as string]: `${p.rotate}deg`,
                animation: `burst-fly ${p.duration} ${p.delay} ease-out forwards`,
                willChange: "transform, opacity",
              }}
            >
              <img
                src={p.src}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          );
        })}

        {/* ── Brand name ─────────────────────────────────────────── */}
        <div
          style={{
            textAlign: "center",
            marginBottom: isMobile ? 16 : 24,
            animation: "intro-fade-in 1s 0.2s ease-out both",
          }}
        >
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: isMobile ? 13 : 16,
              letterSpacing: "0.4em",
              color: "#C4A882",
              textTransform: "uppercase",
              marginBottom: 6,
              animation: "gold-pulse 3s ease-in-out infinite",
            }}
          >
            SOLVIERA
          </p>
          <div style={{ width: 48, height: 1, background: "rgba(196,168,130,0.5)", margin: "0 auto" }} />
        </div>

        {/* ── Envelope ─────────────────────────────────────────── */}
        <div
          ref={envelopeRef}
          style={{
            width: envelopeSize,
            height: envelopeSize,
            position: "relative",
            animation: phase === "idle"
              ? "envelope-float 3s ease-in-out infinite"
              : phase === "opening"
              ? "envelope-open-bounce 0.6s ease-out forwards"
              : "none",
            willChange: "transform",
          }}
        >
          {/* Soft glow behind envelope */}
          <div
            style={{
              position: "absolute",
              inset: -30,
              background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "gold-pulse 2.5s ease-in-out infinite",
            }}
          />
          {/* Closed Envelope */}
          <img
            src="/assets/envelope_closed.png"
            alt="Open to begin"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              inset: 0,
              zIndex: 1,
              filter: "drop-shadow(0 8px 24px rgba(139,115,85,0.25))",
              opacity: phase === "idle" ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}
          />
          {/* Open Envelope */}
          <img
            src="/assets/envelope_open.png"
            alt="Opened"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              inset: 0,
              zIndex: 2,
              filter: "drop-shadow(0 8px 24px rgba(139,115,85,0.25))",
              opacity: phase !== "idle" ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}
          />
        </div>

        {/* ── Tap prompt ───────────────────────────────────────── */}
        {phase === "idle" && (
          <div
            style={{
              marginTop: isMobile ? 20 : 28,
              textAlign: "center",
              animation: "intro-fade-in 1s 0.8s ease-out both",
            }}
          >
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: isMobile ? 14 : 16,
                color: "#8B7355",
                fontStyle: "italic",
                fontWeight: 300,
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              {isMobile ? "Tap to open" : "Click to open"}
            </p>
            <div
              style={{
                width: 24,
                height: 2,
                background: "rgba(139,115,85,0.35)",
                margin: "0 auto",
                borderRadius: 2,
                animation: "gold-pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* ── Blooming message ─────────────────────────────────── */}
        {(phase === "burst") && (
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? "12%" : "18%",
              textAlign: "center",
              animation: "intro-fade-in 0.6s ease-out both",
              zIndex: 200,
            }}
          >
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: isMobile ? 20 : 26,
                color: "#4A3F35",
                fontWeight: 300,
                letterSpacing: "0.05em",
              }}
            >
              Made to be
            </p>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: isMobile ? 24 : 32,
                color: "#8B7355",
                fontStyle: "italic",
                fontWeight: 300,
                letterSpacing: "0.04em",
              }}
            >
              kept forever
            </p>
          </div>
        )}
      </div>
    </>
  );
}
