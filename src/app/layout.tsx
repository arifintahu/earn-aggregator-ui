import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PortfolioProvider } from "@/context/PortfolioContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Earn Aggregator | Find the Best Stablecoin Yields",
  description: "Compare USDT and USDC Simple Earn yields across Binance, Bybit, Bitget and more. Simulate returns, track your portfolio, and maximize your crypto earnings.",
  keywords: ["crypto", "yield", "USDT", "USDC", "earn", "APR", "stablecoin", "binance", "bybit", "bitget"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Earn Aggregator",
  },
  openGraph: {
    title: "Earn Aggregator | Find the Best Stablecoin Yields",
    description: "Compare USDT and USDC yields across top exchanges",
    type: "website",
  },
  icons: {
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
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
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Earn Aggregator" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#22c55e" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('Service worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
}
