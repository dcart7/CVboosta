/** Tab-scoped workspace helpers. Never put an email address in a storage key. */

import { fetchWithRetry } from "./fetchRetry";

export const GUEST_WORKSPACE_ID = "__guest__";
const ACCOUNT_WORKSPACE_ID = "__account__";
const WORKSPACE_DRAFT_FIELDS = [
  "target_role",
  "target_company",
  "job_text",
  "cv_text",
  "job_keywords",
  "job_keywords_hash",
  "job_keywords_source",
] as const;

export function workspaceIdFromEmail(email: string | null | undefined): string {
  if (!email?.trim()) return GUEST_WORKSPACE_ID;
  return ACCOUNT_WORKSPACE_ID;
}

export function parsedCvStorageKey(email: string | null): string {
  return `parsed_cv:${workspaceIdFromEmail(email)}`;
}

export function wsFieldKey(workspaceId: string, field: string): string {
  return `ws:v1:${workspaceId}:${field}`;
}

/** sessionStorage: user ran Upload & parse in this browser tab for this workspace. */
export function sessionCvParsedKey(workspaceId: string): string {
  return `session_cv_parsed:${workspaceId}`;
}

export async function fetchWorkspaceEmail(apiBase: string): Promise<string | null> {
  try {
    const res = await fetchWithRetry(
      `${apiBase}/auth/me`,
      undefined,
      { attempts: 5, baseDelayMs: 400, timeoutMs: 20_000 },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.email === "string" ? data.email : null;
  } catch {
    return null;
  }
}

const LEGACY_FIELDS = [
  "target_role",
  "target_company",
  "job_text",
  "cv_text",
] as const;

/** Move old global guest values to tab storage and remove persistent copies. */
export function migrateLegacyGuestWorkspace(workspaceId: string): void {
  try {
    if (workspaceId !== GUEST_WORKSPACE_ID) return;
    for (const field of LEGACY_FIELDS) {
      const namespaced = wsFieldKey(workspaceId, field);
      const legacy = localStorage.getItem(field) ?? localStorage.getItem(namespaced);
      if (legacy != null && sessionStorage.getItem(namespaced) == null) {
        sessionStorage.setItem(namespaced, legacy);
      }
      localStorage.removeItem(field);
      localStorage.removeItem(namespaced);
    }
    const kw =
      localStorage.getItem("job_keywords") ??
      localStorage.getItem(wsFieldKey(workspaceId, "job_keywords"));
    if (
      kw != null &&
      sessionStorage.getItem(wsFieldKey(workspaceId, "job_keywords")) == null
    ) {
      sessionStorage.setItem(wsFieldKey(workspaceId, "job_keywords"), kw);
    }
    localStorage.removeItem("job_keywords");
    localStorage.removeItem(wsFieldKey(workspaceId, "job_keywords"));
    for (const field of ["job_keywords_hash", "job_keywords_source"] as const) {
      const namespaced = wsFieldKey(workspaceId, field);
      const legacy = localStorage.getItem(field) ?? localStorage.getItem(namespaced);
      if (legacy != null && sessionStorage.getItem(namespaced) == null) {
        sessionStorage.setItem(namespaced, legacy);
      }
      localStorage.removeItem(field);
      localStorage.removeItem(namespaced);
    }
  } catch {
    /* quota / private mode */
  }
}

/** Remove transient dashboard draft data for a specific workspace. */
export function clearWorkspaceDraftData(
  workspaceId: string,
  email: string | null | undefined,
): void {
  try {
    const legacyEmailId = email?.trim() || null;
    localStorage.removeItem(parsedCvStorageKey(email ?? null));
    for (const id of [workspaceId, legacyEmailId].filter(
      (value): value is string => Boolean(value),
    )) {
      for (const field of WORKSPACE_DRAFT_FIELDS) {
        localStorage.removeItem(wsFieldKey(id, field));
        sessionStorage.removeItem(wsFieldKey(id, field));
      }
      localStorage.removeItem(`parsed_cv:${id}`);
      sessionStorage.removeItem(sessionCvParsedKey(id));
    }
    sessionStorage.removeItem(sessionCvParsedKey(workspaceId));
  } catch {
    /* quota / private mode */
  }
}

/** Targeted shared-device cleanup without deleting theme, locale, or consent. */
export function clearAllWorkspaceBrowserData(): void {
  const exactLegacyKeys = new Set([
    "target_role",
    "target_company",
    "job_text",
    "cv_text",
    "job_keywords",
    "job_keywords_hash",
    "job_keywords_source",
    "current_analysis_id",
  ]);
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      const keys: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (
          key &&
          (exactLegacyKeys.has(key) ||
            key.startsWith("ws:v1:") ||
            key.startsWith("parsed_cv:") ||
            key.startsWith("session_cv_parsed:") ||
            key.startsWith("results_paywall_seen:"))
        ) {
          keys.push(key);
        }
      }
      for (const key of keys) storage.removeItem(key);
    }
  } catch {
    // Restricted storage must not prevent the server logout from succeeding.
  }
}
