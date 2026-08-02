"use client";

const WORKSPACE_INTENT_KEY = "cvboosta:workspace-intent:v1";
const CHECKOUT_INTENT_KEY = "cvboosta:checkout-intent:v1";
const RESULT_CONTEXT_KEY = "cvboosta:result-context:v1";
const BILLING_FINALIZE_INTENT_KEY = "cvboosta:billing-finalize-intent:v1";
const WORKSPACE_TTL_MS = 30 * 60 * 1000;
const CHECKOUT_TTL_MS = 30 * 60 * 1000;
const RESULT_CONTEXT_TTL_MS = 30 * 60 * 1000;
const BILLING_FINALIZE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CV_TEXT_LENGTH = 500_000;
const MAX_JOB_TEXT_LENGTH = 200_000;

export type ParsedCvDraft = {
  raw_text: string;
  skills: string[];
  work_experience: string[];
  education: string[];
  achievements: string[];
};

export type WorkspacePendingAction = "optimize" | null;

export type WorkspaceFunnelDraft = {
  parsed: ParsedCvDraft | null;
  targetRole: string;
  targetCompany: string;
  jobText: string;
  pendingAction: WorkspacePendingAction;
  pendingIdempotencyKey: string | null;
  pendingRequestFingerprint: string | null;
};

export type CheckoutTier = "single" | "go" | "pro" | "lifetime";
export type CheckoutBillingCycle = "week" | "month" | "one_time";

export type CheckoutIntent = {
  tier: CheckoutTier;
  billingCycle: CheckoutBillingCycle;
  idempotencyKey: string;
};

export type BillingFinalizeIntent = {
  sessionId: string;
  idempotencyKey: string;
};

export type ResultContext = {
  optimizedCv: string;
  jobText: string;
  missingSkills: string[];
  addedKeywords: string[];
  recommendations: string[];
  matchBefore: number | null;
  matchAfter: number | null;
  canExport: boolean | null;
};

type StoredValue<T> = {
  version: 1;
  expiresAt: number;
  value: T;
};

function readSessionValue<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredValue<T>>;
    if (
      stored.version !== 1 ||
      typeof stored.expiresAt !== "number" ||
      stored.expiresAt <= Date.now() ||
      stored.value == null
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return stored.value;
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in private/restricted browsing modes.
    }
    return null;
  }
}

function writeSessionValue<T>(key: string, value: T, ttlMs: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored: StoredValue<T> = {
      version: 1,
      expiresAt: Date.now() + ttlMs,
      value,
    };
    window.sessionStorage.setItem(key, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}

function removeSessionValue(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private/restricted browsing modes.
  }
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, 500)
    .map((item) => item.slice(0, 2_000));
}

function finiteScore(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function validParsedCv(value: unknown): ParsedCvDraft | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Partial<ParsedCvDraft>;
  if (
    typeof parsed.raw_text !== "string" ||
    parsed.raw_text.length === 0 ||
    parsed.raw_text.length > MAX_CV_TEXT_LENGTH
  ) {
    return null;
  }
  return {
    raw_text: parsed.raw_text,
    skills: stringArray(parsed.skills),
    work_experience: stringArray(parsed.work_experience),
    education: stringArray(parsed.education),
    achievements: stringArray(parsed.achievements),
  };
}

/**
 * Keeps sensitive CV text tab-scoped and short-lived. It is intentionally not
 * written to localStorage, so it disappears when the tab closes or after 30m.
 */
export function saveWorkspaceFunnelDraft(draft: WorkspaceFunnelDraft): boolean {
  const parsed = draft.parsed ? validParsedCv(draft.parsed) : null;
  if (draft.parsed && !parsed) return false;
  if (draft.jobText.length > MAX_JOB_TEXT_LENGTH) return false;

  return writeSessionValue<WorkspaceFunnelDraft>(
    WORKSPACE_INTENT_KEY,
    {
      parsed,
      targetRole: draft.targetRole.slice(0, 500),
      targetCompany: draft.targetCompany.slice(0, 500),
      jobText: draft.jobText,
      pendingAction: draft.pendingAction === "optimize" ? "optimize" : null,
      pendingIdempotencyKey:
        draft.pendingAction === "optimize" && typeof draft.pendingIdempotencyKey === "string"
          ? draft.pendingIdempotencyKey.slice(0, 200)
          : null,
      pendingRequestFingerprint:
        draft.pendingAction === "optimize" &&
        typeof draft.pendingRequestFingerprint === "string" &&
        /^[a-f0-9]{16,64}$/i.test(draft.pendingRequestFingerprint)
          ? draft.pendingRequestFingerprint.toLowerCase()
          : null,
    },
    WORKSPACE_TTL_MS,
  );
}

