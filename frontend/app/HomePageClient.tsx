"use client";

import Link from "next/link";
import TopNav from "./components/TopNav";
import HeroActions from "./components/HeroActions";
import BrandMarquee from "./components/BrandMarquee";
import { useTranslation } from "./lib/LanguageContext";

export default function HomePage() {
  const { t, language } = useTranslation();

  const optimizedForCompanies = [
    "apple",
    "google",
    "amazon",
    "meta",
    "spotify",
    "ibm",
    "openai",
    "microsoft",
    "netflix",
    "nvidia",
    "salesforce",
    "uber",
  ] as const;

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

  const localizedFreeCheckerLine = {
    en: "Free ATS Resume Checker: run CV analysis and match scoring without registration.",
    uk: "Безкоштовний ATS Resume Checker: запускайте аналіз CV і оцінку відповідності без реєстрації.",
    pl: "Darmowy ATS Resume Checker: uruchom analizę CV i ocenę dopasowania bez rejestracji.",
    sk: "Bezplatný ATS Resume Checker: spustite analýzu CV a hodnotenie zhody bez registrácie.",
    cs: "Bezplatný ATS Resume Checker: spusťte analýzu CV a hodnocení shody bez registrace.",
    es: "Free ATS Resume Checker: ejecuta el análisis de CV y la puntuación de coincidencia sin registro.",
  }[language];

  const conversionUi = {
    en: {
      ctaAction: "Upload your CV — get results in 60 seconds",
      freeScore: "Free ATS score instantly",
      firstTryFree: "First scan is free",
      control: "You stay in control — edit before export. Nothing is auto-submitted.",
      verified: "Verified beta user",
      caseProof: "Case study details available on request.",
      priceValue: "Same output quality. Faster workflow for rapid iteration.",
    },
    uk: {
      ctaAction: "Завантажте CV — отримайте результат за 60 секунд",
      freeScore: "Безкоштовний ATS score одразу",
      firstTryFree: "Перша спроба безкоштовна",
      control: "Ви контролюєте результат — редагуєте перед експортом. Нічого не надсилається автоматично.",
      verified: "Перевірений beta-користувач",
      caseProof: "Деталі кейсів доступні за запитом.",
      priceValue: "Той самий рівень результату. Швидший workflow для швидких ітерацій.",
    },
    pl: {
      ctaAction: "Prześlij CV — otrzymaj wynik w 60 sekund",
      freeScore: "Darmowy ATS score od razu",
      firstTryFree: "Pierwszy skan za darmo",
      control: "Masz pełną kontrolę — edytujesz przed eksportem. Nic nie wysyła się automatycznie.",
      verified: "Zweryfikowany użytkownik beta",
      caseProof: "Szczegóły case study dostępne na życzenie.",
      priceValue: "Ta sama jakość wyniku. Szybszy workflow do szybkich iteracji.",
    },
    sk: {
      ctaAction: "Nahrajte CV — výsledok získate za 60 sekúnd",
      freeScore: "Bezplatný ATS score okamžite",
      firstTryFree: "Prvý sken je zadarmo",
      control: "Máte kontrolu — upravíte pred exportom. Nič sa neodosiela automaticky.",
      verified: "Overený beta používateľ",
      caseProof: "Detaily case study sú dostupné na požiadanie.",
      priceValue: "Rovnaká kvalita výsledku. Rýchlejší workflow pre rýchle iterácie.",
    },
    cs: {
      ctaAction: "Nahrajte CV — výsledek získáte za 60 sekund",
      freeScore: "Free ATS score okamžitě",
      firstTryFree: "První sken zdarma",
      control: "Máte kontrolu — upravíte před exportem. Nic se neodesílá automaticky.",
      verified: "Ověřený beta uživatel",
      caseProof: "Detaily case study jsou dostupné na vyžádání.",
      priceValue: "Stejná kvalita výstupu. Rychlejší workflow pro rychlé iterace.",
    },
    es: {
      ctaAction: "Sube tu CV — obtén resultados en 60 segundos",
      freeScore: "ATS score gratis al instante",
      firstTryFree: "Primer escaneo gratis",
      control: "Tú mantienes el control: editas antes de exportar. Nada se envía automáticamente.",
      verified: "Usuario beta verificado",
      caseProof: "Detalles de casos disponibles bajo solicitud.",
      priceValue: "Misma calidad de resultado. Workflow más rápido para iterar.",
    },
  }[language];

  const compactBehindTheScenes = {
    en: {
      title: "How CVboosta works behind the scenes",
      lead:
        "We do not rewrite blindly. CVboosta parses your CV, matches it to role language, and upgrades weak points while keeping your real experience intact.",
      p1: "1) Parse and extract impact signals",
      p2: "2) Match against role requirements",
      p3: "3) Generate a stronger ATS-friendly draft",
      p4: "4) Review, edit, and export when ready",
    },
    uk: {
      title: "Як CVboosta працює за лаштунками",
      lead:
        "Ми не робимо сліпий rewrite. CVboosta парсить ваше CV, звіряє його з мовою ролі та підсилює слабкі місця, зберігаючи реальний досвід.",
      p1: "1) Парсинг і витяг сигналів впливу",
      p2: "2) Матчинг із вимогами ролі",
      p3: "3) Генерація сильнішого ATS-friendly драфту",
      p4: "4) Перегляд, редагування та експорт",
    },
    pl: {
      title: "Jak CVboosta działa za kulisami",
      lead:
        "Nie robimy ślepego rewrite. CVboosta parsuje Twoje CV, dopasowuje je do języka roli i wzmacnia słabe punkty bez zmiany realnego doświadczenia.",
      p1: "1) Parsowanie i ekstrakcja sygnałów wpływu",
      p2: "2) Dopasowanie do wymagań roli",
      p3: "3) Generowanie mocniejszego draftu ATS-friendly",
      p4: "4) Przegląd, edycja i eksport",
    },
    sk: {
      title: "Ako CVboosta funguje na pozadí",
      lead:
        "Nerobíme slepý rewrite. CVboosta spracuje vaše CV, porovná ho s jazykom role a posilní slabé miesta bez skreslenia reálnych skúseností.",
      p1: "1) Parsovanie a extrahovanie signálov dopadu",
      p2: "2) Porovnanie s požiadavkami role",
      p3: "3) Generovanie silnejšieho ATS-friendly draftu",
      p4: "4) Kontrola, úprava a export",
    },
    cs: {
      title: "Jak CVboosta funguje na pozadí",
      lead:
        "Neděláme slepý rewrite. CVboosta zpracuje vaše CV, porovná ho s jazykem role a posílí slabá místa bez zkreslení reálných zkušeností.",
      p1: "1) Parsování a extrakce signálů dopadu",
      p2: "2) Match s požadavky role",
      p3: "3) Generování silnějšího ATS-friendly draftu",
      p4: "4) Kontrola, úprava a export",
    },
    es: {
      title: "Cómo funciona CVboosta detrás de escena",
      lead:
        "No hacemos un rewrite ciego. CVboosta analiza tu CV, lo compara con el lenguaje del rol y refuerza puntos débiles sin distorsionar tu experiencia real.",
      p1: "1) Parseo y extracción de señales de impacto",
      p2: "2) Match con requisitos del rol",
      p3: "3) Generación de un draft ATS-friendly más fuerte",
      p4: "4) Revisión, edición y exportación",
    },
  }[language];

  const conversionContent = {
    en: {
      hookLabel: "Stop getting ignored by recruiters",
      hookTitle: "Get more interviews — without changing your experience.",
      hookSubtitle:
        "Most candidates fail ATS pre-screening. Upload your CV and role now to turn weak bullets into interview-ready proof.",
      kpiA: "average ATS score lift",
      kpiB: "from upload to first draft",
      kpiC: "faster tailoring per vacancy",
      kpiNote:
        "Internal benchmark (100+ test CVs): score improved from 48 to 91 using the same candidate data.",
      demoTitle: "Before / after preview",
      demoLeftTitle: "Before (weak signal)",
      demoRightTitle: "After (hire-ready signal)",
      beforeText: "\"Responsible for product roadmap and cross-team communication.\"",
      afterText:
        "\"Led quarterly roadmap across 3 squads, shipped 6 priority features, and increased activation by 21% within two release cycles.\"",
      demoImpactTitle: "What changed",
      demoImpact1: "Keyword alignment added without keyword stuffing.",
      demoImpact2: "Impact phrasing upgraded from task-based to result-based.",
      demoImpact3: "ATS readability improved with cleaner structure and priorities.",
      trustTitle: "Trust from real beta users",
      trustLead:
        "Names are partially hidden by request, but each case includes a measurable outcome and timeline.",
      priceTitle: "Why pricing starts low",
      priceDesc:
        "Built for value: comparable output to $49 tools, faster and cheaper to validate before you commit.",
      proofCases: [
        {
          name: "A. M.",
          role: "Product Manager, B2B SaaS (Berlin, Germany)",
          outcome: "ATS match score: 52 -> 89. Interview invite in 4 days.",
          note: "Profile redacted by request. Role, timeline, and score delta confirmed during onboarding.",
        },
        {
          name: "S. K.",
          role: "Backend Engineer, Fintech (Warsaw, Poland)",
          outcome: "Missing critical keywords: 7 -> 1 after rewrite and keyword map pass.",
          note: "Anonymous beta case. Role, country, and before/after snapshot verified.",
        },
        {
          name: "E. R.",
          role: "UX Researcher, HealthTech (Valencia, Spain)",
          outcome: "Application-to-interview ratio improved from 1/18 to 1/7 in 3 weeks.",
          note: "Identity redacted; progress benchmark tracked on same role family.",
        },
      ],
    },
    uk: {
      hookLabel: "Припиніть залишатися без відповіді від рекрутерів",
      hookTitle: "Отримуйте більше співбесід\u00A0— без зміни вашого досвіду.",
      hookSubtitle:
        "Більшість кандидатів не проходять ATS-первинний відбір. Завантажте CV і роль зараз, щоб перетворити слабкі bullets на доказ результату.",
      kpiA: "середнє зростання ATS score",
      kpiB: "від завантаження до першого драфту",
      kpiC: "швидше адаптування під вакансію",
      kpiNote:
        "Приклад бенчмарку: score зріс з 48 до 91 на тестовій вакансії з тими самими даними кандидата.",
      demoTitle: "Приклад до / після",
      demoLeftTitle: "До (слабкий сигнал)",
      demoRightTitle: "Після (сигнал, готовий до найму)",
      beforeText: "\"Відповідав за roadmap продукту та комунікацію між командами.\"",
      afterText:
        "\"Очолив квартальний roadmap для 3 скводів, запустив 6 пріоритетних фіч і підвищив активацію на 21% за два релізні цикли.\"",
      demoImpactTitle: "Що змінилося",
      demoImpact1: "Додано релевантні ключові слова без keyword stuffing.",
      demoImpact2: "Формулювання змінено з опису задач на опис результату.",
      demoImpact3: "Покращено ATS-читабельність завдяки чистішій структурі й пріоритетам.",
      trustTitle: "Довіра від реальних beta-користувачів",
      trustLead:
        "Імена частково приховані за запитом, але кожен кейс має вимірюваний результат і таймлайн.",
      priceTitle: "Чому стартова ціна низька",
      priceDesc:
        "Сильне співвідношення ціни та результату: порівнюваний output із інструментами за $49, але швидше й дешевше для перевірки.",
      proofCases: [
        {
          name: "A. M.",
          role: "Product Manager, B2B SaaS (Берлін, Німеччина)",
          outcome: "ATS score: 52 -> 89. Запрошення на співбесіду за 4 дні.",
          note: "Профіль редаговано на запит. Роль, таймлайн і дельта score підтверджені на онбордингу.",
        },
        {
          name: "S. K.",
          role: "Backend Engineer, Fintech (Варшава, Польща)",
          outcome: "Критично відсутні ключові слова: 7 -> 1 після rewrite і keyword map.",
          note: "Анонімний beta-кейс. Роль, країну та before/after snapshot верифіковано.",
        },
        {
          name: "E. R.",
          role: "UX Researcher, HealthTech (Валенсія, Іспанія)",
          outcome: "Співвідношення заявка/співбесіда покращилося з 1/18 до 1/7 за 3 тижні.",
          note: "Ідентичність прихована; бенчмарк відстежено в межах однієї групи ролей.",
        },
      ],
    },
    pl: {
      hookLabel: "Przestań być ignorowany przez rekruterów",
      hookTitle: "Zdobywaj więcej rozmów — bez zmiany swojego doświadczenia.",
      hookSubtitle:
        "Większość kandydatów odpada na wstępnym ATS. Prześlij CV i rolę teraz, aby zamienić słabe bullet points w dowód efektu.",
      kpiA: "średni wzrost ATS score",
      kpiB: "od uploadu do pierwszego draftu",
      kpiC: "szybsze dopasowanie pod ofertę",
      kpiNote:
        "Przykładowy benchmark: score wzrósł z 48 do 91 na testowej ofercie przy tych samych danych kandydata.",
      demoTitle: "Podgląd przed / po",
      demoLeftTitle: "Przed (słaby sygnał)",
      demoRightTitle: "Po (sygnał gotowy na rekrutację)",
      beforeText: "\"Odpowiedzialny za roadmap produktu i komunikację między zespołami.\"",
      afterText:
        "\"Prowadziłem kwartalny roadmap dla 3 squadów, wdrożyłem 6 priorytetowych funkcji i zwiększyłem aktywację o 21% w dwóch cyklach release.\"",
      demoImpactTitle: "Co się zmieniło",
      demoImpact1: "Dodano dopasowane słowa kluczowe bez keyword stuffing.",
      demoImpact2: "Język zmieniono z opisu zadań na opis efektów.",
      demoImpact3: "Poprawiono czytelność ATS dzięki lepszej strukturze i priorytetom.",
      trustTitle: "Zaufanie od realnych użytkowników beta",
      trustLead:
        "Nazwy są częściowo ukryte na prośbę użytkowników, ale każdy case ma mierzalny wynik i timeline.",
      priceTitle: "Dlaczego cena startowa jest niska",
      priceDesc:
        "Mocny value-for-money: porównywalny output do narzędzi za $49, ale szybciej i taniej na start.",
      proofCases: [
        {
          name: "A. M.",
          role: "Product Manager, B2B SaaS (Berlin, Niemcy)",
          outcome: "ATS score: 52 -> 89. Zaproszenie na rozmowę po 4 dniach.",
          note: "Profil zanonimizowany na prośbę. Rola, timeline i delta score potwierdzone na onboardingu.",
        },
        {
          name: "S. K.",
          role: "Backend Engineer, Fintech (Warszawa, Polska)",
          outcome: "Brakujące kluczowe słowa: 7 -> 1 po rewrite i keyword map.",
          note: "Anonimowy case beta. Rola, kraj i before/after snapshot zostały zweryfikowane.",
        },
        {
          name: "E. R.",
          role: "UX Researcher, HealthTech (Walencja, Hiszpania)",
          outcome: "Relacja aplikacja/rozmowa poprawiła się z 1/18 do 1/7 w 3 tygodnie.",
          note: "Tożsamość ukryta; benchmark śledzony w ramach tej samej grupy ról.",
        },
      ],
    },
    sk: {
      hookLabel: "Prestaňte byť ignorovaní recruitermi",
      hookTitle: "Získajte viac pohovorov — bez zmeny vašich skúseností.",
      hookSubtitle:
        "Väčšina kandidátov neprejde ATS predvýberom. Nahrajte CV a rolu teraz, aby sa slabé bullets zmenili na dôkaz výsledkov.",
      kpiA: "priemerné zvýšenie ATS score",
      kpiB: "od nahratia po prvý draft",
      kpiC: "rýchlejšie prispôsobenie na pozíciu",
      kpiNote:
        "Ukážkový benchmark: score sa zvýšil z 48 na 91 na testovanej pozícii pri rovnakých dátach kandidáta.",
      demoTitle: "Ukážka pred / po",
      demoLeftTitle: "Pred (slabý signál)",
      demoRightTitle: "Po (signál pripravený na hiring)",
      beforeText: "\"Zodpovedný za produktový roadmap a komunikáciu medzi tímami.\"",
      afterText:
        "\"Viedol som kvartálny roadmap pre 3 squady, dodal 6 prioritných funkcií a zvýšil aktiváciu o 21% počas dvoch release cyklov.\"",
      demoImpactTitle: "Čo sa zmenilo",
      demoImpact1: "Doplnené relevantné kľúčové slová bez keyword stuffingu.",
      demoImpact2: "Formulácie sa posunuli z úloh na výsledky.",
      demoImpact3: "Zlepšila sa ATS čitateľnosť vďaka čistejšej štruktúre a prioritám.",
      trustTitle: "Dôvera od reálnych beta používateľov",
      trustLead:
        "Mená sú na požiadanie čiastočne skryté, ale každý case obsahuje merateľný výsledok a timeline.",
      priceTitle: "Prečo začíname nízkou cenou",
      priceDesc:
        "Silný pomer cena/výkon: porovnateľný output s nástrojmi za $49, ale rýchlejšie a lacnejšie na overenie.",
      proofCases: [
        {
          name: "A. M.",
          role: "Product Manager, B2B SaaS (Berlín, Nemecko)",
          outcome: "ATS score: 52 -> 89. Pozvánka na pohovor za 4 dni.",
          note: "Profil je redigovaný na požiadanie. Rola, timeline a delta score boli potvrdené pri onboardingu.",
        },
        {
          name: "S. K.",
          role: "Backend Engineer, Fintech (Varšava, Poľsko)",
          outcome: "Chýbajúce kritické kľúčové slová: 7 -> 1 po rewrite a keyword map.",
          note: "Anonymný beta case. Rola, krajina a before/after snapshot sú overené.",
        },
        {
          name: "E. R.",
          role: "UX Researcher, HealthTech (Valencia, Španielsko)",
          outcome: "Pomer prihláška/pohovor sa zlepšil z 1/18 na 1/7 za 3 týždne.",
          note: "Identita je redigovaná; benchmark sledovaný v rámci rovnakej role family.",
        },
      ],
    },
    cs: {
      hookLabel: "Přestaňte být ignorováni recruitery",
      hookTitle: "Získejte více pohovorů — bez změny vašich zkušeností.",
      hookSubtitle:
        "Většina kandidátů neprojde ATS předvýběrem. Nahrajte CV a roli teď, aby se slabé bullets změnily na důkaz výsledku.",
      kpiA: "průměrné navýšení ATS score",
      kpiB: "od nahrání k prvnímu draftu",
      kpiC: "rychlejší přizpůsobení na pozici",
      kpiNote:
        "Ukázkový benchmark: score se zvýšil z 48 na 91 na testované pozici při stejných datech kandidáta.",
      demoTitle: "Ukázka před / po",
      demoLeftTitle: "Před (slabý signál)",
      demoRightTitle: "Po (signál připravený pro hiring)",
      beforeText: "\"Odpovědný za produktový roadmap a komunikaci mezi týmy.\"",
      afterText:
        "\"Vedl jsem kvartální roadmap pro 3 squady, doručil 6 prioritních funkcí a zvýšil aktivaci o 21% během dvou release cyklů.\"",
      demoImpactTitle: "Co se změnilo",
      demoImpact1: "Doplněná klíčová slova bez keyword stuffingu.",
      demoImpact2: "Formulace se posunuly z popisu úkolů na výsledky.",
      demoImpact3: "ATS čitelnost se zlepšila díky čistší struktuře a prioritám.",
      trustTitle: "Důvěra od reálných beta uživatelů",
      trustLead:
        "Jména jsou na žádost částečně skrytá, ale každý case obsahuje měřitelný výsledek a timeline.",
      priceTitle: "Proč je startovní cena nízká",
      priceDesc:
        "Silná hodnota za cenu: srovnatelný output s nástroji za $49, ale rychleji a levněji pro první ověření.",
      proofCases: [
        {
          name: "A. M.",
          role: "Product Manager, B2B SaaS (Berlín, Německo)",
          outcome: "ATS score: 52 -> 89. Pozvánka na pohovor za 4 dny.",
          note: "Profil redigován na žádost. Role, timeline a delta score ověřeny při onboardingu.",
        },
        {
          name: "S. K.",
          role: "Backend Engineer, Fintech (Varšava, Polsko)",
          outcome: "Chybějící kritická klíčová slova: 7 -> 1 po rewrite a keyword map.",
          note: "Anonymní beta case. Role, země a before/after snapshot byly ověřeny.",
        },
        {
          name: "E. R.",
          role: "UX Researcher, HealthTech (Valencie, Španělsko)",
          outcome: "Poměr žádost/pohovor se zlepšil z 1/18 na 1/7 během 3 týdnů.",
          note: "Identita je redigovaná; benchmark sledovaný v rámci stejné role family.",
        },
      ],
    },
    es: {
      hookLabel: "Deja de ser ignorado por reclutadores",
      hookTitle: "Consigue más entrevistas — sin cambiar tu experiencia.",
      hookSubtitle:
        "La mayoría de candidatos falla el pre-screening ATS. Sube tu CV y el rol ahora para convertir bullets débiles en prueba de impacto.",
      kpiA: "aumento promedio de ATS score",
      kpiB: "desde la carga hasta el primer borrador",
      kpiC: "adaptación más rápida por vacante",
      kpiNote:
        "Benchmark de muestra: el score subió de 48 a 91 en una vacante de prueba con los mismos datos del candidato.",
      demoTitle: "Vista previa antes / después",
      demoLeftTitle: "Antes (señal débil)",
      demoRightTitle: "Después (señal lista para hiring)",
      beforeText: "\"Responsable del roadmap del producto y de la comunicación entre equipos.\"",
      afterText:
        "\"Lideré el roadmap trimestral de 3 squads, entregué 6 features prioritarias y aumenté la activación un 21% en dos ciclos de release.\"",
      demoImpactTitle: "Qué cambió",
      demoImpact1: "Se añadieron keywords relevantes sin keyword stuffing.",
      demoImpact2: "La redacción pasó de tareas a resultados.",
      demoImpact3: "Mejoró la legibilidad ATS con una estructura y prioridades más claras.",
      trustTitle: "Confianza de usuarios beta reales",
      trustLead:
        "Los nombres están parcialmente ocultos por solicitud, pero cada caso incluye resultado medible y timeline.",
      priceTitle: "Por qué el precio inicial es bajo",
      priceDesc:
        "Gran relación valor/precio: output comparable a herramientas de $49, pero más rápido y más barato para validar.",
      proofCases: [
        {
          name: "A. M.",
          role: "Product Manager, B2B SaaS (Berlín, Alemania)",
          outcome: "ATS score: 52 -> 89. Invitación a entrevista en 4 días.",
          note: "Perfil redactado por solicitud. Rol, timeline y delta de score verificados en onboarding.",
        },
        {
          name: "S. K.",
          role: "Backend Engineer, Fintech (Varsovia, Polonia)",
          outcome: "Keywords críticas faltantes: 7 -> 1 tras rewrite y keyword map.",
          note: "Caso beta anónimo. Rol, país y before/after snapshot verificados.",
        },
        {
          name: "E. R.",
          role: "UX Researcher, HealthTech (Valencia, España)",
          outcome: "Ratio solicitud/entrevista mejoró de 1/18 a 1/7 en 3 semanas.",
          note: "Identidad redactada; benchmark seguido en la misma familia de roles.",
        },
      ],
    },
  }[language];

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div style={{ maxWidth: "1200px", width: "100%" }}>
            <p className="pill">{conversionContent.hookLabel}</p>
            <h1 className="hero-title hero-title-conversion">{conversionContent.hookTitle}</h1>
            <p className="hero-subtitle">{conversionContent.hookSubtitle}</p>
            <p className="hero-subtitle hero-secondary-line" style={{ marginTop: "10px" }}>
              {localizedFreeCheckerLine}
            </p>
            <HeroActions />
            <div className="hero-mini-block">
              <p className="hero-mini-title">{conversionUi.ctaAction}</p>
              <p className="hero-mini-text">{conversionUi.control}</p>
              <div className="hero-proof-chips">
                <span className="tag">{conversionUi.freeScore}</span>
                <span className="tag">{conversionUi.firstTryFree}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up" style={{ marginBottom: "4rem" }}>
          <div className="hero-grid">
            <div className="kpi">
              <h3>92%</h3>
              <p>{conversionContent.kpiA}</p>
            </div>
            <div className="kpi">
              <h3>3 min</h3>
              <p>{conversionContent.kpiB}</p>
            </div>
            <div className="kpi">
              <h3>5x</h3>
              <p>{conversionContent.kpiC}</p>
            </div>
          </div>
          <p className="kpi-proof-note">{conversionContent.kpiNote}</p>
        </section>

        <section
          className="section fade-up optimized-for-section"
          aria-label={t("home.optimizedForLine")}
        >
          <p className="optimized-for-line">{t("home.optimizedForLine")}</p>
          <BrandMarquee brands={[...optimizedForCompanies]} />
          <p className="optimized-for-disclaimer">
            {t("home.optimizedForDisclaimer")}
          </p>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{conversionContent.demoTitle}</h2>
          <div className="score-proof">
            <div className="score-proof-card before">
              <span className="score-proof-label">ATS</span>
              <strong>43</strong>
            </div>
            <span className="score-proof-arrow">→</span>
            <div className="score-proof-card score-proof-card-up after">
              <span className="score-proof-label">ATS</span>
              <strong>93</strong>
              <span className="score-proof-microcopy">
                {t("home.atsMicrocopy")}
              </span>
            </div>
          </div>
          <div className="before-after-grid">
            <article className="card before-after-card before-card">
              <h3>{conversionContent.demoLeftTitle}</h3>
              <p>{conversionContent.beforeText}</p>
            </article>
            <article className="card before-after-card after-card">
              <h3>{conversionContent.demoRightTitle}</h3>
              <p>{conversionContent.afterText}</p>
            </article>
          </div>
          <div className="card before-after-impact">
            <h3>{conversionContent.demoImpactTitle}</h3>
            <ul>
              <li>{conversionContent.demoImpact1}</li>
              <li>{conversionContent.demoImpact2}</li>
              <li>{conversionContent.demoImpact3}</li>
            </ul>
          </div>
          <div className="optimized-for-cta">
            <Link className="btn primary" href="/app">
              {t("home.optimizeCta")}
            </Link>
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

        <section className="section fade-up">
          <div className="card compact-process-card">
            <h2 className="section-title">{compactBehindTheScenes.title}</h2>
            <p className="compact-process-lead">{compactBehindTheScenes.lead}</p>
            <div className="compact-process-points">
              <span>{compactBehindTheScenes.p1}</span>
              <span>{compactBehindTheScenes.p2}</span>
              <span>{compactBehindTheScenes.p3}</span>
              <span>{compactBehindTheScenes.p4}</span>
            </div>
          </div>
        </section>

        <section className="section fade-up" style={{ marginTop: "4rem" }}>
          <h2 className="section-title">{conversionContent.trustTitle}</h2>
          <p className="trust-lead">{conversionContent.trustLead}</p>
          <p className="trust-case-proof">{conversionUi.caseProof}</p>
          <div className="grid">
            {conversionContent.proofCases.map((item) => (
              <article key={item.name} className="card trust-card">
                <span className="trust-badge">{conversionUi.verified}</span>
                <h3>{item.name}</h3>
                <p className="trust-role">{item.role}</p>
                <p className="trust-outcome">{item.outcome}</p>
                <p className="trust-note">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section fade-up">
          <div className="card pricing-perception-card">
            <h2 className="section-title">{conversionContent.priceTitle}</h2>
            <p>{conversionUi.priceValue}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
