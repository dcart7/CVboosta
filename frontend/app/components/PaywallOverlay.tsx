"use client";

import { ReactNode } from "react";

type PaywallOverlayProps = {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export default function PaywallOverlay({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
}: PaywallOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="paywall-overlay" role="dialog" aria-modal="true">
      <div className="paywall-box">
        {onClose && (
          <button
            className="paywall-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}
        <div className="paywall-head">
          <h2 className="paywall-title">{title}</h2>
          {subtitle && <p className="paywall-subtitle" style={{ whiteSpace: "pre-line" }}>{subtitle}</p>}
        </div>
        {children && <div className="paywall-body">{children}</div>}
        {actions && <div className="paywall-actions">{actions}</div>}
      </div>
    </div>
  );
}
