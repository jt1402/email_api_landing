import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
});

// Colocate with the Railway backend (us-west2 / Oregon) to cut ~100-150ms
// off every backend roundtrip from Server Components and Server Actions.
export const preferredRegion = "pdx1";

export const metadata: Metadata = {
  title: "VerifyMail — Tell who's really behind an email",
  description:
    "Stop fake signups with a single API call. Detect disposable, catch-all, and abusive email addresses with explainable signals.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
