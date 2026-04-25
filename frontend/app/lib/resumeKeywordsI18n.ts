import type { Language } from "./translations";
import type { ResumeKeywordCluster, RoleCategory } from "./resumeKeywordClusters";

type UiTexts = {
  hubKicker: string;
  hubTitle: string;
  hubSubtitle: string;
  rolesLabel: string;
  openGuide: string;
  filterLabel: string;
  allSectors: string;
  searchPlaceholder: string;
  noResults: string;
  checkSpelling: string;
  roleGuideKicker: string;
  pageTitle: (role: string) => string;
  pageDescription: (role: string) => string;
  topKeywordsTitle: (role: string) => string;
  topKeywordsText: (role: string) => string;
  mistakesTitle: (role: string) => string;
  mistakesText: (role: string) => string;
  expectationsTitle: (role: string) => string;
  expectationsText: string;
  examplesTitle: (role: string) => string;
  examplesText: string;
  impactTitle: (role: string) => string;
  impactText: string;
  toolStackTitle: string;
  toolStackText: string;
  blueprintTitle: (role: string) => string;
  blueprintText: string;
  blueprintPurposeLabel: string;
  blueprintKeywordPlacementLabel: string;
  fifteenMinTitle: (role: string) => string;
  fifteenMinText: string;
  longTailText: string;
  faqTitle: string;
  finalChecklistTitle: string;
  nextStepTitle: string;
  nextStepText: string;
  freeChecker: string;
  optimizeCv: string;
  before: string;
  after: string;
};

const SECTOR_LABELS: Record<Language, Record<RoleCategory, string>> = {
  en: {
    engineering: "Engineering",
    data: "Data",
    product: "Product",
    design: "Design",
    marketing: "Marketing",
    sales: "Sales",
    operations: "Operations",
    finance: "Finance",
    hr: "HR",
    customer: "Customer",
    legal: "Legal",
    healthcare: "Healthcare",
    education: "Education",
    security: "Security",
  },
  uk: {
    engineering: "Інженерія",
    data: "Аналітика даних",
    product: "Продукт",
    design: "Дизайн",
    marketing: "Маркетинг",
    sales: "Продажі",
    operations: "Операції",
    finance: "Фінанси",
    hr: "HR",
    customer: "Клієнтський сервіс",
    legal: "Право",
    healthcare: "Охорона здоров'я",
    education: "Освіта",
    security: "Безпека",
  },
  pl: {
    engineering: "Inżynieria",
    data: "Dane",
    product: "Produkt",
    design: "Projektowanie",
    marketing: "Marketing",
    sales: "Sprzedaż",
    operations: "Operacje",
    finance: "Finanse",
    hr: "HR",
    customer: "Obsługa klienta",
    legal: "Prawo",
    healthcare: "Ochrona zdrowia",
    education: "Edukacja",
    security: "Bezpieczeństwo",
  },
  sk: {
    engineering: "Inžinierstvo",
    data: "Dáta",
    product: "Produkt",
    design: "Dizajn",
    marketing: "Marketing",
    sales: "Predaj",
    operations: "Operácie",
    finance: "Financie",
    hr: "HR",
    customer: "Zákaznícka starostlivosť",
    legal: "Právo",
    healthcare: "Zdravotníctvo",
    education: "Vzdelávanie",
    security: "Bezpečnosť",
  },
  cs: {
    engineering: "Inženýrství",
    data: "Data",
    product: "Produkt",
    design: "Design",
    marketing: "Marketing",
    sales: "Prodej",
    operations: "Provoz",
    finance: "Finance",
    hr: "HR",
    customer: "Péče o zákazníky",
    legal: "Právo",
    healthcare: "Zdravotnictví",
    education: "Vzdělávání",
    security: "Bezpečnost",
  },
  es: {
    engineering: "Ingeniería",
    data: "Datos",
    product: "Producto",
    design: "Diseño",
    marketing: "Marketing",
    sales: "Ventas",
    operations: "Operaciones",
    finance: "Finanzas",
    hr: "RR. HH.",
    customer: "Atención al cliente",
    legal: "Legal",
    healthcare: "Salud",
    education: "Educación",
    security: "Seguridad",
  },
};

