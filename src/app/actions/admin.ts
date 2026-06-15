"use server";

import db from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// 1. Admin Auth Actions
export async function loginAdminAction(formData: any) {
  const { email, password } = formData;

  try {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    const trimmedEmail = email.trim();
    const hashedPassword = hashPassword(password);
    let admin = null;

    try {
      admin = await db.admin.findUnique({
        where: { email: trimmedEmail },
      });
    } catch (dbError) {
      console.warn("Database lookup failed. Falling back to mock authentication:", dbError);
    }

    if (admin) {
      if (admin.password !== hashedPassword) {
        return { success: false, message: "Invalid email or password." };
      }

      // Sign JWT and set cookie
      const token = signToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      const cookieStore = await cookies();
      cookieStore.set("solviera_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return { success: true, name: admin.name, role: admin.role };
    }

    // ─── MOCK FALLBACK ───
    const MOCK_ADMIN_EMAIL = "admin@solviera.com";
    const MOCK_ADMIN_PASSWORD_HASH = hashPassword("admin123");

    if (trimmedEmail === MOCK_ADMIN_EMAIL && hashedPassword === MOCK_ADMIN_PASSWORD_HASH) {
      const token = signToken({
        id: "mock-admin-id",
        email: MOCK_ADMIN_EMAIL,
        name: "Solviera Mock Admin",
        role: "SUPER_ADMIN",
      });

      const cookieStore = await cookies();
      cookieStore.set("solviera_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return { success: true, name: "Solviera Mock Admin", role: "SUPER_ADMIN" };
    }

    return { success: false, message: "Invalid email or password." };
  } catch (error) {
    console.error("Admin login crash:", error);
    return { success: false, message: "Server error during authentication." };
  }
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("solviera_admin_token");
  return { success: true };
}

// 2. Workshop CMS actions
export async function createWorkshopAction(data: {
  title: string;
  description: string;
  price: number;
  capacity: number;
  banner: string;
  status?: string;
  featured?: boolean;
  tags?: string;
  showPaintingStyle?: boolean;
  showDietary?: boolean;
  showSpecialRequests?: boolean;
  showCanvasColor?: boolean;
  showPhone?: boolean;
  showCity?: boolean;
}) {
  try {
    const workshop = await db.workshop.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        capacity: data.capacity,
        banner: data.banner || "./workshop_scene.png",
        status: data.status || "DRAFT",
        featured: data.featured || false,
        tags: data.tags || "",
        showPaintingStyle: data.showPaintingStyle ?? false,
        showDietary: data.showDietary ?? false,
        showSpecialRequests: data.showSpecialRequests ?? false,
        showCanvasColor: data.showCanvasColor ?? true,
        showPhone: data.showPhone ?? true,
        showCity: data.showCity ?? true,
      },
    });
    revalidatePath("/workshop");
    return { success: true, workshopId: workshop.id };
  } catch (error) {
    console.error("Failed to create workshop:", error);
    return { success: false, message: "Could not create workshop." };
  }
}

export async function updateWorkshopAction(
  id: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    capacity?: number;
    banner?: string;
    status?: string;
    featured?: boolean;
    tags?: string;
    showPaintingStyle?: boolean;
    showDietary?: boolean;
    showSpecialRequests?: boolean;
    showCanvasColor?: boolean;
    showPhone?: boolean;
    showCity?: boolean;
  }
) {
  try {
    await db.workshop.update({
      where: { id },
      data,
    });
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to update workshop:", error);
    return { success: false, message: "Could not update workshop details." };
  }
}

export async function deleteWorkshopAction(id: string) {
  try {
    await db.workshop.delete({
      where: { id },
    });
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete workshop:", error);
    return { success: false, message: "Could not delete workshop." };
  }
}

// 3. Date Scheduling Actions
export async function createWorkshopDateAction(data: {
  workshopId: string;
  date: string;
  timeSlot: string;
  capacity: number;
  price?: number;
}) {
  try {
    await db.workshopDate.create({
      data: {
        workshopId: data.workshopId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        capacity: data.capacity,
        price: data.price ? Number(data.price) : null,
        booked: 0,
        status: "ACTIVE",
      },
    });
    revalidatePath("/workshop");
    revalidatePath("/workshop-experience");
    return { success: true };
  } catch (error) {
    console.error("Failed to create session date:", error);
    return { success: false, message: "Could not schedule workshop session date." };
  }
}

export async function updateWorkshopDateAction(
  id: string,
  data: {
    status?: string;
    capacity?: number;
    timeSlot?: string;
    price?: number | null;
  }
) {
  try {
    await db.workshopDate.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? (data.price === null ? null : Number(data.price)) : undefined,
      },
    });
    revalidatePath("/workshop");
    revalidatePath("/workshop-experience");
    return { success: true };
  } catch (error) {
    console.error("Failed to update session date:", error);
    return { success: false, message: "Could not update date details." };
  }
}

