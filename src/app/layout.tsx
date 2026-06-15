import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { IntroProvider } from "@/components/IntroProvider";
import FloralDecor from "@/components/FloralDecor";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SOLVIERA — Premium Handcrafted Tote Atelier",
  description:
    "Experience the luxury of premium, bespoke handcrafted canvas tote bags. Attend our exclusive artisan workshops in Florence.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-cream text-dark-mocha font-sans antialiased min-h-screen">
        {/* FloralDecor rendered at body level so mix-blend-mode:multiply
            blends directly against the cream body background,
            making white PNG backgrounds invisible */}
        <FloralDecor />
        <div style={{ position: "relative", zIndex: 1 }}>
          <IntroProvider>{children}</IntroProvider>
        </div>
      </body>
    </html>
  );
}
