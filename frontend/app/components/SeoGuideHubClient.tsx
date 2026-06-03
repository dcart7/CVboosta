"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "./TopNav";
import { useTranslation } from "../lib/LanguageContext";

type HubItem = {
  slug: string;
  title: string;
  lead: string;
};

type Props = {
  badge: string;
  title: string;
  subtitle: string;
  basePath: string;
  openLabel: string;
  ctaTitle: string;
  ctaLead: string;
  items: HubItem[];
};

const PAGE_SIZE = 48;

export default function SeoGuideHubClient({
  badge,
  title,
  subtitle,
  basePath,
  openLabel,
  ctaTitle,
  ctaLead,
  items,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!normalized) return true;
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.lead.toLowerCase().includes(normalized) ||
        item.slug.toLowerCase().includes(normalized)
      );
    });
  }, [items, query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = filtered.length > visibleCount;

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero rk-hero">
          <div className="blog-hero-panel rk-hero-panel">
            <p className="pill">{badge}</p>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle rk-hero-subtitle">{subtitle}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                Free ATS resume checker
              </Link>
              <Link className="btn secondary" href="/app">
                Optimize my resume
              </Link>
              <Link className="btn ghost" href="/register">
                Create free account
              </Link>
              <Link className="btn ghost" href="/login">
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </section>

        <section className="section fade-up rk-hub-section">
          <div className="rk-hub-head">
            <h2 className="section-title">
              Pages ({filtered.length})
            </h2>
          </div>

          <div className="rk-filters">
            <div className="rk-filter-control">
              <label htmlFor={`${basePath}-search`}>Search this hub</label>
              <input
                id={`${basePath}-search`}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, intents, or slugs"
              />
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="card rk-empty">
              <h3>No pages found</h3>
              <p>Try a shorter keyword or a role, company, ATS, or industry term.</p>
            </div>
          ) : (
            <>
              <div className="grid rk-role-grid">
                {visibleItems.map((item) => (
                  <article key={item.slug} className="rk-role-card">
                    <p className="rk-role-card-kicker">{badge}</p>
                    <h3 className="rk-role-card-title">{item.title}</h3>
                    <p className="rk-role-card-copy">{item.lead}</p>
                    <Link className="btn ghost rk-role-card-btn" href={`${basePath}/${item.slug}`}>
                      {openLabel}
                    </Link>
                  </article>
                ))}
              </div>
              {hasMore && (
                <div className="rk-load-more-wrap">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}
                  >
                    Load more pages
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel rk-cta-panel">
            <h2 className="section-title">{ctaTitle}</h2>
            <p className="rk-copy">{ctaLead}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                Free ATS resume checker
              </Link>
              <Link className="btn secondary" href="/app">
                Optimize my resume
              </Link>
              <Link className="btn ghost" href="/register">
                Create free account
              </Link>
              <Link className="btn ghost" href="/login">
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
