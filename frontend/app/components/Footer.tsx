"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useTranslation } from "../lib/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-content">
          <div className="footer-row footer-row-1">
            <div className="footer-brand">
              <Link href="/" className="logo">
                <Image
                  src="/logo.png"
                  alt="CVboosta logo"
                  width={34}
                  height={34}
                  className="footer-logo"
                  sizes="34px"
                />
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
              </div>
            </div>

            <div className="footer-social-row">
              <a
                href="https://apps.apple.com/ua/app/cvboosta/id6778948945?l=ru"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-app-btn"
                aria-label={t("footer.appButton")}
              >
                <span className="footer-app-kicker">{t("footer.appKicker")}</span>
                <span>{t("footer.appButton")}</span>
              </a>
              <a
                href="https://www.producthunt.com/products/cvboosta-ai-resume-optimizer"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
              >
                {t("footer.productHunt")}
              </a>
              <a
                href="https://www.linkedin.com/company/virel-solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
              >
                {t("footer.linkedin")}
              </a>
            </div>
          </div>

          <div className="footer-row footer-row-2" aria-label="Review links">
            <div className="footer-review-head">LEAVE A REVIEW ON</div>
            <div className="footer-review-grid">
              <a
                href="https://www.producthunt.com/products/cvboosta-ai-resume-optimizer/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-cvboosta-ai-resume-optimizer"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-review-badge"
                aria-label="Leave a review on Product Hunt"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1209906&theme=light"
                  alt="Leave a review on Product Hunt"
                  width={250}
                  height={54}
                  loading="lazy"
                />
              </a>

              <Script
                id="trustpilot-widget"
                strategy="afterInteractive"
                src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
              />
              <div
                className="trustpilot-widget footer-review-trustpilot"
                data-locale="en-US"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="69f3862ed92de14a6b52d88c"
                data-style-height="52px"
                data-style-width="100%"
                data-token="16fdccf2-5744-4915-8d1d-5b1fcc003d22"
              >
                <a href="https://www.trustpilot.com/review/cvboosta.com" target="_blank" rel="noopener noreferrer">
                  Trustpilot
                </a>
              </div>
            </div>
          </div>

          <div className="footer-row footer-row-3">
            <div className="footer-links">
              <Link href="/privacy" className="footer-link">
                {t("footer.privacy")}
              </Link>
              <Link href="/terms" className="footer-link">
                {t("footer.terms")}
              </Link>
              <Link href="/terms#service-faq" className="footer-link">
                {t("footer.faq")}
              </Link>
              <Link href="/resume-keywords" className="footer-link">
                {t("footer.resumeKeywords")}
              </Link>
            </div>
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
          display: grid;
          gap: 18px;
        }
        .footer-row {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 16px 18px;
          flex-wrap: wrap;
        }
        .footer-row-1 {
          justify-content: space-between;
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-social-row {
          margin-top: 4px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: fit-content;
          gap: 16px;
        }
        .footer-review-head {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
          color: var(--muted);
          opacity: 0.88;
        }
        .footer-review-grid {
          display: grid;
          grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
          gap: 12px 16px;
          align-items: center;
          width: 100%;
          max-width: 860px;
        }
        .footer-review-badge {
          display: inline-flex;
          width: fit-content;
          text-decoration: none;
        }
        .footer-review-badge img {
          border-radius: 12px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
        }
        .footer-review-trustpilot {
          width: 100%;
        }
        .footer-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--accent) 38%, var(--glass-border));
          background:
            linear-gradient(140deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.08) 62%, rgba(255, 255, 255, 0.04)),
            color-mix(in srgb, var(--surface) 80%, transparent);
          box-shadow:
            0 8px 20px rgba(15, 23, 42, 0.08),
            0 1px 0 rgba(255, 255, 255, 0.3) inset;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: var(--accent);
          text-decoration: none;
          transition: transform 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
        }
        .footer-social-btn:hover {
          border-color: color-mix(in srgb, var(--accent) 56%, var(--glass-border));
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .footer-app-btn {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          min-height: 40px;
          padding: 7px 14px;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--accent) 64%, var(--glass-border));
          background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, #6d5dfc));
          box-shadow: 0 10px 22px color-mix(in srgb, var(--accent) 22%, transparent);
          color: #fff;
          text-decoration: none;
          line-height: 1.15;
          transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
        }
        .footer-app-btn:hover {
          opacity: 0.94;
          transform: translateY(-1px);
          box-shadow: 0 12px 26px color-mix(in srgb, var(--accent) 30%, transparent);
        }
        .footer-app-kicker {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.82;
          font-weight: 700;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 34px;
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
          display: inline-flex;
          align-items: center;
          line-height: 1;
          color: var(--ink);
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
          flex-direction: row;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 10px;
        }
        .footer-link {
          position: relative;
          font-size: 14px;
          color: var(--ink);
          text-decoration: none;
          opacity: 0.9;
          transition: all 0.2s ease;
          font-weight: 500;
          padding: 9px 12px;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--glass-border) 80%, rgba(255, 255, 255, 0.35));
          background:
            linear-gradient(140deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0.10) 62%, rgba(255, 255, 255, 0.05)),
            color-mix(in srgb, var(--surface) 76%, transparent);
          box-shadow:
            0 8px 20px rgba(15, 23, 42, 0.10),
            0 1px 0 rgba(255, 255, 255, 0.35) inset;
          backdrop-filter: blur(14px) saturate(150%);
          overflow: hidden;
        }
        .footer-link::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), transparent 35%, rgba(255, 255, 255, 0.08) 70%, transparent);
        }
        .footer-link:hover {
          opacity: 1;
          color: var(--accent);
          border-color: color-mix(in srgb, var(--accent) 45%, var(--glass-border));
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .footer-social-row {
            width: 100%;
          }
          .footer-review-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
