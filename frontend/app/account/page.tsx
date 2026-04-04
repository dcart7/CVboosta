"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";

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
  const [user, setUser] = useState<MeResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"ok" | "error">("ok");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setUser({ email: data.email });
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));

    fetch(`${apiBase}/auth/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setActivity(data.items || []))
      .finally(() => setActivityLoading(false));
  }, [apiBase, router]);

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
    new Date(value).toLocaleString("ru-RU", {
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
          <h1 className="hero-title">Account</h1>
          {loading && <p className="hero-subtitle">Loading profile...</p>}
          {user && (
            <>
              <div className="grid">
                <div className="card">
                  <h3>Signed in as</h3>
                  <p>{user.email}</p>
                </div>
                <div className="card">
                  <h3>Active workspace</h3>
                  <p>Smart CV Optimizer · Personal</p>
                </div>
                <div className="card">
                  <h3>Plan</h3>
                  <p>Early Access · Free</p>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Your focus this week</h2>
                <div className="steps">
                  <div className="step">
                    <span>1</span>
                    <p>Complete one CV refresh for your top target role.</p>
                  </div>
                  <div className="step">
                    <span>2</span>
                    <p>Add two impact metrics to recent experience.</p>
                  </div>
                  <div className="step">
                    <span>3</span>
                    <p>Save a reusable “core” version in History.</p>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Recent activity</h2>
                <div className="card">
                  {activityLoading && <p>Loading activity...</p>}
                  {!activityLoading && activity.length === 0 && (
                    <p>No activity yet. Run an analysis to see it here.</p>
                  )}
                  {activity.map((item, index) => (
                    <div className="history-row" key={`${item.action}-${index}`}>
                      <div>{item.action}</div>
                      <div>{item.meta?.role || "—"}</div>
                      <div>{item.meta?.score || "—"}</div>
                      <div>{formatDate(item.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="section">
            <h2 className="section-title">Security</h2>
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowPasswordModal(true)}
            >
              Change password
            </button>
          </div>
        </section>
      </div>

      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="section-title">Change password</h2>
              <button
                className="btn ghost"
                type="button"
                onClick={() => setShowPasswordModal(false)}
              >
                Close
              </button>
            </div>
            <form className="form-grid" onSubmit={changePassword}>
              <div>
                <div className="label">CURRENT PASSWORD</div>
                <input
                  className="input"
                  name="current_password"
                  type="password"
                  required
                />
              </div>
              <div>
                <div className="label">NEW PASSWORD</div>
                <input
                  className="input"
                  name="new_password"
                  type="password"
                  required
                />
              </div>
              <div>
                <div className="label">CONFIRM NEW PASSWORD</div>
                <input
                  className="input"
                  name="confirm_password"
                  type="password"
                  required
                />
              </div>
              {message && (
                <p style={{ color: messageTone === "ok" ? "#0f766e" : "#b42318" }}>
                  {message}
                </p>
              )}
              <div className="nav-actions">
                <button className="btn primary" type="submit">
                  Update password
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