const UI: Record<Language, UiTexts> = {
  en: {
    hubKicker: "SEO Cluster Hub",
    hubTitle: "Resume Keywords by Role",
    hubSubtitle:
      "Role-specific ATS keyword guides with mistakes, rewrite examples, and FAQ.",
    rolesLabel: "Roles",
    openGuide: "Open guide",
    filterLabel: "Sector",
    allSectors: "All sectors",
    searchPlaceholder: "Search role (e.g. Product Manager)",
    noResults: "No roles found",
    checkSpelling: "Try another role name or clear filters.",
    roleGuideKicker: "Role Cluster",
    pageTitle: (role) => `Resume Keywords for ${role}`,
    pageDescription: (role) =>
      `This guide shows how to build a stronger ${role} resume using ATS keyword alignment, measurable bullet rewrites, and role-specific quality checks.`,
    topKeywordsTitle: (role) => `Top ATS Keywords for ${role}`,
    topKeywordsText: () =>
      "For this role, keyword targeting should focus on relevance, not stuffing. Place priority terms in summary, skills, and recent experience where ATS and recruiters scan first.",
    mistakesTitle: (role) => `Common Resume Mistakes for ${role}`,
    mistakesText: (role) =>
      `Most weak ${role} resumes fail due to generic wording, missing evidence, and low keyword alignment.`,
    expectationsTitle: (role) => `What Hiring Teams Expect for ${role}`,
    expectationsText:
      "Recruiters scan quickly. Strong resumes make role fit obvious in under 20 seconds and back claims with measurable proof.",
    examplesTitle: (role) => `Example Bullet Rewrites for ${role}`,
    examplesText:
      "Use action + context + measurable result. Replace vague bullets with concrete outcomes.",
    impactTitle: (role) => `High-Impact Achievement Ideas for ${role}`,
    impactText:
      "Use these patterns to convert generic bullets into evidence-based achievements with numbers and scope.",
    toolStackTitle: "Role Tool Stack to Reference",
    toolStackText:
      "Mention tools only when they reflect real experience. Each tool should be backed by a real project or outcome.",
    blueprintTitle: (role) => `ATS-Safe Resume Blueprint for ${role}`,
    blueprintText:
      "This structure keeps both ATS readability and recruiter clarity. Use it as your repeatable application template.",
    blueprintPurposeLabel: "Purpose",
    blueprintKeywordPlacementLabel: "Keyword placement",
    fifteenMinTitle: (role) => `How to Tailor a ${role} Resume in 15 Minutes`,
    fifteenMinText:
      "Step 1: identify repeated requirements in the vacancy. Step 2: update summary with role fit. Step 3: reorder skills. Step 4: rewrite top bullets with outcomes. Step 5: run final ATS check.",
    longTailText: "Long-tail phrases this page targets",
    faqTitle: "FAQ",
    finalChecklistTitle: "Final Submission Checklist",
    nextStepTitle: "Next Step",
    nextStepText:
      "Apply this guide on your resume with live ATS feedback and missing keyword detection.",
    freeChecker: "Free ATS Resume Checker",
    optimizeCv: "Optimize CV",
    before: "Before",
    after: "After",
  },
  uk: {
    hubKicker: "SEO кластер",
    hubTitle: "Ключові слова резюме за ролями",
    hubSubtitle:
      "Рольові ATS-гайди з типовими помилками, прикладами переписування та FAQ.",
    rolesLabel: "Ролі",
    openGuide: "Відкрити гайд",
    filterLabel: "Сфера",
    allSectors: "Усі сфери",
    searchPlaceholder: "Пошук ролі (наприклад, Product Manager)",
    noResults: "Ролі не знайдено",
    checkSpelling: "Спробуйте іншу назву ролі або очистіть фільтри.",
    roleGuideKicker: "Кластер ролі",
    pageTitle: (role) => `Ключові слова резюме для ${role}`,
    pageDescription: (role) =>
      `Цей гайд показує, як зробити резюме для ${role} сильнішим через ATS-відповідність, вимірювані bullet-пункти та перевірки якості.`,
    topKeywordsTitle: (role) => `Топ ATS-ключові слова для ${role}`,
    topKeywordsText: () =>
      "Для цієї ролі важлива релевантність, а не перенасичення ключовими словами. Розміщуйте пріоритетні терміни в summary, skills і останньому досвіді.",
    mistakesTitle: (role) => `Типові помилки в резюме для ${role}`,
    mistakesText: (role) =>
      `Слабкі резюме для ${role} зазвичай мають загальні формулювання, мало доказів та низьку відповідність ключовим словам.`,
    expectationsTitle: (role) => `Що очікує найм від кандидата на ${role}`,
    expectationsText:
      "Рекрутери переглядають резюме дуже швидко. Сильне резюме показує релевантність за перші 20 секунд і підтверджує її цифрами.",
    examplesTitle: (role) => `Приклади переписування bullet-пунктів для ${role}`,
    examplesText:
      "Використовуйте формулу дія + контекст + вимірюваний результат. Замінюйте розмиті формулювання конкретним впливом.",
    impactTitle: (role) => `Ідеї сильних досягнень для ${role}`,
    impactText:
      "Ці шаблони допоможуть перетворити загальні bullet-пункти на переконливі докази з метриками та масштабом.",
    toolStackTitle: "Стек інструментів, який варто згадати",
    toolStackText:
      "Згадуйте інструменти лише там, де це справді ваш досвід. Кожен інструмент має підкріплюватися реальним проєктом або результатом.",
    blueprintTitle: (role) => `ATS-безпечна структура резюме для ${role}`,
    blueprintText:
      "Ця структура зберігає читабельність і для ATS, і для рекрутера. Використовуйте її як повторюваний шаблон під кожну вакансію.",
    blueprintPurposeLabel: "Мета",
    blueprintKeywordPlacementLabel: "Розміщення ключових слів",
    fifteenMinTitle: (role) => `Як адаптувати резюме для ${role} за 15 хвилин`,
    fifteenMinText:
      "Крок 1: знайдіть повторювані вимоги у вакансії. Крок 2: оновіть summary під роль. Крок 3: перегрупуйте skills. Крок 4: перепишіть головні bullet-пункти з результатами. Крок 5: зробіть фінальну ATS-перевірку.",
    longTailText: "Long-tail запити цієї сторінки",
    faqTitle: "FAQ",
    finalChecklistTitle: "Фінальний чекліст перед відправкою",
    nextStepTitle: "Наступний крок",
    nextStepText:
      "Застосуйте цей гайд до свого резюме з live ATS-фідбеком і пошуком відсутніх ключових слів.",
    freeChecker: "Безкоштовний ATS Resume Checker",
    optimizeCv: "Оптимізувати CV",
    before: "До",
    after: "Після",
  },
  pl: {
    hubKicker: "Klaster SEO",
    hubTitle: "Słowa kluczowe CV według roli",
    hubSubtitle:
      "Przewodniki ATS dla ról: błędy, przykłady przeredagowania i FAQ.",
    rolesLabel: "Role",
    openGuide: "Otwórz poradnik",
    filterLabel: "Obszar",
    allSectors: "Wszystkie obszary",
    searchPlaceholder: "Szukaj roli (np. Product Manager)",
    noResults: "Nie znaleziono ról",
    checkSpelling: "Spróbuj innej nazwy roli lub wyczyść filtry.",
    roleGuideKicker: "Klaster roli",
    pageTitle: (role) => `Słowa kluczowe CV dla ${role}`,
    pageDescription: (role) =>
      `Ten poradnik pokazuje, jak zbudować mocniejsze CV dla ${role} dzięki dopasowaniu ATS, mierzalnym bulletom i kontroli jakości.`,
    topKeywordsTitle: (role) => `Najważniejsze słowa ATS dla ${role}`,
    topKeywordsText: () =>
      "W tej roli liczy się trafność, a nie upychanie słów kluczowych. Umieszczaj priorytetowe terminy w podsumowaniu, umiejętnościach i ostatnim doświadczeniu.",
    mistakesTitle: (role) => `Najczęstsze błędy CV dla ${role}`,
    mistakesText: (role) =>
      `Słabsze CV dla ${role} zwykle zawierają zbyt ogólny język, mało dowodów i niski poziom dopasowania słów kluczowych.`,
    expectationsTitle: (role) => `Czego zespoły rekrutujące oczekują od ${role}`,
    expectationsText:
      "Rekruterzy skanują CV bardzo szybko. Dobre CV pokazuje dopasowanie do roli w mniej niż 20 sekund i potwierdza je liczbami.",
    examplesTitle: (role) => `Przykłady przeredagowania bulletów dla ${role}`,
    examplesText:
      "Stosuj schemat działanie + kontekst + mierzalny wynik. Zamieniaj ogólne zdania na konkretne efekty.",
    impactTitle: (role) => `Pomysły na mocne osiągnięcia dla ${role}`,
    impactText:
      "Te wzorce pomagają zmienić ogólne bullet pointy w mocne dowody z metrykami i zakresem.",
    toolStackTitle: "Stos narzędzi, który warto wskazać",
    toolStackText:
      "Wymieniaj narzędzia tylko wtedy, gdy faktycznie z nich korzystałeś(-aś). Każde narzędzie powinno mieć potwierdzenie w projekcie lub wyniku.",
    blueprintTitle: (role) => `Bezpieczny dla ATS układ CV dla ${role}`,
    blueprintText:
      "Ta struktura utrzymuje czytelność zarówno dla ATS, jak i rekrutera. Traktuj ją jako powtarzalny szablon aplikacji.",
    blueprintPurposeLabel: "Cel",
    blueprintKeywordPlacementLabel: "Umiejscowienie słów kluczowych",
    fifteenMinTitle: (role) => `Jak dopasować CV do ${role} w 15 minut`,
    fifteenMinText:
      "Krok 1: znajdź powtarzające się wymagania w ogłoszeniu. Krok 2: dopracuj podsumowanie pod rolę. Krok 3: uporządkuj umiejętności. Krok 4: przepisz kluczowe bullet pointy z wynikami. Krok 5: wykonaj końcowy check ATS.",
    longTailText: "Frazy long-tail tej strony",
    faqTitle: "FAQ",
    finalChecklistTitle: "Końcowa checklista przed wysyłką",
    nextStepTitle: "Następny krok",
    nextStepText:
      "Zastosuj ten poradnik do swojego CV z live ATS feedback i wykrywaniem brakujących słów kluczowych.",
    freeChecker: "Darmowy ATS Resume Checker",
    optimizeCv: "Optymalizuj CV",
    before: "Przed",
    after: "Po",
  },
  sk: {
    hubKicker: "SEO klaster",
    hubTitle: "Kľúčové slová životopisu podľa role",
    hubSubtitle:
      "ATS návody podľa rolí s chybami, príkladmi prepísania a FAQ.",
    rolesLabel: "Roly",
    openGuide: "Otvoriť návod",
    filterLabel: "Oblasť",
    allSectors: "Všetky oblasti",
    searchPlaceholder: "Hľadať rolu (napr. Product Manager)",
    noResults: "Roly sa nenašli",
    checkSpelling: "Skúste iný názov role alebo vymažte filtre.",
    roleGuideKicker: "Klastr role",
    pageTitle: (role) => `Kľúčové slová životopisu pre ${role}`,
    pageDescription: (role) =>
      `Tento návod ukazuje, ako vytvoriť silnejší životopis pre ${role} pomocou ATS súladu, merateľných bullet bodov a kontroly kvality.`,
    topKeywordsTitle: (role) => `Top ATS kľúčové slová pre ${role}`,
    topKeywordsText: () =>
      "Pri tejto role je rozhodujúca relevantnosť, nie keyword stuffing. Prioritné termíny umiestnite do summary, skills a najnovšej skúsenosti.",
    mistakesTitle: (role) => `Najčastejšie chyby životopisu pre ${role}`,
    mistakesText: (role) =>
      `Slabšie životopisy pre ${role} často používajú všeobecné formulácie, slabé dôkazy a nízke keyword prispôsobenie.`,
    expectationsTitle: (role) => `Čo hiring tím očakáva od ${role}`,
    expectationsText:
      "Recruiteri prechádzajú životopis veľmi rýchlo. Silný životopis ukáže vhodnosť na rolu do 20 sekúnd a podloží ju číslami.",
    examplesTitle: (role) => `Príklady prepísania bullet bodov pre ${role}`,
    examplesText:
      "Použite vzorec akcia + kontext + merateľný výsledok. Nahraďte všeobecné body konkrétnym dopadom.",
    impactTitle: (role) => `Návrhy silných výsledkov pre ${role}`,
    impactText:
      "Tieto vzory pomôžu premeniť všeobecné bullet body na dôkazové vyjadrenia s metrikami a rozsahom.",
    toolStackTitle: "Tool stack, ktorý sa oplatí uviesť",
    toolStackText:
      "Spomínajte nástroje iba vtedy, keď sú súčasťou vašej reálnej skúsenosti. Každý nástroj podporte konkrétnym projektom alebo výsledkom.",
    blueprintTitle: (role) => `ATS-safe štruktúra životopisu pre ${role}`,
    blueprintText:
      "Táto štruktúra zachová čitateľnosť pre ATS aj recruitera. Používajte ju ako opakovateľnú šablónu pre každú prihlášku.",
    blueprintPurposeLabel: "Účel",
    blueprintKeywordPlacementLabel: "Umiestnenie kľúčových slov",
    fifteenMinTitle: (role) => `Ako upraviť životopis pre ${role} za 15 minút`,
    fifteenMinText:
      "Krok 1: nájdite opakované požiadavky vo vacancy. Krok 2: upravte summary na cieľovú rolu. Krok 3: preusporiadajte skills. Krok 4: prepíšte hlavné bullet body na výsledky. Krok 5: spravte finálny ATS check.",
    longTailText: "Long-tail frázy tejto stránky",
    faqTitle: "FAQ",
    finalChecklistTitle: "Záverečný checklist pred odoslaním",
    nextStepTitle: "Ďalší krok",
    nextStepText:
      "Použite tento návod na svoj životopis s live ATS spätnou väzbou a detekciou chýbajúcich kľúčových slov.",
    freeChecker: "Bezplatný ATS Resume Checker",
    optimizeCv: "Optimalizovať CV",
    before: "Pred",
    after: "Po",
  },
  cs: {
    hubKicker: "SEO klastr",
    hubTitle: "Klíčová slova životopisu podle role",
    hubSubtitle:
      "ATS průvodci podle rolí s chybami, příklady přepisu a FAQ.",
    rolesLabel: "Role",
    openGuide: "Otevřít průvodce",
    filterLabel: "Obor",
    allSectors: "Všechny obory",
    searchPlaceholder: "Hledat roli (např. Product Manager)",
    noResults: "Role nenalezeny",
    checkSpelling: "Zkuste jiný název role nebo vyčistěte filtry.",
    roleGuideKicker: "Klastr role",
    pageTitle: (role) => `Klíčová slova životopisu pro ${role}`,
    pageDescription: (role) =>
      `Tento průvodce ukazuje, jak vytvořit silnější životopis pro ${role} díky ATS souladu, měřitelným bullet bodům a kontrole kvality.`,
    topKeywordsTitle: (role) => `Top ATS klíčová slova pro ${role}`,
    topKeywordsText: () =>
      "U této role je klíčová relevance, ne keyword stuffing. Prioritní termíny umístěte do summary, skills a poslední zkušenosti.",
    mistakesTitle: (role) => `Nejčastější chyby v životopisu pro ${role}`,
    mistakesText: (role) =>
      `Slabší životopisy pro ${role} často trpí obecným jazykem, slabými důkazy a nízkým souladem klíčových slov.`,
    expectationsTitle: (role) => `Co hiring týmy očekávají od ${role}`,
    expectationsText:
      "Recruiteri čtou životopis rychle. Silný životopis ukáže shodu s rolí do 20 sekund a podloží tvrzení měřitelnými výsledky.",
    examplesTitle: (role) => `Příklady přepisu bullet bodů pro ${role}`,
    examplesText:
      "Používejte vzorec akce + kontext + měřitelný výsledek. Nahraďte obecné body konkrétním dopadem.",
    impactTitle: (role) => `Nápady na silné výsledky pro ${role}`,
    impactText:
      "Tyto vzory pomáhají převést obecné bullet pointy na důkazní výsledky s metrikami a rozsahem.",
    toolStackTitle: "Tool stack, který má smysl uvést",
    toolStackText:
      "Nástroje uvádějte jen tehdy, když odpovídají vaší skutečné praxi. Každý nástroj podpořte konkrétním projektem nebo výsledkem.",
    blueprintTitle: (role) => `ATS-safe struktura životopisu pro ${role}`,
    blueprintText:
      "Tato struktura udrží čitelnost pro ATS i recruitera. Používejte ji jako opakovatelnou šablonu pro každou přihlášku.",
    blueprintPurposeLabel: "Účel",
    blueprintKeywordPlacementLabel: "Umístění klíčových slov",
    fifteenMinTitle: (role) => `Jak upravit životopis pro ${role} za 15 minut`,
    fifteenMinText:
      "Krok 1: najděte opakující se požadavky ve vacancy. Krok 2: upravte summary pro cílovou roli. Krok 3: přeuspořádejte skills. Krok 4: přepište hlavní bullet body na výsledky. Krok 5: proveďte finální ATS check.",
    longTailText: "Long-tail fráze této stránky",
    faqTitle: "FAQ",
    finalChecklistTitle: "Závěrečný checklist před odesláním",
    nextStepTitle: "Další krok",
    nextStepText:
      "Použijte tento průvodce na svůj životopis s live ATS zpětnou vazbou a detekcí chybějících klíčových slov.",
    freeChecker: "Bezplatný ATS Resume Checker",
    optimizeCv: "Optimalizovat CV",
    before: "Před",
    after: "Po",
  },
  es: {
    hubKicker: "Clúster SEO",
    hubTitle: "Palabras clave de CV por rol",
    hubSubtitle:
      "Guías ATS por rol con errores comunes, ejemplos de reescritura y FAQ.",
    rolesLabel: "Roles",
    openGuide: "Abrir guía",
    filterLabel: "Sector",
    allSectors: "Todos los sectores",
    searchPlaceholder: "Buscar rol (p. ej. Product Manager)",
    noResults: "No se encontraron roles",
    checkSpelling: "Prueba otro nombre de rol o limpia los filtros.",
    roleGuideKicker: "Clúster de rol",
    pageTitle: (role) => `Palabras clave de CV para ${role}`,
    pageDescription: (role) =>
      `Esta guía muestra cómo crear un CV más sólido para ${role} con alineación ATS, bullets medibles y controles de calidad por rol.`,
    topKeywordsTitle: (role) => `Principales palabras ATS para ${role}`,
    topKeywordsText: () =>
      "Para este rol, importa la relevancia, no rellenar de palabras clave. Coloca términos prioritarios en resumen, habilidades y experiencia reciente.",
    mistakesTitle: (role) => `Errores comunes de CV para ${role}`,
    mistakesText: (role) =>
      `Los CV débiles para ${role} suelen fallar por lenguaje genérico, poca evidencia y bajo ajuste de palabras clave.`,
    expectationsTitle: (role) => `Qué espera el equipo de contratación de ${role}`,
    expectationsText:
      "Los reclutadores revisan rápido. Un CV fuerte demuestra encaje con el rol en menos de 20 segundos y lo respalda con métricas.",
    examplesTitle: (role) => `Ejemplos de reescritura de bullets para ${role}`,
    examplesText:
      "Usa la fórmula acción + contexto + resultado medible. Sustituye frases vagas por impacto concreto.",
    impactTitle: (role) => `Ideas de logros de alto impacto para ${role}`,
    impactText:
      "Estos patrones te ayudan a convertir bullets genéricos en logros con evidencia, alcance y números.",
    toolStackTitle: "Stack de herramientas para mencionar",
    toolStackText:
      "Menciona herramientas solo cuando formen parte real de tu experiencia. Cada herramienta debe estar respaldada por un proyecto o resultado.",
    blueprintTitle: (role) => `Estructura de CV segura para ATS de ${role}`,
    blueprintText:
      "Esta estructura mantiene la legibilidad para ATS y para reclutadores. Úsala como plantilla repetible en cada postulación.",
    blueprintPurposeLabel: "Objetivo",
    blueprintKeywordPlacementLabel: "Ubicación de palabras clave",
    fifteenMinTitle: (role) => `Cómo adaptar tu CV para ${role} en 15 minutos`,
    fifteenMinText:
      "Paso 1: detecta requisitos repetidos en la vacante. Paso 2: actualiza el resumen para el rol. Paso 3: reordena habilidades. Paso 4: reescribe los bullets principales con resultados. Paso 5: haz una revisión final ATS.",
    longTailText: "Frases long-tail de esta página",
    faqTitle: "FAQ",
    finalChecklistTitle: "Checklist final antes de enviar",
    nextStepTitle: "Siguiente paso",
    nextStepText:
      "Aplica esta guía a tu CV con feedback ATS en vivo y detección de palabras clave faltantes.",
    freeChecker: "Free ATS Resume Checker",
    optimizeCv: "Optimizar CV",
    before: "Antes",
    after: "Después",
  },
};

