"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  PartyPopper, 
  HeartHandshake, 
  Sparkles, 
  ArrowRight,
  Package,
  Brush,
  Scissors,
  Truck,
  X,
  Upload,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

// --- Types ---
type QuoteFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  eventType: string;
  quantity: string;
  color: string;
  method: string;
  date: string;
  description: string;
  budget: string;
};

// --- Animations ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

// --- Subcomponents ---

// Animated Counter
const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="trust-stat">
      <div className="stat-number">{count}{value >= 100 || value === 50 || value === 25 ? "+" : "%"}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default function BeyondTheStudio() {
  // Parallax Setup for Visual Experience
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Quantity Visualizer State
  const [selectedQty, setSelectedQty] = useState<number>(100);
  const quantities = [100, 250, 500, 1000];

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselImages = [
    { src: "/tote_crochet.png", title: "Corporate Gift Bags", subtitle: "Tech Summit 2024" },
    { src: "/tote_hibiscus.png", title: "Wedding Welcome Bags", subtitle: "Tuscany Celebration" },
    { src: "/tote_starry_cat.png", title: "Event Merchandise", subtitle: "Art Biennale" },
    { src: "/workshop_scene.png", title: "Brand Collaborations", subtitle: "Exclusive Launch" }
  ];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"quote" | "contact">("quote");
  const [formState, setFormState] = useState<QuoteFormState>({
    name: "", company: "", email: "", phone: "", eventType: "", 
    quantity: "", color: "", method: "", date: "", description: "", budget: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mouse Parallax for Visual Scene
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setFormState({
          name: "", company: "", email: "", phone: "", eventType: "", 
          quantity: "", color: "", method: "", date: "", description: "", budget: ""
        });
      }, 3000);
    }, 1500);
  };

  return (
    <section className="beyond-studio-section" ref={containerRef} onMouseMove={handleMouseMove}>
      
      {/* 1. SECTION HEADER */}
      <div className="bs-container">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="bs-header text-center" style={{ marginBottom: "100px" }}
        >
          <motion.p variants={fadeUp} className="section-eyebrow">Custom Orders</motion.p>
          <motion.h2 variants={fadeUp} className="bs-title">From One <em>Masterpiece</em> <br/>To <strong>Hundreds</strong></motion.h2>
          <motion.p variants={fadeUp} className="bs-sub max-w-2xl mx-auto mt-6">
            After creating your own tote bag in our workshops, discover how Solviera brings creativity to brands, events, celebrations, communities, and businesses through custom-crafted tote bags designed to leave a lasting impression.
          </motion.p>
        </motion.div>
      </div>

      {/* 2. VISUAL EXPERIENCE */}
      <div className="bs-container" style={{ marginBottom: "120px" }}>
        <div className="bs-visual-split">
          <motion.div style={{ y: y1 }} className="bs-visual-content">
            <div className="bs-visual-card p-12">
              <h3 className="text-3xl font-serif text-dark-mocha mb-4">The Atelier at Scale</h3>
              <p className="text-mocha font-light leading-relaxed mb-8">
                Every bulk order receives the same devotion as a single bespoke piece. From selecting the finest organic canvas to hand-mixing dyes and precision brush painting, your vision becomes a tactile reality.
              </p>
              <ul className="bs-feature-list space-y-4">
                <li className="flex items-center gap-3 text-mocha"><Sparkles className="text-accent w-5 h-5"/> Premium Illustration Style</li>
                <li className="flex items-center gap-3 text-mocha"><Sparkles className="text-accent w-5 h-5"/> Custom Logo & Artwork Integration</li>
                <li className="flex items-center gap-3 text-mocha"><Sparkles className="text-accent w-5 h-5"/> Sustainable Packaging</li>
              </ul>
            </div>
          </motion.div>
          
          <div className="bs-visual-scene">
            {/* Abstract animated scene resembling a studio */}
            <div className="bs-scene-canvas">
              <motion.div 
                className="bs-floating-tote tote-1"
                animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ x: mousePos.x * -1, y: mousePos.y * -1 }}
              >
                <img src="/tote_hibiscus.png" alt="Custom Tote" />
              </motion.div>
              <motion.div 
                className="bs-floating-tote tote-2"
                animate={{ y: [0, 20, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ x: mousePos.x * 1.5, y: mousePos.y * 1.5 }}
              >
                <img src="/tote_crochet.png" alt="Custom Tote" />
              </motion.div>
              
              {/* Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="bs-particle"
                  animate={{ 
                    y: [0, -100 - Math.random() * 50],
                    opacity: [0, 1, 0],
                    scale: [0, Math.random() + 0.5, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity, 
                    delay: Math.random() * 2 
                  }}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    bottom: `${10 + Math.random() * 20}%`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SERVICES GRID */}
      <div className="bs-container" style={{ marginBottom: "120px" }}>
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="bs-services-grid"
        >
          {[
            { icon: Briefcase, title: "Corporate Gifting", desc: "Custom tote bags for employee gifts, client appreciation, conferences, and brand activations." },
            { icon: PartyPopper, title: "Events & Festivals", desc: "Beautiful event merchandise for workshops, exhibitions, fairs, college fests, and community gatherings." },
            { icon: HeartHandshake, title: "Weddings & Celebrations", desc: "Personalized tote bags for weddings, bridal showers, birthdays, and special occasions." },
            { icon: Sparkles, title: "Brand Collaborations", desc: "Exclusive tote bag collections featuring your artwork, branding, and creative vision." }
          ].map((service, idx) => (
            <motion.div key={idx} variants={fadeUp} className="bs-service-card group">
              <div className="bs-service-icon-wrap">
                <service.icon className="bs-service-icon group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="bs-service-title">{service.title}</h4>
              <p className="bs-service-desc">{service.desc}</p>
              <div className="bs-service-glow"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 4. QUANTITY VISUALIZER */}
      <div className="bs-quantity-section" style={{ marginBottom: "120px" }}>
        <div className="bs-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-serif text-dark-mocha mb-4">Built For Small Batches & Large Dreams</h3>
            <p className="text-mocha">No minimum creativity. No maximum ambition.</p>
          </motion.div>
          
          <div className="bs-qty-visualizer">
            <div className="bs-qty-selectors">
              {quantities.map((qty) => (
                <button 
                  key={qty}
                  className={`bs-qty-btn ${selectedQty === qty ? 'active' : ''}`}
                  onClick={() => setSelectedQty(qty)}
                  onMouseEnter={() => setSelectedQty(qty)}
                >
                  {qty}{qty === 1000 ? "+" : ""} Bags
                </button>
              ))}
            </div>
            
            <div className="bs-qty-display">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedQty}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="bs-qty-stack"
                >
                  {/* Visual representation of quantity using CSS bags */}
                  <div className="bs-stack-graphic" style={{ opacity: Math.min(selectedQty / 1000 + 0.2, 1) }}>
                    {[...Array(Math.min(selectedQty / 25, 20))].map((_, i) => (
                      <div key={i} className="bs-stack-item" style={{ bottom: `${i * 8}px`, zIndex: 20 - i, left: `calc(50% + ${Math.sin(i)*10}px)` }}>
                        <img src="/tote_starry_cat.png" alt="Stack item" className="w-24 h-24 object-contain" />
                      </div>
                    ))}
                  </div>
                  <div className="bs-qty-label text-center mt-8">
                    <span className="text-4xl font-serif text-dark-mocha">{selectedQty}{selectedQty === 1000 ? "+" : ""}</span>
                    <span className="text-sm text-mocha block mt-2 tracking-widest uppercase">Custom Masterpieces</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PROCESS TIMELINE */}
      <div className="bs-container" style={{ marginBottom: "120px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">How It Works</p>
          <h2 className="text-4xl font-serif text-dark-mocha mt-2">The Creation Process</h2>
        </motion.div>
        
        <motion.div
          className="bs-timeline"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {[
            { icon: Sparkles, title: "Share Your Vision", desc: "Tell us about your event, idea, audience, or occasion." },
            { icon: Brush, title: "Choose Your Style", desc: "Select tote bag color, printing method, and customization options." },
            { icon: Scissors, title: "Craft & Produce", desc: "Our team carefully creates each tote bag using premium materials." },
            { icon: Truck, title: "Delivered To You", desc: "Receive your custom order ready for gifting, branding, or celebration." }
          ].map((step, idx) => (
            <motion.div key={idx} variants={fadeUp} className="bs-timeline-step group">
              <div className="bs-timeline-marker">
                <div className="bs-timeline-dot"><step.icon className="w-5 h-5 text-accent"/></div>
                {idx < 3 && <div className="bs-timeline-line"></div>}
              </div>
              <div className="bs-timeline-content">
                <h4 className="text-xl font-medium text-dark-mocha mb-2 group-hover:text-accent transition-colors">Step {idx + 1}: {step.title}</h4>
                <p className="text-mocha font-light text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>


      {/* 7. TRUST SECTION & 8. CLIENT TYPES */}
      <div className="bs-container" style={{ marginBottom: "80px" }}>
        <motion.div
          className="bs-trust-grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <AnimatedCounter value={500} label="Custom Tote Bags Created" />
          <AnimatedCounter value={50} label="Events Served" />
          <AnimatedCounter value={25} label="Brand Collaborations" />
          <AnimatedCounter value={100} label="Handcrafted With Care" />
        </motion.div>
        
        <motion.div
          style={{ marginTop: "80px", textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-eyebrow mb-8">Trusted By</p>
          <motion.div
            className="bs-client-chips"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {["Startups", "Creative Brands", "Corporate Teams", "Wedding Planners", "Artists", "Colleges", "Communities", "Event Organizers"].map((client, i) => (
              <motion.span key={i} variants={fadeUp} className="bs-chip">{client}</motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* 9. CALL TO ACTION */}
      <div className="bs-container" style={{ marginBottom: "80px", marginTop: "120px" }}>
        <motion.div
          className="bs-cta-box"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="bs-cta-bg"></div>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif text-dark-mocha mb-6">Have Something <em>Bigger</em> In Mind?</h2>
            <p className="text-mocha text-lg mb-10">From intimate gatherings to large-scale events, we're ready to create something meaningful together.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => { setModalMode("quote"); setIsModalOpen(true); }} className="btn-primary cursor-pointer text-sm px-8 py-4 !rounded-full">Request A Custom Order</button>
              <button onClick={() => { setModalMode("contact"); setIsModalOpen(true); }} className="btn-ghost cursor-pointer text-sm px-8 py-4 !rounded-full">Talk To Our Team</button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 10. QUOTE REQUEST MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="bs-modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="bs-modal-backdrop" 
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bs-modal-content"
            >
              <button className="bs-modal-close" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5"/>
              </button>
              
              <div className="bs-modal-header">
                <h3 className="text-2xl font-serif text-dark-mocha">
                  {modalMode === "quote" ? "Request a Custom Order" : "Talk to Our Team"}
                </h3>
                <p className="text-sm text-mocha mt-1">
                  {modalMode === "quote" 
                    ? "Fill out the details below and our atelier will get back to you within 24 hours."
                    : "Have a general question, collaboration proposal, or event inquiry? Let's start a conversation."}
                </p>
              </div>
              
              {isSuccess ? (
                <div className="bs-modal-success flex flex-col items-center justify-center py-20">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-accent mb-4" />
                  </motion.div>
                  <h4 className="text-xl font-serif text-dark-mocha mb-2">Request Received</h4>
                  <p className="text-mocha text-center">Thank you! Our creative team will review your requirements and reach out shortly.</p>
                </div>
              ) : (
                <div className="bs-modal-body custom-scrollbar">
                  {modalMode === "quote" ? (
                    <form onSubmit={handleQuoteSubmit} className="bs-form">
                      
                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Full Name</label>
                          <input required type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Jane Doe"/>
                        </div>
                        <div className="bs-form-group">
                          <label>Company / Organization</label>
                          <input type="text" value={formState.company} onChange={e => setFormState({...formState, company: e.target.value})} placeholder="Acme Corp"/>
                        </div>
                      </div>
                      
                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Email Address</label>
                          <input required type="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} placeholder="jane@example.com"/>
                        </div>
                        <div className="bs-form-group">
                          <label>Phone Number</label>
                          <input type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} placeholder="+1 (555) 000-0000"/>
                        </div>
                      </div>

                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Event Type / Purpose</label>
                          <select required value={formState.eventType} onChange={e => setFormState({...formState, eventType: e.target.value})}>
                            <option value="">Select an option...</option>
                            <option value="corporate">Corporate Gifting</option>
                            <option value="wedding">Wedding</option>
                            <option value="event">Event / Festival</option>
                            <option value="brand">Brand Collaboration</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="bs-form-group">
                          <label>Required Quantity</label>
                          <select required value={formState.quantity} onChange={e => setFormState({...formState, quantity: e.target.value})}>
                            <option value="">Select quantity...</option>
                            <option value="25-50">25 - 50 Bags</option>
                            <option value="51-100">51 - 100 Bags</option>
                            <option value="101-250">101 - 250 Bags</option>
                            <option value="251-500">251 - 500 Bags</option>
                            <option value="500+">500+ Bags</option>
                          </select>
                        </div>
                      </div>

                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Preferred Tote Color</label>
                          <select value={formState.color} onChange={e => setFormState({...formState, color: e.target.value})}>
                            <option value="">Any</option>
                            <option value="natural">Natural Canvas</option>
                            <option value="black">Midnight Black</option>
                            <option value="custom">Custom Color (500+ only)</option>
                          </select>
                        </div>
                        <div className="bs-form-group">
                          <label>Delivery Date</label>
                          <input type="date" value={formState.date} onChange={e => setFormState({...formState, date: e.target.value})}/>
                        </div>
                      </div>

                      <div className="bs-form-group">
                        <label>Project Description & Vision</label>
                        <textarea required rows={4} value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} placeholder="Tell us about the design, artwork, and aesthetic you have in mind..."></textarea>
                      </div>

                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Budget Range</label>
                          <select value={formState.budget} onChange={e => setFormState({...formState, budget: e.target.value})}>
                            <option value="">Select budget range...</option>
                            <option value="under-1000">Under $1,000</option>
                            <option value="1000-5000">$1,000 - $5,000</option>
                            <option value="5000-10000">$5,000 - $10,000</option>
                            <option value="10000+">$10,000+</option>
                          </select>
                        </div>
                        <div className="bs-form-group pt-6">
                          <button type="button" className="bs-upload-btn w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Design File (Optional)
                          </button>
                        </div>
                      </div>

                      <div className="bs-modal-footer mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              Processing...
                            </>
                          ) : (
                            "Submit Request"
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleQuoteSubmit} className="bs-form">
                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Full Name</label>
                          <input required type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Jane Doe"/>
                        </div>
                        <div className="bs-form-group">
                          <label>Email Address</label>
                          <input required type="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} placeholder="jane@example.com"/>
                        </div>
                      </div>

                      <div className="bs-form-row">
                        <div className="bs-form-group">
                          <label>Phone Number (Optional)</label>
                          <input type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} placeholder="+1 (555) 000-0000"/>
                        </div>
                        <div className="bs-form-group">
                          <label>Inquiry Type</label>
                          <select required value={formState.eventType} onChange={e => setFormState({...formState, eventType: e.target.value})}>
                            <option value="">Select a topic...</option>
                            <option value="general">General Inquiry</option>
                            <option value="collaboration">Brand Collaboration</option>
                            <option value="press">Press & Media</option>
                            <option value="private-workshop">Private / Group Workshop</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="bs-form-group">
                        <label>Your Message</label>
                        <textarea required rows={5} value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} placeholder="Tell us how we can help you..."></textarea>
                      </div>

                      <div className="bs-modal-footer mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              Sending...
                            </>
                          ) : (
                            "Send Message"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
