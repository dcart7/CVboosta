"use client";

import Link from "next/link";
import { useTranslation } from "../lib/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/" className="logo">
              CV<span>boosta</span>
            </Link>
            <p className="footer-copy">{t("footer.rights")}</p>
          </div>
          <div className="footer-links">
            <Link href="/privacy" className="footer-link">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="footer-link">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        .footer {
          margin-top: auto;
          padding: 60px 0 40px;
          border-top: 1px solid var(--glass-border);
          background: rgba(var(--bg-rgb), 0.5);
          backdrop-filter: blur(10px);
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .logo {
          font-size: 20px;
          font-weight: 700;
          text-decoration: none;
          color: var(--ink);
          letter-spacing: -0.5px;
        }
        .logo span {
          color: var(--primary);
        }
        .footer-copy {
          font-size: 14px;
          color: var(--muted);
          opacity: 0.8;
        }
        .footer-links {
          display: flex;
          gap: 32px;
        }
        .footer-link {
          font-size: 14px;
          color: var(--ink);
          text-decoration: none;
          opacity: 0.6;
          transition: all 0.2s ease;
        }
        .footer-link:hover {
          opacity: 1;
          color: var(--primary);
        }
        @media (max-width: 640px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
          .footer-links {
            gap: 24px;
          }
        }
      `}</style>
    </footer>
  );
}
