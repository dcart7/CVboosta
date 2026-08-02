"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  CONSENT_UPDATED_EVENT,
  readConsent,
  type ConsentPreferences,
} from "../lib/consent";
import { isSensitiveCredentialRoute } from "../lib/sensitiveRoutes";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

function updateAdsConsent(granted: boolean) {
  if (typeof window.gtag !== "function") return;
  const state = granted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
}

export default function GoogleAdsTag() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();
  const sensitiveRoute = isSensitiveCredentialRoute(pathname);

  useEffect(() => {
    if (sensitiveRoute) {
      setEnabled(false);
      updateAdsConsent(false);
      return;
    }
    const initial = readConsent();
    setEnabled(Boolean(ADS_ID) && initial?.marketing === true);
    updateAdsConsent(initial?.marketing === true);

    const onConsentUpdated = (event: Event) => {
      const preferences = (event as CustomEvent<ConsentPreferences>).detail || readConsent();
      const granted = preferences?.marketing === true;
      updateAdsConsent(granted);
      setEnabled(Boolean(ADS_ID) && granted);
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [sensitiveRoute]);

  if (!ADS_ID || !enabled || sensitiveRoute) return null;

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
          window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
          window.gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
          });
          window.gtag('js', new Date());
          window.gtag('config', '${ADS_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
