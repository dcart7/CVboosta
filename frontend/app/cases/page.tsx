"use client";

import Link from "next/link";
import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";
import { ANALYTICS_EVENTS, trackEvent } from "../lib/analytics";

export default function CasesPage() {
  const { t, language } = useTranslation();

  const copy = {
    en: {
      title: "See the method, without made-up success claims.",
      subtitle: "These are illustrative role examples. They show what CVboosta checks; they are not presented as customer outcomes.",
      disclosure: "No interview rate, ATS pass rate, or hiring result is promised.",
      principles: [["Compare", "CV against one real vacancy"], ["Prioritize", "missing and weak signals"], ["Review", "every suggested change"]],
      examplesTitle: "Illustrative role examples",
      examplesSubtitle: "The exact recommendations depend on the CV and vacancy you provide.",
      badge: "METHOD EXAMPLE",
      whatChanges: "What the analysis checks",
      points: ["Relevant terms already supported by the CV", "Clearer structure and role-specific wording", "Claims that need evidence before they are added"],
      insights: ["For engineering roles, the vacancy often makes the required stack and system scope explicit.", "For analyst roles, the strongest signals usually connect tools to decisions and outcomes already evidenced in the CV.", "For marketing roles, channel, audience, ownership, and supported results are more useful than generic adjectives."],
      note: "Match score measures text overlap with the selected vacancy. It is not an ATS certification.",
      principlesTitle: "What CVboosta will and will not do",
      willTitle: "The method",
      will: ["Compare one CV with one job description", "Explain important gaps", "Draft clearer wording for your review", "Keep you in control before export"],
      limitsTitle: "Important limits",
      limits: ["No tool can guarantee an interview", "ATS vendors use different systems and rules", "Do not accept a metric or achievement you cannot verify"],
      ctaTitle: "Run the comparison with your own documents.",
      ctaSub: "Start with the free match preview, then decide whether the full rewrite is useful.",
      cta: "Check my CV",
    },
    uk: {
      title: "Метод без вигаданих історій успіху.",
      subtitle: "Це ілюстративні приклади для різних ролей. Вони показують, що перевіряє CVboosta, а не результати клієнтів.",
      disclosure: "Ми не обіцяємо interview rate, проходження ATS або найм.",
      principles: [["Порівняння", "CV з однією реальною вакансією"], ["Пріоритети", "відсутні та слабкі сигнали"], ["Перевірка", "кожної запропонованої зміни"]],
      examplesTitle: "Ілюстративні приклади ролей",
      examplesSubtitle: "Точні рекомендації залежать від вашого CV та вакансії.",
      badge: "ПРИКЛАД МЕТОДУ",
      whatChanges: "Що перевіряє аналіз",
      points: ["Релевантні терміни, які вже підтверджені CV", "Чіткіша структура й формулювання під роль", "Твердження, для яких потрібні докази"],
      insights: ["Для engineering-ролей вакансія часто прямо називає потрібний stack і масштаб систем.", "Для analyst-ролей сильні сигнали пов’язують інструменти з рішеннями та результатами, уже підтвердженими в CV.", "Для marketing-ролей канал, аудиторія, відповідальність і підтверджені результати корисніші за загальні прикметники."],
      note: "Match score вимірює збіг тексту з обраною вакансією. Це не сертифікація ATS.",
      principlesTitle: "Що CVboosta робить і чого не обіцяє",
      willTitle: "Метод",
      will: ["Порівнює одне CV з однією вакансією", "Пояснює важливі прогалини", "Готує чіткіші формулювання для перевірки", "Залишає контроль перед експортом вам"],
      limitsTitle: "Важливі обмеження",
      limits: ["Жоден інструмент не гарантує співбесіду", "ATS-вендори використовують різні системи", "Не приймайте метрику чи досягнення, які не можете підтвердити"],
      ctaTitle: "Перевірте метод на власних документах.",
      ctaSub: "Почніть із безкоштовного прев’ю та вирішіть, чи потрібен повний rewrite.",
      cta: "Перевірити моє CV",
    },
    pl: {
      title: "Metoda bez zmyślonych historii sukcesu.",
      subtitle: "To przykłady ilustracyjne dla różnych ról. Pokazują, co sprawdza CVboosta, a nie wyniki klientów.",
      disclosure: "Nie obiecujemy interview rate, przejścia ATS ani zatrudnienia.",
      principles: [["Porównaj", "CV z jedną prawdziwą ofertą"], ["Priorytety", "brakujące i słabe sygnały"], ["Sprawdź", "każdą sugerowaną zmianę"]],
      examplesTitle: "Ilustracyjne przykłady ról",
      examplesSubtitle: "Dokładne rekomendacje zależą od przesłanego CV i oferty.",
      badge: "PRZYKŁAD METODY",
      whatChanges: "Co sprawdza analiza",
      points: ["Trafne terminy już poparte treścią CV", "Czytelniejszą strukturę i język roli", "Twierdzenia wymagające dowodu przed dodaniem"],
      insights: ["W rolach technicznych oferta często jasno określa stack i zakres systemów.", "W rolach analitycznych mocne sygnały łączą narzędzia z decyzjami i wynikami już opisanymi w CV.", "W marketingu kanał, odbiorcy, odpowiedzialność i potwierdzone wyniki są lepsze niż ogólne przymiotniki."],
      note: "Match score mierzy zgodność tekstu z ofertą. Nie jest certyfikatem ATS.",
      principlesTitle: "Co CVboosta robi, a czego nie obiecuje",
      willTitle: "Metoda",
      will: ["Porównuje jedno CV z jedną ofertą", "Wyjaśnia ważne luki", "Przygotowuje jaśniejszy draft do sprawdzenia", "Zostawia kontrolę przed eksportem Tobie"],
      limitsTitle: "Ważne ograniczenia",
      limits: ["Żadne narzędzie nie gwarantuje rozmowy", "Dostawcy ATS używają różnych zasad", "Nie akceptuj liczby ani osiągnięcia bez potwierdzenia"],
      ctaTitle: "Sprawdź metodę na własnych dokumentach.",
      ctaSub: "Zacznij od bezpłatnego podglądu i zdecyduj, czy pełny rewrite jest przydatny.",
      cta: "Sprawdź moje CV",
    },
    sk: {
      title: "Metóda bez vymyslených príbehov úspechu.",
      subtitle: "Toto sú ilustračné príklady rolí. Ukazujú, čo CVboosta kontroluje, nie výsledky zákazníkov.",
      disclosure: "Nesľubujeme pohovor, prejdenie ATS ani prijatie.",
      principles: [["Porovnať", "CV s jednou reálnou pozíciou"], ["Určiť priority", "chýbajúce a slabé signály"], ["Skontrolovať", "každú navrhnutú zmenu"]],
      examplesTitle: "Ilustračné príklady rolí",
      examplesSubtitle: "Presné odporúčania závisia od vášho CV a pozície.",
      badge: "PRÍKLAD METÓDY",
      whatChanges: "Čo analýza kontroluje",
      points: ["Relevantné výrazy podporené obsahom CV", "Jasnejšiu štruktúru a jazyk role", "Tvrdenia, ktoré pred pridaním potrebujú dôkaz"],
      insights: ["Pri technických rolách pozícia často jasne uvádza stack a rozsah systémov.", "Pri analytických rolách silné signály spájajú nástroje s rozhodnutiami a výsledkami už uvedenými v CV.", "V marketingu sú kanál, publikum, zodpovednosť a podložené výsledky užitočnejšie než všeobecné prídavné mená."],
      note: "Match score meria textovú zhodu s pozíciou. Nie je to certifikácia ATS.",
      principlesTitle: "Čo CVboosta robí a čo nesľubuje",
      willTitle: "Metóda",
      will: ["Porovná jedno CV s jednou pozíciou", "Vysvetlí dôležité medzery", "Pripraví jasnejší návrh na kontrolu", "Nechá vám kontrolu pred exportom"],
      limitsTitle: "Dôležité obmedzenia",
      limits: ["Žiadny nástroj nezaručí pohovor", "ATS systémy používajú rôzne pravidlá", "Neprijímajte číslo alebo úspech bez dôkazu"],
      ctaTitle: "Vyskúšajte metódu na vlastných dokumentoch.",
      ctaSub: "Začnite bezplatným náhľadom a rozhodnite sa, či je úplný rewrite užitočný.",
      cta: "Skontrolovať moje CV",
    },
    cs: {
      title: "Metoda bez vymyšlených příběhů úspěchu.",
      subtitle: "Toto jsou ilustrační příklady rolí. Ukazují, co CVboosta kontroluje, ne výsledky zákazníků.",
      disclosure: "Neslibujeme pohovor, průchod ATS ani přijetí.",
      principles: [["Porovnat", "CV s jednou reálnou pozicí"], ["Určit priority", "chybějící a slabé signály"], ["Zkontrolovat", "každou navrženou změnu"]],
      examplesTitle: "Ilustrační příklady rolí",
      examplesSubtitle: "Přesná doporučení závisí na vašem CV a pozici.",
      badge: "PŘÍKLAD METODY",
      whatChanges: "Co analýza kontroluje",
      points: ["Relevantní výrazy podložené obsahem CV", "Jasnější strukturu a jazyk role", "Tvrzení, která před přidáním potřebují důkaz"],
      insights: ["U technických rolí pozice často jasně uvádí stack a rozsah systémů.", "U analytických rolí silné signály spojují nástroje s rozhodnutími a výsledky už uvedenými v CV.", "V marketingu jsou kanál, publikum, odpovědnost a doložené výsledky užitečnější než obecná přídavná jména."],
      note: "Match score měří textovou shodu s pozicí. Není to certifikace ATS.",
      principlesTitle: "Co CVboosta dělá a co neslibuje",
      willTitle: "Metoda",
      will: ["Porovná jedno CV s jednou pozicí", "Vysvětlí důležité mezery", "Připraví jasnější návrh ke kontrole", "Nechá vám kontrolu před exportem"],
      limitsTitle: "Důležitá omezení",
      limits: ["Žádný nástroj nezaručí pohovor", "ATS systémy používají různá pravidla", "Nepřijímejte číslo nebo úspěch bez důkazu"],
      ctaTitle: "Vyzkoušejte metodu na vlastních dokumentech.",
      ctaSub: "Začněte bezplatným náhledem a rozhodněte se, zda je úplný rewrite užitečný.",
      cta: "Zkontrolovat moje CV",
    },
    es: {
      title: "El método, sin historias de éxito inventadas.",
      subtitle: "Son ejemplos ilustrativos por rol. Muestran qué comprueba CVboosta; no se presentan como resultados de clientes.",
      disclosure: "No prometemos entrevistas, superar un ATS ni una contratación.",
      principles: [["Comparar", "el CV con una vacante real"], ["Priorizar", "señales ausentes o débiles"], ["Revisar", "cada cambio sugerido"]],
      examplesTitle: "Ejemplos ilustrativos por rol",
      examplesSubtitle: "Las recomendaciones exactas dependen del CV y la vacante que aportes.",
      badge: "EJEMPLO DEL MÉTODO",
      whatChanges: "Qué comprueba el análisis",
      points: ["Términos relevantes ya respaldados por el CV", "Estructura y lenguaje de rol más claros", "Afirmaciones que necesitan pruebas antes de añadirse"],
      insights: ["En roles técnicos, la vacante suele indicar claramente el stack y el alcance de los sistemas.", "En roles de análisis, las mejores señales conectan herramientas con decisiones y resultados ya acreditados en el CV.", "En marketing, canal, audiencia, responsabilidad y resultados acreditados aportan más que los adjetivos genéricos."],
      note: "El match score mide coincidencia textual con la vacante. No es una certificación ATS.",
      principlesTitle: "Qué hace CVboosta y qué no promete",
      willTitle: "El método",
      will: ["Compara un CV con una vacante", "Explica las brechas importantes", "Prepara una redacción más clara para revisar", "Te deja el control antes de exportar"],
      limitsTitle: "Límites importantes",
      limits: ["Ninguna herramienta garantiza una entrevista", "Los proveedores ATS usan reglas distintas", "No aceptes cifras o logros que no puedas verificar"],
      ctaTitle: "Prueba el método con tus documentos.",
      ctaSub: "Empieza con la vista previa gratuita y decide si la reescritura completa te resulta útil.",
      cta: "Comprobar mi CV",
    },
  }[language];

  const roles = [
    t("cases.caseStudies.backend.role"),
    t("cases.caseStudies.analyst.role"),
    t("cases.caseStudies.marketing.role"),
  ];

  const trackStart = (location: string) => {
    trackEvent(ANALYTICS_EVENTS.ctaClicked, {
      cta_type: "start_cv_match",
      location,
    });
  };

  return (
    <main className="page cases-page">
      <TopNav />
      <div className="shell">
        <section className="hero cases-hero fade-up">
          <div className="cases-hero-copy">
            <h1 className="hero-title cases-hero-title">{copy.title}</h1>
            <p className="hero-subtitle cases-hero-subtitle">{copy.subtitle}</p>
            <p className="cases-micro">{copy.disclosure}</p>
            <div className="nav-actions" style={{ marginTop: 18 }}>
              <a className="btn ghost" href="#examples">{copy.examplesTitle}</a>
              <Link className="btn primary" href="/app" onClick={() => trackStart("cases_hero")}>{copy.cta}</Link>
            </div>
          </div>
          <div className="hero-card cases-trust-card">
            <div className="cases-trust-strip">
              {copy.principles.map(([title, description]) => (
                <div className="cases-trust-item" key={title}>
                  <div className="cases-trust-kpi">{title}</div>
                  <div className="cases-trust-label">{description}</div>
                </div>
              ))}
            </div>
            <p className="cases-trust-note">{copy.note}</p>
          </div>
        </section>

        <section id="examples" className="section fade-up">
          <h2 className="section-title">{copy.examplesTitle}</h2>
          <p className="cases-section-subtitle">{copy.examplesSubtitle}</p>
          <div className="cases-grid">
            {roles.map((role, index) => (
              <article key={role} className="card case-card">
                <div className="case-head">
                  <div className="case-badge">{copy.badge}</div>
                  <h3 className="case-role">{role}</h3>
                </div>
                <div className="case-mini">
                  <div className="case-mini-changes">
                    <div className="case-subhead">{copy.whatChanges}</div>
                    <ul className="case-list">
                      {copy.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </div>
                  <div className="case-mini-insight">
                    <p className="case-insight-text">{copy.insights[index]}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{copy.principlesTitle}</h2>
          <div className="grid">
            <div className="card cases-bullets">
              <h3 className="cases-bullets-title">{copy.willTitle}</h3>
              <ul className="case-list cases-list-compact">
                {copy.will.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="card cases-bullets">
              <h3 className="cases-bullets-title">{copy.limitsTitle}</h3>
              <ul className="case-list cases-list-compact">
                {copy.limits.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <div className="hero-card cases-final">
            <h2 className="cases-final-title">{copy.ctaTitle}</h2>
            <p className="cases-final-sub">{copy.ctaSub}</p>
            <div className="nav-actions" style={{ marginTop: 18 }}>
              <Link className="btn primary" href="/app" onClick={() => trackStart("cases_footer")}>{copy.cta}</Link>
              <Link className="btn ghost" href="/pricing">{t("cases.sections.pricingLink")}</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
