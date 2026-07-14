"use client";

import Link from "next/link";
import TopNav from "./TopNav";
import MarkdownLite from "./MarkdownLite";
import { useTranslation } from "../lib/LanguageContext";
import type { Language } from "../lib/translations";
import type { SeoMarkdownPage } from "../lib/seoMarkdownPages";

type Props = {
  page: SeoMarkdownPage;
  hubHref: string;
  hubLabel: string;
};

export default function SeoMarkdownPageClient({ page, hubHref, hubLabel }: Props) {
  const { t, language } = useTranslation();
  const uiMap: Record<
    Language,
    {
      updated: string;
      words: string;
      onPage: string;
      freeChecker: string;
      optimize: string;
      register: string;
      ctaTitle: string;
      ctaLead: string;
    }
  > = {
    en: {
      updated: "Updated",
      words: "words",
      onPage: "On this page",
      freeChecker: "Free ATS resume checker",
      optimize: "Optimize my resume",
      register: "Create free account",
      ctaTitle: "Turn this into action on CVboosta",
      ctaLead:
        "Use the guidance as context, then run a scan and tighten the actual file before you send the next application.",
    },
    uk: {
      updated: "Оновлено",
      words: "слів",
      onPage: "На цій сторінці",
      freeChecker: "Безкоштовний ATS Resume Checker",
      optimize: "Оптимізувати резюме",
      register: "Створити акаунт безкоштовно",
      ctaTitle: "Перетворіть це на дію в CVboosta",
      ctaLead:
        "Використайте гайд як основу, а потім запустіть scan і підсиліть саме той файл, який підете відправляти.",
    },
    pl: {
      updated: "Zaktualizowano",
      words: "słów",
      onPage: "Na tej stronie",
      freeChecker: "Darmowy ATS Resume Checker",
      optimize: "Zoptymalizuj CV",
      register: "Załóż darmowe konto",
      ctaTitle: "Zamień to w działanie w CVboosta",
      ctaLead:
        "Potraktuj ten przewodnik jako punkt wyjścia, a potem uruchom scan i popraw prawdziwy plik przed wysłaniem aplikacji.",
    },
    sk: {
      updated: "Aktualizované",
      words: "slov",
      onPage: "Na tejto stránke",
      freeChecker: "Bezplatný ATS Resume Checker",
      optimize: "Optimalizovať životopis",
      register: "Vytvoriť účet zadarmo",
      ctaTitle: "Premeňte to na akciu v CVboosta",
      ctaLead:
        "Použite tento návod ako základ a potom spustite scan, aby ste upravili reálny životopis pred odoslaním.",
    },
    cs: {
      updated: "Aktualizováno",
      words: "slov",
      onPage: "Na této stránce",
      freeChecker: "Bezplatný ATS Resume Checker",
      optimize: "Optimalizovat životopis",
      register: "Vytvořit účet zdarma",
      ctaTitle: "Proměňte to v akci v CVboosta",
      ctaLead:
        "Berte tento průvodce jako základ a pak spusťte scan, abyste upravili skutečný životopis před odesláním.",
    },
    es: {
      updated: "Actualizado",
      words: "palabras",
      onPage: "En esta página",
      freeChecker: "ATS Resume Checker gratis",
      optimize: "Optimizar mi CV",
      register: "Crear cuenta gratis",
      ctaTitle: "Convierte esto en acción en CVboosta",
      ctaLead:
        "Usa esta guía como contexto y luego ejecuta un scan para mejorar el CV real antes de enviar la siguiente candidatura.",
    },
  };
  const ui = uiMap[language] || uiMap.en;

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href={hubHref}>
              {hubLabel}
            </Link>
            <h1 className="hero-title blog-post-title">{page.h1}</h1>
            {page.lead && <p className="hero-subtitle blog-post-lead">{page.lead}</p>}
            <p className="label blog-label">
              {ui.updated}: {page.updatedAt} • ~{page.estimatedWordCount} {ui.words}
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

          {page.sections.length > 0 && (
            <div className="blog-post-section card resume-example-toc">
              <h2 className="seo-anchor" id="on-this-page">
                {ui.onPage}
              </h2>
              <ul className="resume-example-toc-list">
                {page.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {page.introMarkdown && (
            <div className="blog-post-section card">
              <MarkdownLite markdown={page.introMarkdown} />
            </div>
          )}

          {page.sections.map((section) => (
            <div className="blog-post-section card" key={`${page.slug}-${section.id}`}>
              <h2 className="seo-anchor" id={section.id}>
                {section.title}
              </h2>
              <MarkdownLite markdown={section.markdown} />
            </div>
          ))}

          <div className="blog-takeaway card">
            <h3>{ui.ctaTitle}</h3>
            <p>{ui.ctaLead}</p>
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
