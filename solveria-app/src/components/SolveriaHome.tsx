import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Trash2, Sparkles } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  description: string;
  color: string;
  specs: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'rose-clutch',
    name: 'Rose Evening Clutch',
    tagline: 'Gilded Petals & Champagne Silk',
    price: 1850,
    image: '/assets/rose_clutch.png',
    description: 'An exquisite evening companion, featuring layered golden rose motifs hand-embossed onto Italian silk calfskin. Outfitted with a premium brass drop-in chain.',
    color: 'Champagne Gold',
    specs: ['Italian Silk Calfskin', '24k Gold-plated Hardware', '9" W x 5.5" H x 2" D', 'Hand-stitched in Florence']
  },
  {
    id: 'peony-tote',
    name: 'Peony Bloom Tote',
    tagline: 'Sculpted Petals & Ivory Pebbled Leather',
    price: 2450,
    image: '/assets/peony_tote.png',
    description: 'Inspired by the lush layers of opening peony blossoms. This structured tote features overlapping leather panels creating a gorgeous, organic sculptural silhouette.',
    color: 'Ivory Cream',
    specs: ['Pebbled French Calfskin', 'Solid Brass Closures', '13.5" W x 10" H x 6" D', 'Includes Matching Clutch Insert']
  },
  {
    id: 'sage-messenger',
    name: 'Sage Leaf Shoulder Bag',
    tagline: 'Draped Moss & Organic Leather',
    price: 2100,
    image: '/assets/sage_messenger.png',
    description: 'A relaxed, slouchy shoulder bag in a soothing sage green tone. Features a contoured saddle-strap design and custom leaf-embossed hardware for a refined organic feel.',
    color: 'Sage Moss Green',
    specs: ['Milled Grain Calfskin', 'Brushed Gold Details', '11.5" W x 8.5" H x 4.5" D', 'Adjustable Shoulder Strap']
  }
];

