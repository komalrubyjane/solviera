"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

// --- Types ---
interface FlowerParticle {
  id: number;
  type: "lily" | "rose" | "peony" | "lotus" | "babybreath";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startSize: number;
  endSize: number;
  startRotation: number;
  endRotation: number;
  delay: number;
  duration: number;
  zIndex: number;
}

// Maps directly to the pre-rendered transparent assets
const FLOWER_IMAGES: Record<FlowerParticle["type"], string> = {
  lily: "/assets/flowers/trans_flower.png",
  rose: "/assets/flowers/trans_chatgpt_2.png",
  peony: "/assets/flowers/trans_chatgpt_1.png",
  lotus: "/assets/flowers/trans_chatgpt_1.png",
  babybreath: "/assets/flowers/trans_baby_breath.png",
};

let _uid = 0;
const TYPES: FlowerParticle["type"][] = ["lily", "rose", "peony", "lotus", "babybreath"];

function spawnFlowers(count: number, delayOffset: number = 0, spreadDuration: number = 2.5): FlowerParticle[] {
  const flowers: FlowerParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const originRadius = Math.random() * 4;
    const startX = 50 + Math.cos(angle) * originRadius;
    const startY = 50 + Math.sin(angle) * originRadius;

    const flyRadius = 110 + Math.random() * 90;
    const endX = 50 + Math.cos(angle) * flyRadius;
    const endY = 50 + Math.sin(angle) * flyRadius;

    const startSize = 6 + Math.random() * 12;
    const endSize = 180 + Math.random() * 220; // Slightly smaller sizes for crisp rendering and performance

    const duration = 1.0 + Math.random() * 0.8;
    const delay = delayOffset + (i / count) * spreadDuration * Math.random();

    flowers.push({
      id: _uid++,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      startX,
      startY,
      endX,
      endY,
      startSize,
      endSize,
      startRotation: Math.random() * 360,
      endRotation: Math.random() * 540 * (Math.random() > 0.5 ? 1 : -1),
      delay,
      duration,
      zIndex: Math.floor(Math.random() * 100),
    });
  }
  return flowers;
}

