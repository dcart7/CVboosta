import { LanguageProvider } from "./lib/LanguageContext";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

export const metadata = {
  title: "CVboosta | ATS-Friendly CV Optimization",
  description: "Stop guessing why you don't get callbacks. Get an honest AI feedback and ATS-optimized rewrite for your CV in seconds.",
  keywords: ["CV optimization", "ATS resume", "AI resume builder", "career feedback", "CVboosta"],
  authors: [{ name: "CVboosta Team" }],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "CVboosta | Tune your CV for real hiring teams",
    description: "Upload a CV, paste a vacancy, and get an ATS-friendly rewrite with honest feedback.",
    url: "http://localhost:3000",
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
    icon: [
      { url: "/favicon-v2.ico", sizes: "any" },
      { url: "/favicon-v2.png", type: "image/png" },
    ],
    shortcut: "/favicon-v2.png",
    apple: "/apple-icon-v2.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
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
        <script src="https://cdn.paddle.com/paddle/v2/paddle.js" async></script>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <LanguageProvider>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {children}
          </div>
          <Analytics />
          <Footer />
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
