import { LanguageProvider } from "./lib/LanguageContext";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import RouteTransition from "./components/RouteTransition";
import BehaviorTracking from "./components/BehaviorTracking";
import GoogleTagManager from "./components/GoogleTagManager";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";

export const metadata: Metadata = {
  title: "CVboosta | ATS-Friendly CV Optimization",
  description: "Stop guessing why you don't get callbacks. Get an honest AI feedback and ATS-optimized rewrite for your CV in seconds.",
  keywords: ["CV optimization", "ATS resume", "AI resume builder", "career feedback", "CVboosta"],
  authors: [{ name: "CVboosta Team" }],
  metadataBase: new URL(siteUrl),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "CVboosta | Tune your CV for real hiring teams",
    description: "Upload a CV, paste a vacancy, and get an ATS-friendly rewrite with honest feedback.",
    url: siteUrl,
    siteName: "CVboosta",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CVboosta | ATS-Friendly CV Optimization",
    description: "Get an honest AI feedback and ATS-optimized rewrite for your CV in seconds.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [{ url: "/favicon-v2.png", type: "image/png", sizes: "64x64" }],
    shortcut: "/favicon-v2.png",
    apple: "/apple-icon-v2.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CVboosta",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CVboosta",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();",
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}} />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <GoogleTagManager />
        <BehaviorTracking />
        <LanguageProvider>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <RouteTransition>{children}</RouteTransition>
          </div>
          <Analytics />
          <Footer />
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
