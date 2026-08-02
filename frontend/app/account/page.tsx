"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";
import { errorDetailToMessage } from "../lib/errorDetail";
import { trackEvent } from "../lib/analytics";
import {
  clearBillingFinalizeIntent,
  getOrCreateBillingFinalizeIntent,
  loadBillingFinalizeIntent,
  type BillingFinalizeIntent,
} from "../lib/funnelIntent";

type MeResponse = {
  email: string;
};

type ActivityItem = {
  action: string;
  created_at: string;
  meta?: Record<string, string>;
};

type BillingStatusResponse = {
  tier?: string;
  source?: string;
  limits?: {
    scans: number;
    cl: number;
    prep: number;
  };
  usage?: {
    scans: number;
    cl: number;
    prep: number;
  };
  single_scan_remaining?: number | null;
  billing_cycle?: "week" | "month" | null;
  cancel_at_period_end?: boolean;
  subscription_active_until?: string | null;
};

function stripeMinorAmountToMajor(amount: unknown, currency: unknown): number | null {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) return null;
  if (typeof currency !== "string" || !/^[A-Za-z]{3}$/.test(currency)) return null;
  try {
    const fractionDigits = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).resolvedOptions().maximumFractionDigits;
    return amount / 10 ** fractionDigits;
  } catch {
    return null;
  }
}

