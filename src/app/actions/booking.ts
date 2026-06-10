"use server";

// ─── DEMO MODE ─── All DB calls replaced with static mock data for deployment demo.

// Action to fetch all active dates and their availability
export async function getActiveDatesAction() {
  try {
    // Generate demo dates in the future
    const now = new Date();
    const dates = [
      {
        id: "demo-date-1",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0).toISOString(),
        timeSlot: "10:00 AM – 1:00 PM",
        price: 3500,
        workshopTitle: "Solviera Craft Workshop",
        capacity: 12,
        booked: 4,
        remaining: 8,
        isSoldOut: false,
      },
      {
        id: "demo-date-2",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 14, 0).toISOString(),
        timeSlot: "2:00 PM – 5:00 PM",
        price: 3500,
        workshopTitle: "Solviera Craft Workshop",
        capacity: 12,
        booked: 8,
        remaining: 4,
        isSoldOut: false,
      },
      {
        id: "demo-date-3",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 10, 0).toISOString(),
        timeSlot: "10:00 AM – 1:00 PM",
        price: 3500,
        workshopTitle: "Solviera Craft Workshop",
        capacity: 12,
        booked: 2,
        remaining: 10,
        isSoldOut: false,
      },
    ];

    return { success: true, dates };
  } catch (error) {
    console.error("Failed to fetch active dates:", error);
    return { success: false, message: "Could not retrieve available dates." };
  }
}

interface InitializeBookingData {
  name: string;
  email: string;
  phone: string;
  city: string;
  dateId: string;
  participants: number;
  bagColor: string;
  style: string;
  notes?: string;
}

// Action to initialize a booking and generate Razorpay order (Demo: returns mock order)
export async function initializeBookingAction(data: InitializeBookingData) {
  const { participants, style } = data;

  try {
    if (!data.name || !data.email || !data.phone || !data.dateId || !participants || !data.bagColor || !style) {
      return { success: false, message: "Missing required booking details." };
    }

    let basePrice = 3500;
    if (style === "Brush + Block Printing") basePrice = 5500;
    else if (style === "Block Printing") basePrice = 3800;

    const subtotal = basePrice * participants;
    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;

    // Demo: return a mock order (no real Razorpay call)
    return {
      success: true,
      orderId: `demo_order_${Date.now()}`,
      amount: grandTotal * 100,
      currency: "INR",
      pricing: { subtotal, tax, grandTotal },
      paymentRecordId: `demo_payment_${Date.now()}`,
      isDemo: true,
    };
  } catch (error) {
    console.error("Failed to initialize booking order:", error);
    return { success: false, message: "Could not create payment order. Try again." };
  }
}

interface ConfirmBookingData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    city: string;
  };
  bookingInfo: {
    dateId: string;
    participants: number;
    bagColor: string;
    style: string;
    notes?: string;
  };
}

// Action to confirm a booking (Demo: returns a mock booking ref)
export async function confirmBookingAction(data: ConfirmBookingData) {
  try {
    const randomRef = Math.floor(100000 + Math.random() * 900000);
    const bookingRef = `SLV-WK-${randomRef}`;

    return {
      success: true,
      bookingId: `demo_booking_${Date.now()}`,
      bookingRef,
    };
  } catch (error) {
    console.error("Failed to confirm booking:", error);
    return { success: false, message: "Could not complete booking." };
  }
}

export async function getBookingByRefAction(bookingRef: string) {
  // Demo: return a mock booking
  return {
    success: true,
    booking: {
      ref: bookingRef,
      name: "Demo Guest",
      email: "demo@solviera.com",
      phone: "+91 98765 43210",
      workshopTitle: "Solviera Craft Workshop",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeSlot: "10:00 AM – 1:00 PM",
      bagColor: "White",
      style: "Brush Painting",
      participants: 1,
      amount: 4130,
      qrCode: "",
      status: "CONFIRMED",
    },
  };
}
