"use client";

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// --- Types ---
interface FlowerParticle {
  id: number;
  type: 'lily' | 'rose' | 'peony' | 'lotus' | 'babybreath';
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

// Using pre-resized natively transparent flower images
const FLOWER_IMAGES: Record<string, string> = {
  lily:       '/assets/flowers/trans_flower.png',
  rose:       '/assets/flowers/trans_chatgpt_2.png',
  peony:      '/assets/flowers/trans_chatgpt_1.png',
  lotus:      '/assets/flowers/trans_chatgpt_1.png',
  babybreath: '/assets/flowers/trans_baby_breath.png',
};

// Remove dark background from envelope images (aggressive keying for black backgrounds)
const makeEnvelopeTransparent = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(src); return; }
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const r = d.data[i];
        const g = d.data[i+1];
        const b = d.data[i+2];
        if (r < 55 && g < 55 && b < 55) {
          d.data[i+3] = 0;
        }
      }
      ctx.putImageData(d, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => resolve(src);
  });
};

let _uid = 0;
const TYPES: FlowerParticle['type'][] = ['lily', 'rose', 'peony', 'lotus', 'babybreath'];

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
    const endSize   = 220 + Math.random() * 220; 

    const duration  = 1.1 + Math.random() * 0.9;
    const delay = delayOffset + (i / count) * spreadDuration * Math.random();

    flowers.push({
      id: _uid++,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      startX, startY,
      endX,   endY,
      startSize, endSize,
      startRotation: Math.random() * 360,
      endRotation:   Math.random() * 540 * (Math.random() > 0.5 ? 1 : -1),
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
        ease: 'power1.in',
        onStart: () => {
          gsap.to(el, {
            opacity: 0,
            scale: 1.6,
            duration: 0.35,
            delay: flower.duration + flower.delay - 0.35,
            ease: 'power1.in',
          });
        },
      }
    );

    return () => { gsap.killTweensOf(el); };
  }, []);

  useEffect(() => {
    if (stage === 'revealing' && ref.current) {
      gsap.to(ref.current, { opacity: 0, scale: 2.2, duration: 0.5, ease: 'power2.out' });
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
        willChange: 'transform, opacity',
        transformOrigin: 'center center',
      }}
    >
      <img
        src={imgSrc}
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          transform: 'translate3d(0, 0, 0)',
        }}
      />
    </div>
  );
};

export default function SolveriaIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'idle' | 'opening' | 'blooming' | 'revealing'>('idle');
  const [flowers, setFlowers] = useState<FlowerParticle[]>([]);
  const [envelopes, setEnvelopes] = useState({ closed: '/assets/envelope_closed.png', open: '/assets/envelope_open.png' });
  const [envelopePhase, setEnvelopePhase] = useState<'closed' | 'open'>('closed');

  const introLayerRef  = useRef<HTMLDivElement>(null);
  const envelopeRef    = useRef<HTMLDivElement>(null);
  const closedImgRef   = useRef<HTMLImageElement>(null);
  const openImgRef     = useRef<HTMLImageElement>(null);
  const triggerTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [c, o] = await Promise.all([
        makeEnvelopeTransparent('/assets/envelope_closed.png'),
        makeEnvelopeTransparent('/assets/envelope_open.png'),
      ]);
      setEnvelopes({ closed: c, open: o });
    })();
  }, []);

  useEffect(() => {
    if (stage !== 'idle' || !envelopeRef.current) return;
    const t = gsap.to(envelopeRef.current, {
      y: -16, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut',
    });
    return () => { t.kill(); };
  }, [stage]);

  const handleOpen = () => {
    if (stage !== 'idle') return;
    setStage('opening');

    if (triggerTextRef.current) {
      gsap.to(triggerTextRef.current, { opacity: 0, y: 12, duration: 0.4 });
    }

    const tl = gsap.timeline();
    tl.to(envelopeRef.current, { scale: 1.1, duration: 0.6, ease: 'power2.inOut' })
      .add(() => {
        setEnvelopePhase('open');
        if (closedImgRef.current) {
          gsap.to(closedImgRef.current, { opacity: 0, duration: 0.45 });
        }
        if (openImgRef.current) {
          gsap.fromTo(openImgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45 });
        }
      }, '-=0.1')
      .to(envelopeRef.current, {
        y: -50, opacity: 0, scale: 0.8,
        duration: 0.8, delay: 0.4, ease: 'power2.in',
        onStart: () => {
          setStage('blooming');
          const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
          setFlowers(spawnFlowers(isMobileDevice ? 120 : 380, 0, 2.5));
        },
      });
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStage('revealing');
  };

  useEffect(() => {
    if (stage !== 'blooming') return;

    const tReveal = setTimeout(() => {
      setStage('revealing');
    }, 1600); // Speed up wait time from 3000ms to 1600ms

    return () => clearTimeout(tReveal);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'revealing') return;
    gsap.to(introLayerRef.current, {
      opacity: 0,
      duration: 0.8, // Speed up fade-out from 1.6s to 0.8s
      ease: 'power2.inOut',
      onComplete: onComplete,
    });
  }, [stage, onComplete]);

  return (
    <div
      ref={introLayerRef}
      className="fixed inset-0 z-[9999] select-none overflow-hidden"
      style={{ background: '#F5EEE6', perspective: '1000px' }}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-[100] px-5 py-2 border border-[#8B7355]/40 rounded-full font-serif text-sm tracking-widest text-[#8B7355] hover:text-[#2A2421] hover:border-[#2A2421] transition-all duration-300 pointer-events-auto cursor-pointer bg-[#F5EEE6]/70 backdrop-blur-sm shadow-sm hover:shadow-md"
      >
        Skip Intro
      </button>

      {/* Ambient gold dust particles */}
      {stage === 'idle' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#D4AF37]/50"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(0.5px)',
                animation: `ambient-pulse ${3 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Flowers layer — behind envelope */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {flowers.map(f => (
          <ZoomFlower
            key={f.id}
            flower={f}
            imgSrc={FLOWER_IMAGES[f.type]}
            stage={stage}
          />
        ))}
      </div>

      {/* Envelope + UI — above flowers */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 50 }}
      >
        {(stage === 'idle' || stage === 'opening') && (
          <div
            ref={envelopeRef}
            className="relative cursor-pointer pointer-events-auto"
            onClick={handleOpen}
            style={{ width: 320, height: 320 }}
          >
            <div
              className="absolute -top-16 left-1/2 text-center pointer-events-none"
              style={{ transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
            >
              <span className="font-serif text-3xl tracking-[0.4em] text-[#D4AF37] gold-text-glow font-light uppercase">
                SOLVERIA
              </span>
              <div className="w-16 h-[1px] bg-[#D4AF37]/50 mx-auto mt-2" />
            </div>

            {/* Closed envelope */}
            <img
              ref={closedImgRef}
              src={envelopes.closed}
              alt="Envelope"
              draggable={false}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'contain',
                userSelect: 'none', pointerEvents: 'none',
                opacity: envelopePhase === 'closed' ? 1 : 0,
              }}
            />
            {/* Open envelope */}
            <img
              ref={openImgRef}
              src={envelopes.open}
              alt="Envelope open"
              draggable={false}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'contain',
                userSelect: 'none', pointerEvents: 'none',
                opacity: envelopePhase === 'open' ? 1 : 0,
              }}
            />
          </div>
        )}

        {/* Tap to Open */}
        {stage === 'idle' && (
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
