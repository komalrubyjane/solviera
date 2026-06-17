"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { db } from "@/lib/db";

// Action to fetch all active dates and their availability
export async function getActiveDatesAction() {
  try {
    const dbDates = await db.workshopDate.findMany({
      where: {
        status: "ACTIVE",
        date: {
          gte: new Date(),
        },
      },
      include: {
        workshop: {
          include: {
            questions: {
              orderBy: {
                createdAt: "asc"
              }
            }
          }
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const dates = dbDates.map((d) => ({
      id: d.id,
      date: d.date.toISOString(),
      timeSlot: d.timeSlot,
      price: d.price ?? d.workshop.price,
      workshopTitle: d.workshop.title,
      capacity: d.capacity,
      booked: d.booked,
      remaining: Math.max(0, d.capacity - d.booked),
      isSoldOut: d.booked >= d.capacity || d.status === "SOLD_OUT",
      showPaintingStyle: d.workshop.showPaintingStyle,
      showDietary: d.workshop.showDietary,
      showSpecialRequests: d.workshop.showSpecialRequests,
      showCanvasColor: d.workshop.showCanvasColor,
      showPhone: d.workshop.showPhone,
      showCity: d.workshop.showCity,
      questions: d.workshop.questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        options: q.options || "",
      })),
    }));

    return { success: true, dates };
  } catch (error) {
    console.error("Failed to fetch active dates:", error);
    return { success: false, message: "Could not retrieve available dates." };
  }
}

interface InitializeBookingData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  dateId: string;
  participants: number;
  bagColor: string;
  style: string;
  notes?: string;
}

// Action to initialize a booking and generate Razorpay order
export async function initializeBookingAction(data: InitializeBookingData) {
  const { participants, style } = data;

  try {
    if (!data.name || !data.email || !data.dateId || !participants || !data.bagColor || !style) {
      return { success: false, message: "Missing required booking details." };
    }

    const wDate = await db.workshopDate.findUnique({
      where: { id: data.dateId },
      include: { workshop: true },
    });

    if (!wDate) {
      return { success: false, message: "Selected session date not found." };
    }

    const basePrice = wDate.price ?? wDate.workshop.price;

    const subtotal = basePrice * participants;
    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payment = await db.payment.create({
      data: {
        razorpayOrderId: orderId,
        amount: grandTotal,
        status: "PENDING",
      },
    });

    return {
      success: true,
      orderId: payment.razorpayOrderId,
      amount: grandTotal * 100, // paise
      currency: "INR",
      pricing: { subtotal, tax, grandTotal },
      paymentRecordId: payment.id,
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
    phone?: string;
    city?: string;
  };
  bookingInfo: {
    dateId: string;
    participants: number;
    bagColor: string;
    style: string;
    notes?: string;
    customAnswers?: Record<string, string>;
  };
}

// Action to confirm a booking, generate QR, and increment seat registration
export async function confirmBookingAction(data: ConfirmBookingData) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, personalInfo, bookingInfo } = data;

  try {
    let user = await db.user.findUnique({
      where: { email: personalInfo.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: personalInfo.email,
          name: personalInfo.name,
          phone: personalInfo.phone,
        },
      });
    }

    const payment = await db.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: "SUCCESSFUL",
      },
    });

    const wDate = await db.workshopDate.findUnique({
      where: { id: bookingInfo.dateId },
      include: { workshop: true },
    });

    if (!wDate) {
      return { success: false, message: "Session date not found." };
    }

    if (wDate.booked + bookingInfo.participants > wDate.capacity) {
      return { success: false, message: "Not enough remaining seats in this session." };
    }

    const randomRef = Math.floor(100000 + Math.random() * 900000);
    const bookingRef = `SLV-WK-${randomRef}`;

    // Generate QR pointing to: https://workshopdate.com/ticket/[bookingRef]
    const ticketUrl = `https://workshopdate.com/ticket/${bookingRef}`;
    const qrCodeBase64 = await QRCode.toDataURL(ticketUrl, {
      color: {
        dark: "#4A4035",
        light: "#FAF6EE",
      },
      width: 300,
      margin: 2,
    });

    const booking = await db.booking.create({
      data: {
        bookingRef,
        userId: user.id,
        workshopId: wDate.workshopId,
        dateId: wDate.id,
        bagColor: bookingInfo.bagColor,
        style: bookingInfo.style,
        participants: bookingInfo.participants,
        notes: bookingInfo.notes || "",
        totalAmount: payment.amount,
        status: "CONFIRMED",
        paymentId: payment.id,
        qrCodeUrl: qrCodeBase64,
        customAnswers: bookingInfo.customAnswers || {},
      },
    });

    await db.workshopDate.update({
      where: { id: wDate.id },
      data: {
        booked: {
          increment: bookingInfo.participants,
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/workshops");
    revalidatePath("/workshop");

    return {
      success: true,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
    };
  } catch (error) {
    console.error("Failed to confirm booking:", error);
    return { success: false, message: "Could not complete booking." };
  }
}

export async function getBookingByRefAction(bookingRef: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { bookingRef },
      include: {
        user: true,
        workshop: true,
        workshopDate: true,
      },
    });

    if (!booking) {
      return { success: false, message: "Booking not found." };
    }

    const venue = await db.venue.findFirst() || {
      name: "Solviera Cafe & Atelier",
      address: "12, Via de' Tornabuoni, Florence, Italy",
    };

    return {
      success: true,
      booking: {
        ref: booking.bookingRef,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || "",
        workshopTitle: booking.workshop.title,
        date: booking.workshopDate.date.toISOString(),
        timeSlot: booking.workshopDate.timeSlot,
        bagColor: booking.bagColor,
        style: booking.style,
        participants: booking.participants,
        amount: booking.totalAmount,
        qrCode: booking.qrCodeUrl || "",
        status: booking.status,
        venueName: venue.name,
        venueAddress: venue.address,
      },
    };
  } catch (error) {
    console.error("Failed to retrieve booking by ref:", error);
    return { success: false, message: "Could not fetch ticket details." };
  }
}

export async function getUpcomingSessionAction() {
  try {
    const dbDates = await db.workshopDate.findMany({
      where: {
        status: "ACTIVE",
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 1,
    });

    const venue = await db.venue.findFirst() || {
      name: "Solviera Cafe & Atelier",
      address: "Florence",
    };

    if (dbDates.length === 0) {
      return { success: true, upcomingSession: null, venue };
    }

    const d = dbDates[0];
    return {
      success: true,
      upcomingSession: {
        id: d.id,
        date: d.date.toISOString(),
        timeSlot: d.timeSlot,
      },
      venue,
    };
  } catch (error) {
    console.error("Failed to fetch upcoming session:", error);
    return { success: false, error: "Failed to fetch upcoming session" };
  }
}

export async function getProductsAction() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "asc" },
    });
    return {
      success: true,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        desc: p.desc,
        price: `₹${p.price.toLocaleString()}`,
        priceNum: p.price,
        badge: p.badge,
        img: p.img,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, message: "Could not fetch products from catalog." };
  }
}

