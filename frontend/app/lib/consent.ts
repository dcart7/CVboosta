export const CONSENT_STORAGE_KEY = "cvboosta.cookie-consent.v2";
export const CONSENT_UPDATED_EVENT = "cvboosta:consent-updated";

const CONSENT_VERSION = 2;
const CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

type StoredConsent = ConsentPreferences & {
  version: typeof CONSENT_VERSION;
  updatedAt: number;
  expiresAt: number;
};

const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function validDnsHostname(hostname: string): boolean {
  return (
    hostname.length <= 253 &&
    hostname.includes(".") &&
    !hostname.endsWith(".local") &&
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(hostname)
  );
}

/**
 * Returns only a configured HTTPS production host that owns the current host.
 * It intentionally does not guess an eTLD+1 from window.location, which could
 * otherwise target an unrelated parent domain on preview/shared hosting.
 */
export function deriveConfiguredCookieDomain(
  currentHostname: string,
  configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "",
): string | null {
  const configuredUrl = configuredSiteUrl.trim();
  if (!configuredUrl) return null;
  try {
    const parsed = new URL(configuredUrl);
    if (parsed.protocol !== "https:") return null;
    const configuredHost = parsed.hostname.toLowerCase().replace(/\.$/, "");
    const domain = configuredHost.startsWith("www.")
      ? configuredHost.slice(4)
      : configuredHost;
    const current = currentHostname.toLowerCase().replace(/\.$/, "");
    if (!validDnsHostname(domain)) return null;
    if (current !== domain && !current.endsWith(`.${domain}`)) return null;
    return domain;
  } catch {
    return null;
  }
}

function cookiePathsForCurrentPage(): string[] {
  const paths = new Set<string>(["/"]);
  const segments = window.location.pathname.split("/").filter(Boolean);
  let current = "";
  for (const segment of segments) {
    if (!/^[A-Za-z0-9._~%-]{1,100}$/.test(segment)) break;
    current += `/${segment}`;
    paths.add(current);
    paths.add(`${current}/`);
  }
  return [...paths];
}

function removeOptionalFirstPartyCookies(preferences: ConsentPreferences): void {
  if (typeof document === "undefined") return;
  const analyticsCookie = /^(?:_ga(?:_.+)?|_gid|_gat(?:_.+)?)$/;
  const marketingCookie = /^(?:_gcl_.+|_fbp|_fbc)$/;
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name));
  const hostname = window.location.hostname.toLowerCase().replace(/\.$/, "");
  const configuredDomain = deriveConfiguredCookieDomain(hostname);
  const domainAttributes = new Set<string | null>([null]);
  if (validDnsHostname(hostname)) {
    domainAttributes.add(hostname);
    domainAttributes.add(`.${hostname}`);
  }
  if (configuredDomain) {
    domainAttributes.add(configuredDomain);
    domainAttributes.add(`.${configuredDomain}`);
  }
  const paths = cookiePathsForCurrentPage();

  for (const name of names) {
    const shouldRemove =
      (!preferences.analytics && analyticsCookie.test(name)) ||
      (!preferences.marketing && marketingCookie.test(name));
    if (!shouldRemove) continue;
    const encoded = encodeURIComponent(name);
    for (const path of paths) {
      for (const domain of domainAttributes) {
        const domainPart = domain ? `; Domain=${domain}` : "";
        document.cookie = `${encoded}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}${domainPart}; SameSite=Lax`;
      }
    }
  }
}

function isStoredConsent(value: unknown): value is StoredConsent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredConsent>;
  return (
    candidate.version === CONSENT_VERSION &&
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean" &&
    typeof candidate.updatedAt === "number" &&
    typeof candidate.expiresAt === "number"
  );
}

export function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredConsent(parsed) || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
    };
  } catch {
    return null;
  }
}

export function writeConsent(
  preferences: Pick<ConsentPreferences, "analytics" | "marketing">,
): ConsentPreferences {
  const normalized: ConsentPreferences = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
  };

  if (typeof window === "undefined") return normalized;

  const now = Date.now();
  const stored: StoredConsent = {
    ...normalized,
    version: CONSENT_VERSION,
    updatedAt: now,
    expiresAt: now + CONSENT_TTL_MS,
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));

    // Keep these two keys temporarily for old deployments while v2 is rolling out.
    const legacyMode = normalized.analytics && normalized.marketing
      ? "accepted-all"
      : !normalized.analytics && !normalized.marketing
        ? "rejected-all"
        : "custom";
    window.localStorage.setItem("cookie-consent", legacyMode);
    window.localStorage.setItem("cookie-preferences", JSON.stringify(normalized));
  } catch {
    // A blocked storage API must not turn optional tracking on.
  }

  removeOptionalFirstPartyCookies(normalized);

  window.dispatchEvent(
    new CustomEvent<ConsentPreferences>(CONSENT_UPDATED_EVENT, {
      detail: normalized,
    }),
  );
  // Compatibility for any older tab/component still listening to this event.
  window.dispatchEvent(new Event("cookie-consent-updated"));
  return normalized;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return readConsent()?.marketing === true;
}

export function defaultConsent(): ConsentPreferences {
  return { ...DEFAULT_CONSENT };
}

/** Enforce deny-by-default cookie state when consent is missing or expired. */
export function enforceOptionalCookieConsent(
  preferences: ConsentPreferences | null = readConsent(),
): void {
  removeOptionalFirstPartyCookies(preferences || DEFAULT_CONSENT);
}
