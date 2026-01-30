import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PortfolioProvider } from "@/context/PortfolioContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Earn Aggregator | Find the Best Stablecoin Yields",
  description: "Compare USDT and USDC Simple Earn yields across Binance, Bybit, Bitget and more. Simulate returns, track your portfolio, and maximize your crypto earnings.",
  keywords: ["crypto", "yield", "USDT", "USDC", "earn", "APR", "stablecoin", "binance", "bybit", "bitget"],
  openGraph: {
    title: "Earn Aggregator | Find the Best Stablecoin Yields",
    description: "Compare USDT and USDC yields across top exchanges",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
}
