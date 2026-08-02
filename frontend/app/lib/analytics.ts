"use client";

import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  hasMarketingConsent,
} from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const ANALYTICS_EVENTS = {
  pageView: "page_view",
  scrollDepth: "scroll_depth",
  engagedSession: "engaged_session",
  exitIntent: "exit_intent",
  ctaClicked: "cta_clicked",
  pricingViewed: "pricing_viewed",
  checkoutStarted: "checkout_started",
  purchase: "purchase",
  login: "login",
  signUp: "sign_up",
  resumeUploaded: "resume_uploaded",
  analysisStarted: "analysis_started",
  analysisCompleted: "analysis_completed",
  optimizationStarted: "optimization_started",
  optimizationCompleted: "optimization_completed",
  scoreImproved: "score_improved",
  resultsReady: "results_ready",
  resultsViewed: "results_viewed",
  assetDownloaded: "asset_downloaded",
  paywallCtaClicked: "paywall_cta_clicked",
  resultShareOpened: "result_share_opened",
  resultShared: "result_shared",
  sharedResultViewed: "shared_result_viewed",
  sharedResultCtaClicked: "shared_result_cta_clicked",
  advocacyPromptViewed: "advocacy_prompt_viewed",
  honestReviewOpened: "honest_review_opened",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type LegacyEventName =
  | "ats_upload_cv"
  | "ats_analysis_started"
  | "ats_analysis_completed"
  | "ats_view_results"
  | "cta_click"
  | "login"
  | "optimization_download"
  | "payment_started"
  | "payment_success"
  | "pricing_view"
  | "score_improvement"
  | "sign_up"
  | "time_30s";

type EventName = AnalyticsEventName | LegacyEventName;
type EventValue = string | number | boolean | null | undefined;
type EventParams = Record<string, EventValue>;

type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  ref?: string;
  referrer_host?: string;
  capturedAt: number;
  expiresAt: number;
};

const ATTRIBUTION_SESSION_KEY = "cvboosta.attribution.session.v1";
const ATTRIBUTION_PERSISTENT_KEY = "cvboosta.attribution.first-touch.v1";
const SHARE_REF_KEY = "cvboosta.share-ref.v1";
const SESSION_ATTRIBUTION_TTL_MS = 24 * 60 * 60 * 1000;
const PERSISTENT_ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SHARE_REF_TTL_MS = 24 * 60 * 60 * 1000;
const DEDUPE_WINDOW_MS = 1_000;
const MARKETING_CONVERSION_EVENTS = new Set<AnalyticsEventName>([
  ANALYTICS_EVENTS.checkoutStarted,
  ANALYTICS_EVENTS.purchase,
]);
const MARKETING_PRODUCT_TYPES = new Set([
  "single",
  "go",
  "pro",
  "lifetime",
  "optimization",
  "unknown",
]);
const MARKETING_PLANS = new Set([
  "week",
  "month",
  "one_time",
  "single",
  "go",
  "pro",
  "lifetime",
  "unknown",
]);

const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "ref",
] as const;

const BLOCKED_PARAM_KEY =
  /^(?:email|full_name|first_name|last_name|phone|address|resume|cv|cv_text|job_description|job_text|raw_text|token|password|file|file_name)$/i;
const recentEvents = new Map<string, number>();

function looksLikeContactData(value: string): boolean {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && /^[+\d().\s-]+$/.test(value);
}

function sanitizeCampaignValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().slice(0, 120);
  if (
    !normalized ||
    normalized.includes("@") ||
    looksLikeContactData(normalized) ||
    !/^[\p{L}\p{N}._~:+\-/ ]+$/u.test(normalized)
  ) {
    return undefined;
  }
  return normalized;
}

function sanitizeAttributionValue(
  key: (typeof CAMPAIGN_KEYS)[number],
  value: string | null,
): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  if (looksLikeContactData(normalized) || normalized.includes("@")) return undefined;
  if (key === "ref") {
    return /^[A-Za-z0-9_-]{1,64}$/.test(normalized) ? normalized : undefined;
  }
  if (key === "gclid" || key === "fbclid" || key === "msclkid" || key === "ttclid") {
    return /^[A-Za-z0-9._~-]{1,120}$/.test(normalized) ? normalized : undefined;
  }
  return sanitizeCampaignValue(normalized);
}

function sanitizeReferrerHost(value: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().slice(0, 253);
  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(normalized)
    ? normalized
    : undefined;
}

function safeReadAttribution(storage: Storage, key: string): Attribution | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (
      typeof parsed.capturedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      storage.removeItem(key);
      return null;
    }

    const result: Attribution = {
      capturedAt: parsed.capturedAt,
      expiresAt: parsed.expiresAt,
    };
    for (const keyName of CAMPAIGN_KEYS) {
      const value = sanitizeAttributionValue(keyName,
        typeof parsed[keyName] === "string" ? parsed[keyName] : null,
      );
      if (value) result[keyName] = value;
    }
    const referrerHost = sanitizeReferrerHost(
      typeof parsed.referrer_host === "string" ? parsed.referrer_host : null,
    );
    if (referrerHost) result.referrer_host = referrerHost;
    return result;
  } catch {
    return null;
  }
}