export default function SolveriaHome() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const boutiqueRef = useRef<HTMLDivElement>(null);
  const cartDrawerRef = useRef<HTMLDivElement>(null);

  // Entrance animations when homepage loads (stage complete)
  useEffect(() => {
    // 1. Animate Navigation
    gsap.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 }
    );

    // 2. Animate Hero text elements sequentially
    const heroElements = heroRef.current?.querySelectorAll('.animate-hero');
    if (heroElements) {
      gsap.fromTo(heroElements,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.25, ease: "power4.out", delay: 0.5 }
      );
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }];
    });

    // Open cart automatically on add to cart
    setIsCartOpen(true);

    // Subtle button animation / feedback
    const btn = document.getElementById(`btn-${product.id}`);
    if (btn) {
      gsap.timeline()
        .to(btn, { scale: 0.95, duration: 0.1 })
        .to(btn, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Cart Drawer open/close slide transition
  useEffect(() => {
    if (isCartOpen) {
      gsap.to(cartDrawerRef.current, {
        x: 0,
        duration: 0.6,
        ease: "power3.out"
      });
    } else {
      gsap.to(cartDrawerRef.current, {
        x: "100%",
        duration: 0.5,
        ease: "power3.inIn"
      });
    }
  }, [isCartOpen]);

  return (
    <div className="min-h-screen bg-brand-cream relative selection:bg-gold/30">
      
      {/* Navigation */}
      <nav 
        ref={navRef}
        className="fixed top-0 left-0 w-full z-40 glass-nav px-6 md:px-12 py-5 flex justify-between items-center opacity-0"
      >
        <div className="font-serif text-2xl tracking-[0.35em] text-brand-charcoal font-semibold uppercase cursor-pointer hover:opacity-85 transition-opacity">
          SOLVERIA
        </div>
        <div className="hidden md:flex gap-10 text-xs tracking-[0.25em] font-sans font-light uppercase text-brand-taupe">
          <a href="#collection" className="hover:text-brand-charcoal transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-brand-charcoal hover:after:w-full after:transition-all">Collection</a>
          <a href="#maison" className="hover:text-brand-charcoal transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-brand-charcoal hover:after:w-full after:transition-all">Maison</a>
          <a href="#boutique" className="hover:text-brand-charcoal transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-brand-charcoal hover:after:w-full after:transition-all">Boutique</a>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-brand-charcoal hover:text-gold transition-colors flex items-center gap-1.5 focus:outline-none"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-brand-charcoal text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </nav>

      {/* Hero Banner */}
      <header 
        ref={heroRef}
        className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-20"
      >
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute -top-1/4 -left-1/4 w-[70%] h-[70%] bg-gold-light/30 rounded-full ambient-glow" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-brand-sage/20 rounded-full ambient-glow" />
        </div>
        
        <div className="z-10 max-w-4xl">
          <p className="animate-hero text-xs tracking-[0.4em] text-brand-taupe uppercase font-light mb-4 opacity-0">
            Maison de l'Artisanat
          </p>
          <h1 className="animate-hero font-serif text-6xl md:text-8xl lg:text-9xl text-brand-charcoal tracking-[0.2em] font-light leading-none mb-6 select-none opacity-0">
            SOLVERIA
          </h1>
          <p className="animate-hero font-serif text-xl md:text-2xl text-brand-taupe italic font-light tracking-widest max-w-xl mx-auto leading-relaxed mb-10 opacity-0">
            "The Art of Carrying Beauty"
          </p>
          <div className="animate-hero opacity-0">
            <a 
              href="#collection" 
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-brand-taupe/40 text-xs tracking-[0.25em] uppercase text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-paper hover:border-brand-charcoal transition-all duration-500 rounded-sm font-light"
            >
              Explore Masterpieces
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 z-10 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-brand-taupe animate-pulse font-light">
          <span>SCROLL TO EXPLORE</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-brand-taupe to-transparent" />
        </div>
      </header>

      {/* Featured Collection Section */}
      <section 
        id="collection" 
        ref={collectionRef}
        className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-brand-taupe/10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-[10px] tracking-[0.3em] text-gold uppercase font-semibold">The 2026 Bloom Collection</span>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal mt-2 font-light">Sculpted Masterpieces</h2>
          </div>
          <p className="text-brand-taupe text-sm max-w-md mt-4 md:mt-0 font-light leading-relaxed">
            Handcrafted works of art blending structured leather craftsmanship with fluid, botanical silhouettes inspired by the organic shapes of nature.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <div 
              key={product.id}
              className="group bg-brand-paper p-6 rounded-sm border border-brand-taupe/10 hover:border-brand-taupe/20 transition-all duration-500 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden rounded-sm bg-brand-cream/40 mb-6 border border-brand-taupe/5">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-brand-charcoal/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-2xl text-brand-charcoal group-hover:text-gold transition-colors font-medium">
                    {product.name}
                  </h3>
                  <span className="font-serif text-lg text-brand-taupe font-light">
                    ${product.price}
                  </span>
                </div>
                <p className="text-xs text-gold font-light tracking-wider italic mb-3">
                  {product.tagline}
                </p>
                <p className="text-brand-taupe text-sm font-light leading-relaxed mb-6">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-brand-taupe/10 pt-4 flex gap-4">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 py-2.5 border border-brand-taupe/20 text-[10px] tracking-[0.2em] uppercase text-brand-taupe hover:text-brand-charcoal hover:border-brand-charcoal transition-colors rounded-sm font-light"
                >
                  Detail Specs
                </button>
                <button
                  id={`btn-${product.id}`}
                  onClick={() => addToCart(product)}
                  className="flex-1 py-2.5 bg-brand-charcoal text-brand-paper hover:bg-gold hover:text-brand-charcoal text-[10px] tracking-[0.2em] uppercase transition-colors rounded-sm font-light"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Narrative / Maison Section */}
      <section 
        id="maison" 
        ref={storyRef}
        className="bg-brand-paper py-24 md:py-32 px-6 md:px-12 border-y border-brand-taupe/10 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold-light/20 rounded-full ambient-glow pointer-events-none" />
            <div className="aspect-[4/5] max-w-md mx-auto rounded-sm overflow-hidden border border-brand-taupe/15 shadow-xl relative group">
              <img 
                src="/assets/peony_tote.png" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-brand-charcoal/10" />
            </div>
            <div className="absolute bottom-4 right-4 md:right-12 bg-brand-paper px-6 py-4 shadow-lg border border-brand-taupe/15 text-center">
              <span className="block font-serif text-3xl text-brand-charcoal font-semibold">100%</span>
              <span className="block text-[8px] tracking-[0.25em] text-brand-taupe uppercase mt-1">Handmade in Italy</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.3em] text-gold uppercase font-semibold">Our Heritage</span>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal mt-2 mb-6 font-light leading-tight">
              Honoring the Grace of Slow Creation
            </h2>
            <div className="space-y-6 text-brand-taupe text-sm font-light leading-relaxed">
              <p>
                At Solveria, we reject the industrial rush. Our bags are crafted like sculptures, taking inspiration from the blooming flowers that represent pure, delicate, and symmetric geometry. 
              </p>
              <p>
                Each petal panel on the <strong>Peony Bloom Tote</strong>, each gold foil detail on the <strong>Rose Clutch</strong> is individually cut, stained, and hand-sewn by a single artisan in our Florence workshop.
              </p>
              <p className="italic border-l border-gold/40 pl-4 py-1 text-brand-charcoal font-serif">
                "Beauty is not designed to be hurried. It is harvested, petal by petal, seam by seam."
              </p>
              <p>
                Using exclusively vegetable-tanned, certified sustainable full-grain leathers, our pieces are designed to evolve with you—growing richer and more full of character as time carries on.
              </p>
            </div>
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-brand-charcoal hover:text-gold transition-colors font-medium cursor-pointer">
                The Workshop Story
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Boutique Product Catalogue Grid */}
      <section 
        id="boutique" 
        ref={boutiqueRef}
        className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.3em] text-gold uppercase font-semibold">Curated Boutique</span>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal mt-2 font-light">Acquire a Solveria</h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map(product => (
            <div 
              key={`boutique-${product.id}`}
              className="bg-brand-paper rounded-sm overflow-hidden border border-brand-taupe/10 hover:shadow-lg transition-all duration-500 flex flex-col"
            >
              <div 
                className="aspect-square bg-brand-cream/30 overflow-hidden relative cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] tracking-widest text-brand-taupe uppercase font-light">{product.color}</span>
                    <span className="font-serif text-brand-charcoal font-medium">${product.price}</span>
                  </div>
                  <h3 
                    className="font-serif text-xl text-brand-charcoal hover:text-gold transition-colors font-medium mb-3 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-brand-taupe text-xs font-light leading-relaxed line-clamp-3 mb-6">
                    {product.description}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-3 bg-brand-charcoal hover:bg-gold text-brand-paper hover:text-brand-charcoal text-xs tracking-[0.25em] uppercase font-light transition-colors rounded-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Acquire Piece
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-[#d4cbbd] py-16 px-6 md:px-12 border-t border-[#8B7355]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-3xl text-gold tracking-widest uppercase">SOLVERIA</h3>
            <p className="text-xs text-brand-taupe tracking-wider font-light max-w-sm leading-relaxed">
              Maison de Couture dedicated to organic beauty, slow creation, and the heritage of Italian leather craftsmanship.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] text-white uppercase mb-4 font-medium">Collections</h4>
            <ul className="space-y-2 text-xs text-brand-taupe font-light">
              <li className="hover:text-gold cursor-pointer transition-colors">Bloom 2026</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Heritage Classics</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Bespoke Couture</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] text-white uppercase mb-4 font-medium">Boutiques</h4>
            <ul className="space-y-2 text-xs text-brand-taupe font-light">
              <li className="hover:text-gold cursor-pointer transition-colors">Florence, Italy</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Paris, France</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Tokyo, Japan</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[#8B7355]/15 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-brand-taupe font-light">
          <span>&copy; 2026 SOLVERIA MAISON. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-gold cursor-pointer transition-colors">PRIVACY POLICY</span>
            <span className="hover:text-gold cursor-pointer transition-colors">TERMS OF SERVICE</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsCartOpen(false)}
          className={`absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm pointer-events-auto transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Drawer Panel */}
        <div 
          ref={cartDrawerRef}
          className="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-brand-paper border-l border-brand-taupe/15 shadow-2xl p-6 md:p-8 flex flex-col justify-between pointer-events-auto translate-x-full"
        >
          <div>
            <div className="flex justify-between items-center border-b border-brand-taupe/15 pb-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-gold stroke-[1.5]" />
                <h3 className="font-serif text-2xl text-brand-charcoal font-semibold">Your Bouquet</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 hover:text-gold transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="mt-8 space-y-6 overflow-y-auto max-h-[60vh] pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-brand-taupe font-light space-y-4">
                  <p className="font-serif text-xl italic">Your bouquet is empty</p>
                  <p className="text-xs tracking-wider">Browse our collection to add beauty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-brand-taupe/5 pb-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover bg-brand-cream/50 rounded-sm border border-brand-taupe/10"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">{item.name}</h4>
                          <span className="font-serif text-brand-charcoal">${item.price * item.quantity}</span>
                        </div>
                        <span className="text-[10px] text-brand-taupe">Per piece: ${item.price}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-brand-taupe/20 rounded-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 px-2 text-brand-taupe hover:text-brand-charcoal"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs px-2 text-brand-charcoal font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 px-2 text-brand-taupe hover:text-brand-charcoal"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-brand-taupe hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout Block */}
          {cart.length > 0 && (
            <div className="border-t border-brand-taupe/15 pt-6 space-y-4 bg-brand-paper">
              <div className="flex justify-between items-end">
                <span className="text-xs tracking-[0.2em] text-brand-taupe uppercase">Total Value</span>
                <span className="font-serif text-3xl text-brand-charcoal font-semibold">${getCartTotal()}</span>
              </div>
              <button 
                onClick={() => {
                  alert('Order completed! Thank you for acquiring Solveria.');
                  setCart([]);
                  setIsCartOpen(false);
                }}
                className="w-full py-4 bg-brand-charcoal hover:bg-gold text-brand-paper hover:text-brand-charcoal text-xs tracking-[0.25em] uppercase font-light transition-colors rounded-sm flex items-center justify-center gap-2"
              >
                Acquire Bouquet
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[9px] text-brand-taupe text-center tracking-wider">
                Complimentary insured priority courier shipping on all orders.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Specification Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-brand-charcoal/50 backdrop-blur-md"
          />
          <div className="relative bg-brand-paper max-w-2xl w-full rounded-sm border border-brand-taupe/15 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 z-10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-brand-taupe hover:text-brand-charcoal transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full md:w-1/2 aspect-square bg-brand-cream/50 rounded-sm overflow-hidden border border-brand-taupe/10">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] tracking-widest text-brand-taupe uppercase font-light">Maison Specs</span>
                <h3 className="font-serif text-3xl text-brand-charcoal font-medium mt-1 mb-2">
                  {selectedProduct.name}
                </h3>
                <span className="font-serif text-xl text-gold font-light block mb-4">${selectedProduct.price}</span>
                <p className="text-brand-taupe text-sm font-light leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>
                <div className="space-y-2 border-t border-brand-taupe/10 pt-4">
                  <h4 className="text-[10px] tracking-[0.2em] text-brand-charcoal uppercase font-semibold">Materials & Details</h4>
                  <ul className="space-y-1">
                    {selectedProduct.specs.map((spec, i) => (
                      <li key={i} className="text-xs text-brand-taupe font-light flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-gold rounded-full" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="mt-8 w-full py-3.5 bg-brand-charcoal hover:bg-gold text-brand-paper hover:text-brand-charcoal text-xs tracking-[0.2em] uppercase font-light transition-colors rounded-sm"
              >
                Acquire Piece
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
