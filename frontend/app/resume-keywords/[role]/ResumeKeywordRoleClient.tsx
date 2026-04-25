"use client";

import Link from "next/link";
import { useMemo } from "react";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";
import type { ResumeKeywordCluster } from "../../lib/resumeKeywordClusters";
import {
  getResumeKeywordsUi,
  localizeRoleName,
  localizeResumeKeywordCluster,
} from "../../lib/resumeKeywordsI18n";
import {
  getFinalChecklist,
  getRoleFreshnessNotes,
  getRoleExpectations,
  getRoleImpactBullets,
  getRoleUniqueIntro,
  getRoleLongFormSections,
  getRoleToolStack,
  getSectionBlueprint,
} from "../../lib/resumeKeywordContent";

type Props = {
  cluster: ResumeKeywordCluster;
  longTailPhrases: string[];
  relatedRoles: Array<{ slug: string; role: string }>;
};

export default function ResumeKeywordRoleClient({ cluster, longTailPhrases, relatedRoles }: Props) {
  const { language } = useTranslation();
  const ui = getResumeKeywordsUi(language);
  const sectionText = {
    en: {
      strategySnapshot: "resume strategy snapshot",
      inDepthTitle: "In-depth",
      inDepthGuide: "Resume Guide",
      inDepthLead:
        "This section is updated regularly and designed to keep the page useful for real applications, not just keyword matching.",
      monthlyUpdates: "Monthly content updates",
      relatedRoles: "Related roles",
      relatedRolesLead:
        "Explore adjacent guides to improve internal linking and discover role-specific keyword patterns.",
    },
    uk: {
      strategySnapshot: "короткий стратегічний знімок резюме",
      inDepthTitle: "Поглиблений",
      inDepthGuide: "гайд по резюме",
      inDepthLead:
        "Цей блок регулярно оновлюється, щоб сторінка була корисною для реальних відгуків, а не лише для ключових слів.",
      monthlyUpdates: "Щомісячні оновлення контенту",
      relatedRoles: "Суміжні ролі",
      relatedRolesLead:
        "Перегляньте суміжні гайди, щоб краще зрозуміти рольові патерни ключових слів.",
    },
    pl: {
      strategySnapshot: "strategiczny skrót CV",
      inDepthTitle: "Rozszerzony",
      inDepthGuide: "poradnik CV",
      inDepthLead:
        "Ta sekcja jest regularnie aktualizowana, aby strona była użyteczna przy realnych aplikacjach, nie tylko pod słowa kluczowe.",
      monthlyUpdates: "Miesięczne aktualizacje treści",
      relatedRoles: "Powiązane role",
      relatedRolesLead:
        "Sprawdź pokrewne poradniki, aby lepiej dobrać słowa kluczowe do roli.",
    },
    sk: {
      strategySnapshot: "strategický prehľad životopisu",
      inDepthTitle: "Rozšírený",
      inDepthGuide: "návod na životopis",
      inDepthLead:
        "Táto sekcia sa pravidelne aktualizuje, aby bola stránka užitočná pre reálne prihlášky, nielen pre kľúčové slová.",
      monthlyUpdates: "Mesačné aktualizácie obsahu",
      relatedRoles: "Súvisiace roly",
      relatedRolesLead:
        "Preskúmajte príbuzné návody a objavte role-specific vzory kľúčových slov.",
    },
    cs: {
      strategySnapshot: "strategický přehled životopisu",
      inDepthTitle: "Rozšířený",
      inDepthGuide: "průvodce životopisem",
      inDepthLead:
        "Tato sekce se pravidelně aktualizuje, aby stránka byla užitečná pro reálné přihlášky, nejen pro klíčová slova.",
      monthlyUpdates: "Měsíční aktualizace obsahu",
      relatedRoles: "Související role",
      relatedRolesLead:
        "Prozkoumejte související průvodce a objevte role-specific vzory klíčových slov.",
    },
    es: {
      strategySnapshot: "resumen estratégico del CV",
      inDepthTitle: "Guía en profundidad",
      inDepthGuide: "de CV",
      inDepthLead:
        "Esta sección se actualiza regularmente para que la página sea útil en postulaciones reales, no solo para keywords.",
      monthlyUpdates: "Actualizaciones mensuales de contenido",
      relatedRoles: "Roles relacionados",
      relatedRolesLead:
        "Explora guías relacionadas para descubrir patrones de keywords por rol.",
    },
  }[language];
  const localized = useMemo(
    () => localizeResumeKeywordCluster(cluster, language),
    [cluster, language],
  );
  const localizedLongTail = useMemo(() => {
    const roleLower = localized.role.toLowerCase();
    if (language === "uk") {
      return [
        `ключові слова резюме для ${roleLower}`,
        `приклади резюме ${roleLower}`,
        `поради ATS для ${roleLower}`,
        `bullet-пункти резюме ${roleLower}`,
      ];
    }
    if (language === "pl") {
      return [
        `słowa kluczowe CV dla ${roleLower}`,
        `przykłady CV ${roleLower}`,
        `porady ATS dla ${roleLower}`,
        `bullet pointy CV ${roleLower}`,
      ];
    }
    if (language === "sk") {
      return [
        `kľúčové slová životopisu pre ${roleLower}`,
        `príklady životopisu ${roleLower}`,
        `ATS tipy pre ${roleLower}`,
        `bullet body životopisu ${roleLower}`,
      ];
    }
    if (language === "cs") {
      return [
        `klíčová slova životopisu pro ${roleLower}`,
        `příklady životopisu ${roleLower}`,
        `ATS tipy pro ${roleLower}`,
        `bullet body životopisu ${roleLower}`,
      ];
    }
    if (language === "es") {
      return [
        `palabras clave de CV para ${roleLower}`,
        `ejemplos de CV de ${roleLower}`,
        `consejos ATS para ${roleLower}`,
        `bullets de CV para ${roleLower}`,
      ];
    }
    return longTailPhrases;
  }, [language, localized.role, longTailPhrases]);
  const expectations = useMemo(() => getRoleExpectations(cluster, language), [cluster, language]);
  const impactBullets = useMemo(() => getRoleImpactBullets(cluster, language), [cluster, language]);
  const toolStack = useMemo(() => getRoleToolStack(localized), [localized]);
  const blueprint = useMemo(() => getSectionBlueprint(cluster, language), [cluster, language]);
  const checklist = useMemo(() => getFinalChecklist(cluster, language), [cluster, language]);
  const uniqueIntro = useMemo(() => getRoleUniqueIntro(cluster, language), [cluster, language]);
  const longFormSections = useMemo(() => getRoleLongFormSections(cluster, language), [cluster, language]);
  const freshnessNotes = useMemo(() => getRoleFreshnessNotes(cluster, language), [cluster, language]);

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero rk-hero">
          <div className="blog-hero-panel rk-hero-panel">
            <p className="pill">{ui.roleGuideKicker}</p>
            <h1 className="hero-title">{ui.pageTitle(localized.role)}</h1>
            <p className="hero-subtitle rk-hero-subtitle">{ui.pageDescription(localized.role)}</p>
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

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{localized.role} {sectionText.strategySnapshot}</h2>
            {uniqueIntro.map((paragraph) => (
              <p key={paragraph} className="rk-copy" style={{ marginTop: "8px" }}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.topKeywordsTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.topKeywordsText(localized.role)}</p>
            <div className="rk-chip-grid">
              {localized.keywords.map((item) => (
                <div key={item} className="rk-chip">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.mistakesTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.mistakesText(localized.role)}</p>
            <ol className="rk-mistakes-list">
              {localized.mistakes.map((mistake) => (
                <li key={mistake} className="rk-mistake-item">
                  {mistake}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.expectationsTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.expectationsText}</p>
            <ol className="rk-mistakes-list">
              {expectations.map((item) => (
                <li key={item} className="rk-mistake-item">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.examplesTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.examplesText}</p>
            <div className="grid rk-example-grid">
              {localized.examples.map((example, index) => (
                <article key={`${localized.slug}-${index}`} className="card rk-example-card">
                  <p className="rk-example-line rk-before">
                    <strong>{ui.before}</strong>
                    {" "}
                    {example.before}
                  </p>
                  <p className="rk-example-line rk-after">
                    <strong>{ui.after}</strong>
                    {" "}
                    {example.after}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.impactTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.impactText}</p>
            <ol className="rk-mistakes-list">
              {impactBullets.map((item) => (
                <li key={item} className="rk-mistake-item">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.toolStackTitle}</h2>
            <p className="rk-copy">{ui.toolStackText}</p>
            <div className="rk-chip-grid">
              {toolStack.map((tool) => (
                <div key={tool} className="rk-chip">
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.blueprintTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.blueprintText}</p>
            <div className="grid rk-blueprint-grid">
              {blueprint.map((item) => (
                <article key={item.section} className="card rk-blueprint-card">
                  <h3>{item.section}</h3>
                  <p><strong>{ui.blueprintPurposeLabel}:</strong> {item.purpose}</p>
                  <p><strong>{ui.blueprintKeywordPlacementLabel}:</strong> {item.keywordPlacement}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.fifteenMinTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.fifteenMinText}</p>
            <p className="rk-copy rk-muted">
              {ui.longTailText}: {localizedLongTail.join(", ")}.
            </p>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{sectionText.inDepthTitle} {localized.role} {sectionText.inDepthGuide}</h2>
            <p className="rk-copy">
              {sectionText.inDepthLead}
            </p>
            <div className="rk-deep-grid">
              {longFormSections.map((section) => (
                <article key={section.heading} className="card rk-deep-card">
                  <h3>{section.heading}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="rk-copy">{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.faqTitle}</h2>
            <div className="rk-faq-list">
              {localized.faq.map((item) => (
                <details key={item.question} className="rk-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.finalChecklistTitle}</h2>
            <ol className="rk-mistakes-list">
              {checklist.map((item) => (
                <li key={item} className="rk-mistake-item">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{sectionText.monthlyUpdates}</h2>
            <ol className="rk-mistakes-list">
              {freshnessNotes.map((item) => (
                <li key={item} className="rk-mistake-item">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{sectionText.relatedRoles}</h2>
            <p className="rk-copy">
              {sectionText.relatedRolesLead}
            </p>
            <div className="rk-related-grid">
              {relatedRoles.map((item) => (
                <Link key={item.slug} href={`/resume-keywords/${item.slug}`} className="rk-related-link">
                  <span>{localizeRoleName(item.role, language)}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel rk-cta-panel">
            <h2 className="section-title">{ui.nextStepTitle}</h2>
            <p className="rk-copy">{ui.nextStepText}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn ghost" href="/app">
                {ui.optimizeCv}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
