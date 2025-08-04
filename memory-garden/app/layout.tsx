import type { Metadata } from "next";
import { Cinzel, Crimson_Text, Inter } from "next/font/google";
import { SessionProvider } from '@/components/SessionProvider'
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memory Garden",
  description: "Collaborative flashcards that don't suck - learn together with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonText.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-parchment text-forest font-crimson antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
