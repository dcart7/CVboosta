"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "../lib/LanguageContext";
import TopNav from "../components/TopNav";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export default function PricingPage() {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<"week" | "month">("month");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      (window as any).Paddle.Setup({ vendor: 12345 });
    }
  }, []);

  const openCheckout = (priceId: string) => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      (window as any).Paddle.Checkout.open({
        product: priceId,
        email: localStorage.getItem("user_email") || undefined,
      });
    } else {
      alert("Paddle billing service is loading. Please try again in a moment.");
    }
  };

  const tiers = [
    {
      id: "single",
      name: t("pricing.singleScan"),
      price: "$1",
      cycle: t("pricing.oneTime"),
      features: [
        `1 ${t("pricing.featureScan")}`,
        `1 ${t("pricing.featureCl")}`,
        `1 ${t("pricing.featurePrep")}`,
        t("pricing.featureHistory"),
      ],
      cta: t("pricing.ctaBuy"),
      style: "basic",
    },
    {
      id: "go",
      name: t("pricing.go"),
      price: billingCycle === "week" ? "$3" : "$8",
      cycle: billingCycle === "week" ? t("pricing.perWeek") : t("pricing.perMonth"),
      features: [
        t("pricing.featureDaily"),
        `15 ${t("pricing.featureScan")}`,
        `15 ${t("pricing.featureCl")}`,
        `15 ${t("pricing.featurePrep")}`,
        t("pricing.featureHistory"),
      ],
      cta: t("pricing.ctaUpgrade"),
      badge: t("pricing.mostPopular"),
      highlight: true,
      style: "hunted",
    },
    {
      id: "pro",
      name: t("pricing.pro"),
      price: billingCycle === "week" ? "$10" : "$20",
      cycle: billingCycle === "week" ? t("pricing.perWeek") : t("pricing.perMonth"),
      features: [
        t("pricing.featureUnlimited"),
        "Priority Support",
        t("pricing.featureHistory"),
      ],
      cta: t("pricing.ctaUpgrade"),
      badge: t("pricing.bestValue"),
      style: "pro",
    },
    {
      id: "lifetime",
      name: t("pricing.lifetime"),
      price: "$119.99",
      cycle: t("pricing.oneTime"),
      features: [
        t("pricing.featureUnlimited"),
        "Lifetime Access",
        "All Future Updates",
        t("pricing.featureHistory"),
      ],
      cta: t("pricing.ctaUpgrade"),
      premium: true,
      style: "lifetime",
    },
  ];

  return (
    <main className="pricing-container">
      <TopNav />
      
      <div className="pricing-content">
        <header className="pricing-header">
          <h1 className="gradient-text">{t("pricing.title")}</h1>
          <p className="pricing-subtitle">{t("pricing.subtitle")}</p>

          <div className="billing-switch">
             <button 
               onClick={() => setBillingCycle("week")}
               className={billingCycle === "week" ? "active" : ""}
             >
               Weekly
             </button>
             <button 
               onClick={() => setBillingCycle("month")}
               className={billingCycle === "month" ? "active" : ""}
             >
               Monthly
             </button>
          </div>
        </header>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`pricing-card ${tier.style} ${tier.highlight ? "highlight" : ""} ${tier.premium ? "premium" : ""} ${tier.badge ? "has-badge" : ""}`}
            >
              {tier.badge && (
                <div className="badge-tag">{tier.badge}</div>
              )}

              <div className="card-top">
                <h3 className="tier-name">{tier.name}</h3>
                <div className="price-block">
                  <span className="currency">$</span>
                  <span className="amount">{tier.price.replace("$", "")}</span>
                  <span className="cycle">{tier.cycle}</span>
                </div>
              </div>

              <ul className="feature-list">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <div className="check-wrapper">
                      <CheckIcon className="check-icon" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openCheckout(tier.id)}
                className="cta-button"
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <section className="enterprise-box">
           <h2>Enterprise / Teams?</h2>
           <p>Looking for custom limits or volume licenses for your organization?</p>
           <button className="contact-link">
             Contact Sales →
           </button>
        </section>
      </div>
      
      <style jsx>{`
        .pricing-container {
          min-height: 100vh;
          background: #ffffff;
          color: #111;
          position: relative;
        }

        .pricing-content {
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px 24px 100px;
          position: relative;
          z-index: 1;
        }
        .pricing-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .gradient-text {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 16px;
          letter-spacing: -2px;
          color: #000;
        }
        .pricing-subtitle {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .billing-switch {
          display: inline-flex;
          background: #f4f4f7;
          padding: 4px;
          border-radius: 100px;
          margin-top: 32px;
          border: 1px solid #e2e8f0;
        }
        .billing-switch button {
          padding: 10px 28px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: #666;
          border: none;
        }
        .billing-switch button.active {
          background: #ffffff;
          color: #000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .pricing-card {
          background: #ffffff;
          border: 1px solid #eef2f6;
          border-radius: 24px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: 0.3s cubic-bezier(0.2, 0, 0, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
        }
        .pricing-card:hover {
          transform: translateY(-8px);
          border-color: #3b82f6;
          box-shadow: 0 30px 60px rgba(59, 130, 246, 0.12);
        }

        .pricing-card.highlight {
          border-color: #3b82f6;
          background: #f8fbff;
        }
        
        .pricing-card.pro {
          background: #fff;
        }

        .badge-tag {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #3b82f6;
          color: #fff;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.25);
          white-space: nowrap;
        }

        .pro .badge-tag {
          background: #000;
          color: #fff;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        .premium .badge-tag {
          background: #eab308;
          color: #fff;
        }

        .card-top {
          margin-bottom: 24px;
        }
        .tier-name {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: #000;
        }
        .price-block {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .currency {
          font-size: 1.2rem;
          font-weight: 600;
          color: #000;
        }
        .amount {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -2px;
          color: #000;
        }
        .cycle {
          font-size: 0.9rem;
          color: #666;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          flex: 1;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          font-size: 0.85rem;
          color: #444;
          line-height: 1.4;
        }
        .check-wrapper {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .check-icon {
          width: 12px;
          height: 12px;
          color: #3b82f6;
        }

        .cta-button {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.2s;
          border: none;
        }
        
        .basic .cta-button {
          background: #f4f4f7;
          color: #000;
        }
        .hunted .cta-button {
          background: #3b82f6;
          color: #fff;
        }
        .pro .cta-button {
          background: #000;
          color: #fff;
        }
        .premium .cta-button {
          background: #eab308;
          color: #fff;
        }
        .cta-button:hover {
          transform: scale(1.02);
          opacity: 0.9;
        }

        .premium {
          border-color: #fef08a;
          background: #fffdf5;
        }
        .premium .check-wrapper { background: rgba(234, 179, 8, 0.15); }
        .premium .check-icon { color: #eab308; }

        .enterprise-box {
          margin-top: 80px;
          padding: 60px;
          background: #f9fafb;
          border-radius: 32px;
          border: 1px solid #e5e7eb;
          text-align: center;
        }
        .enterprise-box h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .enterprise-box p {
          color: #666;
          margin-bottom: 32px;
        }
        .contact-link {
          background: transparent;
          color: #3b82f6;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          border: none;
        }

        @media (max-width: 1100px) {
          .pricing-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr; }
          .gradient-text { font-size: 2.5rem; }
        }
      `}</style>
    </main>
  );
}
