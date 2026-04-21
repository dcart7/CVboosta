"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";
import type { ResumeKeywordCluster, RoleCategory } from "../lib/resumeKeywordClusters";
import { getResumeKeywordsUi, getSectorLabel } from "../lib/resumeKeywordsI18n";

type Props = {
  clusters: ResumeKeywordCluster[];
};

const CATEGORY_ORDER: RoleCategory[] = [
  "engineering",
  "data",
  "product",
  "design",
  "marketing",
  "sales",
  "operations",
  "finance",
  "hr",
  "customer",
  "legal",
  "healthcare",
  "education",
  "security",
];

export default function ResumeKeywordsHubClient({ clusters }: Props) {
  const { language } = useTranslation();
  const ui = getResumeKeywordsUi(language);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | RoleCategory>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clusters
      .filter((item) => (category === "all" ? true : item.category === category))
      .filter((item) => (q ? item.role.toLowerCase().includes(q) : true))
      .sort((a, b) => a.role.localeCompare(b.role));
  }, [clusters, query, category]);

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      label: getSectorLabel(language, cat),
      items: filtered.filter((item) => item.category === cat),
    })).filter((group) => group.items.length > 0);
  }, [filtered, language]);

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero rk-hero">
          <div className="blog-hero-panel rk-hero-panel">
            <p className="pill">{ui.hubKicker}</p>
            <h1 className="hero-title">{ui.hubTitle}</h1>
            <p className="hero-subtitle rk-hero-subtitle">{ui.hubSubtitle}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn ghost" href="/pricing">
                {ui.optimizeCv}
              </Link>
            </div>
          </div>
        </section>

        <section className="section fade-up rk-hub-section">
          <div className="rk-hub-head">
            <h2 className="section-title">
              {ui.rolesLabel}
              {" "}
              ({filtered.length})
            </h2>
          </div>

          <div className="rk-filters">
            <div className="rk-filter-control">
              <label htmlFor="rk-search">{ui.searchPlaceholder}</label>
              <input
                id="rk-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.searchPlaceholder}
              />
            </div>
            <div className="rk-filter-control">
              <label htmlFor="rk-category">{ui.filterLabel}</label>
              <select
                id="rk-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as "all" | RoleCategory)}
              >
                <option value="all">{ui.allSectors}</option>
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {getSectorLabel(language, cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {grouped.length === 0 ? (
            <div className="card rk-empty">
              <h3>{ui.noResults}</h3>
              <p>{ui.checkSpelling}</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.category} className="rk-category-block">
                <h3 className="rk-category-title">{group.label}</h3>
                <div className="grid rk-role-grid">
                  {group.items.map((cluster) => (
                    <article key={cluster.slug} className="card rk-role-card">
                      <p className="rk-role-card-kicker">{ui.roleGuideKicker}</p>
                      <h3 className="rk-role-card-title">{cluster.role}</h3>
                      <p className="rk-role-card-copy">
                        {ui.hubSubtitle}
                      </p>
                      <Link className="btn ghost rk-role-card-btn" href={`/resume-keywords/${cluster.slug}`}>
                        {ui.openGuide}
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
