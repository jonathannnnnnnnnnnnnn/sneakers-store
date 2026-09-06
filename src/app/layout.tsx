import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/context/StoreContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SOLE VAULT — Premium Footwear & Streetwear Drops",
    template: "%s | SNEAKERS",
  },
  description: "Discover verified authentic sneakers, exclusive streetwear drops, and high-performance footwear.",
  openGraph: {
    title: "SNEAKERS — Premium Footwear & Streetwear Drops",
    description: "Discover verified authentic sneakers and exclusive streetwear drops.",
    url: "https://your-domain.com",
    siteName: "SOLE VAULT",
    images: [
      {
        url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "SNEAKERS Storefront Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLE VAULT Store",
    description: "Exclusive sneaker and streetwear drops.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Hide Google Translate original top bar and tooltips */}
        <style>{`
          .goog-te-banner-frame { display: none !important; }
          body { top: 0px !important; }
          .skiptranslate { display: none !important; }
          #google_translate_element { display: none; }
        `}</style>
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* Hidden Google Translate container */}
        <div id="google_translate_element" />

        {/* Script initializer */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <StoreProvider>
          {children}
          <Toaster position="bottom-right" />
        </StoreProvider>
      </body>
    </html>
  );
}