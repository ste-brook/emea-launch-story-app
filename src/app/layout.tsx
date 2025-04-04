import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import Image from 'next/image'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EMEA Launch Story Submissions",
  description: "Share your launch stories and celebrate success",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--p-color-bg-surface-secondary)] min-h-screen`}>
        <header className="sticky top-0 z-50 bg-[var(--p-color-bg-surface)] border-b border-[var(--p-color-border-subdued)] shadow-[var(--p-shadow-card)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Image
                  src="/images/black-shopify-ecommerce-logo-701751694791307pvl6xyyal3-removebg-preview.png"
                  alt="Shopify Logo"
                  width={32}
                  height={32}
                  className="mr-4 dark:invert"
                />
                <h1 className="text-xl font-bold text-[var(--p-color-text-primary)]">
                  EMEA Launch Story Submissions
                </h1>
              </div>
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