function safeStore(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Tracking must never block the product when storage is unavailable.
  }
}

function externalReferrerHost(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.host === window.location.host) return undefined;
    return sanitizeReferrerHost(referrer.hostname);
  } catch {
    return undefined;
  }
}

/**
 * Captures only an allowlist of campaign parameters. URL paths, CV text, job
 * descriptions, emails, and other page data are intentionally never stored.
 */
export function captureCampaignAttribution(): Attribution | null {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return null;

  const search = new URLSearchParams(window.location.search);
  const captured: Partial<Attribution> = {};
  for (const key of CAMPAIGN_KEYS) {
    const value = sanitizeAttributionValue(key, search.get(key));
    if (value) captured[key] = value;
  }
  const referrerHost = externalReferrerHost();
  if (referrerHost) captured.referrer_host = referrerHost;

  const hasNewAttribution = Object.keys(captured).length > 0;
  const existingSession = safeReadAttribution(
    window.sessionStorage,
    ATTRIBUTION_SESSION_KEY,
  );
  let sessionAttribution = existingSession;

  if (hasNewAttribution) {
    const now = Date.now();
    sessionAttribution = {
      ...captured,
      capturedAt: now,
      expiresAt: now + SESSION_ATTRIBUTION_TTL_MS,
    } as Attribution;
    safeStore(window.sessionStorage, ATTRIBUTION_SESSION_KEY, sessionAttribution);
  }

  if (hasAnalyticsConsent()) {
    const firstTouch = safeReadAttribution(
      window.localStorage,
      ATTRIBUTION_PERSISTENT_KEY,
    );
    if (!firstTouch && sessionAttribution) {
      safeStore(window.localStorage, ATTRIBUTION_PERSISTENT_KEY, {
        ...sessionAttribution,
        expiresAt: Date.now() + PERSISTENT_ATTRIBUTION_TTL_MS,
      });
    }
  }

  return sessionAttribution;
}

function currentAttribution(): Partial<Attribution> {
  if (typeof window === "undefined") return {};
  const session = safeReadAttribution(
    window.sessionStorage,
    ATTRIBUTION_SESSION_KEY,
  );
  const persistent = hasAnalyticsConsent()
    ? safeReadAttribution(window.localStorage, ATTRIBUTION_PERSISTENT_KEY)
    : null;
  const source = session || persistent;
  if (!source) return {};

  const context: Partial<Attribution> = {};
  for (const key of CAMPAIGN_KEYS) {
    if (source[key]) context[key] = source[key];
  }
  if (source.referrer_host) context.referrer_host = source.referrer_host;
  return context;
}

function canonicalEvent(
  eventName: EventName,
  params: EventParams,
): AnalyticsEventName {
  switch (eventName) {
    case "ats_upload_cv":
      return ANALYTICS_EVENTS.resumeUploaded;
    case "ats_analysis_started":
      return ANALYTICS_EVENTS.analysisStarted;
    case "ats_analysis_completed":
      return ANALYTICS_EVENTS.analysisCompleted;
    case "ats_view_results":
      return params.location === "auto_redirect"
        ? ANALYTICS_EVENTS.resultsReady
        : ANALYTICS_EVENTS.resultsViewed;
    case "cta_click":
      return ANALYTICS_EVENTS.ctaClicked;
    case "optimization_download":
      return ANALYTICS_EVENTS.assetDownloaded;
    case "payment_started":
      return params.location === "results_paywall_modal"
        ? ANALYTICS_EVENTS.paywallCtaClicked
        : ANALYTICS_EVENTS.checkoutStarted;
    case "payment_success":
      return ANALYTICS_EVENTS.purchase;
    case "pricing_view":
      return ANALYTICS_EVENTS.pricingViewed;
    case "score_improvement":
      return ANALYTICS_EVENTS.scoreImproved;
    case "time_30s":
      return ANALYTICS_EVENTS.engagedSession;
    default:
      return eventName;
  }
}

function sanitizeEventParams(params: EventParams): Record<string, string | number | boolean | null> {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || BLOCKED_PARAM_KEY.test(key)) continue;
    if (typeof value === "number") {
      if (Number.isFinite(value)) safe[key] = value;
      continue;
    }
    if (typeof value === "boolean" || value === null) {
      safe[key] = value;
      continue;
    }
    const trimmed = value.trim().slice(0, 120);
    if (!trimmed || trimmed.includes("@") || looksLikeContactData(trimmed)) continue;
    if ((CAMPAIGN_KEYS as readonly string[]).includes(key)) {
      const campaignValue = sanitizeAttributionValue(
        key as (typeof CAMPAIGN_KEYS)[number],
        trimmed,
      );
      if (campaignValue) safe[key] = campaignValue;
      continue;
    }
    if (key === "referrer_host") {
      const host = sanitizeReferrerHost(trimmed);
      if (host) safe[key] = host;
      continue;
    }
    safe[key] = key === "page_path" ? trimmed.split("?")[0] : trimmed;
  }
  return safe;
}

