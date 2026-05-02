"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "../../lib/LanguageContext";
import type { ResumeKeywordCluster } from "../../lib/resumeKeywordClusters";
import {
  getResumeKeywordsUi,
  getResumeKeywordsLandingUi,
  localizeRoleName,
  localizeResumeKeywordCluster,
} from "../../lib/resumeKeywordsI18n";
import {
  getFinalChecklist,
  getRoleFreshnessNotes,
  getRoleLandingContent,
  getRoleLongFormSections,
} from "../../lib/resumeKeywordContent";

type Props = {
  cluster: ResumeKeywordCluster;
  longTailPhrases: string[];
  relatedRoles: Array<{ slug: string; role: string }>;
};

export default function ResumeKeywordRoleClient({ cluster, longTailPhrases, relatedRoles }: Props) {
  const { language } = useTranslation();
  const ui = getResumeKeywordsUi(language);
  const landingUi = getResumeKeywordsLandingUi(language);
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
  const landingLocalized = useMemo(
    () => getRoleLandingContent(localized, language, localized.role),
    [localized, language],
  );
  const checklist = useMemo(() => getFinalChecklist(cluster, language), [cluster, language]);
  const longFormSections = useMemo(() => getRoleLongFormSections(cluster, language), [cluster, language]);
  const freshnessNotes = useMemo(() => getRoleFreshnessNotes(cluster, language), [cluster, language]);

  return (
    <main className="page">
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
            <h2 className="section-title">{landingUi.hookTitle}</h2>
            {landingLocalized.hook.map((paragraph) => (
              <p key={paragraph} className="rk-copy" style={{ marginTop: "8px" }}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{landingUi.keywordsTitle(localized.role)}</h2>
            <p className="rk-copy">{landingUi.keywordsLead}</p>
            <div className="rk-keyword-groups">
              {landingLocalized.keywordGroups.map((group) => (
                <div key={group.title} className="rk-keyword-group">
                  <h3 className="rk-subtitle">{group.title}</h3>
                  <div className="rk-chip-grid">
                    {group.keywords.map((item) => (
                      <div key={item} className="rk-chip">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{landingUi.bulletsTitle}</h2>
            <p className="rk-copy">{landingUi.bulletsLead}</p>
            <ul className="rk-bullet-list">
              {landingLocalized.resumeBullets.map((item) => (
                <li key={item} className="rk-bullet-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{landingUi.tipsTitle}</h2>
            <ul className="rk-bullet-list">
              {landingLocalized.atsTips.map((item) => (
                <li key={item} className="rk-bullet-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{landingUi.mistakesTitle}</h2>
            <ul className="rk-bullet-list">
              {landingLocalized.commonMistakes.map((item) => (
                <li key={item} className="rk-bullet-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{landingUi.proTipsTitle}</h2>
            <ul className="rk-bullet-list">
              {landingLocalized.proTips.map((item) => (
                <li key={item} className="rk-bullet-item">
                  {item}
                </li>
              ))}
            </ul>
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
