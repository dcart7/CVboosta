"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_UPDATED_EVENT,
  readConsent,
  type ConsentPreferences,
} from "../lib/consent";
import { isSensitiveCredentialRoute } from "../lib/sensitiveRoutes";

export default function ConsentControlledAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();
  const sensitiveRoute = isSensitiveCredentialRoute(pathname);

  useEffect(() => {
    if (sensitiveRoute) {
      setEnabled(false);
      return;
    }
    setEnabled(readConsent()?.analytics === true);
    const onConsentUpdated = (event: Event) => {
      const preferences = (event as CustomEvent<ConsentPreferences>).detail || readConsent();
      setEnabled(preferences?.analytics === true);
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [sensitiveRoute]);

  return enabled && !sensitiveRoute ? <Analytics /> : null;
}
