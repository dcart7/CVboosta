"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";
import type { RoleCategory } from "../lib/resumeKeywordClusters";
import { getSectorLabel, localizeRoleName } from "../lib/resumeKeywordsI18n";
import { getResumeExamplesUi } from "../lib/resumeExamplesI18n";

type HubCluster = {
  slug: string;
  role: string;
  category: RoleCategory;
};

type Props = {
  clusters: HubCluster[];
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

const PAGE_SIZE = 72;

export default function ResumeExamplesHubClient({ clusters }: Props) {
  const { language, t } = useTranslation();
  const ui = getResumeExamplesUi(language);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | RoleCategory>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const localizedClusters = useMemo(
    () =>
      clusters.map((item) => ({
        ...item,
        role: localizeRoleName(item.role, language),
      })),
    [clusters, language],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localizedClusters
      .filter((item) => (category === "all" ? true : item.category === category))
      .filter((item) => (q ? item.role.toLowerCase().includes(q) : true))
      .sort((a, b) => a.role.localeCompare(b.role));
  }, [localizedClusters, query, category]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const visibleFiltered = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      label: getSectorLabel(language, cat),
      items: visibleFiltered.filter((item) => item.category === cat),
    })).filter((group) => group.items.length > 0);
  }, [visibleFiltered, language]);

  const hasMore = filtered.length > visibleCount;

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
              <Link className="btn secondary" href="/app">
                {ui.optimizeCv}
              </Link>
              <Link className="btn ghost" href="/register">
                {ui.register}
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
              {ui.rolesLabel}
              {" "}
              ({filtered.length})
            </h2>
          </div>

          <div className="rk-filters">
            <div className="rk-filter-control">
              <label htmlFor="re-search">{ui.searchPlaceholder}</label>
              <input
                id="re-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.searchPlaceholder}
              />
            </div>
            <div className="rk-filter-control">
              <label htmlFor="re-category">{ui.filterLabel}</label>
              <select
                id="re-category"
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
            <>
              {grouped.map((group) => (
                <div key={group.category} className="rk-category-block">
                  <h3 className="rk-category-title">{group.label}</h3>
                  <div className="grid rk-role-grid">
                    {group.items.map((cluster) => (
                      <article key={cluster.slug} className="rk-role-card">
                        <p className="rk-role-card-kicker">{ui.roleCardKicker}</p>
                        <h3 className="rk-role-card-title">{cluster.role}</h3>
                        <p className="rk-role-card-copy">
                          {ui.roleCardCopy}
                        </p>
                        <Link className="btn ghost rk-role-card-btn" href={`/resume-examples/${cluster.slug}`}>
                          {ui.openExample}
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="rk-load-more-wrap">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}
                  >
                    {ui.loadMoreLabel}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel rk-cta-panel">
            <h2 className="section-title">Use these pages, then move into the product</h2>
            <p className="rk-copy">
              Read the example, run a scan, and then open the optimizer so you can turn the advice
              into a vacancy-specific resume before you submit.
            </p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn secondary" href="/app">
                {ui.optimizeCv}
              </Link>
              <Link className="btn ghost" href="/register">
                {ui.register}
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
