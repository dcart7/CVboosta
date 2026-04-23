"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../lib/LanguageContext";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const { t } = useTranslation();

  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (type: string) => {
    localStorage.setItem("cookie-consent", type);
    setShow(false);
    setShowPreferences(false);
  };

  const acceptAll = () => saveConsent("accepted-all");
  const rejectAll = () => saveConsent("rejected-all");
  const savePreferences = () => saveConsent("custom");

  if (!show) return null;

  return (
    <>
      <div className="cookie-banner fade-up">
        <div className="cookie-content">
          <div className="cookie-text">
            <span style={{ fontSize: "20px" }}>🍪</span>
            <p>
              {t("footer.cookieNotice") || "Our website uses cookies to improve your experience and analyze usage limits."}
            </p>
          </div>
          <div className="cookie-actions">
            <button className="btn ghost small" onClick={rejectAll}>
              {t("common.rejectAll") || "Reject All"}
            </button>
            <button className="btn ghost small" onClick={() => setShowPreferences(true)}>
              {t("common.customize") || "Customize"}
            </button>
            <button className="btn primary small" onClick={acceptAll}>
              {t("common.acceptAll") || "Accept All"}
            </button>
          </div>
        </div>

        <style jsx>{`
          .cookie-banner {
            position: fixed;
            bottom: 24px;
            left: 24px;
            right: 24px;
            max-width: 700px;
            margin: 0 auto;
            z-index: 9999;
            background: var(--surface);
            backdrop-filter: blur(24px) saturate(160%);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 16px 20px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          }
          .cookie-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }
          .cookie-text {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            color: var(--foreground);
          }
          .cookie-text p {
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
            color: var(--muted);
          }
          .cookie-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
          }
          .small {
            padding: 8px 16px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }
          @media (max-width: 600px) {
            .cookie-banner {
              bottom: max(12px, env(safe-area-inset-bottom));
              left: max(12px, env(safe-area-inset-left));
              right: max(12px, env(safe-area-inset-right));
            }
            .cookie-content {
              flex-direction: column;
              align-items: flex-start;
            }
            .cookie-actions {
              width: 100%;
              justify-content: space-between;
              flex-wrap: wrap;
            }
            .cookie-actions .btn {
              flex: 1 1 auto;
              text-align: center;
            }
          }
        `}</style>
      </div>

      {showPreferences && (
        <div className="modal-backdrop" onClick={() => setShowPreferences(false)}>
          <div
            className="modal-content glass fade-up cookie-pref-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowPreferences(false)}
            >
              &times;
            </button>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{t("legal.cookiePreferences") || "Cookie Preferences"}</h2>
            
            <div className="pref-list">
              <label className="pref-item">
                <div>
                  <strong>{t("legal.strictlyNecessary") || "Strictly Necessary"}</strong>
                  <p className="muted" style={{ fontSize: "12px", margin: "4px 0 0" }}>
                    {t("legal.strictlyNecessaryDesc") || "Required for the website to function properly."}
                  </p>
                </div>
                <input type="checkbox" checked disabled />
              </label>

              <label className="pref-item">
                <div>
                  <strong>{t("legal.analyticsCookies") || "Analytics Cookies"}</strong>
                  <p className="muted" style={{ fontSize: "12px", margin: "4px 0 0" }}>
                    {t("legal.analyticsCookiesDesc") || "Help us understand how visitors interact with our app."}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({...prev, analytics: e.target.checked}))}
                />
              </label>

              <label className="pref-item">
                <div>
                  <strong>{t("legal.marketingCookies") || "Marketing Cookies"}</strong>
                  <p className="muted" style={{ fontSize: "12px", margin: "4px 0 0" }}>
                    {t("legal.marketingCookiesDesc") || "Used to deliver personalized advertisements."}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({...prev, marketing: e.target.checked}))}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button 
                className="btn ghost" 
                style={{ flex: 1 }}
                onClick={() => setShowPreferences(false)}
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button 
                className="btn primary" 
                style={{ flex: 1 }}
                onClick={savePreferences}
              >
                {t("common.saveChoices") || "Save My Choices"}
              </button>
            </div>
          </div>

          <style jsx>{`
            .modal-backdrop {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.4);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              padding: 20px;
              animation: fadeIn 0.3s ease-out;
            }
            .cookie-pref-modal {
              max-width: 480px;
              width: 100%;
              padding: 32px;
              text-align: left;
              border-radius: 24px;
              position: relative;
              max-height: calc(100dvh - 32px - env(safe-area-inset-bottom));
              overflow-y: auto;
            }
            .modal-close {
              position: absolute;
              top: 16px;
              right: 16px;
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: var(--ink);
              opacity: 0.5;
            }
            .pref-list {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-top: 20px;
            }
            .pref-item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid var(--line);
              cursor: pointer;
            }
            .pref-item:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .pref-item input[type="checkbox"] {
              width: 20px;
              height: 20px;
              cursor: pointer;
            }
            .pref-item input[type="checkbox"]:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }

            @media (max-width: 600px) {
              .cookie-pref-modal {
                border-radius: 18px;
                padding: 20px 16px max(20px, env(safe-area-inset-bottom));
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
