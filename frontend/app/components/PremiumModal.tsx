"use client";

import Link from "next/link";
import { useTranslation } from "../lib/LanguageContext";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card fade-up paywall-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="paywall-modal-close"
          type="button"
          onClick={onClose}
          aria-label={t("common.dismiss")}
        >
          ×
        </button>

        <div className="paywall-modal-hero">
          <div className="paywall-modal-icon" aria-hidden="true">
            ✨
          </div>
          <h3 className="paywall-modal-title">{t("results.paywallHeadline")}</h3>
          <p className="paywall-modal-sub">{t("results.paywallSubtext")}</p>
          <p className="paywall-modal-sub">{t("results.paywallJobMatchedLine")}</p>
        </div>

        <ul className="paywall-modal-list">
          <li>
            <span className="paywall-modal-check">✓</span>
            {t("results.paywallFeature1")}
          </li>
          <li>
            <span className="paywall-modal-check">✓</span>
            {t("results.paywallFeature2")}
          </li>
          <li>
            <span className="paywall-modal-check">✓</span>
            {t("results.paywallFeature3")}
          </li>
          <li>
            <span className="paywall-modal-check">✓</span>
            {t("results.paywallFeature4")}
          </li>
        </ul>

        <div className="paywall-modal-actions">
          <Link className="btn primary" href="/pricing?from=modal&intent=unlock">
            {t("results.paywallCta")}
          </Link>
          <button className="btn secondary" type="button" onClick={onClose}>
            {t("results.paywallMaybeLater")}
          </button>
          <Link className="btn ghost" href="/cases?from=paywall_modal" onClick={onClose}>
            {t("results.viewDemoResults")}
          </Link>
        </div>
      </div>
    </div>
  );
}
