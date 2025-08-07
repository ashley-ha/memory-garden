import type { Metadata } from "next";
import { Cinzel, Crimson_Text, Inter } from "next/font/google";
import { SessionProvider } from '@/components/SessionProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/Footer'
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
  title: "Memory Garden - Collaborative Learning with Spaced Repetition",
  description: "Learn together with beautiful flashcards. Create and study topics collaboratively using proven spaced repetition techniques. Join our community of learners.",
  keywords: "flashcards, spaced repetition, collaborative learning, study together, memory techniques",
  authors: [{ name: "Memory Garden Team" }],
  openGraph: {
    title: "Memory Garden - Collaborative Learning",
    description: "Beautiful flashcards that don't suck. Learn together with spaced repetition.",
    type: "website",
    locale: "en_US",
    siteName: "Memory Garden",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Garden",
    description: "Collaborative flashcards with spaced repetition",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonText.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-parchment text-forest font-crimson antialiased min-h-screen flex flex-col">
        <ErrorBoundary>
          <SessionProvider>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
