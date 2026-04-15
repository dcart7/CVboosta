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
              <img src="/logo.png" alt="CVboosta logo" width={34} height={34} className="footer-logo" />
              <span className="logo-text">
                CV<span>boosta</span>
              </span>
            </Link>

            <div className="footer-meta">
              <p className="footer-copy">{t("footer.rights")}</p>
              <a
                href="https://virelsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="attribution-link"
              >
                {t("footer.createdBy")}
              </a>
              <a href={`mailto:${t("footer.support")}`} className="footer-email">
                {t("footer.support")}
              </a>

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
        </div>

        <div className="footer-bottom">
          <p className="footer-bottom-text">
            If any communication service is unavailable, we&apos;ll be happy to respond on LinkedIn.{" "}
            <a
              href="https://www.linkedin.com/company/virel-solutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-bottom-link"
            >
              LinkedIn →
            </a>
          </p>
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
          justify-content: flex-start;
          align-items: flex-start;
          gap: 24px;
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          text-decoration: none;
          color: var(--ink);
          letter-spacing: -0.5px;
        }
        .footer-logo {
          width: 34px;
          height: 34px;
          object-fit: contain;
          border-radius: 8px;
          filter: drop-shadow(0 3px 10px rgba(10, 132, 255, 0.2));
          flex-shrink: 0;
        }
        .logo-text {
          color: var(--ink);
          line-height: 1;
        }
        .logo-text span {
          color: var(--accent);
        }
        .footer-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        .footer-copy {
          font-size: 13px;
          color: var(--muted);
          opacity: 0.82;
          margin: 0;
        }
        .attribution-link {
          color: var(--accent);
          text-decoration: none;
          opacity: 0.86;
          transition: opacity 0.2s ease;
          font-weight: 500;
          font-size: 13px;
        }
        .attribution-link:hover {
          opacity: 1;
          text-decoration: underline;
        }
        .footer-email {
          font-size: 14px;
          color: var(--ink);
          text-decoration: none;
          opacity: 0.65;
          transition: all 0.2s ease;
          width: fit-content;
        }
        .footer-email:hover {
          opacity: 1;
          color: var(--accent);
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding-top: 2px;
        }
        .footer-link {
          font-size: 14px;
          color: var(--ink);
          text-decoration: none;
          opacity: 0.65;
          transition: all 0.2s ease;
        }
        .footer-link:hover {
          opacity: 1;
          color: var(--accent);
        }
        .footer-bottom {
          margin-top: 30px;
          padding-top: 18px;
          border-top: 1px solid var(--glass-border);
        }
        .footer-bottom-text {
          margin: 0;
          font-size: 12px;
          color: var(--muted);
          opacity: 0.8;
          line-height: 1.6;
          text-align: center;
        }
        .footer-bottom-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        .footer-bottom-link:hover {
          opacity: 0.88;
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .footer-content {
            align-items: flex-start;
            text-align: left;
          }
          .footer-bottom-text {
            text-align: left;
          }
        }
      `}</style>
    </footer>
  );
}
