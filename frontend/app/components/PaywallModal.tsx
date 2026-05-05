"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export default function PaywallModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
}: PaywallModalProps) {
  const [mounted, setMounted] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="paywall-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="paywall-box"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          const y = e.touches[0]?.clientY;
          if (typeof y === "number") {
            setTouchStartY(y);
            setTouchDeltaY(0);
          }
        }}
        onTouchMove={(e) => {
          if (touchStartY === null) return;
          const y = e.touches[0]?.clientY;
          if (typeof y !== "number") return;
          setTouchDeltaY(Math.max(0, y - touchStartY));
        }}
        onTouchEnd={() => {
          if (touchDeltaY > 90) onClose();
          setTouchStartY(null);
          setTouchDeltaY(0);
        }}
        style={touchDeltaY ? ({ transform: `translateY(${touchDeltaY}px)` } as any) : undefined}
      >
        <div className="paywall-sheet-handle mobile-only" aria-hidden="true" />
        <button
          className="paywall-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="paywall-title">{title}</h2>
        {subtitle && (
          <p className="paywall-subtitle" style={{ whiteSpace: "pre-line" }}>
            {subtitle}
          </p>
        )}

        {children && <div className="paywall-body">{children}</div>}
        {actions && <div className="paywall-actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
