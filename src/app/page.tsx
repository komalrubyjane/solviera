"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BeyondTheStudio from "@/components/BeyondTheStudio";
import FounderStory from "@/components/FounderStory";

interface CartItem {
  name: string;
  price: number;
  imgSrc: string;
  qty: number;
}

export default function Homepage() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  // Parallax tracking
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Cart & Checkout States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"shipping" | "payment" | "processing" | "success">("shipping");
  
  // Order Success Reference
  const [orderRef, setOrderRef] = useState("#SLV-000000");

  // Form Fields State
  const [shipName, setShipName] = useState("");
  const [shipEmail, setShipEmail] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipZip, setShipZip] = useState("");
  
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState("");
  const [toastIsError, setToastIsError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Trigger Toast Notification
  const triggerToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastIsError(isError);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("solviera_cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
    }
  }, []);

  // Sync cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("solviera_cart", JSON.stringify(newCart));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  };

  // Add to cart handler
  const handleAddToCart = (name: string, price: number, imgSrc: string) => {
    const existing = cart.find((item) => item.name === name);
    let newCart: CartItem[] = [];
    if (existing) {
      newCart = cart.map((item) =>
        item.name === name ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      newCart = [...cart, { name, price, imgSrc, qty: 1 }];
    }
    saveCart(newCart);
    triggerToast(`Added ${name} to your bag.`);
    setIsCartOpen(true);
  };

  // Quantity updates
  const changeQty = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].qty += delta;
    if (newCart[index].qty <= 0) {
      newCart.splice(index, 1);
    }
    saveCart(newCart);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    saveCart(newCart);
  };

  // Cart total sum
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Proceed to checkout modal
  const handleProceedCheckout = () => {
    if (cart.length === 0) {
      triggerToast("Your bag is empty.", true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setCheckoutStep("shipping");
  };

  // Card formatting helpers
  const handleCardNumberInput = (val: string) => {
    const sanitized = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    let formatted = "";
    for (let i = 0; i < sanitized.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += sanitized[i];
    }
    setCardNumber(formatted.slice(0, 19)); // limit to 16 digits + 3 spaces
  };

  const handleCardExpiryInput = (val: string) => {
    const sanitized = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (sanitized.length > 2) {
      setCardExpiry(sanitized.slice(0, 2) + "/" + sanitized.slice(2, 4));
    } else {
      setCardExpiry(sanitized);
    }
  };

  // Checkout submission handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipName || !shipEmail || !shipAddress || !shipCity || !shipZip) {
      triggerToast("Please fill out all shipping details.", true);
      return;
    }
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      triggerToast("Secure payment credentials missing.", true);
      return;
    }

    setCheckoutStep("processing");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: {
            name: shipName,
            email: shipEmail,
            address: shipAddress,
            city: shipCity,
            zip: shipZip,
          },
          payment: {
            cardholder: cardName,
            number: cardNumber,
            expiry: cardExpiry,
          },
          items: cart,
          total: cartTotal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderRef(data.orderId);
        setCheckoutStep("success");
        // Clear local storage and state cart
        saveCart([]);
      } else {
        triggerToast(data.message || "Payment processing failed.", true);
        setCheckoutStep("payment");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Unable to reach secure payment server.", true);
      setCheckoutStep("payment");
    }
  };

  // Newsletter submission handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !email.includes("@")) {
      triggerToast("Please enter a valid email address.", true);
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        triggerToast(data.message || "Thank you for subscribing to Solviera.");
        setNewsletterEmail("");
      } else {
        triggerToast(data.message || "Subscription failed.", true);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Unable to connect to newsletter registry.", true);
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice);
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Gentle parallax calculations for floaters
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOffset({
        x: (e.clientX - cx) * 0.03,
        y: (e.clientY - cy) * 0.03,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smooth lag for outer cursor ring
  useEffect(() => {
    if (isTouch) return;
    let frameId: number;
    
    const updateRing = () => {
      setRingPos((prev) => {
        const dx = cursorPos.x - prev.x;
        const dy = cursorPos.y - prev.y;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      frameId = requestAnimationFrame(updateRing);
    };

    frameId = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(frameId);
  }, [cursorPos, isTouch]);

  // Handle intersection observer scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const featuredBags = [
    {
      name: "Toscana Crochet",
      desc: "Intricately hand-woven crochet mesh tote. Light, breathable, and perfect for resort days.",
      price: "₹29,900",
      priceNum: 29900,
      badge: "Bestseller",
      img: "/tote_crochet.png"
    },
    {
      name: "Venezia Hibiscus",
      desc: "Plush tufted velvet tote in a deep hibiscus crimson. Features a beautiful white floral motif.",
      price: "₹26,500",
      priceNum: 26500,
      badge: null,
      img: "/tote_hibiscus.png"
    },
    {
      name: "Palermo Kitty",
      desc: "Premium plush tufted signature tote in sunset bubblegum pink. A playful, high-fashion statement piece.",
      price: "₹22,900",
      priceNum: 22900,
      badge: "New",
      img: "/tote_kitty.png"
    },
  ];
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    
    card.style.transition = "transform 0.1s ease-out, box-shadow 0.1s ease-out";
    card.style.transform = `perspective(1000px) rotateX(${-dy * 12}deg) rotateY(${dx * 12}deg) translateY(-8px) scale(1.02)`;
    card.style.boxShadow = `${-dx * 15}px ${-dy * 15}px 35px rgba(167, 139, 250, 0.25)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = "transform 0.5s cubic-bezier(.34, 1.2, .64, 1), box-shadow 0.4s ease";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
    card.style.boxShadow = "none";
  };

  const handleWsCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    
    card.style.transition = "transform 0.08s ease-out, box-shadow 0.08s ease-out";
    card.style.transform = `perspective(600px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg) translateY(-5px) scale(1.03)`;
    card.style.boxShadow = `0 16px 40px rgba(167, 139, 250, 0.25), ${-dx * 10}px ${-dy * 10}px 20px rgba(244, 114, 182, 0.15)`;
  };

  const handleWsCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = "transform 0.5s cubic-bezier(.34, 1.2, .64, 1), box-shadow 0.5s ease";
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
    card.style.boxShadow = "none";
  };

  const handleVisualTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    el.style.transition = "transform 0.1s ease-out";
    el.style.transform = `perspective(1200px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale(1.01)`;
  };

  const handleVisualTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transition = "transform 0.6s cubic-bezier(.34, 1.2, .64, 1)";
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const handleBagTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    card.style.transition = "transform 0.08s ease-out";
    card.style.transform = `perspective(500px) rotateX(${-dy * 18}deg) rotateY(${dx * 18}deg) scale(1.08)`;
    card.style.filter = `drop-shadow(${-dx * 20}px ${-dy * 20}px 30px rgba(167,139,250,0.4))`;
  };

  const handleBagTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = "transform 0.6s cubic-bezier(.34, 1.2, .64, 1)";
    card.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.filter = "none";
  };

  const handleHeroCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    card.style.transition = "transform 0.1s ease-out, box-shadow 0.1s ease-out";
    card.style.transform = `perspective(1800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale(1.01)`;
    card.style.boxShadow = `
      ${-dx * 20}px ${-dy * 20}px 60px rgba(13, 8, 20, 0.5),
      0 24px 80px rgba(13, 8, 20, 0.4),
      0 0 40px rgba(167, 139, 250, ${0.08 + Math.abs(dx) * 0.12}),
      0 1px 0 rgba(255, 255, 255, 0.08) inset
    `;
  };

  const handleHeroCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = "transform 0.8s cubic-bezier(.34, 1.2, .64, 1), box-shadow 0.8s ease";
    card.style.transform = "perspective(1800px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.boxShadow = "0 24px 80px rgba(13, 8, 20, 0.4), 0 4px 24px rgba(13, 8, 20, 0.2), 0 1px 0 rgba(255, 255, 255, 0.08) inset";
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${!isTouch ? "custom-cursor-active" : ""}`}>
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
            className="fixed w-10 h-10 border border-mocha rounded-full pointer-events-none z-[9998] opacity-80 transition-opacity duration-300"
            style={{
              left: `${ringPos.x - 20}px`,
              top: `${ringPos.y - 20}px`,
              opacity: isHovered ? 0.2 : 0.8,
              boxShadow: "0 0 8px rgba(167,139,250,0.2)",
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
              <a
                href="#sec-curated"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Collection
              </a>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setIsCartOpen(true)}
              className="nav-cta"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Cart</span>
              <span style={{ background: "var(--warm-brown)", color: "white", borderRadius: "50%", padding: "1px 6px", fontSize: "9px", fontWeight: "bold" }}>
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grain" />

        <div
          className="hero-container"
          id="heroContainer"
          onMouseMove={handleHeroCardTilt}
          onMouseLeave={handleHeroCardLeave}
        >
          {/* Floating tags */}
          <div className="hero-tags">
            <span className="tag-pill">✦ New Arrivals 2025</span>
            <span className="tag-pill">Handcrafted in Florence</span>
            <span className="tag-pill">Free global shipping</span>
          </div>

          {/* Main content */}
          <div className="hero-top">
            <div className="hero-headline">
              <p className="hero-eyebrow hero-eyebrow-anim">The Luxury Tote Atelier</p>
              <h1 className="hero-title hero-title-anim">
                <span className="hero-title-line hero-title-line--italic">Timeless</span>
                <span className="hero-title-line hero-title-line--bold">Craft &amp;</span>
                <span className="hero-title-line">Form.</span>
              </h1>
              <p className="hero-sub hero-sub-anim">
                Each bag is a study in restraint. Vegetable-tanned leathers, hand-stitched edges, and silhouettes that carry decades without effort.
              </p>
              <div className="hero-actions hero-actions-anim">
                <button
                  onClick={() => document.getElementById("sec-curated")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-primary cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Explore Collection
                </button>
                <Link
                  href="/workshop-experience"
                  className="btn-ghost flex items-center justify-center cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Our Story →
                </Link>
              </div>
            </div>
            
            <div className="hero-stats hero-stats-anim">
              <div className="stat-item">
                <div className="stat-num">12</div>
                <div className="stat-label">Signature styles</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">04</div>
                <div className="stat-label">Collections</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">∞</div>
                <div className="stat-label">Lifetime care</div>
              </div>
            </div>
          </div>

          {/* Floating bags */}
          <div className="hero-products">
            {/* Bag 1: Large tote */}
            <div className="bag-float bag-1" style={{ position: "absolute", top: "5%", left: "22%", width: "220px", transform: `translate3d(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px, 0)` }}>
              <div
                className="bag-tilt-inner"
                onMouseMove={handleBagTilt}
                onMouseLeave={handleBagTiltLeave}
                style={{ position: "relative", display: "inline-block", cursor: "none" }}
              >
                <img className="bag-svg" src="/tote_crochet.png" alt="Toscana Crochet Tote" style={{ width: "100%", display: "block" }} />
                <div className="bag-label label-1">Toscana Crochet</div>
                <div className="bag-label label-2">From ₹29,900</div>
              </div>
            </div>

            {/* Bag 2: Slim tote */}
            <div className="bag-float bag-2" style={{ position: "absolute", top: "12%", right: "5%", width: "190px", transform: `translate3d(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px, 0)` }}>
              <div
                className="bag-tilt-inner"
                onMouseMove={handleBagTilt}
                onMouseLeave={handleBagTiltLeave}
                style={{ position: "relative", display: "inline-block", cursor: "none" }}
              >
                <img className="bag-svg" src="/tote_hibiscus.png" alt="Venezia Hibiscus Mini" style={{ width: "100%", display: "block" }} />
                <div className="bag-label label-3">Venezia Hibiscus</div>
              </div>
            </div>

            {/* Bag 3: Structured tote */}
            <div className="bag-float bag-3" style={{ position: "absolute", bottom: "2%", left: "38%", width: "200px", transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)` }}>
              <div
                className="bag-tilt-inner"
                onMouseMove={handleBagTilt}
                onMouseLeave={handleBagTiltLeave}
                style={{ position: "relative", display: "inline-block", cursor: "none" }}
              >
                <img className="bag-svg" src="/tote_kitty.png" alt="Palermo Kitty Everyday" style={{ width: "100%", display: "block" }} />
                <div className="bag-label label-1">Palermo Kitty</div>
              </div>
            </div>
          </div>

          {/* Wave bottom */}
          <div className="hero-wave">
            <svg viewBox="0 0 1100 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 40 Q100 10 200 40 Q300 70 400 45 Q500 20 600 45 Q700 70 800 40 Q900 10 1000 38 Q1050 48 1100 35 L1100 80 L0 80 Z" fill="url(#wave-grad)" opacity="0.35"/>
              <path d="M0 55 Q150 30 300 55 Q450 80 600 55 Q750 30 900 55 Q1000 68 1100 50 L1100 80 L0 80 Z" fill="url(#wave-grad)" opacity="0.2"/>
              <defs>
                <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9CCBA"/>
                  <stop offset="100%" stopColor="#C4A882"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* WORKSHOP PREVIEW */}
      <section className="workshop-preview" id="sec-workshop">
        <div className="workshop-split">
          <div className="workshop-left reveal">
            <p className="ws-eyebrow">Studio Experience</p>
            <h2 className="ws-title"><em>Create.</em> Paint. <strong>Carry.</strong></h2>
            <p className="ws-sub">Transform a simple tote bag into a personal piece of art. Explore colors, experiment with traditional block printing, and leave with a handcrafted creation that's uniquely yours.</p>
            <p className="ws-desc">Whether you're an experienced artist or picking up a brush for the first time, our workshops are designed to inspire creativity in a welcoming and fun environment.</p>
            
            <div className="ws-highlights">
              <div className="ws-card reveal" style={{ transitionDelay: "0.1s" }} onMouseMove={handleWsCardMouseMove} onMouseLeave={handleWsCardMouseLeave}>
                <div className="ws-icon">✔</div><div className="ws-text">Premium Tote Bag Included</div>
              </div>
              <div className="ws-card reveal" style={{ transitionDelay: "0.2s" }} onMouseMove={handleWsCardMouseMove} onMouseLeave={handleWsCardMouseLeave}>
                <div className="ws-icon">✔</div><div className="ws-text">White &amp; Black Options</div>
              </div>
              <div className="ws-card reveal" style={{ transitionDelay: "0.3s" }} onMouseMove={handleWsCardMouseMove} onMouseLeave={handleWsCardMouseLeave}>
                <div className="ws-icon">✔</div><div className="ws-text">Professional Paint Brushes</div>
              </div>
              <div className="ws-card reveal" style={{ transitionDelay: "0.4s" }} onMouseMove={handleWsCardMouseMove} onMouseLeave={handleWsCardMouseLeave}>
                <div className="ws-icon">✔</div><div className="ws-text">Vibrant Fabric Colors</div>
              </div>
              <div className="ws-card reveal" style={{ transitionDelay: "0.5s" }} onMouseMove={handleWsCardMouseMove} onMouseLeave={handleWsCardMouseLeave}>
                <div className="ws-icon">✔</div><div className="ws-text">Traditional Block Printing</div>
              </div>
              <div className="ws-card reveal" style={{ transitionDelay: "0.6s" }} onMouseMove={handleWsCardMouseMove} onMouseLeave={handleWsCardMouseLeave}>
                <div className="ws-icon">✔</div><div className="ws-text">Take Home Your Creation</div>
              </div>
            </div>
          </div>

          <div className="workshop-right reveal" style={{ transitionDelay: "0.3s" }}>
            <div className="ws-comic-wrapper">
              <div className="ws-comic-card">
                <div className="ws-comic-glow"></div>
                <img src="/workshop_comic.jpg" alt="Workshop Storyboard" className="ws-comic-img" />
              </div>
            </div>
          </div>
        </div>

        <div className="ws-cta reveal">
          <h2 className="ws-cta-title">Ready to Create Your Own Tote Bag?</h2>
          <p className="ws-cta-sub">Join our creative workshops and experience the joy of making something truly personal.</p>
          <Link href="/workshop-experience" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary cursor-pointer"
              style={{ fontSize: "13px", padding: "16px 40px", boxShadow: "0 0 25px rgba(244,114,182,0.4)", borderRadius: "100px" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Explore Workshop Experience →
            </button>
          </Link>
        </div>
      </section>

      <BeyondTheStudio />

      {/* FEATURED PRODUCTS */}
      <section className="section" id="sec-curated">
        <div className="section-header reveal" id="sec1">
          <p className="section-eyebrow">Curated Selection</p>
          <h2 className="section-title">Featured <em>Pieces</em></h2>
        </div>
        <div className="products-grid">
          {featuredBags.map((bag, idx) => (
            <div
              key={idx}
              className="product-card reveal"
              style={{ transitionDelay: `${0.1 * (idx + 1)}s` }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="product-img">
                {bag.badge && <span className="badge">{bag.badge}</span>}
                <img src={bag.img} alt={bag.name} />
              </div>
              <div className="product-info">
                <div className="product-name">{bag.name}</div>
                <div className="product-desc">{bag.desc}</div>
                <div className="product-footer">
                  <div className="product-price">{bag.price}</div>
                  <button
                    onClick={() => handleAddToCart(bag.name, bag.priceNum, bag.img)}
                    className="add-btn cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Add to bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <div className="collections-wrap">
        <div className="collections-inner">
          <div className="section-header reveal" id="sec2">
            <p className="section-eyebrow">Explore</p>
            <h2 className="section-title">Our <em>Collections</em></h2>
          </div>
          <div className="collections-grid">
            <div className="collection-card large reveal">
              <div className="collection-bg" style={{ background: "linear-gradient(rgba(13,8,20,0.3), rgba(13,8,20,0.75)), url('/collection_heritage.png') no-repeat center/cover", position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <svg viewBox="0 0 400 740" style={{ position: "absolute", right: "-20px", top: 0, width: "60%", opacity: 0.12 }} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M80 200 Q80 80 200 60 Q320 80 320 200 L320 640 Q320 700 200 720 Q80 700 80 640 Z" fill="var(--sand)" />
                </svg>
              </div>
              <div className="collection-overlay" />
              <div className="collection-info">
                <h3 className="collection-name">The Italian<br /><em>Heritage</em> Edit</h3>
                <div className="collection-cta">Shop Collection <span className="cta-arrow"></span></div>
              </div>
            </div>
            
            <div className="collection-card reveal" style={{ transitionDelay: "0.15s" }}>
              <div className="collection-bg" style={{ background: "linear-gradient(rgba(13,8,20,0.25), rgba(13,8,20,0.75)), url('/collection_summer.png') no-repeat center/cover", position: "absolute", inset: 0 }} />
              <div className="collection-overlay" style={{ background: "linear-gradient(to top,rgba(13,8,20,0.65) 0%,transparent 60%)" }} />
              <div className="collection-info">
                <h3 className="collection-name">Summer<br />Naturals</h3>
                <div className="collection-cta">Discover <span className="cta-arrow"></span></div>
              </div>
            </div>

            <div className="collection-card reveal" style={{ transitionDelay: "0.25s" }}>
              <div className="collection-bg" style={{ background: "linear-gradient(rgba(13,8,20,0.25), rgba(13,8,20,0.75)), url('/collection_noir.png') no-repeat center/cover", position: "absolute", inset: 0 }} />
              <div className="collection-overlay" style={{ background: "linear-gradient(to top,rgba(13,8,20,0.65) 0%,transparent 60%)" }} />
              <div className="collection-info">
                <h3 className="collection-name">Midnight<br />Noir</h3>
                <div className="collection-cta">Explore <span className="cta-arrow"></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOUNDER STORY */}
      <FounderStory />

      {/* WORN WITH LOVE TAGLINE */}
      <section className="worn-with-love-section reveal" id="sec3" style={{ textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="wwl-inner" style={{ textAlign: "center", width: "100%", maxWidth: "800px" }}>
          <p className="wwl-eyebrow" style={{ textAlign: "center", width: "100%" }}>Worn with Love</p>
          <h2 className="wwl-title wwl-typewriter" style={{ textAlign: "center", width: "100%" }}>
            <span className="wwl-typewriter-text">Made to be <em>kept forever</em></span>
          </h2>
          <div className="wwl-divider" />
        </div>
      </section>

      {/* NEWSLETTER */}
      <div className="newsletter reveal" id="sec5">
        <p className="section-eyebrow">Stay close</p>
        <h3 className="newsletter-title">The Solviera Letter</h3>
        <p className="newsletter-sub">New collections, rare leathers, and stories from the atelier — delivered slowly.</p>
        <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <button
            type="submit"
            disabled={isSubscribing}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isSubscribing ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>

      {/* FOOTER */}
      <div className="footer-outer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col-brand">
              <div className="footer-brand">Solviera</div>
              <p className="footer-tagline">Handcrafted leather tote bags.<br />Made in Florence, carried everywhere.</p>
            </div>
            <div className="footer-col">
              <p className="footer-heading">Shop</p>
              <ul className="footer-links">
                <li><a href="#sec-curated">New Arrivals</a></li>
                <li><a href="#sec-collections">Collections</a></li>
                <li><a href="#sec-curated">Bestsellers</a></li>
                <li><a href="#">Gift Cards</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-heading">Atelier</p>
              <ul className="footer-links">
                <li><a href="#sec-story">Our Story</a></li>
                <li><Link href="/workshop-experience">Craftsmanship</Link></li>
                <li><Link href="/workshop-experience">Materials</Link></li>
                <li><a href="#">Journal</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-heading">Support</p>
              <ul className="footer-links">
                <li><a href="#">Sizing guide</a></li>
                <li><a href="#">Care &amp; repair</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Solviera. All rights reserved.</span>
            <span className="footer-copy">Made with care in Florence, Italy.</span>
          </div>
        </div>
      </div>

      {/* CART DRAWER PANEL (RESTORED) */}
      <div className={`cart-drawer ${isCartOpen ? "open" : ""}`} id="cartDrawer">
        <div className="cart-header">
          <h3 className="cart-title">Your Bag</h3>
          <button onClick={() => setIsCartOpen(false)} className="close-drawer">
            ✕
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="text-center text-soft-brown py-16 text-xs tracking-wider">
              Your bag is empty.
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="cart-item">
                <img className="cart-item-img" src={item.imgSrc} alt={item.name} />
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-price">₹{item.price.toLocaleString("en-IN")}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => changeQty(idx, -1)} className="qty-btn">-</button>
                    <span className="qty-val">{item.qty}</span>
                    <button onClick={() => changeQty(idx, 1)} className="qty-btn">+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(idx)} className="cart-remove">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-price">₹{cartTotal.toLocaleString("en-IN")}</span>
          </div>
          <button onClick={handleProceedCheckout} className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL (RESTORED) */}
      <div className={`checkout-modal ${isCheckoutOpen ? "open" : ""}`} id="checkoutModal">
        <div className="checkout-content">
          <button onClick={() => setIsCheckoutOpen(false)} className="checkout-close">
            ✕
          </button>
          <h3 className="checkout-title">
            {checkoutStep === "shipping" && "Shipping Details"}
            {checkoutStep === "payment" && "Secure Payment"}
            {checkoutStep === "processing" && "Processing Order..."}
            {checkoutStep === "success" && "Order Placed"}
          </h3>

          <form onSubmit={handleCheckoutSubmit}>
            {/* Step 1: Shipping Details */}
            <div className={`form-step ${checkoutStep === "shipping" ? "active" : ""}`}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  placeholder="Isabelle Mercer"
                  required={checkoutStep === "shipping"}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={shipEmail}
                  onChange={(e) => setShipEmail(e.target.value)}
                  placeholder="isabelle@example.com"
                  required={checkoutStep === "shipping"}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(e.target.value)}
                  placeholder="24 Rue de Rivoli"
                  required={checkoutStep === "shipping"}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                    placeholder="Paris"
                    required={checkoutStep === "shipping"}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={shipZip}
                    onChange={(e) => setShipZip(e.target.value)}
                    placeholder="75001"
                    required={checkoutStep === "shipping"}
                  />
                </div>
              </div>
              <div className="step-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (!shipName || !shipEmail || !shipAddress || !shipCity || !shipZip) {
                      triggerToast("Please fill out all shipping details.", true);
                      return;
                    }
                    setCheckoutStep("payment");
                  }}
                  className="btn-next cursor-pointer"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>

            {/* Step 2: Payment Details */}
            <div className={`form-step ${checkoutStep === "payment" ? "active" : ""}`}>
              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="ISABELLE MERCER"
                  required={checkoutStep === "payment"}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberInput(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  maxLength={19}
                  required={checkoutStep === "payment"}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardExpiry}
                    onChange={(e) => handleCardExpiryInput(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    required={checkoutStep === "payment"}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    className="form-input"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="•••"
                    maxLength={3}
                    required={checkoutStep === "payment"}
                  />
                </div>
              </div>
              <div className="step-actions">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("shipping")}
                  className="btn-back cursor-pointer"
                >
                  Back
                </button>
                <button type="submit" className="btn-next cursor-pointer">
                  Complete Purchase (₹{cartTotal.toLocaleString("en-IN")})
                </button>
              </div>
            </div>

            {/* Step 3: Processing */}
            <div className={`form-step ${checkoutStep === "processing" ? "active" : ""}`} style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="animate-spin inline-block w-10 h-10 border-[3px] border-beige border-t-warm-brown rounded-full mb-5" />
              <p className="text-white text-sm tracking-wider">Securing your luxurious purchase...</p>
            </div>

            {/* Step 4: Success */}
            <div className={`form-step ${checkoutStep === "success" ? "active" : ""}`} style={{ textAlign: "center" }}>
              <div className="text-5xl text-accent mb-4">✦</div>
              <h4 className="font-serif text-2xl text-white mb-2">Thank You for Your Order</h4>
              <p className="text-soft-brown text-xs leading-relaxed mb-6">
                Your order of luxury Solviera totes is confirmed. A tracking reference and receipt have been dispatched.
              </p>
              
              <div className="bg-black/50 border border-mocha/15 rounded-2xl p-5 text-left mb-6">
                <div className="flex justify-between mb-2 text-xs text-soft-brown">
                  <span>ORDER REFERENCE</span>
                  <span className="text-accent font-bold">{orderRef}</span>
                </div>
                <div className="flex justify-between text-xs text-soft-brown">
                  <span>ESTIMATED DELIVERY</span>
                  <span className="text-white">3-5 Business Days</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="checkout-btn cursor-pointer"
              >
                Return to Atelier
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TOAST PANEL (RESTORED) */}
      <div
        id="toast"
        className={`fixed bottom-6 right-6 z-[9999] bg-sand/95 border border-mocha/30 rounded-2xl py-4 px-6 shadow-2xl transition-all duration-500 ease-out translate-y-[120px] opacity-0 ${
          showToast ? "translate-y-0 opacity-100" : ""
        }`}
        style={{
          background: toastIsError ? "rgba(239, 68, 68, 0.95)" : "rgba(27, 17, 42, 0.95)",
          border: toastIsError ? "0.5px solid rgba(239, 68, 68, 0.4)" : "0.5px solid rgba(167, 139, 250, 0.3)",
        }}
      >
        <span className="text-white text-xs tracking-wider font-light">{toastMsg}</span>
      </div>
    </div>
  );
}