const KEYWORD_SUFFIX_BY_LANG: Record<Language, Record<string, string>> = {
  en: {
    resume: "resume",
    achievements: "achievements",
    responsibilities: "responsibilities",
    tools: "tools",
    projects: "projects",
    results: "results",
  },
  uk: {
    resume: "резюме",
    achievements: "досягнення",
    responsibilities: "обов'язки",
    tools: "інструменти",
    projects: "проєкти",
    results: "результати",
  },
  pl: {
    resume: "CV",
    achievements: "osiągnięcia",
    responsibilities: "obowiązki",
    tools: "narzędzia",
    projects: "projekty",
    results: "wyniki",
  },
  sk: {
    resume: "životopis",
    achievements: "výsledky",
    responsibilities: "zodpovednosti",
    tools: "nástroje",
    projects: "projekty",
    results: "výsledky",
  },
  cs: {
    resume: "životopis",
    achievements: "výsledky",
    responsibilities: "odpovědnosti",
    tools: "nástroje",
    projects: "projekty",
    results: "výsledky",
  },
  es: {
    resume: "currículum",
    achievements: "logros",
    responsibilities: "responsabilidades",
    tools: "herramientas",
    projects: "proyectos",
    results: "resultados",
  },
};

const ROLE_PHRASE_MAP: Record<Exclude<Language, "en">, Array<[string, string]>> = {
  uk: [
    ["Software Engineer", "Програмний інженер"],
    ["Frontend Developer", "Фронтенд-розробник"],
    ["Backend Developer", "Бекенд-розробник"],
    ["Full Stack Developer", "Фулстек-розробник"],
    ["DevOps Engineer", "DevOps інженер"],
    ["Site Reliability Engineer", "Інженер з надійності сайтів"],
    ["Machine Learning Engineer", "Інженер машинного навчання"],
    ["Cloud Engineer", "Хмарний інженер"],
    ["Platform Engineer", "Платформний інженер"],
    ["Security Engineer", "Інженер з безпеки"],
    ["Data Scientist", "Дата-сайентист"],
    ["Data Engineer", "Інженер даних"],
    ["Data Analyst", "Аналітик даних"],
    ["Product Manager", "Продуктовий менеджер"],
    ["Project Manager", "Керівник проєкту"],
    ["Program Manager", "Керівник програм"],
    ["Product Designer", "Продуктовий дизайнер"],
    ["UX Designer", "UX дизайнер"],
    ["UI Designer", "UI дизайнер"],
    ["UX Researcher", "UX дослідник"],
    ["Marketing Manager", "Маркетинг-менеджер"],
    ["Sales Manager", "Менеджер з продажу"],
    ["Account Manager", "Акаунт-менеджер"],
    ["Customer Success Manager", "Менеджер успіху клієнтів"],
    ["Business Analyst", "Бізнес-аналітик"],
    ["Financial Analyst", "Фінансовий аналітик"],
    ["HR Manager", "HR менеджер"],
    ["HR Generalist", "HR дженераліст"],
    ["Recruiter", "Рекрутер"],
    ["Legal Counsel", "Юрисконсульт"],
    ["Compliance Officer", "Офіцер з комплаєнсу"],
    ["Registered Nurse", "Дипломована медсестра"],
    ["Nurse Practitioner", "Практикуюча медсестра"],
    ["Medical Assistant", "Медичний асистент"],
    ["Instructional Designer", "Методист з навчального дизайну"],
    ["Academic Advisor", "Академічний радник"],
    ["Chief of Staff", "Керівник штабу"],
  ],
  pl: [
    ["Software Engineer", "Inżynier oprogramowania"],
    ["Frontend Developer", "Programista frontend"],
    ["Backend Developer", "Programista backend"],
    ["Full Stack Developer", "Programista full stack"],
    ["DevOps Engineer", "Inżynier DevOps"],
    ["Site Reliability Engineer", "Inżynier niezawodności systemów"],
    ["Machine Learning Engineer", "Inżynier uczenia maszynowego"],
    ["Cloud Engineer", "Inżynier chmurowy"],
    ["Platform Engineer", "Inżynier platformowy"],
    ["Security Engineer", "Inżynier bezpieczeństwa"],
    ["Data Scientist", "Naukowiec danych"],
    ["Data Engineer", "Inżynier danych"],
    ["Data Analyst", "Analityk danych"],
    ["Product Manager", "Menedżer produktu"],
    ["Project Manager", "Kierownik projektu"],
    ["Program Manager", "Kierownik programu"],
    ["Product Designer", "Projektant produktu"],
    ["UX Designer", "Projektant UX"],
    ["UI Designer", "Projektant UI"],
    ["UX Researcher", "Badacz UX"],
    ["Marketing Manager", "Menedżer marketingu"],
    ["Sales Manager", "Menedżer sprzedaży"],
    ["Account Manager", "Menedżer kont"],
    ["Customer Success Manager", "Menedżer sukcesu klienta"],
    ["Business Analyst", "Analityk biznesowy"],
    ["Financial Analyst", "Analityk finansowy"],
    ["HR Manager", "Menedżer HR"],
    ["HR Generalist", "Specjalista HR"],
    ["Recruiter", "Rekruter"],
    ["Legal Counsel", "Radca prawny"],
    ["Compliance Officer", "Specjalista ds. zgodności"],
    ["Registered Nurse", "Pielęgniarka dyplomowana"],
    ["Nurse Practitioner", "Pielęgniarka praktyk"],
    ["Medical Assistant", "Asystent medyczny"],
    ["Instructional Designer", "Projektant szkoleń"],
    ["Academic Advisor", "Doradca akademicki"],
    ["Chief of Staff", "Szef sztabu"],
  ],
  sk: [
    ["Software Engineer", "Softvérový inžinier"],
    ["Frontend Developer", "Frontend vývojár"],
    ["Backend Developer", "Backend vývojár"],
    ["Full Stack Developer", "Full stack vývojár"],
    ["DevOps Engineer", "DevOps inžinier"],
    ["Site Reliability Engineer", "Inžinier spoľahlivosti systémov"],
    ["Machine Learning Engineer", "Inžinier strojového učenia"],
    ["Cloud Engineer", "Cloudový inžinier"],
    ["Platform Engineer", "Platformový inžinier"],
    ["Security Engineer", "Bezpečnostný inžinier"],
    ["Data Scientist", "Dátový vedec"],
    ["Data Engineer", "Dátový inžinier"],
    ["Data Analyst", "Dátový analytik"],
    ["Product Manager", "Produktový manažér"],
    ["Project Manager", "Projektový manažér"],
    ["Program Manager", "Programový manažér"],
    ["Product Designer", "Produktový dizajnér"],
    ["UX Designer", "UX dizajnér"],
    ["UI Designer", "UI dizajnér"],
    ["UX Researcher", "UX výskumník"],
    ["Marketing Manager", "Marketingový manažér"],
    ["Sales Manager", "Manažér predaja"],
    ["Account Manager", "Account manažér"],
    ["Customer Success Manager", "Manažér úspechu zákazníkov"],
    ["Business Analyst", "Biznis analytik"],
    ["Financial Analyst", "Finančný analytik"],
    ["HR Manager", "HR manažér"],
    ["HR Generalist", "HR generalista"],
    ["Recruiter", "Rekruter"],
    ["Legal Counsel", "Právny poradca"],
    ["Compliance Officer", "Compliance špecialista"],
    ["Registered Nurse", "Registrovaná sestra"],
    ["Nurse Practitioner", "Praktická sestra"],
    ["Medical Assistant", "Zdravotnícky asistent"],
    ["Instructional Designer", "Dizajnér výučby"],
    ["Academic Advisor", "Akademický poradca"],
    ["Chief of Staff", "Vedúci štábu"],
  ],
  cs: [
    ["Software Engineer", "Softwarový inženýr"],
    ["Frontend Developer", "Frontend vývojář"],
    ["Backend Developer", "Backend vývojář"],
    ["Full Stack Developer", "Full stack vývojář"],
    ["DevOps Engineer", "DevOps inženýr"],
    ["Site Reliability Engineer", "Inženýr spolehlivosti systémů"],
    ["Machine Learning Engineer", "Inženýr strojového učení"],
    ["Cloud Engineer", "Cloudový inženýr"],
    ["Platform Engineer", "Platformní inženýr"],
    ["Security Engineer", "Bezpečnostní inženýr"],
    ["Data Scientist", "Datový vědec"],
    ["Data Engineer", "Datový inženýr"],
    ["Data Analyst", "Datový analytik"],
    ["Product Manager", "Produktový manažer"],
    ["Project Manager", "Projektový manažer"],
    ["Program Manager", "Programový manažer"],
    ["Product Designer", "Produktový designér"],
    ["UX Designer", "UX designér"],
    ["UI Designer", "UI designér"],
    ["UX Researcher", "UX výzkumník"],
    ["Marketing Manager", "Marketingový manažer"],
    ["Sales Manager", "Manažer prodeje"],
    ["Account Manager", "Account manažer"],
    ["Customer Success Manager", "Manažer zákaznického úspěchu"],
    ["Business Analyst", "Business analytik"],
    ["Financial Analyst", "Finanční analytik"],
    ["HR Manager", "HR manažer"],
    ["HR Generalist", "HR generalista"],
    ["Recruiter", "Recruiter"],
    ["Legal Counsel", "Právní poradce"],
    ["Compliance Officer", "Specialista na compliance"],
    ["Registered Nurse", "Registrovaná sestra"],
    ["Nurse Practitioner", "Praktická sestra"],
    ["Medical Assistant", "Zdravotnický asistent"],
    ["Instructional Designer", "Designér výuky"],
    ["Academic Advisor", "Akademický poradce"],
    ["Chief of Staff", "Vedoucí štábu"],
  ],
  es: [
    ["Software Engineer", "Ingeniero de software"],
    ["Frontend Developer", "Desarrollador frontend"],
    ["Backend Developer", "Desarrollador backend"],
    ["Full Stack Developer", "Desarrollador full stack"],
    ["DevOps Engineer", "Ingeniero DevOps"],
    ["Site Reliability Engineer", "Ingeniero de confiabilidad del sitio"],
    ["Machine Learning Engineer", "Ingeniero de aprendizaje automático"],
    ["Cloud Engineer", "Ingeniero de nube"],
    ["Platform Engineer", "Ingeniero de plataforma"],
    ["Security Engineer", "Ingeniero de seguridad"],
    ["Data Scientist", "Científico de datos"],
    ["Data Engineer", "Ingeniero de datos"],
    ["Data Analyst", "Analista de datos"],
    ["Product Manager", "Gerente de producto"],
    ["Project Manager", "Gerente de proyecto"],
    ["Program Manager", "Gerente de programa"],
    ["Product Designer", "Diseñador de producto"],
    ["UX Designer", "Diseñador UX"],
    ["UI Designer", "Diseñador UI"],
    ["UX Researcher", "Investigador UX"],
    ["Marketing Manager", "Gerente de marketing"],
    ["Sales Manager", "Gerente de ventas"],
    ["Account Manager", "Gerente de cuentas"],
    ["Customer Success Manager", "Gerente de éxito del cliente"],
    ["Business Analyst", "Analista de negocio"],
    ["Financial Analyst", "Analista financiero"],
    ["HR Manager", "Gerente de RR. HH."],
    ["HR Generalist", "Generalista de RR. HH."],
    ["Recruiter", "Reclutador"],
    ["Legal Counsel", "Asesor legal"],
    ["Compliance Officer", "Responsable de compliance"],
    ["Registered Nurse", "Enfermero titulado"],
    ["Nurse Practitioner", "Enfermero practicante"],
    ["Medical Assistant", "Asistente médico"],
    ["Instructional Designer", "Diseñador instruccional"],
    ["Academic Advisor", "Asesor académico"],
    ["Chief of Staff", "Jefe de gabinete"],
  ],
};

