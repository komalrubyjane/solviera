const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Clearing database tables...');
  await prisma.admin.deleteMany({});
  await prisma.workshopDate.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.venue.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.testimonial.deleteMany({});

  console.log('Seeding administrative users...');
  const adminPassword = hashPassword('admin123');
  await prisma.admin.create({
    data: {
      email: 'admin@solviera.com',
      password: adminPassword,
      name: 'Solviera Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Created Admin: admin@solviera.com / admin123');

  console.log('Seeding default workshop metadata...');
  const workshop = await prisma.workshop.create({
    data: {
      title: 'Tote Bag Painting Workshop',
      description: 'Transform a simple heavy-canvas tote bag into a personal piece of art. Explore fabric colors, experiment with traditional woodblock stamps, and leave with a handcrafted creation that is uniquely yours. Classes are hosted by master artisans in our sunlit Tornabuoni atelier.',
      price: 3500.0,
      capacity: 12,
      banner: './workshop_scene.png',
      status: 'PUBLISHED',
      featured: true,
      tags: 'Painting,Block Printing,Crafts,Atelier',
    },
  });

  console.log('Seeding active workshop calendar dates...');
  // Seed dates: July 5, July 12, July 19, July 26 (all Sundays in 2026)
  const sessionDates = [
    { date: new Date('2026-07-05T10:00:00Z'), timeSlot: 'Morning (10:00 - 13:00)' },
    { date: new Date('2026-07-12T10:00:00Z'), timeSlot: 'Morning (10:00 - 13:00)' },
    { date: new Date('2026-07-19T10:00:00Z'), timeSlot: 'Morning (10:00 - 13:00)' },
    { date: new Date('2026-07-26T10:00:00Z'), timeSlot: 'Morning (10:00 - 13:00)' },
  ];

  for (const item of sessionDates) {
    await prisma.workshopDate.create({
      data: {
        workshopId: workshop.id,
        date: item.date,
        timeSlot: item.timeSlot,
        capacity: 12,
        booked: 0,
        status: 'ACTIVE',
      },
    });
  }

  console.log('Seeding venue details...');
  await prisma.venue.create({
    data: {
      name: 'Solviera Cafe & Atelier',
      address: '12, Via de\' Tornabuoni, Florence, Italy',
      mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2881.0827618218153!2d11.250552776829777!3d43.771141344795325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132a56a6442657ab%3A0x8cf25e79ff39e14a!2sVia%20de&#39;%20Tornabuoni%2C%2050123%20Firenze%20FI%2C%20Italy!5e0!3m2!1sen!2sin!4v1718029000000!5m2!1sen!2sin',
      parkingInfo: 'Valet parking available at the Tornabuoni garage. Public parking within 200m walking distance.',
      contactInfo: '+39 055 123 4567 | atelier@solviera.com',
    },
  });

  console.log('Seeding FAQs...');
  const faqs = [
    {
      question: 'Do I need painting experience?',
      answer: 'No experience is required. Our workshop hosts guide you through design templates, brushes, and color choices step-by-step.',
      order: 1,
    },
    {
      question: 'What is included in the ticket?',
      answer: 'A premium heavy-canvas tote bag (in choice of Ivory White or Noir Black), professional brushes, custom pigments, woodblock stamps, and gourmet coffee/tea refreshments.',
      order: 2,
    },
    {
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Rescheduling is free up to 48 hours before your session. Cancellations are eligible for a full refund if requested at least 72 hours in advance.',
      order: 3,
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }

  console.log('Seeding testimonials...');
  const testimonials = [
    {
      name: 'Alessia Rossi',
      review: 'A magical afternoon in Florence. I created a gorgeous botanical bag that I carry everywhere. The tutors were wonderfully helpful!',
      rating: 5,
    },
    {
      name: 'Julian Vance',
      review: 'Loved the block printing stamps! Getting to work with heritage wooden blocks was an incredible tactile experience. Highly recommended.',
      rating: 5,
    },
    {
      name: 'Meera Nair',
      review: 'Highly professional, relaxing, and aesthetic. The workspace has a beautiful glassmorphic lounge vibe. I will definitely book another session.',
      rating: 5,
    },
  ];

  for (const item of testimonials) {
    await prisma.testimonial.create({ data: item });
  }

  console.log('Seeding complete! Database ready.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
