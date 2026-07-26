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

type InternalLink = {
  href: string;
  label: string;
};

function isInternalLinkIdeasSection(title: string) {
  return ["internal link ideas", "recommended next reads"].includes(title.trim().toLowerCase());
}

function titleCaseSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const upper = part.toUpperCase();
      if (["ats", "api", "sql", "pdf", "docx", "hr", "qa", "ux", "ui"].includes(part)) return upper;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function internalLinkLabel(href: string) {
  const parts = href.split("/").filter(Boolean);
  const family = parts[0] || "guide";
  const topic = titleCaseSlug(parts.at(-1) || "guide");

  switch (family) {
    case "tools":
      return `Open ${topic}`;
    case "ats":
      return `Read the ${topic} ATS guide`;
    case "resume-keywords":
      return `See ${topic} resume keywords`;
    case "skills":
      return `Review ${topic} skill guidance`;
    case "datasets":
      return `Explore ${topic} resume skills`;
    default:
      return `Explore ${topic}`;
  }
}

function extractInternalLinks(markdown: string): InternalLink[] {
  const links = markdown.split(/\r?\n/).flatMap((line) => {
    const rawPath = line.match(/^\s*-\s+`(\/[^`]+)`\s*$/)?.[1];
    const markdownPath = line.match(/^\s*-\s+\[[^\]]+\]\((\/[^)]+)\)\s*$/)?.[1];
    const href = rawPath || markdownPath;
    return href ? [{ href, label: internalLinkLabel(href) }] : [];
  });

  return Array.from(new Map(links.map((link) => [link.href, link])).values());
}

function InternalLinkButtons({ markdown }: { markdown: string }) {
  const links = extractInternalLinks(markdown);

  return (
    <div className="nav-actions seo-internal-link-actions">
      {links.map((link, index) => (
        <Link className={`btn ${index === 0 ? "primary" : "secondary"}`} href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

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
            <nav className="rk-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={hubHref}>{hubLabel}</Link>
              <span aria-hidden="true">/</span>
              <span>{page.h1}</span>
            </nav>
            <Link className="btn ghost" href={hubHref}>
              {hubLabel}
            </Link>
            <h1 className="hero-title blog-post-title">{page.h1}</h1>
            {page.lead && <p className="hero-subtitle blog-post-lead">{page.lead}</p>}
            <p className="label blog-label">
              {ui.updated}: <time dateTime={page.updatedAt}>{page.updatedAt}</time> • ~{page.estimatedWordCount} {ui.words}
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

          <section className="blog-post-section card" data-ai-summary="true" aria-labelledby="quick-answer">
            <h2 className="section-title" id="quick-answer">Quick answer</h2>
            <p>{page.lead || page.metaDescription}</p>
          </section>

          {page.sections.length > 0 && (
            <div className="blog-post-section card resume-example-toc">
              <h2 className="seo-anchor" id="on-this-page">
                {ui.onPage}
              </h2>
              <ul className="resume-example-toc-list">
                {page.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>
                      {isInternalLinkIdeasSection(section.title) ? "Recommended next reads" : section.title}
                    </a>
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
                {isInternalLinkIdeasSection(section.title) ? "Recommended next reads" : section.title}
              </h2>
              {isInternalLinkIdeasSection(section.title) ? (
                <>
                  <p className="seo-internal-link-lead">
                    Continue with the most relevant CVBoosta guides for this topic.
                  </p>
                  <InternalLinkButtons markdown={section.markdown} />
                </>
              ) : (
                <MarkdownLite markdown={section.markdown} />
              )}
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
