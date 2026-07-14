"use client";

import Link from "next/link";
import { useMemo } from "react";
import TopNav from "./TopNav";
import MarkdownLite from "./MarkdownLite";
import { useTranslation } from "../lib/LanguageContext";
import type { Language } from "../lib/translations";
import { localizeSeoExpansionPage, type SeoGuidePage } from "../lib/seoExpansion";

type Props = {
  page: SeoGuidePage;
  hubHref: string;
  hubLabel: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function SeoGuidePageClient({ page, hubHref, hubLabel }: Props) {
  const { t, language } = useTranslation();
  const localizedPage = useMemo(() => localizeSeoExpansionPage(page, language), [page, language]);
  const uiMap: Record<Language, { updated: string; words: string; onPage: string; related: string; relatedLead: string; ctaTitle: string; ctaLead: string; freeChecker: string; optimize: string; register: string }> = {
    en: { updated: "Updated", words: "words", onPage: "On this page", related: "Related pages", relatedLead: "Keep exploring the same cluster so the next page matches your exact hiring problem.", ctaTitle: "Turn this into action on CVboosta", ctaLead: "Run a scan, open the optimizer, and fix the exact gaps before you apply so this page becomes a real resume improvement, not just another tab.", freeChecker: "Free ATS resume checker", optimize: "Optimize my resume", register: "Create free account" },
    uk: { updated: "Оновлено", words: "слів", onPage: "На цій сторінці", related: "Пов’язані сторінки", relatedLead: "Переходьте далі всередині кластера, щоб наступна сторінка точніше закривала вашу hiring-проблему.", ctaTitle: "Перетворіть це на дію в CVboosta", ctaLead: "Запустіть scan, відкрийте optimizer і виправте найбільші розриви ще до відправки заявки.", freeChecker: "Безкоштовний ATS Resume Checker", optimize: "Оптимізувати резюме", register: "Створити акаунт безкоштовно" },
    pl: { updated: "Zaktualizowano", words: "słów", onPage: "Na tej stronie", related: "Powiązane strony", relatedLead: "Przechodź dalej po klastrze, aby kolejna strona lepiej trafiała w Twój problem hiringowy.", ctaTitle: "Zamień to w działanie w CVboosta", ctaLead: "Uruchom scan, otwórz optimizer i popraw największe luki przed wysłaniem aplikacji.", freeChecker: "Darmowy ATS Resume Checker", optimize: "Zoptymalizuj CV", register: "Załóż darmowe konto" },
    sk: { updated: "Aktualizované", words: "slov", onPage: "Na tejto stránke", related: "Súvisiace stránky", relatedLead: "Pokračujte ďalej v rámci klastru, aby ďalšia stránka lepšie riešila váš hiring problém.", ctaTitle: "Premeňte to na akciu v CVboosta", ctaLead: "Spustite scan, otvorte optimizer a opravte najväčšie gapy ešte pred odoslaním žiadosti.", freeChecker: "Bezplatný ATS Resume Checker", optimize: "Optimalizovať životopis", register: "Vytvoriť účet zadarmo" },
    cs: { updated: "Aktualizováno", words: "slov", onPage: "Na této stránce", related: "Související stránky", relatedLead: "Pokračujte v rámci clusteru, aby další stránka přesněji řešila váš hiring problém.", ctaTitle: "Proměňte to v akci v CVboosta", ctaLead: "Spusťte scan, otevřete optimizer a opravte největší mezery ještě před odesláním žádosti.", freeChecker: "Bezplatný ATS Resume Checker", optimize: "Optimalizovat životopis", register: "Vytvořit účet zdarma" },
    es: { updated: "Actualizado", words: "palabras", onPage: "En esta página", related: "Páginas relacionadas", relatedLead: "Sigue explorando el mismo cluster para que la siguiente página encaje mejor con tu problema de hiring.", ctaTitle: "Convierte esto en acción en CVboosta", ctaLead: "Ejecuta un scan, abre el optimizer y corrige las brechas más importantes antes de aplicar.", freeChecker: "ATS Resume Checker gratis", optimize: "Optimizar mi CV", register: "Crear cuenta gratis" },
  };
  const ui = uiMap[language] || uiMap.en;

  const toc = localizedPage.sections.map((section, index) => {
    const base = slugify(section.title);
    return {
      id: `${base || "section"}-${index + 1}`,
      title: section.title,
    };
  });

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href={hubHref}>
              {hubLabel}
            </Link>
            <h1 className="hero-title blog-post-title">{localizedPage.h1}</h1>
            <p className="hero-subtitle blog-post-lead">{localizedPage.lead}</p>
            <p style={{ marginTop: "10px" }}>
              If you want to use this guidance on a live application,{" "}
              <Link href="/cv-optimizer">improve ATS compatibility</Link> and review the role match
              before you submit.
            </p>
            <p className="label blog-label">
              {ui.updated}: {localizedPage.updatedAt} • ~{localizedPage.estimatedWordCount} {ui.words}
            </p>
            <div className="nav-actions" style={{ marginTop: "14px" }}>
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

          <div className="blog-post-section card resume-example-toc">
            <h2 className="seo-anchor" id="on-this-page">
              {ui.onPage}
            </h2>
            <ul className="resume-example-toc-list">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {localizedPage.sections.map((section, index) => (
            <div className="blog-post-section card" key={`${localizedPage.slug}-${index}`}>
              <h2 className="seo-anchor" id={toc[index]?.id || `section-${index + 1}`}>
                {section.title}
              </h2>
              <MarkdownLite markdown={section.body} />
            </div>
          ))}

          {localizedPage.relatedPages.length > 0 && (
            <div className="blog-takeaway card">
              <h3>{ui.related}</h3>
              <p>{ui.relatedLead}</p>
              <div className="rk-related-grid" style={{ marginTop: "10px" }}>
                {localizedPage.relatedPages.map((item) => (
                  <Link key={item.href} className="rk-related-link" href={item.href}>
                    <span>{item.title}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="blog-takeaway card">
            <h3>{ui.ctaTitle}</h3>
            <p>{ui.ctaLead}</p>
            <p style={{ marginTop: "10px" }}>
              The fastest next step is to <Link href="/cv-optimizer">optimize your CV</Link> for
              the exact role instead of trying to generalize the advice across every application.
            </p>
            <div className="nav-actions" style={{ marginTop: "12px" }}>
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
        </article>
      </div>
    </main>
  );
}