const ZoomFlower = ({
  flower,
  imgSrc,
  stage,
}: {
  flower: FlowerParticle;
  imgSrc: string;
  stage: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    // Trigger hardware accelerated animation via GSAP
    gsap.fromTo(
      el,
      {
        x: `${flower.startX}vw`,
        y: `${flower.startY}vh`,
        scale: 0.05,
        opacity: 0,
        rotation: flower.startRotation,
      },
      {
        x: `${flower.endX}vw`,
        y: `${flower.endY}vh`,
        scale: 1,
        opacity: 1,
        rotation: flower.endRotation,
        duration: flower.duration,
        delay: flower.delay,
        ease: "power1.in",
        onStart: () => {
          gsap.to(el, {
            opacity: 0,
            scale: 1.5,
            duration: 0.3,
            delay: flower.duration + flower.delay - 0.3,
            ease: "power1.in",
          });
        },
      }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, [flower]);

  useEffect(() => {
    if (stage === "revealing" && ref.current) {
      gsap.to(ref.current, { opacity: 0, scale: 2.0, duration: 0.4, ease: "power2.out" });
    }
  }, [stage]);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: `${flower.endSize}px`,
        height: `${flower.endSize}px`,
        marginLeft: `-${flower.endSize / 2}px`,
        marginTop: `-${flower.endSize / 2}px`,
        zIndex: flower.zIndex,
        opacity: 0,
        willChange: "transform, opacity",
        transformOrigin: "center center",
        transform: "translate3d(0,0,0)",
      }}
    >
      <img
        src={imgSrc}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default function SolveriaIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"idle" | "opening" | "blooming" | "revealing">("idle");
  const [flowers, setFlowers] = useState<FlowerParticle[]>([]);
  const [envelopePhase, setEnvelopePhase] = useState<"closed" | "open">("closed");

  const introLayerRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const closedImgRef = useRef<HTMLImageElement>(null);
  const openImgRef = useRef<HTMLImageElement>(null);
  const triggerTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "idle" || !envelopeRef.current) return;
    const t = gsap.to(envelopeRef.current, {
      y: -12,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      t.kill();
    };
  }, [stage]);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("opening");

    if (triggerTextRef.current) {
      gsap.to(triggerTextRef.current, { opacity: 0, y: 8, duration: 0.35 });
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = isMobile ? 60 : 180; // Optimized count for smooth frame rates on all devices

    const tl = gsap.timeline();
    tl.to(envelopeRef.current, { scale: 1.08, duration: 0.5, ease: "power2.inOut" })
      .add(() => {
        setEnvelopePhase("open");
        if (closedImgRef.current) {
          gsap.to(closedImgRef.current, { opacity: 0, duration: 0.35 });
        }
        if (openImgRef.current) {
          gsap.fromTo(openImgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
        }
      }, "-=0.08")
      .to(envelopeRef.current, {
        y: -40,
        opacity: 0,
        scale: 0.85,
        duration: 0.7,
        delay: 0.3,
        ease: "power2.in",
        onStart: () => {
          setStage("blooming");
          setFlowers(spawnFlowers(count, 0, 2.2));
        },
      });
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStage("revealing");
  };

  useEffect(() => {
    if (stage !== "blooming") return;

    const tReveal = setTimeout(() => {
      setStage("revealing");
    }, 2500);

    return () => clearTimeout(tReveal);
  }, [stage]);

  useEffect(() => {
    if (stage !== "revealing") return;
    gsap.to(introLayerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: onComplete,
    });
  }, [stage, onComplete]);

  return (
    <div
      ref={introLayerRef}
      className="fixed inset-0 z-[9999] select-none overflow-hidden"
      style={{ background: "#F5EEE6", perspective: "1000px" }}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-[100] px-5 py-2 border border-[#8B7355]/40 rounded-full font-serif text-sm tracking-widest text-[#8B7355] hover:text-[#2A2421] hover:border-[#2A2421] transition-all duration-300 pointer-events-auto cursor-pointer bg-[#F5EEE6]/70 backdrop-blur-sm shadow-sm hover:shadow-md"
      >
        Skip Intro
      </button>

      {/* Ambient gold dust particles */}
      {stage === "idle" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#D4AF37]/50"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(0.5px)",
                animation: `ambient-pulse ${3 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Flowers layer — behind everything */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {flowers.map((f) => (
          <ZoomFlower key={f.id} flower={f} imgSrc={FLOWER_IMAGES[f.type]} stage={stage} />
        ))}
      </div>

      {/* Envelope + UI — above flowers */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 50 }}
      >
        {(stage === "idle" || stage === "opening") && (
          <div
            ref={envelopeRef}
            className="relative cursor-pointer pointer-events-auto"
            onClick={handleOpen}
            style={{ width: 320, height: 320 }}
          >
            <div
              className="absolute -top-16 left-1/2 text-center pointer-events-none"
              style={{ transform: "translateX(-50%)", whiteSpace: "nowrap" }}
            >
              <span className="font-serif text-3xl tracking-[0.4em] text-[#D4AF37] gold-text-glow font-light uppercase">
                SOLVERIA
              </span>
              <div className="w-16 h-[1px] bg-[#D4AF37]/50 mx-auto mt-2" />
            </div>

            {/* Closed envelope */}
            <img
              ref={closedImgRef}
              src="/assets/envelope_closed.png"
              alt="Envelope"
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
                opacity: envelopePhase === "closed" ? 1 : 0,
              }}
            />
            {/* Open envelope */}
            <img
              ref={openImgRef}
              src="/assets/envelope_open.png"
              alt="Envelope open"
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
                opacity: envelopePhase === "open" ? 1 : 0,
              }}
            />
          </div>
        )}

        {/* Tap to Open */}
        {stage === "idle" && (
          <div ref={triggerTextRef} className="mt-10 text-center pointer-events-none">
            <p className="font-serif text-xl text-[#8B7355] italic font-light tracking-widest">
              Tap to Open
            </p>
            <div className="w-4 h-[1px] bg-[#8B7355]/40 mx-auto mt-2 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