const ROLE_TOKEN_MAP: Record<Exclude<Language, "en">, Record<string, string>> = {
  uk: {
    Junior: "Junior",
    "Mid-Level": "Middle",
    Senior: "Senior",
    Lead: "Lead",
    Principal: "Principal",
    Staff: "Staff",
    Platform: "Платформний",
    Cloud: "Хмарний",
    Frontend: "Фронтенд",
    Backend: "Бекенд",
    Full: "Фул",
    Stack: "Стек",
    DevOps: "DevOps",
    Site: "Сайт",
    Reliability: "Надійність",
    Machine: "Машинне",
    Learning: "Навчання",
    API: "API",
    Performance: "Перформанс",
    Security: "Безпека",
    Analytics: "Аналітика",
    BI: "BI",
    Reporting: "Звітність",
    Forecasting: "Прогнозування",
    Experimentation: "Експерименти",
    Growth: "Growth",
    Mobile: "Мобільний",
    Design: "Дизайн",
    Systems: "Системи",
    Research: "Дослідження",
    Content: "Контент",
    Lifecycle: "Lifecycle",
    Brand: "Бренд",
    Enterprise: "Enterprise",
    Partnerships: "Партнерства",
    Process: "Процеси",
    Strategy: "Стратегія",
    Execution: "Виконання",
    Supply: "Supply",
    Chain: "Chain",
    Vendor: "Vendor",
    Revenue: "Revenue",
    Compliance: "Комплаєнс",
    Talent: "Таланти",
    People: "People",
    Onboarding: "Онбординг",
    Retention: "Утримання",
    Support: "Підтримка",
    Success: "Успіх",
    Contracts: "Контракти",
    Regulatory: "Regulatory",
    Corporate: "Корпоративний",
    Risk: "Ризик",
    Clinical: "Клінічний",
    Care: "Догляд",
    Delivery: "Доставка",
    Patient: "Пацієнт",
    Safety: "Безпека",
    Curriculum: "Навчальний план",
    Student: "Студент",
    Assessment: "Оцінювання",
    Program: "Програма",
    Instruction: "Навчання",
    SOC: "SOC",
    Threat: "Threat",
    Detection: "Detection",
    Quality: "Якість",
    Automation: "Автоматизація",
    Cybersecurity: "Кібербезпека",
    Network: "Мережа",
    iOS: "iOS",
    Android: "Android",
    Engineer: "Інженер",
    Developer: "Розробник",
    Manager: "Менеджер",
    Analyst: "Аналітик",
    Specialist: "Спеціаліст",
    Executive: "Executive",
    Consultant: "Консультант",
    Designer: "Дизайнер",
    Scientist: "Scientist",
    Coordinator: "Координатор",
    Administrator: "Адміністратор",
    Assistant: "Асистент",
    Advisor: "Радник",
    Teacher: "Вчитель",
    Nurse: "Медсестра",
    Practitioner: "Практик",
    Officer: "Офіцер",
    Lawyer: "Юрист",
    Counsel: "Юрисконсульт",
  },
  pl: {
    Junior: "Junior",
    "Mid-Level": "Mid-Level",
    Senior: "Senior",
    Lead: "Lead",
    Principal: "Principal",
    Staff: "Staff",
    Platform: "Platformowy",
    Cloud: "Chmurowy",
    Frontend: "Frontend",
    Backend: "Backend",
    Full: "Full",
    Stack: "Stack",
    DevOps: "DevOps",
    Site: "Site",
    Reliability: "Niezawodność",
    Machine: "Uczenie",
    Learning: "Maszynowe",
    Analytics: "Analityka",
    Reporting: "Raportowanie",
    Forecasting: "Prognozowanie",
    Growth: "Growth",
    Design: "Design",
    Systems: "Systems",
    Content: "Content",
    Brand: "Brand",
    Enterprise: "Enterprise",
    Strategy: "Strategia",
    Execution: "Wykonanie",
    Revenue: "Revenue",
    Compliance: "Compliance",
    Talent: "Talent",
    Retention: "Retention",
    Support: "Wsparcie",
    Risk: "Ryzyko",
    Clinical: "Kliniczny",
    Safety: "Bezpieczeństwo",
    Quality: "Jakość",
    Automation: "Automatyzacja",
    Cybersecurity: "Cyberbezpieczeństwo",
    Network: "Sieć",
    iOS: "iOS",
    Android: "Android",
    Mobile: "Mobilny",
    Curriculum: "Program nauczania",
    Assessment: "Ocena",
    Engineer: "Inżynier",
    Developer: "Developer",
    Manager: "Menedżer",
    Analyst: "Analityk",
    Specialist: "Specjalista",
    Designer: "Projektant",
    Coordinator: "Koordynator",
    Administrator: "Administrator",
    Assistant: "Asystent",
    Advisor: "Doradca",
    Teacher: "Nauczyciel",
    Nurse: "Pielęgniarz",
    Officer: "Specjalista",
    Lawyer: "Prawnik",
  },
  sk: {
    Junior: "Junior",
    "Mid-Level": "Mid-Level",
    Senior: "Senior",
    Lead: "Lead",
    Principal: "Principal",
    Staff: "Staff",
    Platform: "Platformový",
    Cloud: "Cloudový",
    Analytics: "Analytika",
    Frontend: "Frontend",
    Backend: "Backend",
    Full: "Full",
    Stack: "Stack",
    DevOps: "DevOps",
    Site: "Site",
    Reliability: "Spoľahlivosť",
    Machine: "Strojové",
    Learning: "Učenie",
    Reporting: "Reporting",
    Forecasting: "Forecasting",
    Strategy: "Stratégia",
    Execution: "Exekúcia",
    Compliance: "Compliance",
    Risk: "Riziko",
    Safety: "Bezpečnosť",
    Quality: "Kvalita",
    Automation: "Automatizácia",
    Cybersecurity: "Kyberbezpečnosť",
    Network: "Sieť",
    iOS: "iOS",
    Android: "Android",
    Mobile: "Mobilný",
    Engineer: "Inžinier",
    Developer: "Developer",
    Manager: "Manažér",
    Analyst: "Analytik",
    Specialist: "Špecialista",
    Designer: "Dizajnér",
    Coordinator: "Koordinátor",
    Administrator: "Administrátor",
    Assistant: "Asistent",
    Advisor: "Poradca",
    Teacher: "Učiteľ",
    Nurse: "Sestra",
    Officer: "Officer",
    Lawyer: "Právnik",
  },
  cs: {
    Junior: "Junior",
    "Mid-Level": "Mid-Level",
    Senior: "Senior",
    Lead: "Lead",
    Principal: "Principal",
    Staff: "Staff",
    Platform: "Platformní",
    Cloud: "Cloudový",
    Analytics: "Analytika",
    Frontend: "Frontend",
    Backend: "Backend",
    Full: "Full",
    Stack: "Stack",
    DevOps: "DevOps",
    Site: "Site",
    Reliability: "Spolehlivost",
    Machine: "Strojové",
    Learning: "Učení",
    Strategy: "Strategie",
    Execution: "Exekuce",
    Compliance: "Compliance",
    Risk: "Riziko",
    Safety: "Bezpečnost",
    Quality: "Kvalita",
    Automation: "Automatizace",
    Cybersecurity: "Kyberbezpečnost",
    Network: "Síť",
    iOS: "iOS",
    Android: "Android",
    Mobile: "Mobilní",
    Engineer: "Inženýr",
    Developer: "Developer",
    Manager: "Manažer",
    Analyst: "Analytik",
    Specialist: "Specialista",
    Designer: "Designér",
    Coordinator: "Koordinátor",
    Administrator: "Administrátor",
    Assistant: "Asistent",
    Advisor: "Poradce",
    Teacher: "Učitel",
    Nurse: "Sestra",
    Officer: "Officer",
    Lawyer: "Právník",
  },
  es: {
    Junior: "Junior",
    "Mid-Level": "Mid-Level",
    Senior: "Senior",
    Lead: "Lead",
    Principal: "Principal",
    Staff: "Staff",
    Platform: "Plataforma",
    Cloud: "Nube",
    Frontend: "Frontend",
    Backend: "Backend",
    Full: "Full",
    Stack: "Stack",
    DevOps: "DevOps",
    Site: "Sitio",
    Reliability: "Confiabilidad",
    Machine: "Aprendizaje",
    Learning: "Automático",
    Security: "Seguridad",
    Analytics: "Analítica",
    Reporting: "Reportes",
    Forecasting: "Pronóstico",
    Growth: "Growth",
    Design: "Diseño",
    Content: "Contenido",
    Brand: "Marca",
    Strategy: "Estrategia",
    Execution: "Ejecución",
    Compliance: "Compliance",
    Risk: "Riesgo",
    Clinical: "Clínico",
    Safety: "Seguridad",
    Quality: "Calidad",
    Automation: "Automatización",
    Cybersecurity: "Ciberseguridad",
    Network: "Red",
    iOS: "iOS",
    Android: "Android",
    Mobile: "Móvil",
    Curriculum: "Currículo",
    Assessment: "Evaluación",
    Engineer: "Ingeniero",
    Developer: "Desarrollador",
    Manager: "Gerente",
    Analyst: "Analista",
    Specialist: "Especialista",
    Designer: "Diseñador",
    Coordinator: "Coordinador",
    Administrator: "Administrador",
    Assistant: "Asistente",
    Advisor: "Asesor",
    Teacher: "Profesor",
    Nurse: "Enfermero",
    Officer: "Responsable",
    Lawyer: "Abogado",
  },
};

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TECH_ROLE_MARKERS = [
  "engineer",
  "engineering",
  "developer",
  "devops",
  "sre",
  "site reliability",
  "software",
  "frontend",
  "backend",
  "full stack",
  "fullstack",
  "mobile",
  "ios",
  "android",
  "platform",
  "cloud",
  "data",
  "analytics engineer",
  "machine learning",
  "ai ",
  "qa",
  "automation",
  "security",
  "cybersecurity",
  "soc",
  "network",
  "systems administrator",
  "it support",
  "ux",
  "ui",
  "product designer",
  "instructional designer",
] as const;

