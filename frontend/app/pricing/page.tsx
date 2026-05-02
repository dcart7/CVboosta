"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../lib/LanguageContext";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { trackEvent } from "../lib/analytics";
import { fetchWithRetry } from "../lib/fetchRetry";

export default function PricingPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const apiBase = getApiBase();
  const [billingCycle, setBillingCycle] = useState<"week" | "month">("month");
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [activeBillingCycle, setActiveBillingCycle] = useState<"week" | "month" | null>(null);
  const tierRank: Record<string, number> = {
    single: 1,
    go: 2,
    pro: 3,
    lifetime: 4,
  };
  const pricingUiCopy = {
    en: { notUpgrade: "Not an upgrade" },
    uk: { notUpgrade: "Не є апгрейдом" },
    pl: { notUpgrade: "To nie upgrade" },
    sk: { notUpgrade: "Nie je to upgrade" },
    cs: { notUpgrade: "Není to upgrade" },
    es: { notUpgrade: "No es una mejora" },
  } as const;

  useEffect(() => {
    setMounted(true);
    trackEvent("pricing_view", { page_type: "pricing" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/billing/status`,
          undefined,
          { attempts: 4, baseDelayMs: 300, timeoutMs: 20_000 },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data?.tier === "string") {
          setActiveTier(data.tier.toLowerCase());
          if (data?.billing_cycle === "week" || data?.billing_cycle === "month") {
            setActiveBillingCycle(data.billing_cycle);
          } else {
            setActiveBillingCycle(null);
          }
        }
      } catch {
        // ignore, pricing page still works without badge
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const openCheckout = async (tierId: string) => {
    const plan = tierId === "go" || tierId === "pro" ? billingCycle : "one_time";
    const price =
      tierId === "single" ? 1
        : tierId === "go" ? (billingCycle === "week" ? 3 : 8)
          : tierId === "pro" ? (billingCycle === "week" ? 10 : 20)
            : 119.99;

    trackEvent("payment_started", {
      product_type: "optimization",
      plan,
      price,
    });

    setCheckoutLoading(tierId);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/billing/stripe/checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier: tierId,
            billing_cycle: tierId === "go" || tierId === "pro" ? billingCycle : null,
            success_url: `${window.location.origin}/account?billing=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/pricing?billing=cancel`,
          }),
        },
        { attempts: 3, baseDelayMs: 300, timeoutMs: 20_000 },
      );
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok || !data?.checkout_url) {
        throw new Error(data?.detail || t("pricing.paddleLoading"));
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      alert(err instanceof Error ? err.message : t("pricing.paddleLoading"));
    } finally {
      setCheckoutLoading(null);
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
        t("pricing.featureNoWatermark"),
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
        t("pricing.featureNoWatermark"),
        t("pricing.featureHistory"),
      ],
      cta: t("pricing.ctaUpgrade"),
      badge: t("pricing.mostPopular"),
      discount: billingCycle === "month" ? t("pricing.savePercent").replace("{{percent}}", "33") : null,
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
        t("pricing.featureNoWatermark"),
        t("pricing.prioritySupport"),
        t("pricing.featureHistory"),
      ],
      cta: t("pricing.ctaUpgrade"),
      badge: t("pricing.bestValue"),
      discount: billingCycle === "month" ? t("pricing.savePercent").replace("{{percent}}", "50") : null,
      style: "pro",
    },
    {
      id: "lifetime",
      name: t("pricing.lifetime"),
      price: "$119.99",
      cycle: t("pricing.oneTime"),
      features: [
        t("pricing.featureUnlimited"),
        t("pricing.featureNoWatermark"),
        t("pricing.lifetimeAccess"),
        t("pricing.allFutureUpdates"),
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

          {!mounted ? (
            <div style={{ height: "64px" }} />
          ) : (
            <div className="billing-switch">
               <button 
                 onClick={() => setBillingCycle("week")}
                 className={billingCycle === "week" ? "active" : ""}
               >
                 {t("pricing.weekly")}
               </button>
               <button 
                 onClick={() => setBillingCycle("month")}
                 className={billingCycle === "month" ? "active" : ""}
               >
                 {t("pricing.monthly")}
               </button>
            </div>
          )}
        </header>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            (() => {
              const isSingleTier = tier.id === "single";
              const isCycleSwitch =
                (tier.id === "go" || tier.id === "pro") &&
                activeTier === tier.id &&
                (activeBillingCycle === "week" || activeBillingCycle === "month") &&
                activeBillingCycle !== billingCycle;
              const isDowngradeCycleSwitch =
                isCycleSwitch && activeBillingCycle === "month" && billingCycle === "week";
              const isActive =
                !isSingleTier &&
                ((tier.id === "go" && activeTier === "go" && !isCycleSwitch) ||
                  (tier.id === "pro" && activeTier === "pro" && !isCycleSwitch) ||
                  (tier.id === "lifetime" && activeTier === "lifetime"));
              const activeRank =
                activeTier && activeTier !== "single" && tierRank[activeTier]
                  ? tierRank[activeTier]
                  : 0;
              const isUpgrade =
                isSingleTier || isCycleSwitch || activeRank === 0 || tierRank[tier.id] > activeRank;
              const canCheckout = isSingleTier ? true : isCycleSwitch || (!isActive && isUpgrade);
              const ctaLabel = isActive
                ? t("pricing.activePlan")
                : isCycleSwitch
                ? t("pricing.switchCycleCta")
                : isUpgrade
                ? tier.cta
                : pricingUiCopy[language].notUpgrade;
              return (
            <div 
              key={tier.id}
              className={`pricing-card ${tier.style} ${tier.highlight ? "highlight" : ""} ${tier.premium ? "premium" : ""} ${tier.badge ? "has-badge" : ""} ${isActive ? "is-active-plan" : ""}`}
            >
              {isActive && (
                <div className="active-plan-tag">{t("pricing.activePlan")}</div>
              )}
              {tier.badge && (
                <div className="badge-tag">{tier.badge}</div>
              )}

              <div className="card-top">
                <h3 className="tier-name">{tier.name}</h3>
                {mounted && tier.discount && (
                  <div className="discount-badge">{tier.discount}</div>
                )}
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
                      <span className="check-glyph" aria-hidden="true">✓</span>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (!canCheckout) return;
                  if (isDowngradeCycleSwitch) {
                    const confirmed = window.confirm(t("pricing.confirmCycleDowngrade"));
                    if (!confirmed) return;
                  }
                  openCheckout(tier.id);
                }}
                className={`cta-button ${!canCheckout ? "is-disabled" : ""}`}
                disabled={checkoutLoading === tier.id || !canCheckout}
              >
                {checkoutLoading === tier.id ? "Redirecting..." : ctaLabel}
              </button>
            </div>
            );
            })()
          ))}
        </div>

        <section className="enterprise-box">
           <h2>{t("pricing.enterpriseTitle")}</h2>
           <p>{t("pricing.enterpriseSubtitle")}</p>
           <button className="contact-link" onClick={() => window.location.href = "mailto:sales@cvboosta.com"}>
             {t("pricing.contactSales")}
           </button>
        </section>
      </div>
      
      <style jsx>{`
        .pricing-container {
          min-height: 100vh;
          background: radial-gradient(circle at 15% 10%, var(--bg-page-spot-a), var(--bg-page-base) 40%),
                      radial-gradient(circle at 85% 10%, var(--bg-page-spot-b), transparent 40%);
          color: var(--ink);
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
          color: var(--ink);
        }
        .pricing-subtitle {
          font-size: 1.2rem;
          color: var(--muted);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .billing-switch {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          padding: 4px;
          border-radius: 100px;
          margin-top: 32px;
          border: 1px solid var(--line);
        }
        .billing-switch button {
          padding: 10px 28px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: var(--muted);
          border: none;
        }
        .billing-switch button.active {
          background: var(--glass-hi);
          color: var(--ink);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .pricing-card {
          background: linear-gradient(135deg, 
                      color-mix(in srgb, var(--glass-hi) 86%, transparent), 
                      var(--surface));
          backdrop-filter: blur(18px) saturate(140%);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: 0.3s cubic-bezier(0.2, 0, 0, 1);
          box-shadow: var(--card-shadow);
        }
        .pricing-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent);
          box-shadow: var(--shadow-hover);
        }
        .pricing-card.is-active-plan {
          border-color: color-mix(in srgb, var(--accent) 70%, #39d98a);
          box-shadow:
            var(--shadow-hover),
            0 0 0 1px color-mix(in srgb, var(--accent) 28%, #39d98a) inset;
        }
        .active-plan-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          background: linear-gradient(135deg, #14b86f, #0f9f5f);
          color: #fff;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          z-index: 2;
          box-shadow: 0 6px 18px rgba(15, 159, 95, 0.35);
        }

        .pricing-card.highlight {
          border-color: var(--accent);
          background: linear-gradient(135deg, 
                      color-mix(in srgb, var(--accent-soft) 20%, var(--glass-hi)), 
                      var(--surface));
        }
        
        .pricing-card.pro {
           /* specialized look if needed, otherwise stays glass */
        }

        .badge-tag {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #fff;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: var(--primary-shadow);
          white-space: nowrap;
          z-index: 2;
        }

        .pro .badge-tag {
          background: var(--ink);
          color: var(--paper);
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
          margin-bottom: 8px;
          color: var(--ink);
        }
        .discount-badge {
          display: inline-block;
          background: var(--accent-soft);
          color: var(--accent);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .price-block {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .currency {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--ink);
        }
        .amount {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -2px;
          color: var(--ink);
        }
        .cycle {
          font-size: 0.9rem;
          color: var(--muted);
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
          color: var(--muted);
          line-height: 1.4;
        }
        .check-wrapper {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .check-glyph {
          font-size: 12px;
          line-height: 1;
          font-weight: 800;
          color: var(--accent);
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
          background: var(--surface-2);
          color: var(--ink);
        }
        .hunted .cta-button {
          background: var(--accent);
          color: #fff;
        }
        .pro .cta-button {
          background: var(--ink);
          color: var(--paper);
        }
        .premium .cta-button {
          background: #eab308;
          color: #fff;
        }
        .cta-button:hover {
          transform: scale(1.02);
          opacity: 0.9;
        }
        .cta-button.is-disabled,
        .cta-button:disabled {
          cursor: not-allowed;
          opacity: 0.62;
          transform: none !important;
          filter: grayscale(0.1);
        }
        .cta-button.is-disabled:hover,
        .cta-button:disabled:hover {
          transform: none;
          opacity: 0.62;
        }

        .premium {
          border-color: #fef08a;
          background: var(--warm);
        }
        .premium .check-wrapper { background: rgba(234, 179, 8, 0.15); }
        .premium .check-glyph { color: #eab308; }

        .enterprise-box {
          margin-top: 80px;
          padding: 60px;
          background: linear-gradient(135deg, 
                      color-mix(in srgb, var(--glass-hi) 80%, transparent), 
                      var(--glass));
          backdrop-filter: blur(20px) saturate(150%);
          border-radius: 32px;
          border: 1px solid var(--glass-border);
          text-align: center;
        }
        .enterprise-box h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--ink);
        }
        .enterprise-box p {
          color: var(--muted);
          margin-bottom: 32px;
        }
        .contact-link {
          background: transparent;
          color: var(--accent);
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
