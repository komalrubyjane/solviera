"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Palette, Scissors, Heart, Leaf } from "lucide-react";
import Image from "next/image";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
};

export default function FounderStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  
  // Parallax for mouse movement on left illustration
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 30;
    const y = (clientY / window.innerHeight - 0.5) * 30;
    setMousePos({ x, y });
  };

  return (
    <section className="founder-story-section" ref={containerRef}>
      
      {/* 1. Header */}
      <div className="fs-container" style={{ marginBottom: "120px" }}>
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.p variants={fadeUp} className="section-eyebrow">Our Story</motion.p>
          <motion.h2 variants={fadeUp} className="fs-title">The Two Threads Co.</motion.h2>
          <motion.p variants={fadeUp} className="fs-sub max-w-3xl mx-auto mt-6">
            What began as a shared love for creativity, craftsmanship, and meaningful design slowly evolved into Solviera — a space where everyday essentials become expressions of individuality.
          </motion.p>
        </motion.div>
      </div>

      {/* 2. Split Screen */}
      <div className="fs-container" style={{ marginBottom: "120px" }}>
        <div className="fs-split">
          
          {/* Left: Illustration Area */}
          <motion.div 
            style={{ y: y1 }} 
            className="fs-illustration-wrap"
            onMouseMove={handleMouseMove}
          >
            <div className="fs-illustration-bg"></div>
            
            {/* Abstract elements representing the studio */}
            <div className="fs-scene">
              <motion.div 
                className="fs-float-item fs-desk"
                style={{ x: mousePos.x * -0.5, y: mousePos.y * -0.5 }}
              />
              <motion.div 
                className="fs-float-item fs-tote"
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ x: mousePos.x * 1, y: mousePos.y * 1 }}
              >
                <img src="/tote_kitty.png" alt="Tote" className="w-full h-full object-contain drop-shadow-2xl" />
              </motion.div>
              
              <motion.div 
                className="fs-float-item fs-brushes"
                animate={{ y: [0, 8, 0], rotate: [-5, 0, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ x: mousePos.x * -1.5, y: mousePos.y * -1.5 }}
              >
                <Palette className="w-16 h-16 text-accent opacity-80" />
              </motion.div>
              
              <motion.div 
                className="fs-float-item fs-fabric"
                animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                style={{ x: mousePos.x * 0.8, y: mousePos.y * 0.8 }}
              />

              <div className="fs-founder-silhouettes">
                {/* Abstract representation of founders */}
                <div className="fs-silhouette f1"></div>
                <div className="fs-silhouette f2"></div>
              </div>
            </div>
          </motion.div>

          {/* Right: Story Content */}
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="fs-story-content"
          >
            <motion.p variants={fadeUp} className="fs-paragraph">
              Solviera was founded by two creators who believed that art belongs in everyday life. What started as conversations over sketches, ideas, and handmade experiments became a journey to create products that carry stories, memories, and personal expression.
            </motion.p>
            <motion.p variants={fadeUp} className="fs-paragraph">
              Every tote bag is designed with intention, balancing creativity, craftsmanship, and sustainability. We wanted to build more than a brand—we wanted to build experiences that inspire people to create, connect, and express themselves.
            </motion.p>
            <motion.p variants={fadeUp} className="fs-paragraph">
              From handcrafted collections to immersive workshops, Solviera continues to grow through the support of a community that values thoughtful design and meaningful creativity.
            </motion.p>
          </motion.div>
          
        </div>
      </div>

      {/* 3. Founder Cards */}
      <div className="fs-container" style={{ marginBottom: "120px" }}>
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="fs-founders-grid"
        >
          {/* Founder 1 */}
          <motion.div variants={fadeUp} className="fs-founder-card group">
            <div className="fs-founder-photo-wrap">
              <div className="fs-founder-placeholder f-placeholder-1"></div>
            </div>
            <div className="fs-founder-info">
              <h4 className="fs-founder-name">Purna</h4>
              <p className="fs-founder-role">Co-Founder & Creative Director</p>
              <div className="fs-founder-divider"></div>
              <p className="fs-founder-quote">"Creativity becomes meaningful when it can be carried into everyday life."</p>
            </div>
            <div className="fs-card-glow"></div>
          </motion.div>

          {/* Founder 2 */}
          <motion.div variants={fadeUp} className="fs-founder-card group">
            <div className="fs-founder-photo-wrap">
              <div className="fs-founder-placeholder f-placeholder-2"></div>
            </div>
            <div className="fs-founder-info">
              <h4 className="fs-founder-name">Deekshit</h4>
              <p className="fs-founder-role">Co-Founder &  Operations Director</p>
              <div className="fs-founder-divider"></div>
              <p className="fs-founder-quote">"The smallest handmade details often leave the biggest impression."</p>
            </div>
            <div className="fs-card-glow"></div>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. Values Section */}
      <div className="fs-values-section" style={{ marginBottom: "100px" }}>
        <div className="fs-container">
          <div className="text-center mb-16">
            <p className="section-eyebrow">Our Philosophy</p>
            <h2 className="text-4xl font-serif text-dark-mocha mt-2">The Pillars of Solviera</h2>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="fs-values-grid"
          >
            {[
              { icon: Scissors, title: "Craftsmanship", desc: "Every piece is thoughtfully created." },
              { icon: Palette, title: "Creativity", desc: "Designed to inspire self-expression." },
              { icon: Heart, title: "Community", desc: "Built through meaningful connections." },
              { icon: Leaf, title: "Sustainability", desc: "Made with conscious choices." }
            ].map((val, idx) => (
              <motion.div key={idx} variants={fadeUp} className="fs-value-card">
                <div className="fs-value-icon-wrap">
                  <val.icon className="w-6 h-6 text-mocha" />
                </div>
                <h4 className="fs-value-title">{val.title}</h4>
                <p className="fs-value-desc">{val.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 5. Highlighted Quote */}
      <div className="fs-container" style={{ marginBottom: "80px" }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-150px" }}
          className="fs-quote-block"
        >
          <Sparkles className="w-8 h-8 text-mocha/50 mx-auto mb-8" />
          <h2 className="fs-big-quote">
            "We didn't start Solviera to sell tote bags. <br className="hidden md:block"/>
            We started it to create moments of <em>creativity</em>, <em>connection</em>, and <em>self-expression</em>."
          </h2>
          <p className="fs-quote-author mt-8">— Purna & Deekshit</p>
        </motion.div>
      </div>

    </section>
  );
}
