/** Per-account / guest workspace keys in localStorage (v1). */

import { fetchWithRetry } from "./fetchRetry";

export const GUEST_WORKSPACE_ID = "__guest__";
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
  return email.trim();
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

/** Copy old global keys into guest workspace once (no token). */
export function migrateLegacyGuestWorkspace(workspaceId: string): void {
  try {
    if (workspaceId !== GUEST_WORKSPACE_ID) return;
    for (const field of LEGACY_FIELDS) {
      const namespaced = wsFieldKey(workspaceId, field);
      if (localStorage.getItem(namespaced) != null) continue;
      const legacy = localStorage.getItem(field);
      if (legacy != null) localStorage.setItem(namespaced, legacy);
    }
    const kw = localStorage.getItem("job_keywords");
    if (
      kw != null &&
      localStorage.getItem(wsFieldKey(workspaceId, "job_keywords")) == null
    ) {
      localStorage.setItem(wsFieldKey(workspaceId, "job_keywords"), kw);
    }
    for (const field of ["job_keywords_hash", "job_keywords_source"] as const) {
      const namespaced = wsFieldKey(workspaceId, field);
      if (localStorage.getItem(namespaced) != null) continue;
      const legacy = localStorage.getItem(field);
      if (legacy != null) localStorage.setItem(namespaced, legacy);
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
    localStorage.removeItem(parsedCvStorageKey(email ?? null));
    for (const field of WORKSPACE_DRAFT_FIELDS) {
      localStorage.removeItem(wsFieldKey(workspaceId, field));
    }
    sessionStorage.removeItem(sessionCvParsedKey(workspaceId));
  } catch {
    /* quota / private mode */
  }
}
