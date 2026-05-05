"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="paywall-overlay"
      role="dialog"
      aria-modal="true"
      onClick={() => onClose?.()}
    >
      <div className="paywall-box" onClick={(e) => e.stopPropagation()}>
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
    </div>,
    document.body,
  );
}