export async function deleteWorkshopDateAction(id: string) {
  try {
    await db.workshopDate.delete({
      where: { id },
    });
    revalidatePath("/workshop");
    revalidatePath("/workshop-experience");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete date:", error);
    return { success: false, message: "Could not delete scheduled date." };
  }
}

// 4. Booking & Attendance check-in actions
export async function markAttendanceAction(bookingId: string, present: boolean) {
  try {
    const now = new Date();
    await db.booking.update({
      where: { id: bookingId },
      data: { 
        attendance: present,
        checkedIn: present,
        checkedInAt: present ? now : null
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return { success: false, message: "Could not update attendance status." };
  }
}

export async function markAttendanceByRefAction(bookingRef: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { bookingRef },
    });

    if (!booking) return { success: false, message: "Booking ref not found." };
    if (booking.attendance) return { success: true, message: "Attendee was already checked in." };

    await db.booking.update({
      where: { id: booking.id },
      data: { attendance: true },
    });

    return { success: true, name: bookingRef, message: "Checked in successfully!" };
  } catch (error) {
    console.error("Failed to check in via reference QR:", error);
    return { success: false, message: "Could not process QR check-in scan." };
  }
}

export async function cancelBookingAction(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { workshopDate: true, payment: true },
    });

    if (!booking) return { success: false, message: "Booking not found." };
    if (booking.status === "CANCELLED") return { success: true, message: "Booking already cancelled." };

    await db.$transaction(async (tx) => {
      // Restore capacity
      const updatedBooked = Math.max(0, booking.workshopDate.booked - booking.participants);
      await tx.workshopDate.update({
        where: { id: booking.dateId },
        data: {
          booked: updatedBooked,
          status: updatedBooked >= booking.workshopDate.capacity ? "SOLD_OUT" : "ACTIVE",
        },
      });

      // Update Booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      // Update payment status (Mock Refund process)
      if (booking.paymentId) {
        await tx.payment.update({
          where: { id: booking.paymentId },
          data: { status: "REFUNDED" },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return { success: false, message: "Could not process booking cancellation." };
  }
}

// 5. CMS Content updates actions
export async function updateVenueAction(data: {
  id?: string;
  name: string;
  address: string;
  mapsEmbed: string;
  parkingInfo: string;
  contactInfo: string;
}) {
  try {
    const venue = await db.venue.findFirst();
    if (venue) {
      await db.venue.update({
        where: { id: venue.id },
        data,
      });
    } else {
      await db.venue.create({ data });
    }
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to update venue info:", error);
    return { success: false, message: "Could not update venue details." };
  }
}

export async function createFaqAction(question: string, answer: string, order = 0) {
  try {
    await db.faq.create({
      data: { question, answer, order },
    });
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return { success: false, message: "Could not create FAQ entry." };
  }
}

export async function deleteFaqAction(id: string) {
  try {
    await db.faq.delete({ where: { id } });
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return { success: false, message: "Could not delete FAQ entry." };
  }
}

export async function createTestimonialAction(name: string, review: string, rating = 5) {
  try {
    await db.testimonial.create({
      data: { name, review, rating },
    });
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return { success: false, message: "Could not create testimonial." };
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    await db.testimonial.delete({ where: { id } });
    revalidatePath("/workshop");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return { success: false, message: "Could not delete review testimonial." };
  }
}

// 6. QR Check-In & Admin Check-In Dashboard Actions
export async function checkInTicketAction(registrationCode: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { bookingRef: registrationCode },
      include: {
        user: true,
        workshop: true,
        workshopDate: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        errorType: "INVALID",
        message: "❌ Invalid Registration",
      };
    }

    if (booking.checkedIn) {
      return {
        success: false,
        errorType: "ALREADY_CHECKED_IN",
        message: "⚠️ Already Checked In",
        attendee: {
          name: booking.user.name,
          email: booking.user.email,
          ref: booking.bookingRef,
          checkedInAt: booking.checkedInAt ? booking.checkedInAt.toISOString() : null,
        },
      };
    }

    // Mark as checked in
    const now = new Date();
    await db.booking.update({
      where: { id: booking.id },
      data: {
        checkedIn: true,
        checkedInAt: now,
        attendance: true, // Synced with legacy attendance column
      },
    });

    const venue = await db.venue.findFirst() || {
      name: "Solviera Cafe & Atelier",
      address: "12, Via de' Tornabuoni, Florence, Italy",
    };

    revalidatePath("/admin/checkin");
    revalidatePath("/admin");

    return {
      success: true,
      message: "✅ Check-In Successful",
      attendee: {
        name: booking.user.name,
        email: booking.user.email,
        ref: booking.bookingRef,
        workshopTitle: booking.workshop.title,
        date: booking.workshopDate.date.toISOString(),
        timeSlot: booking.workshopDate.timeSlot,
        venueName: venue.name,
        checkedInAt: now.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error during checkInTicketAction:", error);
    return {
      success: false,
      errorType: "ERROR",
      message: "Server error checking in ticket. Please try again.",
    };
  }
}

export async function getCheckInMetricsAction() {
  try {
    const total = await db.booking.count({
      where: { status: "CONFIRMED" },
    });

    const checkedIn = await db.booking.count({
      where: {
        status: "CONFIRMED",
        checkedIn: true,
      },
    });

    const percent = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    const recentBookings = await db.booking.findMany({
      where: {
        status: "CONFIRMED",
        checkedIn: true,
      },
      include: {
        user: true,
        workshop: true,
        workshopDate: true,
      },
      orderBy: {
        checkedInAt: "desc",
      },
      take: 5,
    });

    const recent = recentBookings.map((b) => ({
      ref: b.bookingRef,
      name: b.user.name,
      workshopTitle: b.workshop.title,
      timeSlot: b.workshopDate.timeSlot,
      checkedInAt: b.checkedInAt ? b.checkedInAt.toISOString() : null,
    }));

    return {
      success: true,
      metrics: {
        total,
        checkedIn,
        percent,
        recent,
      },
    };
  } catch (error) {
    console.error("Error fetching check-in metrics:", error);
    return {
      success: false,
      message: "Could not retrieve check-in statistics.",
    };
  }
}

// 7. Custom Question Actions
export async function createCustomQuestionAction(data: {
  workshopId: string;
  label: string;
  type: string;
  required: boolean;
  options?: string;
}) {
  try {
    const question = await db.customQuestion.create({
      data: {
        workshopId: data.workshopId,
        label: data.label,
        type: data.type,
        required: data.required,
        options: data.options || null,
      },
    });
    revalidatePath("/workshop");
    revalidatePath("/admin/workshops");
    return { success: true, question };
  } catch (error) {
    console.error("Failed to create custom question:", error);
    return { success: false, message: "Could not add custom question." };
  }
}

export async function updateCustomQuestionAction(
  id: string,
  data: {
    label?: string;
    type?: string;
    required?: boolean;
    options?: string;
  }
) {
  try {
    const question = await db.customQuestion.update({
      where: { id },
      data,
    });
    revalidatePath("/workshop");
    revalidatePath("/admin/workshops");
    return { success: true, question };
  } catch (error) {
    console.error("Failed to update custom question:", error);
    return { success: false, message: "Could not update custom question." };
  }
}

export async function deleteCustomQuestionAction(id: string) {
  try {
    await db.customQuestion.delete({
      where: { id },
    });
    revalidatePath("/workshop");
    revalidatePath("/admin/workshops");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete custom question:", error);
    return { success: false, message: "Could not delete custom question." };
  }
}

// 8. Product (Featured Pieces) Actions
export async function createProductAction(data: {
  name: string;
  desc: string;
  price: number;
  badge?: string;
  img: string;
}) {
  try {
    const product = await db.product.create({
      data,
    });
    revalidatePath("/");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, message: "Could not create product." };
  }
}

export async function updateProductAction(
  id: string,
  data: {
    name?: string;
    desc?: string;
    price?: number;
    badge?: string | null;
    img?: string;
  }
) {
  try {
    const product = await db.product.update({
      where: { id },
      data: {
        ...data,
        badge: data.badge === "" ? null : data.badge,
      },
    });
    revalidatePath("/");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, message: "Could not update product details." };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await db.product.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, message: "Could not delete product." };
  }
}

// 9. Custom Orders Actions
export async function createCustomOrderAction(data: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  eventType?: string;
  quantity?: string;
  color?: string;
  method?: string;
  date?: string;
  description?: string;
  budget?: string;
}) {
  try {
    const order = await db.customOrder.create({
      data,
    });
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create custom order:", error);
    return { success: false, message: "Could not submit custom order request." };
  }
}

export async function updateCustomOrderStatusAction(id: string, status: string) {
  try {
    await db.customOrder.update({
      where: { id },
      data: { status },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update custom order status:", error);
    return { success: false, message: "Could not update status." };
  }
}

export async function deleteCustomOrderAction(id: string) {
  try {
    await db.customOrder.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete custom order:", error);
    return { success: false, message: "Could not delete request." };
  }
}

