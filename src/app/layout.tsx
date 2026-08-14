import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "SNEAKERS — Premium Footwear & Streetwear Drops",
    template: "%s | SNEAKERS",
  },
  description: "Discover verified authentic sneakers, exclusive streetwear drops, and high-performance footwear.",
  openGraph: {
    title: "SNEAKERS — Premium Footwear & Streetwear Drops",
    description: "Discover verified authentic sneakers and exclusive streetwear drops.",
    url: "https://your-domain.com",
    siteName: "SNEAKERS",
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
    title: "SNEAKERS Store",
    description: "Exclusive sneaker and streetwear drops.",
  },
};

// export default function RootLayout({ children }: LayoutProps<"/">) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col bg-white text-gray-900">{children}</body>
//     </html>
//   );
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