function isTechnicalRoleName(role: string): boolean {
  const normalized = role.toLowerCase();
  return TECH_ROLE_MARKERS.some((marker) => normalized.includes(marker));
}

export function localizeRoleName(role: string, language: Language): string {
  if (language === "en") {
    return role;
  }
  if (isTechnicalRoleName(role)) {
    return role;
  }

  let translated = role;

  for (const [from, to] of ROLE_PHRASE_MAP[language]) {
    const pattern = new RegExp(`\\b${escapeRegExp(from)}\\b`, "gi");
    translated = translated.replace(pattern, to);
  }

  const tokenMap = ROLE_TOKEN_MAP[language];
  const tokenPattern = /\b[A-Za-z][A-Za-z.&-]*\b/g;

  translated = translated.replace(tokenPattern, (token) => tokenMap[token] || token);

  return translated.replace(/\s+/g, " ").trim();
}

function getLocalizedRoleTerm(role: string, language: Language): string {
  if (language === "en") {
    return role;
  }
  return localizeRoleName(role, language).toLowerCase();
}

function localizeGeneratedKeyword(keyword: string, role: string, language: Language): string {
  if (language === "en") {
    return keyword;
  }

  const lowerRole = role.toLowerCase();
  for (const suffix of Object.keys(KEYWORD_SUFFIX_BY_LANG.en)) {
    const source = `${lowerRole} ${suffix}`;
    if (keyword === source) {
      return `${getLocalizedRoleTerm(role, language)} ${KEYWORD_SUFFIX_BY_LANG[language][suffix]}`;
    }
  }

  return keyword;
}

