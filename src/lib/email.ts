import fs from 'fs';
import path from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  bookingRef?: string;
}

export async function sendEmail({ to, subject, html, bookingRef }: EmailOptions) {
  console.log(`[Email Service] Sending email to ${to} | Subject: "${subject}"`);
  
  try {
    const logsDir = path.join(process.cwd(), 'email_logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const fileName = `${bookingRef || 'email'}_${Date.now()}.html`;
    const filePath = path.join(logsDir, fileName);
    
    // Save email as static HTML file for local developer preview
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[Email Service] Saved local preview at: file://${filePath}`);
  } catch (error) {
    console.error('[Email Service] Failed to save local preview:', error);
  }
  
  // In production, integration with Resend or Nodemailer SMTP can be added here
  return { success: true };
}

// HTML template builders
export function getBookingConfirmationTemplate(data: {
  name: string;
  bookingRef: string;
  workshopName: string;
  dateStr: string;
  timeSlot: string;
  venueName: string;
  venueAddress: string;
  bagColor: string;
  style: string;
  participants: number;
  totalAmount: number;
  qrCodeDataUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmed — Solviera Atelier</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; background-color: #0D0814; color: #FAF5FF; margin: 0; padding: 40px 20px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #1B112A; border: 1px solid rgba(167, 139, 250, 0.2); border-radius: 24px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #2E1D47 0%, #1B112A 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(167, 139, 250, 0.1); }
        .logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; letter-spacing: 0.15em; color: #FFFFFF; text-transform: uppercase; margin: 0 0 10px; }
        .eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #A78BFA; }
        .content { padding: 40px 30px; }
        .greeting { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #FFFFFF; margin-bottom: 20px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; border-top: 1px solid rgba(167, 139, 250, 0.1); border-bottom: 1px solid rgba(167, 139, 250, 0.1); padding: 20px 0; }
        .detail-item { font-size: 13px; line-height: 1.5; color: #C084FC; }
        .detail-item strong { color: #FFFFFF; font-weight: 500; }
        .qr-section { text-align: center; margin: 30px 0; }
        .qr-img { width: 180px; height: 180px; background-color: white; padding: 10px; border-radius: 12px; border: 1px solid rgba(167, 139, 250, 0.3); }
        .footer { background-color: #0D0814; padding: 24px; text-align: center; font-size: 11px; color: #C084FC; opacity: 0.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">Solviera</div>
          <div class="eyebrow">Booking Confirmation</div>
        </div>
        <div class="content">
          <div class="greeting">Dear ${data.name},</div>
          <p>Your seat has been reserved at the Solviera Atelier. We look forward to welcome you into our creative studio space.</p>
          
          <div class="details-grid">
            <div class="detail-item"><strong>Booking Ref:</strong><br>${data.bookingRef}</div>
            <div class="detail-item"><strong>Workshop:</strong><br>${data.workshopName}</div>
            <div class="detail-item"><strong>Date:</strong><br>${data.dateStr}</div>
            <div class="detail-item"><strong>Time:</strong><br>${data.timeSlot}</div>
            <div class="detail-item"><strong>Bag Customization:</strong><br>${data.bagColor} Canvas Tote</div>
            <div class="detail-item"><strong>Painting Style:</strong><br>${data.style}</div>
            <div class="detail-item"><strong>Participants:</strong><br>${data.participants} Seat(s)</div>
            <div class="detail-item"><strong>Total Amount:</strong><br>₹${data.totalAmount.toLocaleString()}</div>
          </div>
          
          <p><strong>Venue Location:</strong><br>${data.venueName}<br>${data.venueAddress}</p>
          
          <div class="qr-section">
            <p style="font-size: 13px; color: #A78BFA; margin-bottom: 12px;">Scan QR code for atelier check-in</p>
            <img class="qr-img" src="${data.qrCodeDataUrl}" alt="Check-in QR Code">
          </div>
        </div>
        <div class="footer">
          © 2026 Solviera Atelier. Florence & Milan.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentReceiptTemplate(data: {
  name: string;
  bookingRef: string;
  orderId: string;
  paymentId: string;
  dateStr: string;
  amount: number;
  tax: number;
  total: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt — Solviera Atelier</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; background-color: #0D0814; color: #FAF5FF; margin: 0; padding: 40px 20px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #1B112A; border: 1px solid rgba(167, 139, 250, 0.2); border-radius: 24px; overflow: hidden; }
        .header { background-color: #2E1D47; padding: 30px; text-align: center; }
        .logo { font-family: 'Cormorant Garamond', serif; font-size: 24px; letter-spacing: 0.15em; color: #FFFFFF; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 30px; }
        .invoice-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #FFFFFF; margin-bottom: 20px; text-align: center; }
        .invoice-details { font-size: 12px; color: #C084FC; margin-bottom: 30px; line-height: 1.6; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .th { text-align: left; padding: 12px; border-bottom: 1px solid rgba(167, 139, 250, 0.2); font-size: 11px; text-transform: uppercase; color: #A78BFA; }
        .td { padding: 12px; border-bottom: 1px solid rgba(167, 139, 250, 0.1); font-size: 13px; color: #FAF5FF; }
        .total-row .td { border-top: 1px solid rgba(167, 139, 250, 0.2); border-bottom: none; font-weight: 500; font-size: 15px; color: #F472B6; }
        .footer { background-color: #0D0814; padding: 20px; text-align: center; font-size: 11px; color: #C084FC; opacity: 0.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">Solviera</div>
        </div>
        <div class="content">
          <div class="invoice-title">Payment Receipt</div>
          
          <div class="invoice-details">
            <strong>Billed To:</strong> ${data.name}<br>
            <strong>Receipt Date:</strong> ${data.dateStr}<br>
            <strong>Booking Reference:</strong> ${data.bookingRef}<br>
            <strong>Razorpay Order ID:</strong> ${data.orderId}<br>
            <strong>Razorpay Payment ID:</strong> ${data.paymentId || 'MOCK_PAYMENT_ID'}
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th class="th">Description</th>
                <th class="th" style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="td">Solviera Tote Bag Atelier Workshop Registration</td>
                <td class="td" style="text-align: right;">₹${data.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="td" style="color: #C084FC;">GST / Atelier Taxes (18%)</td>
                <td class="td" style="text-align: right; color: #C084FC;">₹${data.tax.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td class="td"><strong>Grand Total Paid</strong></td>
                <td class="td" style="text-align: right;"><strong>₹${data.total.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <p style="font-size: 12px; text-align: center; color: #C084FC; margin-top: 40px;">Thank you for your patronage. Your invoice is fully settled.</p>
        </div>
        <div class="footer">
          © 2026 Solviera Atelier. Fully Secure Transaction.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getAdminNotificationTemplate(data: {
  bookingRef: string;
  name: string;
  email: string;
  phone: string;
  workshopName: string;
  dateStr: string;
  totalAmount: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Workshop Booking Alert — Solviera Admins</title>
      <style>
        body { font-family: sans-serif; background-color: #f6f6f6; color: #333; margin: 0; padding: 40px 20px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; }
        .header { background-color: #2E1D47; padding: 20px; color: white; text-align: center; }
        .content { padding: 30px; font-size: 14px; line-height: 1.6; }
        .detail-list { background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee; }
        .detail-list li { margin-bottom: 8px; list-style: none; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h3>💎 New Booking Registered</h3>
        </div>
        <div class="content">
          <p>A new customer has successfully booked a seat in the upcoming workshop.</p>
          <ul class="detail-list">
            <li><strong>Booking Ref:</strong> ${data.bookingRef}</li>
            <li><strong>Customer Name:</strong> ${data.name}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Phone:</strong> ${data.phone}</li>
            <li><strong>Workshop:</strong> ${data.workshopName}</li>
            <li><strong>Date & Time:</strong> ${data.dateStr}</li>
            <li><strong>Amount Received:</strong> ₹${data.totalAmount.toLocaleString()}</li>
          </ul>
          <p>Access the <a href="http://localhost:8000/solviera/admin" target="_blank">Solviera Admin Portal</a> to review metrics, check attendance, or process bookings.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
