"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../lib/LanguageContext";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner fade-up">
      <div className="cookie-content">
        <div className="cookie-text">
          <span style={{ fontSize: "20px" }}>🍪</span>
          <p>
            {t("legal.cookieNotice") || "Our website uses cookies to improve your experience and analyze usage limits."}
          </p>
        </div>
        <div className="cookie-actions">
          <button className="btn ghost small" onClick={() => setShow(false)}>
            {t("common.dismiss") || "Dismiss"}
          </button>
          <button className="btn primary small" onClick={accept}>
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
          max-width: 600px;
          margin: 0 auto;
          z-index: 9999;
          background: rgba(15, 20, 30, 0.7);
          backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 16px 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
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
        }
        .cookie-text p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
        }
        .cookie-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .small {
          padding: 8px 16px !important;
          font-size: 12px !important;
          border-radius: 10px !important;
        }
        @media (max-width: 600px) {
          .cookie-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .cookie-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