function localizeMistakes(role: string, language: Language): string[] {
  const roleTerm = getLocalizedRoleTerm(role, language);

  if (language === "uk") {
    return [
      `Занадто загальне summary без фокуса на пріоритетах ролі ${roleTerm}.`,
      "Перелік інструментів без метрик впливу та масштабу.",
      "Відсутні точні терміни, які повторюються в описі вакансії.",
      "Багато buzzwords і мало вимірюваних результатів.",
    ];
  }
  if (language === "pl") {
    return [
      `Zbyt ogólne podsumowanie bez nacisku na priorytety roli ${roleTerm}.`,
      "Lista narzędzi bez metryk wpływu i skali.",
      "Brak dokładnych terminów powtarzających się w opisie oferty.",
      "Za dużo buzzwordów, za mało mierzalnych rezultatów.",
    ];
  }
  if (language === "sk") {
    return [
      `Príliš všeobecné summary bez zamerania na priority role ${roleTerm}.`,
      "Zoznam nástrojov bez metrík dopadu a rozsahu.",
      "Chýbajú presné termíny, ktoré sa opakujú v popise pozície.",
      "Príliš veľa buzzwordov a málo merateľných výsledkov.",
    ];
  }
  if (language === "cs") {
    return [
      `Příliš obecné summary bez zaměření na priority role ${roleTerm}.`,
      "Výčet nástrojů bez metrik dopadu a rozsahu.",
      "Chybí přesné termíny, které se opakují v popisu pozice.",
      "Příliš mnoho buzzwordů a málo měřitelných výsledků.",
    ];
  }
  if (language === "es") {
    return [
      `Resumen demasiado genérico sin foco en las prioridades del rol ${roleTerm}.`,
      "Lista de herramientas sin métricas de impacto ni alcance.",
      "Faltan términos exactos repetidos en la descripción de la vacante.",
      "Demasiados buzzwords y pocos resultados medibles.",
    ];
  }

  return [
    `Using a generic summary that never mentions ${role} priorities.`,
    "Listing tools without impact metrics or scope.",
    "Missing the exact terms repeated in the target job description.",
    "Overusing buzzwords and underusing measurable outcomes.",
  ];
}

