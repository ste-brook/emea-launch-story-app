import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from 'next/image'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Launch Story App",
  description: "Submit and enhance your Shopify launch stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-transparent bg-clip-text">
                EMEA Launch Story App
              </h1>
              <span className="text-xl font-semibold text-gray-600/90 dark:text-gray-300/90">
                | Share Your Success!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Image
                src="/images/black-shopify-ecommerce-logo-701751694791307pvl6xyyal3-removebg-preview.png"
                alt="Shopify Logo"
                width={50}
                height={50}
                className="dark:invert w-12 h-12"
                priority
              />
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-0.5 sm:pt-1 lg:pt-2">
          {children}
        </main>
      </body>
    </html>
  );
}