export default function AccountPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const finalizedSessionRef = useRef<string | null>(null);
  const billingFinalizeInFlightRef = useRef(false);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"ok" | "error">("ok");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [billingFinalizeIntent, setBillingFinalizeIntent] =
    useState<BillingFinalizeIntent | null>(null);
  const [billingFinalizeLoading, setBillingFinalizeLoading] = useState(false);
  const [profileError, setProfileError] = useState<"unauthorized" | "offline" | null>(
    null,
  );
  const apiBase = getApiBase();

  const getPlanLabel = (
    tierRaw: string | null,
    billingCycle: "week" | "month" | null | undefined,
  ) => {
    const tier = (tierRaw || "").toLowerCase();
    if (!tier || tier === "free") return t("account.freePlan");
    if (tier === "single" || tier === "single_scan") return t("account.freePlan");
    if (tier === "go") {
      if (billingCycle === "week") return `${t("pricing.go")} Weekly`;
      if (billingCycle === "month") return `${t("pricing.go")} Monthly`;
      return t("pricing.go");
    }
    if (tier === "pro") {
      if (billingCycle === "week") return `${t("pricing.pro")} Weekly`;
      if (billingCycle === "month") return `${t("pricing.pro")} Monthly`;
      return t("pricing.pro");
    }
    if (tier === "lifetime") return t("pricing.lifetime");
    return tierRaw || "Free";
  };

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setProfileError(null);
    setActivityLoading(true);
    try {
      const meRes = await fetchWithRetry(
        `${apiBase}/auth/me`,
        undefined,
        { attempts: 5, baseDelayMs: 400, timeoutMs: 20_000 },
      );
      if (meRes.status === 401) {
        setUser(null);
        setProfileError("unauthorized");
        setSubscriptionTier(null);
        setLoading(false);
        setActivityLoading(false);
        return;
      }
      if (!meRes.ok) {
        setUser(null);
        setProfileError("offline");
        setSubscriptionTier(null);
        setLoading(false);
        setActivityLoading(false);
        return;
      }
      const meData = await meRes.json();
      if (!meData?.email) {
        setUser(null);
        setProfileError("offline");
        setSubscriptionTier(null);
        setLoading(false);
        setActivityLoading(false);
        return;
      }
      setUser({ email: meData.email });
      setProfileError(null);
      setLoading(false);

      try {
        const billingRes = await fetchWithRetry(
          `${apiBase}/billing/status`,
          undefined,
          { attempts: 4, baseDelayMs: 350, timeoutMs: 20_000 },
        );
        if (billingRes.ok) {
          const billingData: BillingStatusResponse = await billingRes.json();
          setSubscriptionTier(
            typeof billingData.tier === "string" ? billingData.tier : null,
          );
          setBillingStatus(billingData);
        } else {
          setSubscriptionTier(null);
          setBillingStatus(null);
        }
      } catch {
        setSubscriptionTier(null);
        setBillingStatus(null);
      }

      try {
        const actRes = await fetchWithRetry(
          `${apiBase}/auth/activity`,
          undefined,
          { attempts: 4, baseDelayMs: 350, timeoutMs: 20_000 },
        );
        const actData = actRes.ok ? await actRes.json() : { items: [] };
        setActivity(actData.items || []);
      } catch {
        setActivity([]);
      } finally {
        setActivityLoading(false);
      }
    } catch {
      setUser(null);
      setProfileError("offline");
      setSubscriptionTier(null);
      setBillingStatus(null);
      setLoading(false);
      setActivityLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const finalizeBillingSession = useCallback(
    async (intent: BillingFinalizeIntent) => {
      if (billingFinalizeInFlightRef.current) return;
      billingFinalizeInFlightRef.current = true;
      setBillingFinalizeLoading(true);
      setMessageTone("ok");
      setMessage("Confirming your payment…");
      try {
        const response = await fetchWithRetry(
          `${apiBase}/billing/stripe/finalize-session?session_id=${encodeURIComponent(intent.sessionId)}`,
          {
            method: "POST",
            headers: { "Idempotency-Key": intent.idempotencyKey },
          },
          { attempts: 5, baseDelayMs: 500, timeoutMs: 25_000 },
        );
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          const tier = typeof payload?.tier === "string"
            ? payload.tier.trim().toLowerCase()
            : "unknown";
          const currency = typeof payload?.currency === "string"
            ? payload.currency.trim().toUpperCase()
            : null;
          trackEvent("payment_success", {
            product_type: tier,
            plan: String(payload?.billing_cycle || tier),
            price: stripeMinorAmountToMajor(payload?.amount, currency),
            currency,
            transaction_id:
              typeof payload?.transaction_id === "string"
                ? payload.transaction_id
                : intent.sessionId,
          });
          clearBillingFinalizeIntent();
          setBillingFinalizeIntent(null);
          setMessageTone("ok");
          setMessage("Payment confirmed. Your plan was activated.");
          router.replace("/account");
          await loadAccount();
          return;
        }

        // A 400 from older API versions can mean Stripe is still processing or
        // temporarily unreachable. Preserve recovery unless ownership/input is
        // definitively rejected.
        const terminalFailure = [403, 404, 422].includes(response.status);
        if (terminalFailure) {
          clearBillingFinalizeIntent();
          setBillingFinalizeIntent(null);
          router.replace("/account");
        }
        setMessageTone("error");
        setMessage(
          errorDetailToMessage(payload?.detail) ||
            (terminalFailure
              ? "We could not verify this checkout session."
              : "Payment confirmation is taking longer than expected. Retry safely below."),
        );
      } catch {
        setMessageTone("error");
        setMessage(
          "Payment confirmation was interrupted. Your payment is not lost; retry safely below.",
        );
      } finally {
        billingFinalizeInFlightRef.current = false;
        setBillingFinalizeLoading(false);
      }
    },
    [apiBase, loadAccount, router],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    const querySessionId = params.get("session_id");
    const intent =
      billing === "success" && querySessionId
        ? getOrCreateBillingFinalizeIntent(querySessionId)
        : loadBillingFinalizeIntent();
    if (!intent) return;
    setBillingFinalizeIntent(intent);
    if (finalizedSessionRef.current === intent.sessionId) return;
    finalizedSessionRef.current = intent.sessionId;
    void finalizeBillingSession(intent);
  }, [finalizeBillingSession]);

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const current_password = String(form.get("current_password") || "");
    const new_password = String(form.get("new_password") || "");
    const confirm_password = String(form.get("confirm_password") || "");
    if (new_password !== confirm_password) {
      setMessageTone("error");
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ current_password, new_password }),
        },
        { attempts: 1, timeoutMs: 20_000 },
      );
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (response.ok) {
        setMessageTone("ok");
        setMessage("Password updated.");
        formElement.reset();
        return;
      }
      const payload = await response.json().catch(() => ({}));
      setMessageTone("error");
      setMessage(errorDetailToMessage(payload.detail) || "Failed to update password.");
    } catch {
      setMessageTone("error");
      setMessage("Connection interrupted. Check your network before trying again.");
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const cancelSubscription = async () => {
    setCancelLoading(true);
    setMessage("");
    try {
      const response = await fetchWithRetry(
        `${apiBase}/billing/stripe/cancel-subscription`,
        {
          method: "POST",
        },
        { attempts: 3, baseDelayMs: 350, timeoutMs: 20_000 },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(errorDetailToMessage(payload.detail) || "Failed to cancel subscription.");
      }
      setMessageTone("ok");
      if (payload.active_until) {
        setMessage(
          `Subscription canceled. Access remains active until ${formatDate(payload.active_until)}.`,
        );
      } else {
        setMessage("Subscription canceled.");
      }
      await loadAccount();
    } catch (err) {
      setMessageTone("error");
      setMessage(err instanceof Error ? err.message : "Failed to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="form-card fade-up">
          <h1 className="hero-title">{t("account.title")}</h1>
          {loading && <p className="hero-subtitle">{t("account.loadingProfile")}</p>}
          {!loading && profileError === "unauthorized" && (
            <div className="section">
              <p className="hero-subtitle" style={{ color: "#b42318" }}>
                {t("account.sessionExpiredReload")}
              </p>
              <Link className="btn primary" href="/login">
                {t("nav.login")}
              </Link>
            </div>
          )}
          {!loading && profileError === "offline" && (
            <div className="section">
              <p className="hero-subtitle" style={{ color: "#b42318" }}>
                {t("account.profileUnreachable")}
              </p>
              <button className="btn primary" type="button" onClick={() => void loadAccount()}>
                {t("account.retryLoad")}
              </button>
            </div>
          )}
          {user && (
            <>
              <div className="grid">
                <div className="card">
                  <h3>{t("account.signedInAs")}</h3>
                  <p>{user.email}</p>
                </div>
                <div className="card">
                  <h3>{t("account.activeWorkspace")}</h3>
                  <p>{t("account.activeWorkspaceValue")}</p>
                </div>
                <div className="card">
                  <h3>{t("account.plan")}</h3>
                  <p>{getPlanLabel(subscriptionTier, billingStatus?.billing_cycle)}</p>
                  {subscriptionTier === "single" && (
                    <p style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                      {t("account.singleScanActivated")}: {billingStatus?.single_scan_remaining ?? 0}
                      {" "}
                      {t("account.scansAvailable")}
                    </p>
                  )}
                  {billingStatus?.cancel_at_period_end &&
                    typeof billingStatus.subscription_active_until === "string" && (
                      <p style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                        Cancels at period end: {formatDate(billingStatus.subscription_active_until)}
                      </p>
                    )}
                </div>
              </div>

              {(subscriptionTier === "go" || subscriptionTier === "pro") &&
                billingStatus?.source !== "app_store" && (
                <div className="section">
                  <h2 className="section-title">Subscription</h2>
                  {!billingStatus?.cancel_at_period_end ? (
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => void cancelSubscription()}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "Canceling..." : "Cancel subscription"}
                    </button>
                  ) : (
                    <p className="hero-subtitle">
                      Subscription is already canceled and remains active until{" "}
                      {billingStatus.subscription_active_until
                        ? formatDate(billingStatus.subscription_active_until)
                        : "the end of your period"}
                      .
                    </p>
                  )}
                </div>
              )}

              <div className="section">
                <h2 className="section-title">{t("account.focusThisWeek")}</h2>
                <div className="steps">
                  <div className="step">
                    <span>1</span>
                    <p>{t("account.focus1")}</p>
                  </div>
                  <div className="step">
                    <span>2</span>
                    <p>{t("account.focus2")}</p>
                  </div>
                  <div className="step">
                    <span>3</span>
                    <p>{t("account.focus3")}</p>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">{t("account.recentActivity")}</h2>
                <div className="card">
                  {activityLoading && <p>{t("account.loadingActivity")}</p>}
                  {!activityLoading && activity.length === 0 && (
                    <p>{t("account.noActivity")}</p>
                  )}
                  {activity.map((item, index) => (
                    <div className="history-row" key={`${item.action}-${index}`}>
                      <div data-label="Action">{item.action}</div>
                      <div data-label="Role">{item.meta?.role || "—"}</div>
                      <div data-label="Score">{item.meta?.score || "—"}</div>
                      <div data-label="Date">{formatDate(item.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {message && !showPasswordModal && (
                <div className="section">
                  <p style={{ color: messageTone === "ok" ? "#0f766e" : "#b42318" }}>
                    {message}
                  </p>
                  {billingFinalizeIntent && messageTone === "error" ? (
                    <button
                      className="btn primary"
                      type="button"
                      disabled={billingFinalizeLoading}
                      onClick={() => void finalizeBillingSession(billingFinalizeIntent)}
                      style={{ marginTop: 10 }}
                    >
                      {billingFinalizeLoading ? "Confirming…" : "Retry payment confirmation"}
                    </button>
                  ) : null}
                </div>
              )}
            </>
          )}

          <div className="section">
            <h2 className="section-title">{t("account.security")}</h2>
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowPasswordModal(true)}
            >
              {t("account.changePassword")}
            </button>
          </div>
        </section>
      </div>

      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="section-title">{t("account.changePasswordTitle")}</h2>
              <button
                className="btn ghost"
                type="button"
                onClick={() => setShowPasswordModal(false)}
              >
                {t("account.close")}
              </button>
            </div>
            <form className="form-grid" onSubmit={changePassword}>
              <div>
                <div className="label">{t("account.currentPassword")}</div>
                <input className="input" name="current_password" type="password" required />
              </div>
              <div>
                <div className="label">{t("account.newPassword")}</div>
                <input className="input" name="new_password" type="password" required />
              </div>
              <div>
                <div className="label">{t("account.confirmPassword")}</div>
                <input className="input" name="confirm_password" type="password" required />
              </div>
              {message && (
                <p style={{ color: messageTone === "ok" ? "#0f766e" : "#b42318" }}>
                  {message}
                </p>
              )}
              <div className="nav-actions">
                <button className="btn primary" type="submit">
                  {t("account.updatePassword")}
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                >
                  {t("account.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
