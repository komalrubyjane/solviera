import QRCode from 'qrcode';

export async function generateBookingQRCode(bookingRef: string): Promise<string> {
  try {
    // Generates a base64 data URL representing the QR code image
    return await QRCode.toDataURL(bookingRef, {
      color: {
        dark: '#2E1D47',  // Beige brand color
        light: '#FAF5FF', // Ivory brand background
      },
      width: 250,
      margin: 2,
    });
  } catch (error) {
    console.error('Failed to generate check-in QR code:', error);
    return '';
  }
}