export function loadWorkspaceFunnelDraft(): WorkspaceFunnelDraft | null {
  const draft = readSessionValue<WorkspaceFunnelDraft>(WORKSPACE_INTENT_KEY);
  if (!draft || typeof draft !== "object") return null;
  const parsed = draft.parsed ? validParsedCv(draft.parsed) : null;
  if (draft.parsed && !parsed) {
    clearWorkspaceFunnelDraft();
    return null;
  }
  if (
    typeof draft.targetRole !== "string" ||
    typeof draft.targetCompany !== "string" ||
    typeof draft.jobText !== "string" ||
    draft.jobText.length > MAX_JOB_TEXT_LENGTH
  ) {
    clearWorkspaceFunnelDraft();
    return null;
  }
  return {
    parsed,
    targetRole: draft.targetRole,
    targetCompany: draft.targetCompany,
    jobText: draft.jobText,
    pendingAction: draft.pendingAction === "optimize" ? "optimize" : null,
    pendingIdempotencyKey:
      draft.pendingAction === "optimize" && typeof draft.pendingIdempotencyKey === "string"
        ? draft.pendingIdempotencyKey.slice(0, 200)
        : null,
    pendingRequestFingerprint:
      draft.pendingAction === "optimize" &&
      typeof draft.pendingRequestFingerprint === "string" &&
      /^[a-f0-9]{16,64}$/i.test(draft.pendingRequestFingerprint)
        ? draft.pendingRequestFingerprint.toLowerCase()
        : null,
  };
}

export function clearWorkspaceFunnelDraft(): void {
  removeSessionValue(WORKSPACE_INTENT_KEY);
}

export function saveCheckoutIntent(intent: CheckoutIntent): boolean {
  const validTier: CheckoutTier[] = ["single", "go", "pro", "lifetime"];
  const validCycle: CheckoutBillingCycle[] = ["week", "month", "one_time"];
  if (
    !validTier.includes(intent.tier) ||
    !validCycle.includes(intent.billingCycle) ||
    typeof intent.idempotencyKey !== "string" ||
    intent.idempotencyKey.length < 8 ||
    intent.idempotencyKey.length > 200
  ) {
    return false;
  }
  const subscription = intent.tier === "go" || intent.tier === "pro";
  if (subscription !== (intent.billingCycle !== "one_time")) return false;
  return writeSessionValue(CHECKOUT_INTENT_KEY, intent, CHECKOUT_TTL_MS);
}

export function loadCheckoutIntent(): CheckoutIntent | null {
  const intent = readSessionValue<CheckoutIntent>(CHECKOUT_INTENT_KEY);
  if (!intent) return null;
  const validTier: CheckoutTier[] = ["single", "go", "pro", "lifetime"];
  const validCycle: CheckoutBillingCycle[] = ["week", "month", "one_time"];
  const subscription = intent.tier === "go" || intent.tier === "pro";
  if (
    !validTier.includes(intent.tier) ||
    !validCycle.includes(intent.billingCycle) ||
    typeof intent.idempotencyKey !== "string" ||
    intent.idempotencyKey.length < 8 ||
    intent.idempotencyKey.length > 200 ||
    subscription !== (intent.billingCycle !== "one_time")
  ) {
    clearCheckoutIntent();
    return null;
  }
  return intent;
}

export function clearCheckoutIntent(): void {
  removeSessionValue(CHECKOUT_INTENT_KEY);
}

function validBillingSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 255 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

export function loadBillingFinalizeIntent(): BillingFinalizeIntent | null {
  const intent = readSessionValue<BillingFinalizeIntent>(BILLING_FINALIZE_INTENT_KEY);
  if (
    !intent ||
    !validBillingSessionId(intent.sessionId) ||
    typeof intent.idempotencyKey !== "string" ||
    intent.idempotencyKey.length < 8 ||
    intent.idempotencyKey.length > 200
  ) {
    if (intent) clearBillingFinalizeIntent();
    return null;
  }
  return intent;
}

export function getOrCreateBillingFinalizeIntent(
  sessionId: string,
): BillingFinalizeIntent | null {
  if (!validBillingSessionId(sessionId)) return null;
  const existing = loadBillingFinalizeIntent();
  if (existing?.sessionId === sessionId) return existing;
  const intent: BillingFinalizeIntent = {
    sessionId,
    idempotencyKey: createIdempotencyKey("finalize"),
  };
  return writeSessionValue(
    BILLING_FINALIZE_INTENT_KEY,
    intent,
    BILLING_FINALIZE_TTL_MS,
  )
    ? intent
    : null;
}

