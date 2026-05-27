"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18110089986";

type ConsentModeState = {
  ad_storage: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
};

function resolveConsentState(): ConsentModeState {
  const consent = localStorage.getItem("cookie-consent");
  const rawPrefs = localStorage.getItem("cookie-preferences");

  if (!consent) {
    return {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }

  if (consent === "accepted-all") {
    return {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    };
  }

  if (consent === "rejected-all") {
    return {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }

  // consent === "custom"
  try {
    const prefs = rawPrefs ? (JSON.parse(rawPrefs) as { analytics?: boolean; marketing?: boolean }) : {};
    const analyticsGranted = Boolean(prefs.analytics);
    const marketingGranted = Boolean(prefs.marketing);
    return {
      ad_storage: marketingGranted ? "granted" : "denied",
      analytics_storage: analyticsGranted ? "granted" : "denied",
      ad_user_data: marketingGranted ? "granted" : "denied",
      ad_personalization: marketingGranted ? "granted" : "denied",
    };
  } catch {
    return {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }
}

export default function GoogleAdsTag() {
  const enabled = Boolean(ADS_ID);
  if (!enabled) return null;

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;

    const state = resolveConsentState();
    gtag("consent", "default", state);
    gtag("consent", "update", state);

    const handler = () => {
      const next = resolveConsentState();
      gtag("consent", "update", next);
    };
    window.addEventListener("cookie-consent-updated", handler);
    return () => window.removeEventListener("cookie-consent-updated", handler);
  }, []);

  return (
    <>
      <Script
        id="google-ads-gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ADS_ID)}`}
      />
      <Script id="google-ads-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${ADS_ID}');
        `}
      </Script>
    </>
  );
}