/**
 * Marketing-only consent permits only the minimum fields needed to measure a
 * checkout or confirmed purchase. Campaign data, page paths, free-form text,
 * account identifiers, and transaction/session IDs are deliberately omitted.
 */
export function sanitizeMarketingConversionParams(
  params: EventParams,
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {
    consent_scope: "marketing_only",
  };

  const productType = typeof params.product_type === "string"
    ? params.product_type.trim().toLowerCase()
    : "";
  if (MARKETING_PRODUCT_TYPES.has(productType)) {
    safe.product_type = productType;
  }

  const plan = typeof params.plan === "string"
    ? params.plan.trim().toLowerCase()
    : "";
  if (MARKETING_PLANS.has(plan)) safe.plan = plan;

  const rawValue = typeof params.value === "number"
    ? params.value
    : typeof params.price === "number"
      ? params.price
      : null;
  if (rawValue !== null && Number.isFinite(rawValue) && rawValue >= 0 && rawValue <= 10_000) {
    safe.value = Math.round(rawValue * 100) / 100;
  }

  const currency = typeof params.currency === "string"
    ? params.currency.trim().toUpperCase()
    : "USD";
  if (/^[A-Z]{3}$/.test(currency)) safe.currency = currency;

  if (params.resumed_after_auth === true) safe.resumed_after_auth = true;
  return safe;
}

function stableEventKey(
  eventName: AnalyticsEventName,
  params: Record<string, string | number | boolean | null>,
): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");
  return `${eventName}|${sorted}`;
}

function eventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function pushDataLayerEvent(
  event: AnalyticsEventName,
  params?: EventParams,
): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...(params || {}) });
}

export function trackEvent(eventName: EventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const canonicalName = canonicalEvent(eventName, params);
  const analyticsAllowed = hasAnalyticsConsent();
  const marketingOnlyAllowed =
    !analyticsAllowed &&
    hasMarketingConsent() &&
    MARKETING_CONVERSION_EVENTS.has(canonicalName);
  if (!analyticsAllowed && !marketingOnlyAllowed) return;

  if (analyticsAllowed) captureCampaignAttribution();
  const cleanParams = analyticsAllowed
    ? sanitizeEventParams({
        ...currentAttribution(),
        ...params,
      })
    : sanitizeMarketingConversionParams(params);
  const dedupeKey = stableEventKey(canonicalName, cleanParams);
  const now = Date.now();
  const lastSeen = recentEvents.get(dedupeKey);
  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) return;
  recentEvents.set(dedupeKey, now);

  if (recentEvents.size > 100) {
    for (const [key, timestamp] of recentEvents) {
      if (now - timestamp > DEDUPE_WINDOW_MS) recentEvents.delete(key);
    }
  }

  const payload = {
    ...cleanParams,
    event_id: eventId(),
    event_schema_version: 2,
  };

  // gtag itself writes to dataLayer. Calling both caused every event to be sent
  // twice in the previous implementation.
  if (typeof window.gtag === "function") {
    window.gtag("event", canonicalName, payload);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: canonicalName, ...payload });
  }
}

/**
 * A short-lived campaign label for voluntary result shares. It is not an
 * account identifier, entitlement, discount, or reward code.
 */
export function getOrCreateShareReferralCode(): string {
  if (typeof window === "undefined") return "shared_result";
  try {
    const raw = window.sessionStorage.getItem(SHARE_REF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { value?: string; expiresAt?: number };
      const value = sanitizeAttributionValue("ref", parsed.value || null);
      if (value && typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now()) {
        return value;
      }
    }
  } catch {
    // Create an ephemeral replacement below.
  }

  const randomPart = eventId().replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
  const value = `share_${randomPart}`;
  safeStore(window.sessionStorage, SHARE_REF_KEY, {
    value,
    expiresAt: Date.now() + SHARE_REF_TTL_MS,
  });
  return value;
}

if (typeof window !== "undefined") {
  if (!hasAnalyticsConsent()) {
    try {
      window.localStorage.removeItem(ATTRIBUTION_PERSISTENT_KEY);
      window.sessionStorage.removeItem(ATTRIBUTION_SESSION_KEY);
    } catch {
      // Optional storage may be unavailable.
    }
  }
  window.addEventListener(CONSENT_UPDATED_EVENT, () => {
    if (hasAnalyticsConsent()) {
      captureCampaignAttribution();
      return;
    }
    try {
      window.localStorage.removeItem(ATTRIBUTION_PERSISTENT_KEY);
      window.sessionStorage.removeItem(ATTRIBUTION_SESSION_KEY);
    } catch {
      // Optional storage may be unavailable.
    }
  });
}
