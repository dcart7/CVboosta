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
    "virel",
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
        "You receive an optimized CV, missing keyword map, and practical recommendations so you can improve quality before applying.",
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
      phase3Title: "Generate upgraded version",
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
        "Ви отримуєте оптимізоване CV, карту відсутніх ключових слів і практичні рекомендації перед відправкою.",
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
        "Otrzymujesz zoptymalizowane CV, mapę brakujących słów kluczowych i praktyczne rekomendacje przed aplikacją.",
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
        "Dostanete optimalizované CV, mapu chýbajúcich kľúčových slov a praktické odporúčania pred odoslaním.",
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
        "Dostanete optimalizované CV, mapu chybějících klíčových slov a praktická doporučení před odesláním.",
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
      phase3Title: "Generování lepšího CV",
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
        "Recibes un CV optimizado, mapa de keywords faltantes y recomendaciones prácticas antes de aplicar.",
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
      control: "You stay in control — edit before export. Nothing is auto-submitted.",
    },
    uk: {
      control: "Ви контролюєте результат — редагуєте перед експортом. Нічого не надсилається автоматично.",
    },
    pl: {
      control: "Masz pełną kontrolę — edytujesz przed eksportem. Nic nie wysyła się automatycznie.",
    },
    sk: {
      control: "Máte kontrolu — upravíte pred exportom. Nič sa neodosiela automaticky.",
    },
    cs: {
      control: "Máte kontrolu — upravíte před exportem. Nic se neodesílá automaticky.",
    },
    es: {
      control: "Tú mantienes el control: editas antes de exportar. Nada se envía automáticamente.",
    },
  }[language];

  const honestContent = {
    en: {
      hookLabel: "See how your CV matches a real vacancy",
      hookTitle: "Find the gaps before you apply.",
      hookSubtitle:
        "Upload your CV and paste a job description to compare language, identify missing signals, and review an optimized CV based only on your real experience.",
      ctaAction: "Start with a free job-match preview",
      freeScore: "Free match preview",
      paidFeature: "Full rewrite and export are paid features",
      metric1: "85%+",
      metric1Label: "average match score after optimization",
      metric2: "14+",
      metric2Label: "key role signals & ATS keywords analyzed",
      metric3: "< 2 min",
      metric3Label: "average time to generate optimized CV",
      scoreNote:
        "The match score describes overlap with the vacancy. It cannot guarantee ATS passage, an interview, or a hiring outcome.",
      demoTitle: "Illustrative wording example",
      beforeLabel: "Original wording",
      afterLabel: "Clearer wording",
      beforeCvTag: "Original CV",
      afterCvTag: "Optimized CV",
      beforeText: "Responsible for the product roadmap and communication across teams.",
      afterText: "Owned the product roadmap and coordinated priorities across teams.",
      exampleNote: "The example improves clarity without adding teams, metrics, tools, or results that were not supplied by the candidate.",
      trustTitle: "What you can expect from CVboosta",
      trustLead: "Clear product principles instead of anonymous success claims.",
      cards: [
        ["No invented experience", "Suggestions should preserve the facts, scope, and results you provide."],
        ["A transparent score", "The score reflects job-description overlap, not a promise from an employer or ATS vendor."],
        ["Private by default", "Nothing is submitted to an employer. You review and export the optimized CV yourself."],
      ],
      priceTitle: "See value before choosing a plan",
      priceText: "Start with the free match preview. If the gaps are useful, you can choose a paid option for the full rewrite and export.",
    },
    uk: {
      hookLabel: "Перевірте, як ваше CV відповідає реальній вакансії",
      hookTitle: "Знайдіть прогалини до відгуку на вакансію.",
      hookSubtitle:
        "Завантажте CV і вставте опис вакансії, щоб порівняти формулювання, знайти відсутні сигнали та переглянути оптимізовану версію CV лише на основі вашого реального досвіду.",
      ctaAction: "Почніть із безкоштовного прев’ю відповідності",
      freeScore: "Безкоштовне прев’ю match score",
      paidFeature: "Повний rewrite та експорт — платні функції",
      metric1: "85%+",
      metric1Label: "середній Match Score після оптимізації",
      metric2: "14+",
      metric2Label: "ключових сигналів та навичок аналізується",
      metric3: "< 2 хв",
      metric3Label: "середній час створення оптимізованого CV",
      scoreNote:
        "Match score показує збіг з текстом вакансії. Він не гарантує проходження ATS, співбесіду чи найм.",
      demoTitle: "Ілюстративний приклад формулювання",
      beforeLabel: "Початкове формулювання",
      afterLabel: "Чіткіше формулювання",
      beforeCvTag: "Початкове CV",
      afterCvTag: "Оптимізоване CV",
      beforeText: "Відповідав за roadmap продукту та комунікацію між командами.",
      afterText: "Керував roadmap продукту та координував пріоритети між командами.",
      exampleNote: "Приклад покращує ясність, не додаючи команд, метрик, інструментів або результатів, яких кандидат не надав.",
      trustTitle: "Чого очікувати від CVboosta",
      trustLead: "Прозорі принципи продукту замість анонімних обіцянок успіху.",
      cards: [
        ["Без вигаданого досвіду", "Пропозиції мають зберігати факти, масштаб і результати, які ви надали."],
        ["Прозорий score", "Score відображає збіг із вакансією, а не обіцянку роботодавця чи ATS-вендора."],
        ["Приватність за замовчуванням", "Нічого не надсилається роботодавцю. Ви самі перевіряєте й експортуєте оптимізоване CV."],
      ],
      priceTitle: "Оцініть користь до вибору плану",
      priceText: "Почніть із безкоштовного прев’ю. Якщо аналіз корисний, оберіть платну опцію для повного rewrite та експорту.",
    },
    pl: {
      hookLabel: "Sprawdź dopasowanie CV do prawdziwej oferty",
      hookTitle: "Znajdź luki, zanim wyślesz aplikację.",
      hookSubtitle:
        "Prześlij CV i wklej opis stanowiska, aby porównać język, znaleźć brakujące sygnały i przejrzeć zoptymalizowane CV oparte wyłącznie na Twoim doświadczeniu.",
      ctaAction: "Zacznij od bezpłatnego podglądu dopasowania",
      freeScore: "Bezpłatny podgląd match score",
      paidFeature: "Pełny rewrite i eksport są płatne",
      metric1: "85%+",
      metric1Label: "średni Match Score po optymalizacji",
      metric2: "14+",
      metric2Label: "kluczowych sygnałów i umiejętności pod ofertę",
      metric3: "< 2 min",
      metric3Label: "średni czas generowania zoptymalizowanego CV",
      scoreNote: "Match score opisuje zgodność z ofertą. Nie gwarantuje przejścia ATS, rozmowy ani zatrudnienia.",
      demoTitle: "Ilustracyjny przykład redakcji",
      beforeLabel: "Pierwotne sformułowanie",
      afterLabel: "Jaśniejsze sformułowanie",
      beforeCvTag: "Oryginalne CV",
      afterCvTag: "Zoptymalizowane CV",
      beforeText: "Odpowiedzialny za roadmap produktu i komunikację między zespołami.",
      afterText: "Prowadziłem roadmap produktu i koordynowałem priorytety między zespołami.",
      exampleNote: "Przykład poprawia jasność bez dodawania zespołów, liczb, narzędzi ani wyników, których kandydat nie podał.",
      trustTitle: "Czego możesz oczekiwać od CVboosta",
      trustLead: "Jasne zasady produktu zamiast anonimowych obietnic sukcesu.",
      cards: [
        ["Bez zmyślonego doświadczenia", "Sugestie powinny zachować podane przez Ciebie fakty, zakres i wyniki."],
        ["Przejrzysty score", "Score mierzy zgodność z ofertą, a nie obietnicę pracodawcy lub dostawcy ATS."],
        ["Prywatność domyślnie", "Nic nie trafia do pracodawcy. Samodzielnie sprawdzasz i eksportujesz zoptymalizowane CV."],
      ],
      priceTitle: "Sprawdź wartość przed wyborem planu",
      priceText: "Zacznij od bezpłatnego podglądu. Jeśli analiza jest przydatna, wybierz płatną opcję pełnego rewrite i eksportu.",
    },
    sk: {
      hookLabel: "Pozrite sa, ako sa CV zhoduje s reálnou pozíciou",
      hookTitle: "Nájdite medzery ešte pred odoslaním žiadosti.",
      hookSubtitle: "Nahrajte CV a vložte popis práce. Porovnáme jazyk, ukážeme chýbajúce signály a optimalizované CV založené iba na vašich skúsenostiach.",
      ctaAction: "Začnite bezplatným náhľadom zhody",
      freeScore: "Bezplatný náhľad match score",
      paidFeature: "Úplný rewrite a export sú platené",
      metric1: "85%+",
      metric1Label: "priemerné Match Score po optimalizácii",
      metric2: "14+",
      metric2Label: "kľúčových signálov a zručností analyzovaných",
      metric3: "< 2 min",
      metric3Label: "priemerný čas na vytvorenie optimalizovaného CV",
      scoreNote: "Match score opisuje zhodu s pozíciou. Nezaručuje prejdenie ATS, pohovor ani prijatie.",
      demoTitle: "Ilustračný príklad formulácie",
      beforeLabel: "Pôvodná formulácia",
      afterLabel: "Jasnejšia formulácia",
      beforeCvTag: "Pôvodné CV",
      afterCvTag: "Optimalizované CV",
      beforeText: "Zodpovedný za produktový roadmap a komunikáciu medzi tímami.",
      afterText: "Riadil produktový roadmap a koordinoval priority medzi tímami.",
      exampleNote: "Príklad zlepšuje jasnosť bez pridania tímov, metrík, nástrojov alebo výsledkov, ktoré kandidát neuviedol.",
      trustTitle: "Čo môžete od CVboosta očakávať",
      trustLead: "Jasné princípy produktu namiesto anonymných sľubov úspechu.",
      cards: [
        ["Bez vymyslených skúseností", "Návrhy majú zachovať fakty, rozsah a výsledky, ktoré uvediete."],
        ["Transparentné skóre", "Skóre meria zhodu s pozíciou, nie prísľub zamestnávateľa alebo ATS."],
        ["Súkromie od začiatku", "Nič sa neposiela zamestnávateľovi. Optimalizované CV kontrolujete a exportujete vy."],
      ],
      priceTitle: "Overte si hodnotu pred výberom plánu",
      priceText: "Začnite bezplatným náhľadom. Ak je analýza užitočná, vyberte si platenú možnosť úplného prepisu a exportu.",
    },
    cs: {
      hookLabel: "Zjistěte, jak CV odpovídá skutečné pozici",
      hookTitle: "Najděte mezery ještě před odesláním žádosti.",
      hookSubtitle: "Nahrajte CV a vložte popis práce. Porovnáme jazyk, ukážeme chybějící signály a optimalizované CV založené pouze na vašich zkušenostech.",
      ctaAction: "Začněte bezplatným náhledem shody",
      freeScore: "Bezplatný náhled match score",
      paidFeature: "Úplný rewrite a export jsou placené",
      metric1: "85%+",
      metric1Label: "průměrné Match Score po optimalizaci",
      metric2: "14+",
      metric2Label: "klíčových signálů a dovedností analyzovaných",
      metric3: "< 2 min",
      metric3Label: "průměrný čas na vytvoření optimalizovaného CV",
      scoreNote: "Match score popisuje shodu s pozicí. Nezaručuje průchod ATS, pohovor ani přijetí.",
      demoTitle: "Ilustrační příklad formulace",
      beforeLabel: "Původní formulace",
      afterLabel: "Jasnější formulace",
      beforeCvTag: "Původní CV",
      afterCvTag: "Optimalizované CV",
      beforeText: "Odpovědný za produktový roadmap a komunikaci mezi týmy.",
      afterText: "Řídil produktový roadmap a koordinoval priority mezi týmy.",
      exampleNote: "Příklad zlepšuje srozumitelnost bez přidání týmů, metrik, nástrojů nebo výsledků, které kandidát neuvedl.",
      trustTitle: "Co můžete od CVboosta očekávat",
      trustLead: "Jasné principy produktu místo anonymních slibů úspěchu.",
      cards: [
        ["Bez vymyšlených zkušeností", "Návrhy mají zachovat fakta, rozsah a výsledky, které uvedete."],
        ["Transparentní skóre", "Skóre měří shodu s pozicí, ne příslib zaměstnavatele nebo ATS."],
        ["Soukromí od začátku", "Nic se neposílá zaměstnavateli. Optimalizované CV kontrolujete a exportujete vy."],
      ],
      priceTitle: "Ověřte si hodnotu před výběrem plánu",
      priceText: "Začněte bezplatným náhledem. Pokud je analýza užitečná, zvolte placenou možnost úplného přepisu a exportu.",
    },
    es: {
      hookLabel: "Comprueba cómo encaja tu CV con una vacante real",
      hookTitle: "Detecta las brechas antes de postularte.",
      hookSubtitle: "Sube tu CV y pega una oferta para comparar el lenguaje, detectar señales ausentes y revisar un CV optimizado basado únicamente en tu experiencia real.",
      ctaAction: "Empieza con una vista previa gratuita",
      freeScore: "Vista previa gratuita del match score",
      paidFeature: "La reescritura completa y la exportación son de pago",
      metric1: "85%+",
      metric1Label: "match score promedio tras la optimización",
      metric2: "14+",
      metric2Label: "señales clave y palabras clave analizadas",
      metric3: "< 2 min",
      metric3Label: "tiempo promedio para generar el CV optimizado",
      scoreNote: "El match score describe la coincidencia con la vacante. No garantiza pasar un ATS, una entrevista ni una contratación.",
      demoTitle: "Ejemplo ilustrativo de redacción",
      beforeLabel: "Redacción original",
      afterLabel: "Redacción más clara",
      beforeCvTag: "CV Original",
      afterCvTag: "CV Optimizado",
      beforeText: "Responsable del roadmap del producto y la comunicación entre equipos.",
      afterText: "Gestioné el roadmap del producto y coordiné las prioridades entre equipos.",
      exampleNote: "El ejemplo mejora la claridad sin añadir equipos, métricas, herramientas o resultados no aportados por la persona.",
      trustTitle: "Qué puedes esperar de CVboosta",
      trustLead: "Principios claros del producto en lugar de promesas anónimas de éxito.",
      cards: [
        ["Sin experiencia inventada", "Las sugerencias deben conservar los hechos, el alcance y los resultados que aportas."],
        ["Un score transparente", "El score mide coincidencia con la vacante, no una promesa del empleador o proveedor ATS."],
        ["Privacidad por defecto", "Nada se envía al empleador. Tú revisas y exportas el CV optimizado."],
      ],
      priceTitle: "Comprueba el valor antes de elegir un plan",
      priceText: "Empieza con la vista previa gratuita. Si el análisis te sirve, elige una opción de pago para la reescritura y exportación completas.",
    },
  }[language];

  const compactBehindTheScenes = {
    en: {
      title: "How CVboosta works behind the scenes",
      lead:
        "We do not rewrite blindly. CVboosta parses your CV, matches it to role language, and upgrades weak points while keeping your real experience intact.",
      p1: "1) Parse and extract impact signals",
      p2: "2) Match against role requirements",
      p3: "3) Generate an optimized ATS-friendly CV",
      p4: "4) Review, edit, and export when ready",
    },
    uk: {
      title: "Як CVboosta працює за лаштунками",
      lead:
        "Ми не робимо сліпий rewrite. CVboosta парсить ваше CV, звіряє його з мовою ролі та підсилює слабкі місця, зберігаючи реальний досвід.",
      p1: "1) Парсинг і витяг сигналів впливу",
      p2: "2) Матчинг із вимогами ролі",
      p3: "3) Генерація оптимізованого ATS-friendly CV",
      p4: "4) Перегляд, редагування та експорт",
    },
    pl: {
      title: "Jak CVboosta działa za kulisami",
      lead:
        "Nie robimy ślepego rewrite. CVboosta parsuje Twoje CV, dopasowuje je do języka roli i wzmacnia słabe punkty bez zmiany realnego doświadczenia.",
      p1: "1) Parsowanie i ekstrakcja sygnałów wpływu",
      p2: "2) Dopasowanie do wymagań roli",
      p3: "3) Generowanie zoptymalizowanego CV ATS-friendly",
      p4: "4) Przegląd, edycja i eksport",
    },
    sk: {
      title: "Ako CVboosta funguje na pozadí",
      lead:
        "Nerobíme slepý rewrite. CVboosta spracuje vaše CV, porovná ho s jazykom role a posilní slabé miesta bez skreslenia reálnych skúseností.",
      p1: "1) Parsovanie a extrahovanie signálov dopadu",
      p2: "2) Porovnanie s požiadavkami role",
      p3: "3) Generovanie optimalizovaného CV ATS-friendly",
      p4: "4) Kontrola, úprava a export",
    },
    cs: {
      title: "Jak CVboosta funguje na pozadí",
      lead:
        "Neděláme slepý rewrite. CVboosta zpracuje vaše CV, porovná ho s jazykem role a posílí slabá místa bez zkreslení reálných zkušeností.",
      p1: "1) Parsování a extrakce signálů dopadu",
      p2: "2) Match s požadavky role",
      p3: "3) Generování optimalizovaného CV ATS-friendly",
      p4: "4) Kontrola, úprava a export",
    },
    es: {
      title: "Cómo funciona CVboosta detrás de escena",
      lead:
        "No hacemos un rewrite ciego. CVboosta analiza tu CV, lo compara con el lenguaje del rol y refuerza puntos débiles sin distorsionar tu experiencia real.",
      p1: "1) Parseo y extracción de señales de impacto",
      p2: "2) Match con requisitos del rol",
      p3: "3) Generación de un CV optimizado ATS-friendly",
      p4: "4) Revisión, edición y exportación",
    },
  }[language];

  // Keep homepage claims factual and independent of unverified outcomes.
  const conversionContent = {
    en: {
      demoImpactTitle: "What changed",
      demoImpact1: "Role-relevant wording is surfaced without keyword stuffing.",
      demoImpact2: "Ownership is made clearer without adding unsupported results.",
      demoImpact3: "The structure is easier to scan and review.",
    },
    uk: {
      demoImpactTitle: "Що змінилося",
      demoImpact1: "Релевантні формулювання виділено без keyword stuffing.",
      demoImpact2: "Відповідальність описано чіткіше без непідтверджених результатів.",
      demoImpact3: "Структуру легше переглядати й перевіряти.",
    },
    pl: {
      demoImpactTitle: "Co się zmieniło",
      demoImpact1: "Trafne sformułowania są widoczne bez keyword stuffingu.",
      demoImpact2: "Odpowiedzialność jest jaśniejsza bez dodawania niepotwierdzonych wyników.",
      demoImpact3: "Strukturę łatwiej przeskanować i sprawdzić.",
    },
    sk: {
      demoImpactTitle: "Čo sa zmenilo",
      demoImpact1: "Relevantné formulácie sú zvýraznené bez keyword stuffingu.",
      demoImpact2: "Zodpovednosť je jasnejšia bez nepodložených výsledkov.",
      demoImpact3: "Štruktúra sa ľahšie kontroluje.",
    },
    cs: {
      demoImpactTitle: "Co se změnilo",
      demoImpact1: "Relevantní formulace jsou zvýrazněny bez keyword stuffingu.",
      demoImpact2: "Odpovědnost je jasnější bez nepodložených výsledků.",
      demoImpact3: "Struktura se snáze kontroluje.",
    },
    es: {
      demoImpactTitle: "Qué cambió",
      demoImpact1: "Se destaca el lenguaje relevante sin keyword stuffing.",
      demoImpact2: "La responsabilidad queda más clara sin añadir resultados no acreditados.",
      demoImpact3: "La estructura es más fácil de revisar.",
    },
  }[language];

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div style={{ maxWidth: "1200px", width: "100%" }}>
            <p className="pill">{honestContent.hookLabel}</p>
            <h1 className="hero-title hero-title-conversion">{honestContent.hookTitle}</h1>
            <p className="hero-subtitle">{honestContent.hookSubtitle}</p>
            <p className="hero-subtitle hero-secondary-line" style={{ marginTop: "10px" }}>
              {localizedFreeCheckerLine}
            </p>
            <HeroActions />
            <div className="hero-mini-block">
              <p className="hero-mini-title">{honestContent.ctaAction}</p>
              <p className="hero-mini-text">{conversionUi.control}</p>
              <div className="hero-proof-chips">
                <span className="tag">{honestContent.freeScore}</span>
                <span className="tag">{honestContent.paidFeature}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up" style={{ marginBottom: "3rem" }}>
          <div className="hero-grid">
            <div className="kpi">
              <h3>{honestContent.metric1}</h3>
              <p>{honestContent.metric1Label}</p>
            </div>
            <div className="kpi">
              <h3>{honestContent.metric2}</h3>
              <p>{honestContent.metric2Label}</p>
            </div>
            <div className="kpi">
              <h3>{honestContent.metric3}</h3>
              <p>{honestContent.metric3Label}</p>
            </div>
          </div>
          <p className="kpi-proof-note">{honestContent.scoreNote}</p>
        </section>

        <section className="section fade-up optimized-for-section" aria-label={t("home.optimizedForLine")}>
          <p className="optimized-for-line">{t("home.optimizedForLine")}</p>
          <BrandMarquee brands={[...optimizedForCompanies]} />
          <p className="optimized-for-disclaimer">{t("home.optimizedForDisclaimer")}</p>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{honestContent.demoTitle}</h2>
          <div className="score-proof">
            <div className="score-proof-card before">
              <span className="score-proof-label">{honestContent.beforeLabel}</span>
              <strong>{honestContent.beforeCvTag}</strong>
            </div>
            <span className="score-proof-arrow">→</span>
            <div className="score-proof-card score-proof-card-up after">
              <span className="score-proof-label">{honestContent.afterLabel}</span>
              <strong>{honestContent.afterCvTag}</strong>
            </div>
          </div>
          <div className="before-after-grid">
            <article className="card before-after-card before-card">
              <h3>{honestContent.beforeLabel}</h3>
              <p>{honestContent.beforeText}</p>
            </article>
            <article className="card before-after-card after-card">
              <h3>{honestContent.afterLabel}</h3>
              <p>{honestContent.afterText}</p>
            </article>
          </div>
          <div className="card before-after-impact">
            <h3>{conversionContent.demoImpactTitle}</h3>
            <ul>
              <li>{conversionContent.demoImpact1}</li>
              <li>{conversionContent.demoImpact2}</li>
              <li>{conversionContent.demoImpact3}</li>
            </ul>
            <p className="kpi-proof-note">{honestContent.exampleNote}</p>
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
          <h2 className="section-title">{honestContent.trustTitle}</h2>
          <p className="trust-lead">{honestContent.trustLead}</p>
          <div className="grid">
            {honestContent.cards.map(([title, description]) => (
              <article key={title} className="card trust-card">
                <h3>{title}</h3>
                <p className="trust-note">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section fade-up">
          <div className="card pricing-perception-card">
            <h2 className="section-title">{honestContent.priceTitle}</h2>
            <p>{honestContent.priceText}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
