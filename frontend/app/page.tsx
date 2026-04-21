"use client";

import TopNav from "./components/TopNav";
import HeroActions from "./components/HeroActions";
import { useTranslation } from "./lib/LanguageContext";

export default function HomePage() {
  const { t, language } = useTranslation();

  const localizedProjectInfo = {
    en: {
      behindTitle: "What CVboosta does behind the scenes",
      behindLead:
        "CVboosta is not just a text rewriter. It compares your current CV to the exact language of a target role, spots mismatches, and then rebuilds your content into a stronger narrative that still stays true to your real experience.",
      p1Title: "Signal extraction",
      p1Desc:
        "We parse structure, role history, measurable outcomes, and skill signals from your CV to avoid blind rewriting.",
      p2Title: "Role intelligence",
      p2Desc:
        "Job descriptions are analyzed for required skills, seniority expectations, and repeated priority phrases recruiters are likely screening for.",
      p3Title: "Guided optimization",
      p3Desc:
        "You receive a rewritten draft, missing keyword map, and practical recommendations so you can improve quality before applying.",
      workflowTitle: "How the project workflow works",
      phase1: "Phase 1",
      phase1Title: "Upload and parse",
      phase1Desc:
        "Your file is converted into structured text so section quality and impact signals can be evaluated.",
      phase2: "Phase 2",
      phase2Title: "Match against vacancy",
      phase2Desc:
        "We compare your profile to role requirements and rank what is missing, weak, or already competitive.",
      phase3: "Phase 3",
      phase3Title: "Generate upgraded draft",
      phase3Desc:
        "A cleaner CV version is generated with stronger bullet phrasing and clearer ATS-friendly alignment.",
      phase4: "Phase 4",
      phase4Title: "Review, export, iterate",
      phase4Desc:
        "You can inspect recommendations, save versions to history, and export a polished CV for applications.",
    },
    uk: {
      behindTitle: "Що CVboosta робить за лаштунками",
      behindLead:
        "CVboosta — це не просто переписувач тексту. Сервіс порівнює ваше поточне CV з мовою цільової вакансії, знаходить розбіжності й перебудовує зміст у сильнішу історію, зберігаючи правдивість вашого досвіду.",
      p1Title: "Витяг сигналів",
      p1Desc:
        "Ми аналізуємо структуру, рольову історію, вимірювані результати й сигнали навичок, щоб уникнути сліпого рерайту.",
      p2Title: "Інтелект вакансії",
      p2Desc:
        "Опис вакансії аналізується на ключові навички, рівень seniority та повторювані пріоритетні формулювання рекрутерів.",
      p3Title: "Керована оптимізація",
      p3Desc:
        "Ви отримуєте оновлений драфт, карту відсутніх ключових слів і практичні рекомендації перед відправкою.",
      workflowTitle: "Як працює процес у проєкті",
      phase1: "Фаза 1",
      phase1Title: "Завантаження та парсинг",
      phase1Desc:
        "Ваш файл перетворюється у структурований текст, щоб оцінити якість секцій і сигнали впливу.",
      phase2: "Фаза 2",
      phase2Title: "Матчинг із вакансією",
      phase2Desc:
        "Ми порівнюємо ваш профіль із вимогами ролі та ранжуємо, чого бракує або що вже конкурентне.",
      phase3: "Фаза 3",
      phase3Title: "Генерація покращеного CV",
      phase3Desc:
        "Формується чистіша версія CV з сильнішими формулюваннями bullet-пунктів і ATS-узгодженням.",
      phase4: "Фаза 4",
      phase4Title: "Перевірка, експорт, ітерації",
      phase4Desc:
        "Ви переглядаєте рекомендації, зберігаєте версії в історію та експортуєте готове CV.",
    },
    pl: {
      behindTitle: "Co CVboosta robi „za kulisami”",
      behindLead:
        "CVboosta to nie tylko narzędzie do przepisywania tekstu. Porównuje Twoje CV z językiem oferty, wykrywa luki i przebudowuje treść w mocniejszą narrację, pozostając wiernym Twojemu doświadczeniu.",
      p1Title: "Ekstrakcja sygnałów",
      p1Desc:
        "Analizujemy strukturę, historię ról, mierzalne wyniki i sygnały kompetencji, aby uniknąć ślepego przepisywania.",
      p2Title: "Inteligencja oferty",
      p2Desc:
        "Ogłoszenie analizujemy pod kątem wymaganych umiejętności, poziomu seniority i powtarzających się priorytetowych fraz.",
      p3Title: "Optymalizacja krok po kroku",
      p3Desc:
        "Otrzymujesz nowy draft, mapę brakujących słów kluczowych i praktyczne rekomendacje przed aplikacją.",
      workflowTitle: "Jak działa workflow projektu",
      phase1: "Etap 1",
      phase1Title: "Przesyłanie i parsowanie",
      phase1Desc:
        "Plik jest zamieniany na ustrukturyzowany tekst, by ocenić jakość sekcji i sygnały wpływu.",
      phase2: "Etap 2",
      phase2Title: "Dopasowanie do oferty",
      phase2Desc:
        "Porównujemy Twój profil z wymaganiami roli i wskazujemy, co jest brakujące lub słabsze.",
      phase3: "Etap 3",
      phase3Title: "Generowanie lepszej wersji",
      phase3Desc:
        "Tworzona jest czystsza wersja CV z mocniejszym stylem bulletów i lepszym dopasowaniem ATS.",
      phase4: "Etap 4",
      phase4Title: "Przegląd, eksport, iteracje",
      phase4Desc:
        "Sprawdzasz rekomendacje, zapisujesz wersje do historii i eksportujesz dopracowane CV.",
    },
    sk: {
      behindTitle: "Čo CVboosta robí na pozadí",
      behindLead:
        "CVboosta nie je len prepisovač textu. Porovnáva vaše CV s jazykom cieľovej pozície, hľadá medzery a prestavuje obsah do silnejšieho príbehu bez skreslenia reality.",
      p1Title: "Extrahovanie signálov",
      p1Desc:
        "Analyzujeme štruktúru, históriu rolí, merateľné výsledky a signály zručností, aby sme sa vyhli slepému prepisu.",
      p2Title: "Inteligencia pozície",
      p2Desc:
        "Popis pracovnej pozície analyzujeme podľa požadovaných zručností, seniority a opakovaných priorít.",
      p3Title: "Riadená optimalizácia",
      p3Desc:
        "Dostanete nový draft, mapu chýbajúcich kľúčových slov a praktické odporúčania pred odoslaním.",
      workflowTitle: "Ako funguje workflow projektu",
      phase1: "Fáza 1",
      phase1Title: "Nahratie a parsovanie",
      phase1Desc:
        "Súbor sa prevedie na štruktúrovaný text, aby sa dali vyhodnotiť sekcie a signály dopadu.",
      phase2: "Fáza 2",
      phase2Title: "Porovnanie s ponukou",
      phase2Desc:
        "Porovnáme váš profil s požiadavkami role a určime, čo chýba alebo je slabšie.",
      phase3: "Fáza 3",
      phase3Title: "Generovanie lepšej verzie",
      phase3Desc:
        "Vytvorí sa čistejšia verzia CV so silnejšími bodmi a lepším ATS zarovnaním.",
      phase4: "Fáza 4",
      phase4Title: "Kontrola, export, iterácie",
      phase4Desc:
        "Skontrolujete odporúčania, uložíte verzie do histórie a exportujete finálne CV.",
    },
    cs: {
      behindTitle: "Co CVboosta dělá na pozadí",
      behindLead:
        "CVboosta není jen přepisovač textu. Porovnává vaše CV s jazykem cílové pozice, odhaluje rozdíly a přestavuje obsah do silnějšího příběhu bez vymýšlení.",
      p1Title: "Extrakce signálů",
      p1Desc:
        "Analyzujeme strukturu, historii rolí, měřitelné výsledky a signály dovedností, aby nešlo o slepý přepis.",
      p2Title: "Inteligence pozice",
      p2Desc:
        "Popis pozice se analyzuje podle požadovaných dovedností, úrovně seniority a opakovaných prioritních frází.",
      p3Title: "Řízená optimalizace",
      p3Desc:
        "Dostanete nový draft, mapu chybějících klíčových slov a praktická doporučení před odesláním.",
      workflowTitle: "Jak funguje workflow projektu",
      phase1: "Fáze 1",
      phase1Title: "Nahrání a parsování",
      phase1Desc:
        "Soubor se převede na strukturovaný text, aby šla vyhodnotit kvalita sekcí a signály dopadu.",
      phase2: "Fáze 2",
      phase2Title: "Porovnání s pozicí",
      phase2Desc:
        "Porovnáme váš profil s požadavky role a určíme, co chybí nebo je slabší.",
      phase3: "Fáze 3",
      phase3Title: "Generování lepšího draftu",
      phase3Desc:
        "Vytvoří se čistší verze CV se silnější formulací bodů a lepším ATS sladěním.",
      phase4: "Fáze 4",
      phase4Title: "Kontrola, export, iterace",
      phase4Desc:
        "Zkontrolujete doporučení, uložíte verze do historie a exportujete finální CV.",
    },
    es: {
      behindTitle: "Qué hace CVboosta detrás de escena",
      behindLead:
        "CVboosta no es solo un reescritor de texto. Compara tu CV con el lenguaje exacto del puesto objetivo, detecta brechas y reconstruye el contenido en una narrativa más fuerte sin perder veracidad.",
      p1Title: "Extracción de señales",
      p1Desc:
        "Analizamos estructura, historial de roles, logros medibles y señales de habilidades para evitar reescritura ciega.",
      p2Title: "Inteligencia del puesto",
      p2Desc:
        "La vacante se analiza por habilidades requeridas, seniority y frases prioritarias repetidas por reclutadores.",
      p3Title: "Optimización guiada",
      p3Desc:
        "Recibes un nuevo borrador, mapa de keywords faltantes y recomendaciones prácticas antes de aplicar.",
      workflowTitle: "Cómo funciona el flujo del proyecto",
      phase1: "Fase 1",
      phase1Title: "Subir y parsear",
      phase1Desc:
        "El archivo se convierte en texto estructurado para evaluar calidad de secciones y señales de impacto.",
      phase2: "Fase 2",
      phase2Title: "Match con la vacante",
      phase2Desc:
        "Comparamos tu perfil con los requisitos del rol y priorizamos lo faltante o mejorable.",
      phase3: "Fase 3",
      phase3Title: "Generar versión mejorada",
      phase3Desc:
        "Se genera una versión más limpia con bullets más fuertes y mejor alineación ATS.",
      phase4: "Fase 4",
      phase4Title: "Revisar, exportar, iterar",
      phase4Desc:
        "Revisas recomendaciones, guardas versiones en historial y exportas un CV pulido para aplicar.",
    },
  }[language];

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div style={{ maxWidth: "1200px", width: "100%" }}>
            <p className="pill">{t("home.pill")}</p>
            <h1 className="hero-title">{t("home.heroTitle")}</h1>
            <p className="hero-subtitle">{t("home.heroSubtitle")}</p>
            <p className="hero-subtitle" style={{ marginTop: "10px" }}>
              Free ATS Resume Checker: run CV analysis and match scoring without registration.
            </p>
            <HeroActions />
          </div>
        </section>

        <section className="fade-up" style={{ marginBottom: "4rem" }}>
          <div className="hero-grid">
            <div className="kpi">
              <h3>92%</h3>
              <p>{t("home.stats.ats")}</p>
            </div>
            <div className="kpi">
              <h3>3 min</h3>
              <p>{t("home.stats.time")}</p>
            </div>
            <div className="kpi">
              <h3>5x</h3>
              <p>{t("home.stats.speed")}</p>
            </div>
          </div>
        </section>

        <section className="section fade-up" style={{ marginBottom: "6rem" }}>
          <h2 className="section-title">{t("home.whatYouGet.title")}</h2>
          <div className="grid">
            <div className="card">
              <h3>{t("home.whatYouGet.rewrite.title")}</h3>
              <p>{t("home.whatYouGet.rewrite.desc")}</p>
            </div>
            <div className="card">
              <h3>{t("home.whatYouGet.map.title")}</h3>
              <p>{t("home.whatYouGet.map.desc")}</p>
            </div>
            <div className="card">
              <h3>{t("home.whatYouGet.history.title")}</h3>
              <p>{t("home.whatYouGet.history.desc")}</p>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{t("home.howItWorks.title")}</h2>
          <div className="steps">
            <div className="step">
              <span>1</span>
              <h3>{t("home.howItWorks.step1.title")}</h3>
              <p>{t("home.howItWorks.step1.desc")}</p>
            </div>
            <div className="step">
              <span>2</span>
              <h3>{t("home.howItWorks.step2.title")}</h3>
              <p>{t("home.howItWorks.step2.desc")}</p>
            </div>
            <div className="step">
              <span>3</span>
              <h3>{t("home.howItWorks.step3.title")}</h3>
              <p>{t("home.howItWorks.step3.desc")}</p>
            </div>
          </div>
        </section>

        <section className="section fade-up project-explainer">
          <div className="project-explainer-card">
            <h2 className="section-title">{localizedProjectInfo.behindTitle}</h2>
            <p className="project-lead">{localizedProjectInfo.behindLead}</p>
            <div className="project-points">
              <article className="project-point">
                <h3>{localizedProjectInfo.p1Title}</h3>
                <p>{localizedProjectInfo.p1Desc}</p>
              </article>
              <article className="project-point">
                <h3>{localizedProjectInfo.p2Title}</h3>
                <p>{localizedProjectInfo.p2Desc}</p>
              </article>
              <article className="project-point">
                <h3>{localizedProjectInfo.p3Title}</h3>
                <p>{localizedProjectInfo.p3Desc}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section fade-up workflow-section">
          <h2 className="section-title">{localizedProjectInfo.workflowTitle}</h2>
          <div className="workflow-grid">
            <div className="card workflow-card">
              <span className="workflow-tag">{localizedProjectInfo.phase1}</span>
              <h3>{localizedProjectInfo.phase1Title}</h3>
              <p>{localizedProjectInfo.phase1Desc}</p>
            </div>
            <div className="card workflow-card">
              <span className="workflow-tag">{localizedProjectInfo.phase2}</span>
              <h3>{localizedProjectInfo.phase2Title}</h3>
              <p>{localizedProjectInfo.phase2Desc}</p>
            </div>
            <div className="card workflow-card">
              <span className="workflow-tag">{localizedProjectInfo.phase3}</span>
              <h3>{localizedProjectInfo.phase3Title}</h3>
              <p>{localizedProjectInfo.phase3Desc}</p>
            </div>
            <div className="card workflow-card">
              <span className="workflow-tag">{localizedProjectInfo.phase4}</span>
              <h3>{localizedProjectInfo.phase4Title}</h3>
              <p>{localizedProjectInfo.phase4Desc}</p>
            </div>
          </div>
        </section>

        <section className="section fade-up" style={{ marginTop: "4rem" }}>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "3rem" }}>
            {t("testimonials.title")}
          </h2>
          
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {/* Render 12 items (6 reviews duplicated) for seamless infinite loop */}
              {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, idx) => (
                <div key={`${num}-${idx}`} className="card testi-card shadow-soft">
                  <p style={{ fontStyle: "italic", opacity: 0.9, marginBottom: "2rem", fontSize: "1.1rem", lineHeight: "1.6" }}>
                    "{t(`testimonials.quote${num}`)}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-light, #6366f1))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>
                      {t(`testimonials.author${num}`)[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{t(`testimonials.author${num}`)}</div>
                      <div style={{ fontSize: "12px", opacity: 0.6 }}>Verified User</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
