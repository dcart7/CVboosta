import { LanguageProvider } from "./lib/LanguageContext";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import RouteTransition from "./components/RouteTransition";
import BehaviorTracking from "./components/BehaviorTracking";
import GoogleTagManager from "./components/GoogleTagManager";
import GoogleAdsTag from "./components/GoogleAdsTag";
import ConsentControlledAnalytics from "./components/ConsentControlledAnalytics";
import "./globals.css";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";

export const metadata: Metadata = {
  title: "CVboosta | Match Your CV to a Real Job",
  description: "Stop guessing why you don't get callbacks. Get honest feedback and an ATS-optimized rewrite for your CV in seconds.",
  keywords: ["CV optimization", "ATS resume", "AI resume builder", "career feedback", "CVboosta"],
  authors: [{ name: "CVboosta Team" }],
  creator: "CVboosta",
  publisher: "CVboosta",
  category: "career development",
  applicationName: "CVboosta",
  other: {
    "apple-itunes-app": "app-id=6778948945",
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CVboosta — match your CV to a real job description",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CVboosta | ATS-Friendly CV Optimization",
    description: "Get an honest AI feedback and ATS-optimized rewrite for your CV in seconds.",
    images: ["/opengraph-image"],
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
  "@id": `${siteUrl}/#organization`,
  name: "CVboosta",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "CVboosta",
  url: siteUrl,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: ["en", "uk", "pl", "sk", "cs", "es"],
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${siteUrl}/#app`,
  name: "CVboosta",
  url: `${siteUrl}/app`,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Career development",
  operatingSystem: "Web browser",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  publisher: { "@id": `${siteUrl}/#organization` },
  featureList: [
    "CV and job-description comparison",
    "Job match score",
    "Missing keyword analysis",
    "CV draft optimization",
  ],
};

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

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
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(webApplicationSchema) }}
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
        <GoogleAdsTag />
        <BehaviorTracking />
        <LanguageProvider>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <RouteTransition>{children}</RouteTransition>
          </div>
          <ConsentControlledAnalytics />
          <Footer />
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
