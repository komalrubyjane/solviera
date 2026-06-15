"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BookingForm from "./BookingForm";

interface Venue {
  name: string;
  address: string;
  mapsEmbed: string;
  parkingInfo: string;
  contactInfo: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
}

interface Props {
  venue: Venue;
  faqs: FAQ[];
  testimonials: Testimonial[];
}

export default function WorkshopClient({ venue, faqs, testimonials }: Props) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  // Accordion active index for FAQs
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice);
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    let frameId: number;
    const updateRing = () => {
      setRingPos((prev) => {
        const dx = cursorPos.x - prev.x;
        const dy = cursorPos.y - prev.y;
        return { x: prev.x + dx * 0.15, y: prev.y + dy * 0.15 };
      });
      frameId = requestAnimationFrame(updateRing);
    };
    frameId = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(frameId);
  }, [cursorPos, isTouch]);

  // Scroll reveal trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const materials = [
    { name: "Premium Raw Canvas", desc: "Heavy-duty 14oz organic cotton canvas tote bags, custom woven for our atelier." },
    { name: "Fine Bristle Brushes", desc: "Assorted professional paint brushes ranging from fine details to wide coverage." },
    { name: "Permanent Textile Acrylics", desc: "A curated range of fabric acrylic pigments that fuse molecularly on canvas." },
    { name: "Artisan Stencils", desc: "Premium custom-designed stencils for outlining classic geometric patterns and frames." },
  ];

  return (
    <div className={`relative min-h-screen pb-24 overflow-hidden ${!isTouch ? "custom-cursor-active" : ""}`}>
      {/* CUSTOM CURSOR */}
      {!isTouch && (
        <>
          <div
            id="cursor"
            className="fixed w-3 h-3 bg-warm-brown rounded-full pointer-events-none z-[9999] transition-transform duration-150 ease-out"
            style={{
              left: `${cursorPos.x - 6}px`,
              top: `${cursorPos.y - 6}px`,
              transform: isHovered ? "scale(2.5)" : "scale(1)",
              boxShadow: "0 0 12px var(--warm-brown)",
            }}
          />
          <div
            id="cursor-ring"
            className="fixed w-10 h-10 border border-mocha rounded-full pointer-events-none z-[9998] opacity-80"
            style={{
              left: `${ringPos.x - 20}px`,
              top: `${ringPos.y - 20}px`,
              opacity: isHovered ? 0.2 : 0.8,
            }}
          />
        </>
      )}

      {/* NAV */}
      <nav className="main-nav">
        <div className="nav-pill">
          <Link
            href="/"
            className="nav-logo"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Solviera
          </Link>
          <ul className="nav-links">
            <li>
              <Link
                href="/#sec-curated"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Collection
              </Link>
            </li>
            <li>
              <Link
                href="/workshop-experience"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Workshop
              </Link>
            </li>
          </ul>
          <button
            onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
            className="nav-cta cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Book Session
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(167,139,250,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="text-center max-w-[800px] z-10">
          <p className="text-[10px] tracking-[0.25em] text-mocha uppercase mb-4 animate-[heroFadeUp_0.8s_ease_0.2s_forwards] opacity-0">
            Creative Retreat
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight text-dark-mocha mb-6 animate-[heroFadeUp_0.8s_ease_0.4s_forwards] opacity-0">
            The Atelier <em className="italic text-mocha">Workshop</em>
          </h1>
          <p className="text-base font-light text-soft-brown leading-relaxed mb-8 max-w-[600px] mx-auto animate-[heroFadeUp_0.8s_ease_0.6s_forwards] opacity-0">
            Step into our sunlit studio atelier. Select a premium heavy-canvas tote, study under master artisans, and paint or print a beautiful custom accessory to carry forever.
          </p>
          <div className="animate-[heroFadeUp_0.8s_ease_0.8s_forwards] opacity-0">
            <button
              onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gradient-to-r from-warm-brown to-nude text-cream font-semibold text-xs tracking-wider uppercase py-4 px-10 rounded-full shadow-lg hover:scale-104 hover:shadow-[0_8px_25px_rgba(244,114,182,0.5)] transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Reserve Atelier Seat →
            </button>
          </div>
        </div>
      </section>

      {/* DETAILED CRAFT MEDIUMS */}
      <section className="max-w-[1200px] mx-auto py-16 px-6">
        <div className="reveal text-center mb-16">
          <p className="text-[10px] tracking-widest text-mocha uppercase mb-3">Choose Your Medium</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-dark-mocha">
            The <em className="italic text-mocha">Atelier</em> Crafts
          </h2>
        </div>

        <div className="experience-showcase">
          {/* Card 1: The Canvas Bags */}
          <div className="exp-card reveal">
            <div className="exp-img-wrapper">
              <span className="exp-badge">Craft 01</span>
              <img
                src="/ws_canvas_bags.jpg"
                alt="Premium Canvas Bags"
                className="exp-img"
              />
              <div className="exp-overlay">
                <h3 className="exp-title-overlay">The Canvas Bags</h3>
              </div>
            </div>
            <div className="exp-details">
              <h4 className="exp-heading">Premium Organic Canvas</h4>
              <p className="exp-desc">
                Select your preferred base canvas, available in premium Off-White and Noir Black tote bags. Every bag features heavy-duty organic cotton weave, heavy weight stitching, and luxury genuine leather straps designed to withstand daily use while serving as your personal artistic canvas.
              </p>
              <ul className="exp-features">
                <li>Heavyweight 100% organic cotton</li>
                <li>Genuine leather top handles</li>
                <li>Secure internal pockets & premium details</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Pigments & Colors */}
          <div className="exp-card reveal">
            <div className="exp-img-wrapper">
              <span className="exp-badge">Craft 02</span>
              <img
                src="/ws_palette.png"
                alt="Pigments and Color Palettes"
                className="exp-img"
              />
              <div className="exp-overlay">
                <h3 className="exp-title-overlay">Pigments &amp; Colors</h3>
              </div>
            </div>
            <div className="exp-details">
              <h4 className="exp-heading">Artisanal Color Palettes</h4>
              <p className="exp-desc">
                Explore an extensive collection of premium, molecular-binding fabric pigments. Learn the principles of color theory, custom gradient blending, and shading techniques to mix customized hues on your wooden mixing palette under expert atelier guidance.
              </p>
              <ul className="exp-features">
                <li>Non-toxic, molecular-binding pigment</li>
                <li>Professional wooden mixing palettes</li>
                <li>Shading, layering & gradient tools</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIALS INCLUDED */}
      <section className="max-w-[1200px] mx-auto py-16 px-6">
        <div className="reveal text-center mb-16">
          <p className="text-[10px] tracking-widest text-mocha uppercase mb-3">Premium Quality</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-dark-mocha">
            Materials <em className="italic text-mocha">Included</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {materials.map((m, idx) => (
            <div key={idx} className="reveal bg-sand/40 border border-mocha/20 rounded-2xl p-6 text-center shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-warm-brown text-xl mb-4">✦</div>
              <h3 className="font-serif text-lg text-dark-mocha mb-2">{m.name}</h3>
              <p className="text-xs font-light text-soft-brown leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VENUE INFORMATION */}
      <section className="max-w-[1000px] mx-auto py-16 px-6">
        <div className="reveal text-center mb-16">
          <p className="text-[10px] tracking-widest text-mocha uppercase mb-3">Our Location</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-dark-mocha">
            Venue &amp; <em className="italic text-mocha">Details</em>
          </h2>
        </div>

        <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gradient-to-br from-sand/70 to-cream/80 border border-mocha/20 rounded-[32px] overflow-hidden p-8 shadow-2xl items-center">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-dark-mocha mb-1">{venue.name}</h3>
              <p className="text-xs font-light text-soft-brown">{venue.address}</p>
            </div>
            <div className="border-t border-mocha/10 pt-4">
              <h4 className="text-[10px] tracking-widest text-mocha uppercase mb-2">Parking Details</h4>
              <p className="text-xs font-light text-soft-brown leading-relaxed">{venue.parkingInfo}</p>
            </div>
            <div className="border-t border-mocha/10 pt-4">
              <h4 className="text-[10px] tracking-widest text-mocha uppercase mb-2">Contact &amp; Bookings</h4>
              <p className="text-xs font-light text-soft-brown">{venue.contactInfo}</p>
            </div>
          </div>

          <div className="relative h-[300px] w-full rounded-2xl overflow-hidden border border-mocha/20">
            <iframe
              src={venue.mapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(1.2)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* BOOKING FORM SECTION */}
      <section id="booking-section" className="relative max-w-[700px] mx-auto py-16 px-6 z-10 reveal">
        <div className="reveal text-center mb-12">
          <p className="text-[10px] tracking-widest text-mocha uppercase mb-3">Reservations</p>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-dark-mocha">
            Book a <em className="italic text-mocha">Session</em>
          </h2>
        </div>
        <BookingForm onHoverChange={setIsHovered} />
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-[800px] mx-auto py-16 px-6">
        <div className="reveal text-center mb-16">
          <p className="text-[10px] tracking-widest text-mocha uppercase mb-3">Questions &amp; Answers</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-dark-mocha">
            Frequently Asked <em className="italic text-mocha">Questions</em>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="reveal border-b border-mocha/20 pb-4"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left flex justify-between items-center py-3 font-serif text-lg text-dark-mocha hover:text-mocha transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span>{faq.question}</span>
                <span className="text-warm-brown">{activeFaq === idx ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-light text-soft-brown leading-relaxed pt-2">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-[1200px] mx-auto py-16 px-6">
          <div className="reveal text-center mb-16">
            <p className="text-[10px] tracking-widest text-mocha uppercase mb-3">Testimonials</p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-dark-mocha">
              Studio <em className="italic text-mocha">Reviews</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="reveal bg-sand/40 border border-mocha/20 rounded-2xl p-6 shadow-md">
                <div className="text-yellow-500 mb-4">{"★".repeat(t.rating)}</div>
                <p className="text-xs font-light text-soft-brown leading-relaxed mb-4">"{t.review}"</p>
                <div className="font-serif text-sm text-dark-mocha">{t.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="max-w-[1000px] mx-auto py-16 px-6 text-center">
        <div className="reveal bg-gradient-to-r from-sand/70 to-cream/90 border border-mocha/30 rounded-[36px] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.06)_0%,transparent_60%)] pointer-events-none" />
          <h2 className="font-serif text-3xl md:text-5xl font-light text-dark-mocha mb-4 relative z-10">
            Begin Your Creative Journey
          </h2>
          <p className="text-xs font-light text-soft-brown max-w-[500px] mx-auto mb-8 relative z-10">
            Book your session to create a custom, hand-painted luxury heavy canvas tote bag in our Tornabuoni workshop.
          </p>
          <div className="relative z-10">
            <button
              onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-block bg-gradient-to-r from-warm-brown to-nude text-ivory font-semibold text-xs tracking-wider uppercase py-4 px-10 rounded-full shadow-lg hover:scale-104 hover:shadow-[0_0_25px_rgba(107,79,58,0.2)] transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Book Your Atelier Experience
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-mocha/10 pt-16 text-center">
        <div className="font-serif text-xl tracking-widest text-dark-mocha uppercase mb-4">Solviera</div>
        <p className="text-[11px] font-light text-soft-brown opacity-60">
          © 2026 Solviera Atelier. Florence & Milan. All rights reserved.
        </p>
      </footer>

      {/* TOAST SYSTEM */}
      <div id="toast" className="text-white text-xs font-light rounded-xl"></div>
    </div>
  );
}
