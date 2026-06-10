"use server";

import db from "@/lib/db";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";
import { generateBookingQRCode } from "@/lib/qrcode";
import { sendEmail, getBookingConfirmationTemplate, getPaymentReceiptTemplate, getAdminNotificationTemplate } from "@/lib/email";

// Action to fetch all active dates and their availability
export async function getActiveDatesAction() {
  try {
    const dates = await db.workshopDate.findMany({
      where: {
        status: "ACTIVE",
        date: {
          gte: new Date(), // Only future dates
        },
      },
      include: {
        workshop: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return {
      success: true,
      dates: dates.map((d) => {
        const remaining = d.capacity - d.booked;
        return {
          id: d.id,
          date: d.date.toISOString(),
          timeSlot: d.timeSlot,
          price: d.workshop.price,
          workshopTitle: d.workshop.title,
          capacity: d.capacity,
          booked: d.booked,
          remaining: Math.max(0, remaining),
          isSoldOut: remaining <= 0,
        };
      }),
    };
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

// Action to initialize a booking and generate Razorpay order
export async function initializeBookingAction(data: InitializeBookingData) {
  const { name, email, phone, city, dateId, participants, bagColor, style, notes } = data;

  try {
    // 1. Validate inputs
    if (!name || !email || !phone || !dateId || !participants || !bagColor || !style) {
      return { success: false, message: "Missing required booking details." };
    }

    // 2. Fetch active date and check capacity
    const selectedDate = await db.workshopDate.findUnique({
      where: { id: dateId },
      include: { workshop: true },
    });

    if (!selectedDate || selectedDate.status !== "ACTIVE") {
      return { success: false, message: "Selected date is no longer active." };
    }

    const remainingSeats = selectedDate.capacity - selectedDate.booked;
    if (remainingSeats < participants) {
      return {
        success: false,
        message: `Only ${remainingSeats} seat(s) remaining for this date.`,
      };
    }

    // 3. Price calculations (Pricing details: ₹3,500 base price. Adjust if dual style chosen)
    let basePrice = selectedDate.workshop.price;
    if (style === "Brush + Block Printing") {
      basePrice = 5500.0; // Dual craft pricing
    } else if (style === "Block Printing") {
      basePrice = 3800.0; // Block printing pricing
    } else {
      basePrice = 3500.0; // Brush painting pricing
    }

    const subtotal = basePrice * participants;
    const tax = subtotal * 0.18; // 18% GST
    const grandTotal = subtotal + tax;

    // 4. Generate unique mock receipt ID
    const tempRefNum = Math.floor(100000 + Math.random() * 900000);
    const receiptId = `SLV-REC-${tempRefNum}`;

    // 5. Create Razorpay Order
    const order = await createRazorpayOrder(grandTotal, receiptId);

    // 6. Record pending Payment record
    const paymentRecord = await db.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount: grandTotal,
        status: "PENDING",
      },
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
      pricing: {
        subtotal,
        tax,
        grandTotal,
      },
      paymentRecordId: paymentRecord.id,
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

// Action to verify signature and complete the booking registration
export async function confirmBookingAction(data: ConfirmBookingData) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, personalInfo, bookingInfo } = data;

  try {
    // 1. Verify Payment Signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      return { success: false, message: "Payment verification failed. Invalid signature." };
    }

    // 2. Start transaction
    const result = await db.$transaction(async (tx) => {
      // Find and update payment record
      const paymentRecord = await tx.payment.findUnique({
        where: { razorpayOrderId },
      });

      if (!paymentRecord) {
        throw new Error("Payment record matching order ID not found.");
      }

      if (paymentRecord.status === "SUCCESSFUL") {
        // Already processed
        return { alreadyProcessed: true, paymentRecordId: paymentRecord.id };
      }

      // Lock date check capacity
      const wDate = await tx.workshopDate.findUnique({
        where: { id: bookingInfo.dateId },
        include: { workshop: true },
      });

      if (!wDate) {
        throw new Error("Selected date schedule not found.");
      }

      const remaining = wDate.capacity - wDate.booked;
      if (remaining < bookingInfo.participants) {
        throw new Error("Atelier seats sold out during transaction.");
      }

      // Update Date capacity
      const updatedBooked = wDate.booked + bookingInfo.participants;
      await tx.workshopDate.update({
        where: { id: wDate.id },
        data: {
          booked: updatedBooked,
          status: updatedBooked >= wDate.capacity ? "SOLD_OUT" : "ACTIVE",
        },
      });

      // Find or Create User
      let user = await tx.user.findUnique({
        where: { email: personalInfo.email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email: personalInfo.email,
            name: personalInfo.name,
            phone: personalInfo.phone,
          },
        });
      } else {
        // Update phone just in case
        await tx.user.update({
          where: { id: user.id },
          data: { phone: personalInfo.phone },
        });
      }

      // Update Payment status
      await tx.payment.update({
        where: { id: paymentRecord.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "SUCCESSFUL",
        },
      });

      // Generate unique reference
      const randomRef = Math.floor(100000 + Math.random() * 900000);
      const bookingRef = `SLV-WK-${randomRef}`;

      // Create check-in QR Code
      const qrCodeDataUrl = await generateBookingQRCode(bookingRef);

      // Create Booking record
      const booking = await tx.booking.create({
        data: {
          bookingRef,
          userId: user.id,
          workshopId: wDate.workshopId,
          dateId: wDate.id,
          bagColor: bookingInfo.bagColor,
          style: bookingInfo.style,
          participants: bookingInfo.participants,
          notes: bookingInfo.notes,
          totalAmount: paymentRecord.amount,
          status: "CONFIRMED",
          qrCode: qrCodeDataUrl,
          paymentId: paymentRecord.id,
        },
        include: {
          workshop: true,
          workshopDate: true,
        },
      });

      return {
        alreadyProcessed: false,
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        amount: booking.totalAmount,
        qrCode: qrCodeDataUrl,
        workshopTitle: booking.workshop.title,
        date: booking.workshopDate.date.toISOString(),
        timeSlot: booking.workshopDate.timeSlot,
      };
    });

    if (result.alreadyProcessed) {
      return { success: true, message: "Booking already confirmed." };
    }

    const bookingResult = result as {
      alreadyProcessed: false;
      bookingId: string;
      bookingRef: string;
      amount: number;
      qrCode: string;
      workshopTitle: string;
      date: string;
      timeSlot: string;
    };

    // 3. Emit Emails (Non-blocking call to not slow down transaction result)
    const formattedDate = new Date(bookingResult.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const venue = await db.venue.findFirst() || {
      name: "Solviera Cafe & Atelier",
      address: "12, Via de' Tornabuoni, Florence, Italy",
    };

    const subtotal = bookingResult.amount / 1.18;
    const tax = bookingResult.amount - subtotal;

    // customer confirmation
    const confirmTemplate = getBookingConfirmationTemplate({
      name: personalInfo.name,
      bookingRef: bookingResult.bookingRef,
      workshopName: bookingResult.workshopTitle,
      dateStr: formattedDate,
      timeSlot: bookingResult.timeSlot,
      venueName: venue.name,
      venueAddress: venue.address,
      bagColor: bookingInfo.bagColor,
      style: bookingInfo.style,
      participants: bookingInfo.participants,
      totalAmount: bookingResult.amount,
      qrCodeDataUrl: bookingResult.qrCode,
    });
    await sendEmail({
      to: personalInfo.email,
      subject: `Booking Confirmed [${bookingResult.bookingRef}] — Solviera Atelier`,
      html: confirmTemplate,
      bookingRef: bookingResult.bookingRef,
    });

    // customer receipt
    const receiptTemplate = getPaymentReceiptTemplate({
      name: personalInfo.name,
      bookingRef: bookingResult.bookingRef,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      dateStr: new Date().toLocaleDateString(),
      amount: subtotal,
      tax: tax,
      total: bookingResult.amount,
    });
    await sendEmail({
      to: personalInfo.email,
      subject: `Payment Receipt [${bookingResult.bookingRef}] — Solviera Atelier`,
      html: receiptTemplate,
      bookingRef: `${bookingResult.bookingRef}_invoice`,
    });

    // admin alert
    const adminTemplate = getAdminNotificationTemplate({
      bookingRef: bookingResult.bookingRef,
      name: personalInfo.name,
      email: personalInfo.email,
      phone: personalInfo.phone,
      workshopName: bookingResult.workshopTitle,
      dateStr: `${formattedDate} (${bookingResult.timeSlot})`,
      totalAmount: bookingResult.amount,
    });
    await sendEmail({
      to: "admin@solviera.com",
      subject: `New Workshop Booking Alert — ${bookingResult.bookingRef}`,
      html: adminTemplate,
      bookingRef: `${bookingResult.bookingRef}_admin_alert`,
    });

    return {
      success: true,
      bookingId: bookingResult.bookingId,
      bookingRef: bookingResult.bookingRef,
    };
  } catch (error: any) {
    console.error("Signature verification and completion crashed:", error);
    return { success: false, message: error.message || "Could not complete booking transaction." };
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
    
    if (!booking) return { success: false, message: "Booking ref not found." };
    
    return {
      success: true,
      booking: {
        ref: booking.bookingRef,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
        workshopTitle: booking.workshop.title,
        date: booking.workshopDate.date.toISOString(),
        timeSlot: booking.workshopDate.timeSlot,
        bagColor: booking.bagColor,
        style: booking.style,
        participants: booking.participants,
        amount: booking.totalAmount,
        qrCode: booking.qrCode || "",
        status: booking.status,
      },
    };
  } catch (error) {
    console.error("Failed to retrieve booking ref details:", error);
    return { success: false, message: "Could not load booking details." };
  }
}