function localizeExamples(role: string, language: Language): ResumeKeywordCluster["examples"] {
  const roleTerm = getLocalizedRoleTerm(role, language);

  if (language === "uk") {
    return [
      {
        before: "Відповідав(ла) за кілька кросфункціональних ініціатив.",
        after: `Очолив(ла) 4 кросфункціональні ініціативи в напрямку ${roleTerm}, скоротивши час delivery на 23% за два квартали.`,
      },
      {
        before: "Працював(ла) над покращенням процесів.",
        after: `Перебудував(ла) ключовий workflow у напрямку ${roleTerm} та підвищив(ла) KPI якості з 81% до 93% за 6 місяців.`,
      },
      {
        before: "Допомагав(ла) з reporting і комунікацією.",
        after: `Запустив(ла) щотижневий цикл звітності ${roleTerm} для керівництва, скоротивши затримку прийняття рішень на 30%.`,
      },
    ];
  }
  if (language === "pl") {
    return [
      {
        before: "Odpowiadałem(-am) za kilka inicjatyw cross-team.",
        after: `Poprowadziłem(-am) 4 inicjatywy cross-funkcyjne w obszarze ${roleTerm}, skracając czas delivery o 23% w dwa kwartały.`,
      },
      {
        before: "Pracowałem(-am) nad usprawnieniami procesów.",
        after: `Przeprojektowałem(-am) kluczowy workflow ${roleTerm} i poprawiłem(-am) KPI jakości z 81% do 93% w 6 miesięcy.`,
      },
      {
        before: "Pomagałem(-am) w raportowaniu i komunikacji.",
        after: `Zbudowałem(-am) tygodniowy rytm raportowania ${roleTerm} dla leadershipu, skracając opóźnienie decyzji o 30%.`,
      },
    ];
  }
  if (language === "sk") {
    return [
      {
        before: "Zodpovedal(a) som za viacero cross-team iniciatív.",
        after: `Viedol(a) som 4 cross-funkčné iniciatívy v oblasti ${roleTerm}, čím som skrátil(a) delivery čas o 23% za dva kvartály.`,
      },
      {
        before: "Pracoval(a) som na zlepšení procesov.",
        after: `Prepracoval(a) som kľúčový ${roleTerm} workflow a zlepšil(a) KPI kvality z 81% na 93% za 6 mesiacov.`,
      },
      {
        before: "Pomáhal(a) som s reportingom a komunikáciou.",
        after: `Nastavil(a) som týždenný ${roleTerm} reporting pre leadership a znížil(a) oneskorenie rozhodnutí o 30%.`,
      },
    ];
  }
  if (language === "cs") {
    return [
      {
        before: "Byl(a) jsem zodpovědný(á) za několik cross-team iniciativ.",
        after: `Vedl(a) jsem 4 cross-funkční iniciativy v oblasti ${roleTerm} a zkrátil(a) delivery čas o 23% během dvou kvartálů.`,
      },
      {
        before: "Pracoval(a) jsem na zlepšení procesů.",
        after: `Přepracoval(a) jsem klíčový ${roleTerm} workflow a zvýšil(a) KPI kvality z 81% na 93% během 6 měsíců.`,
      },
      {
        before: "Pomáhal(a) jsem s reportingem a komunikací.",
        after: `Zavedl(a) jsem týdenní ${roleTerm} reporting pro vedení a snížil(a) zpoždění rozhodování o 30%.`,
      },
    ];
  }
  if (language === "es") {
    return [
      {
        before: "Responsable de múltiples iniciativas entre equipos.",
        after: `Lideré 4 iniciativas cross-funcionales de ${roleTerm}, reduciendo el tiempo de delivery en un 23% en dos trimestres.`,
      },
      {
        before: "Trabajé en mejoras de procesos.",
        after: `Rediseñé el workflow principal de ${roleTerm} y mejoré el KPI de calidad del 81% al 93% en 6 meses.`,
      },
      {
        before: "Apoyé reporting y comunicación.",
        after: `Implementé una cadencia semanal de reporting de ${roleTerm} para liderazgo, reduciendo el retraso de decisión en un 30%.`,
      },
    ];
  }

  return [
    {
      before: "Responsible for multiple cross-team initiatives.",
      after: `Led 4 cross-functional ${role.toLowerCase()} initiatives, reducing delivery time by 23% in two quarters.`,
    },
    {
      before: "Worked on process improvements.",
      after: `Redesigned core ${role.toLowerCase()} workflow and improved quality KPI from 81% to 93% within 6 months.`,
    },
    {
      before: "Helped with reporting and communication.",
      after: `Built weekly ${role.toLowerCase()} reporting cadence for leadership, cutting decision lag by 30%.`,
    },
  ];
}

