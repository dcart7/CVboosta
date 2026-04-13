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
        className="modal-content glass fade-up" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <div className="modal-header">
          <div className="premium-icon-badge">✨</div>
          <h2 className="hero-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {t("premiumModal.title")}
          </h2>
          <p className="muted">
            {t("premiumModal.description")}
          </p>
        </div>

        <div className="modal-body">
          <ul className="feature-list">
            <li>
              <span className="check">✓</span>
              {t("premiumModal.features.scans")}
            </li>
            <li>
              <span className="check">✓</span>
              {t("premiumModal.features.cl")}
            </li>
            <li>
              <span className="check">✓</span>
              {t("premiumModal.features.prep")}
            </li>
          </ul>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button 
            className="btn primary" 
            style={{ width: "100%", padding: "14px", borderRadius: "12px" }}
            onClick={() => window.location.href = "/pricing"}
          >
            {t("premiumModal.upgradeBtn")}
          </button>
          
          <button 
            className="btn ghost" 
            style={{ width: "100%", padding: "12px" }}
            onClick={onClose}
          >
            {t("premiumModal.backBtn")}
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
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          max-width: 440px;
          width: 100%;
          padding: 32px;
          position: relative;
          text-align: center;
          border-radius: 24px;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--foreground);
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .modal-close:hover {
          opacity: 1;
        }

        .premium-icon-badge {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 24px 0;
          text-align: left;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .check {
          color: #10b981;
          font-weight: bold;
        }

        .full-width {
          width: 100%;
          margin-bottom: 8px;
        }

        .modal-footer {
          margin-top: 24px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
