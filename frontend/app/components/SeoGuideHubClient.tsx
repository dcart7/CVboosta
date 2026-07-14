"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "./TopNav";
import { useTranslation } from "../lib/LanguageContext";
import type { Language } from "../lib/translations";

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
  const { t, language } = useTranslation();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const copy: Record<Language, {
    pages: string;
    searchLabel: string;
    searchPlaceholder: string;
    noResults: string;
    noResultsHint: string;
    loadMore: string;
    freeChecker: string;
    optimize: string;
    register: string;
  }> = {
    en: {
      pages: "Pages",
      searchLabel: "Search this hub",
      searchPlaceholder: "Search titles, intents, or slugs",
      noResults: "No pages found",
      noResultsHint: "Try a shorter keyword or a role, company, ATS, or industry term.",
      loadMore: "Load more pages",
      freeChecker: "Free ATS resume checker",
      optimize: "Optimize my resume",
      register: "Create free account",
    },
    uk: {
      pages: "Сторінки",
      searchLabel: "Пошук у цьому хабі",
      searchPlaceholder: "Шукайте назви, наміри або slug",
      noResults: "Сторінки не знайдено",
      noResultsHint: "Спробуйте коротший запит або назву ролі, компанії, ATS чи індустрії.",
      loadMore: "Показати більше сторінок",
      freeChecker: "Безкоштовний ATS Resume Checker",
      optimize: "Оптимізувати резюме",
      register: "Створити акаунт безкоштовно",
    },
    pl: {
      pages: "Strony",
      searchLabel: "Szukaj w tym hubie",
      searchPlaceholder: "Szukaj tytułów, intencji lub slugów",
      noResults: "Nie znaleziono stron",
      noResultsHint: "Spróbuj krótszego zapytania albo nazwy roli, firmy, ATS lub branży.",
      loadMore: "Pokaż więcej stron",
      freeChecker: "Darmowy ATS Resume Checker",
      optimize: "Zoptymalizuj CV",
      register: "Załóż darmowe konto",
    },
    sk: {
      pages: "Stránky",
      searchLabel: "Hľadať v tomto hube",
      searchPlaceholder: "Hľadajte názvy, intent alebo slugy",
      noResults: "Nenašli sa žiadne stránky",
      noResultsHint: "Skúste kratší dopyt alebo názov roly, firmy, ATS či odvetvia.",
      loadMore: "Zobraziť viac stránok",
      freeChecker: "Bezplatný ATS Resume Checker",
      optimize: "Optimalizovať životopis",
      register: "Vytvoriť účet zadarmo",
    },
    cs: {
      pages: "Stránky",
      searchLabel: "Hledat v tomto hubu",
      searchPlaceholder: "Hledejte názvy, intent nebo slugy",
      noResults: "Žádné stránky nebyly nalezeny",
      noResultsHint: "Zkuste kratší dotaz nebo název role, firmy, ATS či odvětví.",
      loadMore: "Zobrazit více stránek",
      freeChecker: "Bezplatný ATS Resume Checker",
      optimize: "Optimalizovat životopis",
      register: "Vytvořit účet zdarma",
    },
    es: {
      pages: "Páginas",
      searchLabel: "Buscar en este hub",
      searchPlaceholder: "Busca títulos, intenciones o slugs",
      noResults: "No se encontraron páginas",
      noResultsHint: "Prueba una consulta más corta o el nombre del rol, empresa, ATS o industria.",
      loadMore: "Ver más páginas",
      freeChecker: "ATS Resume Checker gratis",
      optimize: "Optimizar mi CV",
      register: "Crear cuenta gratis",
    },
  };
  const ui = copy[language] || copy.en;

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
                {ui.freeChecker}
              </Link>
              <Link className="btn secondary" href="/app">
                {ui.optimize}
              </Link>
              <Link className="btn ghost" href="/cv-optimizer">
                CV optimizer
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
              {ui.pages} ({filtered.length})
            </h2>
          </div>

          <div className="rk-filters">
            <div className="rk-filter-control">
              <label htmlFor={`${basePath}-search`}>{ui.searchLabel}</label>
              <input
                id={`${basePath}-search`}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={ui.searchPlaceholder}
              />
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="card rk-empty">
              <h3>{ui.noResults}</h3>
              <p>{ui.noResultsHint}</p>
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
                    {ui.loadMore}
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
            <p style={{ marginTop: "10px" }}>
              If you already know the target position,{" "}
              <Link href="/cv-optimizer">tailor your CV for this role</Link> before you export the
              final version.
            </p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn secondary" href="/app">
                {ui.optimize}
              </Link>
              <Link className="btn ghost" href="/cv-optimizer">
                CV optimizer
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