function localizeFaq(role: string, language: Language): ResumeKeywordCluster["faq"] {
  const roleTerm = getLocalizedRoleTerm(role, language);

  if (language === "uk") {
    return [
      {
        question: `Скільки ключових слів має бути в резюме для ${roleTerm}?`,
        answer:
          "Орієнтуйтесь на релевантність: зазвичай 20-35 рольових термінів, природно розподілених між summary, skills і останнім досвідом. Пріоритет мають слова, що повторюються у вакансії.",
      },
      {
        question: `Де краще розміщувати ключові слова ${roleTerm} у резюме?`,
        answer:
          "Почніть із headline/summary, далі skills, а потім 2 останні місця роботи. Це дає ATS і рекрутеру швидке підтвердження відповідності ролі.",
      },
      {
        question: `Чи можна брати формулювання з опису вакансії для ${roleTerm}?`,
        answer:
          "Так, якщо це правдиво. Використовуйте ту саму термінологію лише там, де вона реально відповідає вашому досвіду. Не копіюйте цілі фрази без доказу в bullet-пунктах.",
      },
      {
        question: `Який найшвидший спосіб адаптувати резюме ${roleTerm} під вакансію?`,
        answer:
          "Виділіть ключові вимоги, зіставте кожну з реальним прикладом, перепишіть головні bullet-пункти і зробіть фінальну ATS-перевірку перед відправкою.",
      },
      {
        question: `Чи потрібно мати одне універсальне резюме для всіх вакансій ${roleTerm}?`,
        answer:
          "Краще мати одну сильну базову версію і під кожну вакансію адаптувати summary, порядок skills та перші bullet-пункти. Так ви збережете і швидкість, і релевантність.",
      },
    ];
  }

  if (language === "pl") {
    return [
      {
        question: `Ile słów kluczowych powinno zawierać CV dla ${roleTerm}?`,
        answer:
          "Stawiaj przede wszystkim na trafność: zwykle 20-35 terminów specyficznych dla roli, naturalnie rozłożonych między podsumowanie, umiejętności i ostatnie doświadczenie. Priorytet mają frazy powtarzające się w ofercie.",
      },
      {
        question: `Gdzie umieszczać słowa kluczowe ${roleTerm} w CV?`,
        answer:
          "Zacznij od nagłówka/podsumowania, potem sekcja umiejętności, a następnie 2 najnowsze role. Dzięki temu ATS i rekruter szybciej potwierdzą dopasowanie.",
      },
      {
        question: `Czy mogę używać dokładnych sformułowań z ogłoszenia dla ${roleTerm}?`,
        answer:
          "Tak, jeśli są zgodne z prawdą. Kopiuj terminologię tylko wtedy, gdy odzwierciedla Twoje realne doświadczenie. Nie wklejaj pełnych zdań bez dowodu w bulletach.",
      },
      {
        question: `Jaki jest najszybszy sposób dopasowania CV ${roleTerm} do oferty?`,
        answer:
          "Wypisz kluczowe wymagania, przypisz do nich konkretne przykłady z doświadczenia, przeredaguj główne bullety i wykonaj finalny check ATS przed wysyłką.",
      },
      {
        question: `Czy warto mieć jedno uniwersalne CV do każdej aplikacji ${roleTerm}?`,
        answer:
          "Najlepiej trzymaj mocną wersję bazową, a pod każdą ofertę dopasowuj podsumowanie, kolejność umiejętności i pierwsze bullet pointy. To daje balans między szybkością i trafnością.",
      },
    ];
  }

  if (language === "sk") {
    return [
      {
        question: `Koľko kľúčových slov má obsahovať životopis pre ${roleTerm}?`,
        answer:
          "Zamerajte sa najmä na relevantnosť: zvyčajne 20-35 termínov pre danú rolu, prirodzene rozdelených medzi summary, skills a poslednú skúsenosť. Prioritu majú opakované termíny z vacancy.",
      },
      {
        question: `Kam umiestniť kľúčové slová ${roleTerm} v životopise?`,
        answer:
          "Začnite headline/summary, potom skills a následne 2 najnovšie pozície. ATS aj recruiter tak rýchlo potvrdia zhodu role.",
      },
      {
        question: `Môžem pri ${roleTerm} použiť presné frázy z popisu pozície?`,
        answer:
          "Áno, ak sú pravdivé. Terminológiu kopírujte iba tam, kde odráža vašu reálnu skúsenosť. Nevkladajte celé vety bez dôkazu v bullet bodoch.",
      },
      {
        question: `Aký je najrýchlejší spôsob úpravy životopisu ${roleTerm} pre konkrétnu vacancy?`,
        answer:
          "Vyberte top požiadavky, priraďte ku každej dôkaz z praxe, prepíšte hlavné bullet body a pred odoslaním spravte finálny ATS check.",
      },
      {
        question: `Mám mať jeden univerzálny životopis pre každú ${roleTerm} prihlášku?`,
        answer:
          "Udržujte jednu silnú základnú verziu a pre každú pozíciu dolaďte summary, poradie skills a prvé bullet body. Získate rýchlosť aj relevantnosť.",
      },
    ];
  }

  if (language === "cs") {
    return [
      {
        question: `Kolik klíčových slov má obsahovat životopis pro ${roleTerm}?`,
        answer:
          "Zaměřte se hlavně na relevanci: obvykle 20-35 termínů specifických pro roli, přirozeně rozložených mezi summary, skills a poslední zkušenost. Prioritu mají výrazy opakované ve vacancy.",
      },
      {
        question: `Kam umístit klíčová slova ${roleTerm} v životopise?`,
        answer:
          "Začněte headline/summary, pak skills a následně 2 nejnovější role. ATS i recruiter tak rychle potvrdí shodu s rolí.",
      },
      {
        question: `Mohu pro ${roleTerm} použít přesné formulace z popisu pozice?`,
        answer:
          "Ano, pokud jsou pravdivé. Terminologii přebírejte jen tam, kde odpovídá vaší reálné zkušenosti. Nevkládejte celé věty bez důkazu v bullet bodech.",
      },
      {
        question: `Jak nejrychleji upravit životopis ${roleTerm} pro konkrétní vacancy?`,
        answer:
          "Vypište hlavní požadavky, ke každému přiřaďte důkaz z praxe, přepište klíčové bullet body a před odesláním proveďte finální ATS check.",
      },
      {
        question: `Mám mít jeden univerzální životopis pro každou ${roleTerm} přihlášku?`,
        answer:
          "Nejlepší je mít jednu silnou základní verzi a pro každou pozici upravit summary, pořadí skills a první bullet body. Získáte rychlost i relevanci.",
      },
    ];
  }

  if (language === "es") {
    return [
      {
        question: `¿Cuántas palabras clave debe incluir un CV de ${roleTerm}?`,
        answer:
          "Prioriza la relevancia: normalmente 20-35 términos específicos del rol, distribuidos de forma natural entre resumen, habilidades y experiencia reciente. Da prioridad a los términos repetidos en la vacante.",
      },
      {
        question: `¿Dónde colocar palabras clave de ${roleTerm} en el CV?`,
        answer:
          "Empieza por titular/resumen, luego habilidades y después las 2 experiencias más recientes. Así ATS y reclutadores validan rápido el encaje del rol.",
      },
      {
        question: `¿Puedo usar la redacción exacta de la oferta para ${roleTerm}?`,
        answer:
          "Sí, si es verídica. Refleja la terminología solo cuando represente tu experiencia real. No copies frases completas sin evidencia en los bullets.",
      },
      {
        question: `¿Cuál es la forma más rápida de adaptar un CV de ${roleTerm} por vacante?`,
        answer:
          "Extrae los requisitos clave, vincula cada uno con evidencia real, reescribe los bullets principales y haz una revisión ATS final antes de enviar.",
      },
      {
        question: `¿Debo mantener un CV maestro para cada postulación de ${roleTerm}?`,
        answer:
          "Mantén una versión base sólida y adapta resumen, orden de habilidades y primeros bullets para cada vacante. Así equilibras velocidad y relevancia.",
      },
    ];
  }

  return [
    {
      question: `How many keywords should a ${role} resume include?`,
      answer:
        "Aim for relevance first: usually 20-35 role-specific terms naturally distributed across summary, skills, and recent experience. Prioritize repeated terms from the vacancy.",
    },
    {
      question: `Where should I place ${role} keywords in my resume?`,
      answer:
        "Start with headline/summary, then skills, then top 2 most recent roles. This gives ATS and recruiters fast confirmation of role fit in the first scan.",
    },
    {
      question: `Can I use exact wording from the job description for ${role} applications?`,
      answer:
        "Yes, if truthful. Mirror terminology only when it reflects your real experience. Do not paste full lines without evidence in bullet points.",
    },
    {
      question: `What is the fastest way to tailor a ${role} resume per vacancy?`,
      answer:
        "Extract top requirements, map each one to evidence from your experience, rewrite top bullets, then run one final ATS check before submit.",
    },
    {
      question: `Should I keep one master resume for every ${role} application?`,
      answer:
        "Keep one strong base version, then tailor summary, skills ordering, and first bullet points for each target role. This balances speed with relevance.",
    },
  ];
}

export function getResumeKeywordsUi(language: Language): UiTexts {
  return UI[language] || UI.en;
}

export function getSectorLabel(language: Language, category: RoleCategory): string {
  return SECTOR_LABELS[language]?.[category] || SECTOR_LABELS.en[category];
}

export function localizeResumeKeywordCluster(
  cluster: ResumeKeywordCluster,
  language: Language,
): ResumeKeywordCluster {
  if (language === "en") {
    return cluster;
  }

  return {
    ...cluster,
    role: localizeRoleName(cluster.role, language),
    keywords: cluster.keywords.map((k) => localizeGeneratedKeyword(k, cluster.role, language)),
    mistakes: localizeMistakes(cluster.role, language),
    examples: localizeExamples(cluster.role, language),
    faq: localizeFaq(cluster.role, language),
  };
}
