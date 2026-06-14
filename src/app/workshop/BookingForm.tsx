"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveDatesAction, initializeBookingAction, confirmBookingAction } from "@/app/actions/booking";

// Zod validation schemas
const personalSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number (minimum 10 digits)"),
  city: z.string().min(2, "Please enter your city"),
});

const detailsSchema = z.object({
  dateId: z.string().min(1, "Please select an available workshop date"),
});

const customSchema = z.object({
  bagColor: z.enum(["White Tote Bag", "Black Tote Bag"], { required_error: "Please select a tote bag canvas color" }),
  bookingType: z.enum(["Single", "Couple", "Customise"], { required_error: "Please select a booking type" }),
  customSeats: z.number().min(1).max(20).optional(),
});

const notesSchema = z.object({});

type FormValues = z.infer<typeof personalSchema> & 
  z.infer<typeof detailsSchema> & 
  z.infer<typeof customSchema> & 
  z.infer<typeof notesSchema>;

interface ActiveDate {
  id: string;
  date: string;
  timeSlot: string;
  price: number;
  workshopTitle: string;
  capacity: number;
  booked: number;
  remaining: number;
  isSoldOut: boolean;
}

interface BookingFormProps {
  onHoverChange?: (hovered: boolean) => void;
}

export default function BookingForm({ onHoverChange }: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dates, setDates] = useState<ActiveDate[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricing, setPricing] = useState({ subtotal: 0, tax: 0, grandTotal: 0 });
  const [orderData, setOrderData] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastError, setToastError] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      step === 1 ? personalSchema :
      step === 2 ? detailsSchema :
      step === 3 ? customSchema :
      notesSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      dateId: "",
      bagColor: "White Tote Bag",
      bookingType: "Single",
      customSeats: 1,
    },
    mode: "onTouched",
  });

  const { control, handleSubmit, watch, formState: { errors } } = form;
  const watchedValues = watch();

  const handleHoverStart = () => {
    if (onHoverChange) onHoverChange(true);
  };

  const handleHoverEnd = () => {
    if (onHoverChange) onHoverChange(false);
  };

  // Load active dates
  useEffect(() => {
    async function loadDates() {
      setIsLoadingDates(true);
      const res = await getActiveDatesAction();
      if (res.success && res.dates) {
        setDates(res.dates);
      } else {
        showToast(res.message || "Failed to load active dates.", true);
      }
      setIsLoadingDates(false);
    }
    loadDates();
  }, []);

  // Update prices on customization change
  useEffect(() => {
    if (step < 3) return;
    
    const selectedDate = dates.find((d) => d.id === watchedValues.dateId);
    if (!selectedDate) return;
    
    const basePrice = selectedDate.price;
    let seats = 1;
    if (watchedValues.bookingType === "Couple") {
      seats = 2;
    } else if (watchedValues.bookingType === "Customise") {
      seats = watchedValues.customSeats || 1;
    }

    const sub = basePrice * seats;
    const tx = sub * 0.18;
    setPricing({
      subtotal: sub,
      tax: tx,
      grandTotal: sub + tx,
    });
  }, [watchedValues.bookingType, watchedValues.customSeats, watchedValues.dateId, step, dates]);

  const showToast = (msg: string, isErr = false) => {
    setToastMsg(msg);
    setToastError(isErr);
    const toast = document.getElementById("toast");
    if (toast) {
      toast.innerText = msg;
      if (isErr) {
        toast.style.borderColor = "rgba(239, 68, 68, 0.5)";
      } else {
        toast.style.borderColor = "rgba(167, 139, 250, 0.3)";
      }
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  const handleNextStep = async () => {
    const isStepValid = await form.trigger();
    if (isStepValid) {
      if (step === 3) {
        setIsSubmitting(true);
        const seats = watchedValues.bookingType === "Couple" ? 2 : watchedValues.bookingType === "Customise" ? (watchedValues.customSeats || 1) : 1;
        const res = await initializeBookingAction({
          name: watchedValues.name,
          email: watchedValues.email,
          phone: watchedValues.phone,
          city: watchedValues.city,
          dateId: watchedValues.dateId,
          participants: seats,
          bagColor: watchedValues.bagColor,
          style: watchedValues.bookingType,
          notes: undefined,
        });

        if (res.success && res.orderId) {
          setOrderData(res);
          setStep(4);
        } else {
          showToast(res.message || "Failed to create order. Try again.", true);
        }
        setIsSubmitting(false);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePayment = async () => {
    if (!orderData) return;
    setIsSubmitting(true);

    const keyId = "rzp_test_mockkey123";
    const seats = watchedValues.bookingType === "Couple" ? 2 : watchedValues.bookingType === "Customise" ? (watchedValues.customSeats || 1) : 1;

    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Solviera Atelier",
      description: "Tote Bag Painting Workshop",
      order_id: orderData.orderId,
      handler: async function (response: any) {
        showToast("Processing payment verification...");
        const result = await confirmBookingAction({
          razorpayOrderId: response.razorpay_order_id || orderData.orderId,
          razorpayPaymentId: response.razorpay_payment_id || "pay_mock_" + Math.random().toString(36).substring(2, 12),
          razorpaySignature: response.razorpay_signature || "sig_mock_" + Math.random().toString(36).substring(2, 12),
          personalInfo: {
            name: watchedValues.name,
            email: watchedValues.email,
            phone: watchedValues.phone,
            city: watchedValues.city,
          },
          bookingInfo: {
            dateId: watchedValues.dateId,
            participants: seats,
            bagColor: watchedValues.bagColor,
            style: watchedValues.bookingType,
            notes: undefined,
          },
        });

        if (result.success && result.bookingRef) {
          router.push(`/booking-success?ref=${result.bookingRef}`);
        } else {
          showToast(result.message || "Booking confirmation failed.", true);
          setIsSubmitting(false);
        }
      },
      prefill: {
        name: watchedValues.name,
        email: watchedValues.email,
        contact: watchedValues.phone,
      },
      theme: {
        color: "#2E1D47",
      },
    };

    if ((window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      console.log("[Mock Checkout] Simulating payment success handler...");
      showToast("Verification mock payment success...");
      
      const mockResult = await confirmBookingAction({
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: "pay_mock_" + Math.random().toString(36).substring(2, 12),
        razorpaySignature: "sig_mock_" + Math.random().toString(36).substring(2, 12),
        personalInfo: {
          name: watchedValues.name,
          email: watchedValues.email,
          phone: watchedValues.phone,
          city: watchedValues.city,
        },
        bookingInfo: {
          dateId: watchedValues.dateId,
          participants: seats,
          bagColor: watchedValues.bagColor,
          style: watchedValues.bookingType,
          notes: undefined,
        },
      });

      if (mockResult.success && mockResult.bookingRef) {
        router.push(`/booking-success?ref=${mockResult.bookingRef}`);
      } else {
        showToast(mockResult.message || "Booking confirmation failed.", true);
        setIsSubmitting(false);
      }
    }
  };

  const selectedDateObject = dates.find((d) => d.id === watchedValues.dateId);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="text-center mb-8">
        <p className="text-[10px] tracking-widest text-mocha uppercase mb-2">Step {step} of 4</p>
        <h2 className="font-serif text-3xl font-light text-white">
          {step === 1 && "Personal details"}
          {step === 2 && "Select Session Date"}
          {step === 3 && "Customize Your Tote"}
          {step === 4 && "Booking Summary"}
        </h2>
      </div>

      <div className="bg-gradient-to-br from-sand/80 to-cream/95 border border-mocha/25 rounded-3xl p-8 md:p-12 shadow-2xl relative">
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="form-input"
                          placeholder="e.g. Isabella Vance"
                          onFocus={handleHoverStart}
                          onBlur={handleHoverEnd}
                        />
                      )}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          className="form-input"
                          placeholder="e.g. isabella@solviera.com"
                          onFocus={handleHoverStart}
                          onBlur={handleHoverEnd}
                        />
                      )}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone Number</label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 9876543210"
                            onFocus={handleHoverStart}
                            onBlur={handleHoverEnd}
                          />
                        )}
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">City</label>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="form-input"
                            placeholder="e.g. Florence"
                            onFocus={handleHoverStart}
                            onBlur={handleHoverEnd}
                          />
                        )}
                      />
                      {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE SELECTION */}
              {step === 2 && (
                <div className="space-y-6">
                  <label className="form-label">Available Calendar Sessions</label>
                  {isLoadingDates ? (
                    <div className="text-center text-xs font-light text-soft-brown py-8">
                      Loading studio schedules...
                    </div>
                  ) : dates.length === 0 ? (
                    <div className="text-center text-xs font-light text-red-300 py-8">
                      No active dates scheduled. Check back later or contact admin.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      <Controller
                        name="dateId"
                        control={control}
                        render={({ field }) => (
                          <>
                            {dates.map((d) => {
                              const isSelected = field.value === d.id;
                              const formattedDateStr = new Date(d.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              });

                              return (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => field.onChange(d.id)}
                                  disabled={d.isSoldOut}
                                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex justify-between items-center ${
                                    isSelected
                                      ? "bg-beige/40 border-mocha shadow-[0_0_15px_rgba(167,139,250,0.2)]"
                                      : "bg-sand/40 border-mocha/10 hover:border-mocha/40"
                                  } ${d.isSoldOut ? "opacity-40 cursor-not-allowed" : ""}`}
                                  onMouseEnter={handleHoverStart}
                                  onMouseLeave={handleHoverEnd}
                                >
                                  <div>
                                    <h4 className="font-serif text-base text-white">{formattedDateStr}</h4>
                                    <p className="text-[10px] text-soft-brown mt-1 font-light">{d.timeSlot}</p>
                                  </div>
                                  <div className="text-right">
                                    {d.isSoldOut ? (
                                      <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">
                                        Sold Out
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-warm-brown font-light">
                                        {d.remaining} Seats Left
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        )}
                      />
                    </div>
                  )}
                  {errors.dateId && <p className="text-red-400 text-xs mt-1">{errors.dateId.message}</p>}
                </div>
              )}

              {/* STEP 3: CUSTOMIZATION */}
              {step === 3 && (
                <div className="space-y-8">
                  {/* Tote bag color */}
                  <div className="form-group">
                    <label className="form-label mb-3">Tote Bag Canvas Color</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="bagColor"
                        control={control}
                        render={({ field }) => (
                          <>
                            {["White Tote Bag", "Black Tote Bag"].map((color) => {
                              const isSelected = field.value === color;
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => field.onChange(color)}
                                  className={`py-4 rounded-xl border font-serif text-sm transition-all duration-300 ${
                                    isSelected
                                      ? "bg-beige/40 border-mocha text-white shadow-md"
                                      : "bg-sand/40 border-mocha/10 text-soft-brown hover:border-mocha/40"
                                  }`}
                                  onMouseEnter={handleHoverStart}
                                  onMouseLeave={handleHoverEnd}
                                >
                                  {color}
                                </button>
                              );
                            })}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  {/* Booking Type */}
                  <div className="form-group">
                    <label className="form-label mb-3">Booking Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Controller
                        name="bookingType"
                        control={control}
                        render={({ field }) => (
                          <>
                            {[
                              { name: "Single", desc: "1 Guest", icon: "👤" },
                              { name: "Couple", desc: "2 Guests", icon: "👥" },
                              { name: "Customise", desc: "Custom group", icon: "✨" },
                            ].map((opt) => {
                              const isSelected = field.value === opt.name;
                              return (
                                <button
                                  key={opt.name}
                                  type="button"
                                  onClick={() => field.onChange(opt.name)}
                                  className={`py-5 px-3 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                                    isSelected
                                      ? "bg-beige/40 border-mocha text-white shadow-md"
                                      : "bg-sand/40 border-mocha/10 text-soft-brown hover:border-mocha/40"
                                  }`}
                                  onMouseEnter={handleHoverStart}
                                  onMouseLeave={handleHoverEnd}
                                >
                                  <span className="text-xl">{opt.icon}</span>
                                  <span className="font-serif text-sm">{opt.name}</span>
                                  <span className="text-[10px] text-warm-brown font-light">{opt.desc}</span>
                                </button>
                              );
                            })}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  {/* Custom seats (only show when Customise is selected) */}
                  {watchedValues.bookingType === "Customise" && (
                    <div className="form-group">
                      <label className="form-label mb-3">Number of Seats (1-20)</label>
                      <Controller
                        name="customSeats"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="number"
                            className="form-input"
                            min={1}
                            max={20}
                            value={field.value || 1}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="Enter number of guests"
                            onFocus={handleHoverStart}
                            onBlur={handleHoverEnd}
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: SUMMARY & CHECKOUT */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-mocha/15 pb-4">
                     <h4 className="font-serif text-xl text-white mb-2">Tote Bag Atelier Painting Workshop</h4>
                     <p className="text-xs text-soft-brown font-light leading-relaxed">
                       Session Date: {selectedDateObject ? new Date(selectedDateObject.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""}
                       <br />
                       Time slot: {selectedDateObject?.timeSlot}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-light text-soft-brown pb-6 border-b border-mocha/15">
                    <div>
                      <strong>Canvas Color:</strong> {watchedValues.bagColor}
                    </div>
                    <div>
                      <strong>Booking Type:</strong> {watchedValues.bookingType}
                    </div>
                    <div>
                      <strong>Guests:</strong> {watchedValues.bookingType === "Couple" ? 2 : watchedValues.bookingType === "Customise" ? (watchedValues.customSeats || 1) : 1} Seat(s)
                    </div>
                    <div>
                      <strong>Location:</strong> Florence Atelier
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-light text-soft-brown">
                      <span>Subtotal:</span>
                      <span>₹{pricing.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-light text-soft-brown">
                      <span>Atelier Tax / GST (18%):</span>
                      <span>₹{pricing.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-serif text-white border-t border-mocha/10 pt-3">
                      <span>Grand Total:</span>
                      <span className="text-warm-brown">₹{pricing.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ACTION BUTTONS */}
          <div className="flex justify-between gap-4 mt-10">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="bg-transparent border border-mocha/30 text-mocha py-3 px-8 rounded-full uppercase text-xs tracking-wider transition-all duration-300 hover:bg-mocha/10"
                onMouseEnter={handleHoverStart}
                onMouseLeave={handleHoverEnd}
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleSubmit(handleNextStep)}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-warm-brown to-nude text-cream font-semibold py-3 px-8 rounded-full uppercase text-xs tracking-wider transition-all duration-300 ml-auto hover:scale-104 hover:shadow-[0_8px_15px_rgba(244,114,182,0.4)]"
                onMouseEnter={handleHoverStart}
                onMouseLeave={handleHoverEnd}
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePayment}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3.5 px-10 rounded-full uppercase text-xs tracking-wider transition-all duration-300 ml-auto hover:scale-104 hover:shadow-[0_8px_25px_rgba(244,114,182,0.6)]"
                onMouseEnter={handleHoverStart}
                onMouseLeave={handleHoverEnd}
              >
                {isSubmitting ? "Verifying signature..." : "Pay with Razorpay →"}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
