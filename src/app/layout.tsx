import type { Metadata } from "next";
import { Quicksand, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PhantomPay",
  description: "Payments without identity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", quicksand.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-quicksand)' }}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
