import React from "react";
import WorkshopClient from "./WorkshopClient";

export const revalidate = 0;

export default async function WorkshopPage() {
  // Static demo data — no database required
  const venue = {
    name: "Solviera Cafe & Atelier",
    address: "12, Via de' Tornabuoni, Florence, Italy",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2881.0827618218153!2d11.250552776829777!3d43.771141344795325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132a56a6442657ab%3A0x8cf25e79ff39e14a!2sVia%20de&#39;%20Tornabuoni%2C%2050123%20Firenze%20FI%2C%20Italy!5e0!3m2!1sen!2sin!4v1718029000000!5m2!1sen!2sin",
    parkingInfo:
      "Valet parking available at the Tornabuoni garage. Public parking within 200m walking distance.",
    contactInfo: "+91 98765 43210 | atelier@solviera.com",
  };

  const faqs = [
    {
      id: "1",
      question: "What will I make in the workshop?",
      answer:
        "You'll create your own hand-crafted tote bag using brush canvas painting or custom stencil techniques. All materials are provided.",
      order: 1,
    },
    {
      id: "2",
      question: "Do I need prior experience?",
      answer:
        "Not at all! Our workshops are designed for all skill levels. Our expert instructors will guide you through every step.",
      order: 2,
    },
    {
      id: "3",
      question: "How long is the workshop?",
      answer:
        "Each session is approximately 3 hours long, giving you plenty of time to create and personalise your tote bag.",
      order: 3,
    },
    {
      id: "4",
      question: "What is included in the price?",
      answer:
        "The price includes all materials (canvas tote, paints, stencils, brushes), expert guidance, refreshments, and you take home your finished creation.",
      order: 4,
    },
    {
      id: "5",
      question: "Can I bring a friend?",
      answer:
        "Absolutely! Group bookings are welcome. You can book for up to 6 participants in a single session.",
      order: 5,
    },
    {
      id: "6",
      question: "What is the cancellation policy?",
      answer:
        "You can cancel or reschedule up to 48 hours before your session for a full refund. After that, we offer a credit for a future session.",
      order: 6,
    },
  ];

  const testimonials = [
    {
      id: "1",
      name: "Priya Sharma",
      review:
        "Absolutely magical experience! The instructors were so patient and talented. I created the most beautiful tote bag and felt so proud of my work.",
      rating: 5,
      avatar: null,
    },
    {
      id: "2",
      name: "Ananya Mehta",
      review:
        "Came with my friends for a weekend activity and we all had a blast. The studio is gorgeous and the whole vibe is so luxurious yet welcoming.",
      rating: 5,
      avatar: null,
    },
    {
      id: "3",
      name: "Rohan Kapoor",
      review:
        "Gifted this experience to my wife for her birthday. She absolutely loved it! She's already planning to go back and create another design.",
      rating: 5,
      avatar: null,
    },
    {
      id: "4",
      name: "Sneha Iyer",
      review:
        "The attention to detail is incredible. From the premium materials to the guided technique, every part of the workshop felt premium and special.",
      rating: 5,
      avatar: null,
    },
  ];

  return (
    <WorkshopClient
      venue={venue}
      faqs={faqs}
      testimonials={testimonials}
    />
  );
}
