import type { Metadata } from "next";
import { Cinzel_Decorative, Rajdhani } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeHunter",
  description: "Turn your GitHub activity into XP, levels, and ranks. Your code is your power.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${rajdhani.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
