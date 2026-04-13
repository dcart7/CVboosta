"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";

type MeResponse = {
  email: string;
};

type ActivityItem = {
  action: string;
  created_at: string;
  meta?: Record<string, string>;
};

export default function AccountPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"ok" | "error">("ok");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<"unauthorized" | "offline" | null>(
    null,
  );
  const apiBase = getApiBase();

  const loadAccount = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setProfileError(null);
    setActivityLoading(true);
    try {
      const meRes = await fetchWithRetry(
        `${apiBase}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } },
        { attempts: 5, baseDelayMs: 400, timeoutMs: 20_000 },
      );
      if (meRes.status === 401) {
        localStorage.removeItem("auth_token");
        setUser(null);
        setProfileError("unauthorized");
        setLoading(false);
        setActivityLoading(false);
        return;
      }
      if (!meRes.ok) {
        setUser(null);
        setProfileError("offline");
        setLoading(false);
        setActivityLoading(false);
        return;
      }
      const meData = await meRes.json();
      if (!meData?.email) {
        setUser(null);
        setProfileError("offline");
        setLoading(false);
        setActivityLoading(false);
        return;
      }
      setUser({ email: meData.email });
      setProfileError(null);
      setLoading(false);

      try {
        const actRes = await fetchWithRetry(
          `${apiBase}/auth/activity`,
          { headers: { Authorization: `Bearer ${token}` } },
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
      setLoading(false);
      setActivityLoading(false);
    }
  }, [apiBase, router]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const form = new FormData(event.currentTarget);
    const current_password = String(form.get("current_password") || "");
    const new_password = String(form.get("new_password") || "");
    const confirm_password = String(form.get("confirm_password") || "");
    if (new_password !== confirm_password) {
      setMessageTone("error");
      setMessage("Passwords do not match.");
      return;
    }
    const response = await fetch(`${apiBase}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password, new_password }),
    });
    if (response.ok) {
      setMessageTone("ok");
      setMessage("Password updated.");
      event.currentTarget.reset();
      return;
    }
    const payload = await response.json().catch(() => ({}));
    setMessageTone("error");
    setMessage(payload.detail || "Failed to update password.");
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

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
                  <p>{t("account.planValue")}</p>
                </div>
              </div>

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
