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

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

function consentMode(preferences: ConsentPreferences | null) {
  const analytics = preferences?.analytics === true ? "granted" : "denied";
  const marketing = preferences?.marketing === true ? "granted" : "denied";
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  } as const;
}

function updateLoadedTagConsent(preferences: ConsentPreferences | null) {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", consentMode(preferences));
  }
}

export default function GoogleTagManager() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();
  const sensitiveRoute = isSensitiveCredentialRoute(pathname);

  useEffect(() => {
    if (sensitiveRoute) {
      setEnabled(false);
      updateLoadedTagConsent(null);
      return;
    }
    const initial = readConsent();
    setEnabled(initial?.analytics === true || initial?.marketing === true);
    updateLoadedTagConsent(initial);

    const onConsentUpdated = (event: Event) => {
      const preferences = (event as CustomEvent<ConsentPreferences>).detail || readConsent();
      updateLoadedTagConsent(preferences);
      setEnabled(preferences?.analytics === true || preferences?.marketing === true);
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [sensitiveRoute]);

  if (!GTM_ID || !enabled || sensitiveRoute) return null;

  const current = readConsent();
  const defaults = consentMode(current);

  return (
    <>
      <Script id="gtm-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
          window.gtag('consent', 'default', ${JSON.stringify(defaults)});
        `}
      </Script>
      <Script id="gtm-init" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
    </>
  );
}