export function clearBillingFinalizeIntent(): void {
  removeSessionValue(BILLING_FINALIZE_INTENT_KEY);
}

/** Clear every account- or document-specific tab value on explicit logout. */
export function clearSensitiveFunnelData(): void {
  removeSessionValue(WORKSPACE_INTENT_KEY);
  removeSessionValue(CHECKOUT_INTENT_KEY);
  removeSessionValue(RESULT_CONTEXT_KEY);
  removeSessionValue(BILLING_FINALIZE_INTENT_KEY);
  clearLegacyPersistentFunnelData();
}

export function saveResultContext(context: ResultContext): boolean {
  if (
    typeof context.optimizedCv !== "string" ||
    context.optimizedCv.length > MAX_CV_TEXT_LENGTH ||
    typeof context.jobText !== "string" ||
    context.jobText.length > MAX_JOB_TEXT_LENGTH
  ) {
    return false;
  }
  return writeSessionValue<ResultContext>(
    RESULT_CONTEXT_KEY,
    {
      optimizedCv: context.optimizedCv,
      jobText: context.jobText,
      missingSkills: stringArray(context.missingSkills),
      addedKeywords: stringArray(context.addedKeywords),
      recommendations: stringArray(context.recommendations),
      matchBefore: finiteScore(context.matchBefore),
      matchAfter: finiteScore(context.matchAfter),
      canExport: typeof context.canExport === "boolean" ? context.canExport : null,
    },
    RESULT_CONTEXT_TTL_MS,
  );
}

export function loadResultContext(): ResultContext | null {
  const context = readSessionValue<ResultContext>(RESULT_CONTEXT_KEY);
  if (
    !context ||
    typeof context.optimizedCv !== "string" ||
    context.optimizedCv.length > MAX_CV_TEXT_LENGTH ||
    typeof context.jobText !== "string" ||
    context.jobText.length > MAX_JOB_TEXT_LENGTH
  ) {
    if (context) clearResultContext();
    return null;
  }
  return {
    optimizedCv: context.optimizedCv,
    jobText: context.jobText,
    missingSkills: stringArray(context.missingSkills),
    addedKeywords: stringArray(context.addedKeywords),
    recommendations: stringArray(context.recommendations),
    matchBefore: finiteScore(context.matchBefore),
    matchAfter: finiteScore(context.matchAfter),
    canExport: typeof context.canExport === "boolean" ? context.canExport : null,
  };
}

export function clearResultContext(): void {
  removeSessionValue(RESULT_CONTEXT_KEY);
}

/** One-time cleanup for CV/JD values written by pre-TTL frontend versions. */
export function clearLegacyPersistentFunnelData(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove = [
      "optimized_cv",
      "missing_skills",
      "added_keywords",
      "recommendations",
      "match_before",
      "match_after",
    ];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (
        key &&
        (key.startsWith("parsed_cv:") ||
          /^ws:v1:.*:(?:cv_text|job_text)$/.test(key))
      ) {
        keysToRemove.push(key);
      }
    }
    for (const key of new Set(keysToRemove)) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Product flow must still work if storage is unavailable.
  }
}

export function createIdempotencyKey(prefix: string): string {
  const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, "").slice(0, 32) || "request";
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${safePrefix}-${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2);
  return `${safePrefix}-${Date.now().toString(36)}-${random}`;
}

/** Accept only a relative same-origin destination and avoid auth redirect loops. */
export function sanitizeNextDestination(
  raw: string | null | undefined,
  fallback = "/account",
): string {
  if (!raw || raw.length > 2_048 || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return fallback;
  }
  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return fallback;
  }
  try {
    const base = "https://cvboosta.local";
    const parsed = new URL(raw, base);
    const normalizedPath = parsed.pathname.replace(/\/+$/, "") || "/";
    if (
      parsed.origin !== base ||
      normalizedPath === "/login" ||
      normalizedPath === "/register"
    ) {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function nextDestinationFromSearch(fallback = "/account"): string {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  return sanitizeNextDestination(params.get("next"), fallback);
}

export function authHref(
  authPath: "/login" | "/register",
  nextDestination: string,
): string {
  const safeNext = sanitizeNextDestination(nextDestination);
  return `${authPath}?next=${encodeURIComponent(safeNext)}`;
}
