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
  examplesTitle: (role: string) => string;
  examplesText: string;
  fifteenMinTitle: (role: string) => string;
  fifteenMinText: string;
  longTailText: string;
  faqTitle: string;
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
    data: "Дані",
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
    design: "Design",
    marketing: "Marketing",
    sales: "Sprzedaż",
    operations: "Operacje",
    finance: "Finanse",
    hr: "HR",
    customer: "Obsługa klienta",
    legal: "Prawo",
    healthcare: "Opieka zdrowotna",
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
    operations: "Operace",
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
    hr: "RRHH",
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
    examplesTitle: (role) => `Example Bullet Rewrites for ${role}`,
    examplesText:
      "Use action + context + measurable result. Replace vague bullets with concrete outcomes.",
    fifteenMinTitle: (role) => `How to Tailor a ${role} Resume in 15 Minutes`,
    fifteenMinText:
      "Step 1: identify repeated requirements in the vacancy. Step 2: update summary with role fit. Step 3: reorder skills. Step 4: rewrite top bullets with outcomes. Step 5: run final ATS check.",
    longTailText: "Long-tail phrases this page targets",
    faqTitle: "FAQ",
    nextStepTitle: "Next Step",
    nextStepText:
      "Apply this guide on your resume with live ATS feedback and missing keyword detection.",
    freeChecker: "Free ATS Resume Checker",
    optimizeCv: "Optimize CV",
    before: "Before",
    after: "After",
  },
  uk: {
    hubKicker: "SEO Кластер",
    hubTitle: "Ключові слова резюме за ролями",
    hubSubtitle:
      "Рольові гіди по ATS-ключам з помилками, прикладами переписування та FAQ.",
    rolesLabel: "Ролі",
    openGuide: "Відкрити гайд",
    filterLabel: "Сфера",
    allSectors: "Усі сфери",
    searchPlaceholder: "Пошук ролі (наприклад, Product Manager)",
    noResults: "Ролі не знайдено",
    checkSpelling: "Спробуйте іншу назву ролі або скиньте фільтри.",
    roleGuideKicker: "Кластер ролі",
    pageTitle: (role) => `Ключові слова резюме для ${role}`,
    pageDescription: (role) =>
      `Цей гайд показує, як зробити сильніше резюме для ролі ${role} через ATS-відповідність, вимірювані bullet-пункти та перевірки якості.`,
    topKeywordsTitle: (role) => `Топ ATS-ключові слова для ${role}`,
    topKeywordsText: () =>
      "Для цієї ролі важлива релевантність, а не набивання ключовими словами. Розміщуйте пріоритетні терміни у summary, skills і останньому досвіді.",
    mistakesTitle: (role) => `Типові помилки резюме для ${role}`,
    mistakesText: (role) =>
      `Більшість слабких резюме для ${role} мають загальні формулювання, слабкі докази та низьку відповідність ключовим словам.`,
    examplesTitle: (role) => `Приклади переписування bullet-пунктів для ${role}`,
    examplesText:
      "Використовуйте формулу дія + контекст + вимірюваний результат. Замінюйте розмиті фрази на конкретний вплив.",
    fifteenMinTitle: (role) => `Як адаптувати резюме для ${role} за 15 хвилин`,
    fifteenMinText:
      "Крок 1: знайдіть повторювані вимоги у вакансії. Крок 2: оновіть summary. Крок 3: переставте навички. Крок 4: перепишіть топ-буліти з результатами. Крок 5: зробіть фінальну ATS-перевірку.",
    longTailText: "Long-tail фрази цієї сторінки",
    faqTitle: "FAQ",
    nextStepTitle: "Наступний крок",
    nextStepText:
      "Застосуйте цей гайд до свого резюме з live ATS-фідбеком та пошуком відсутніх ключових слів.",
    freeChecker: "Безкоштовний ATS Checker",
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
      `Ten poradnik pokazuje, jak zbudować lepsze CV dla ${role} dzięki dopasowaniu ATS, mierzalnym bulletom i kontroli jakości.`,
    topKeywordsTitle: (role) => `Najważniejsze słowa ATS dla ${role}`,
    topKeywordsText: () =>
      "Dla tej roli liczy się trafność, a nie upychanie słów kluczowych. Umieść priorytetowe terminy w podsumowaniu, sekcji umiejętności i ostatnim doświadczeniu.",
    mistakesTitle: (role) => `Najczęstsze błędy CV dla ${role}`,
    mistakesText: (role) =>
      `Słabsze CV dla ${role} zwykle mają zbyt ogólny język, mało dowodów i niskie dopasowanie do słów kluczowych.`,
    examplesTitle: (role) => `Przykłady przeredagowania bulletów dla ${role}`,
    examplesText:
      "Używaj schematu działanie + kontekst + mierzalny wynik. Zamieniaj ogólne sformułowania na konkretne efekty.",
    fifteenMinTitle: (role) => `Jak dopasować CV do ${role} w 15 minut`,
    fifteenMinText:
      "Krok 1: znajdź powtarzające się wymagania w ofercie. Krok 2: popraw podsumowanie. Krok 3: uporządkuj umiejętności. Krok 4: przepisz top bullet points. Krok 5: wykonaj końcowy check ATS.",
    longTailText: "Frazy long-tail dla tej strony",
    faqTitle: "FAQ",
    nextStepTitle: "Następny krok",
    nextStepText:
      "Zastosuj ten poradnik w swoim CV, korzystając z live ATS feedback i wykrywania brakujących słów kluczowych.",
    freeChecker: "Darmowy ATS Resume Checker",
    optimizeCv: "Optymalizuj CV",
    before: "Przed",
    after: "Po",
  },
  sk: {
    hubKicker: "SEO Klaster",
    hubTitle: "Kľúčové slová životopisu podľa role",
    hubSubtitle:
      "Role-based ATS návody s chybami, príkladmi prepísania a FAQ.",
    rolesLabel: "Role",
    openGuide: "Otvoriť návod",
    filterLabel: "Oblasť",
    allSectors: "Všetky oblasti",
    searchPlaceholder: "Hľadať rolu (napr. Product Manager)",
    noResults: "Roly sa nenašli",
    checkSpelling: "Skúste iný názov role alebo vymažte filtre.",
    roleGuideKicker: "Klaster role",
    pageTitle: (role) => `Kľúčové slová životopisu pre ${role}`,
    pageDescription: (role) =>
      `Tento návod ukazuje, ako vytvoriť silnejší životopis pre ${role} cez ATS súlad, merateľné bullet body a kontrolu kvality.`,
    topKeywordsTitle: (role) => `Top ATS kľúčové slová pre ${role}`,
    topKeywordsText: () =>
      "Pre túto rolu je dôležitá relevantnosť, nie keyword stuffing. Umiestnite prioritné termíny do summary, skills a recent experience.",
    mistakesTitle: (role) => `Najčastejšie chyby životopisu pre ${role}`,
    mistakesText: (role) =>
      `Slabšie životopisy pre ${role} majú často všeobecný jazyk, slabé dôkazy a nízky keyword match.`,
    examplesTitle: (role) => `Príklady prepísania bullet bodov pre ${role}`,
    examplesText:
      "Používajte vzorec akcia + kontext + merateľný výsledok. Nahraďte nejasné vety konkrétnym dopadom.",
    fifteenMinTitle: (role) => `Ako prispôsobiť životopis pre ${role} za 15 minút`,
    fifteenMinText:
      "Krok 1: nájdite opakované požiadavky vo vacancy. Krok 2: upravte summary. Krok 3: zoradte skills. Krok 4: prepíšte top bullet body. Krok 5: spravte finálny ATS check.",
    longTailText: "Long-tail frázy tejto stránky",
    faqTitle: "FAQ",
    nextStepTitle: "Ďalší krok",
    nextStepText:
      "Použite tento návod na svoj životopis s live ATS spätnou väzbou a detekciou chýbajúcich kľúčových slov.",
    freeChecker: "Bezplatný ATS Checker",
    optimizeCv: "Optimalizovať CV",
    before: "Pred",
    after: "Po",
  },
  cs: {
    hubKicker: "SEO Klaster",
    hubTitle: "Klíčová slova životopisu podle role",
    hubSubtitle:
      "Role-based ATS průvodce s chybami, příklady přepisu a FAQ.",
    rolesLabel: "Role",
    openGuide: "Otevřít průvodce",
    filterLabel: "Obor",
    allSectors: "Všechny obory",
    searchPlaceholder: "Hledat roli (např. Product Manager)",
    noResults: "Role nenalezeny",
    checkSpelling: "Zkuste jiný název role nebo vyčistěte filtry.",
    roleGuideKicker: "Role klastr",
    pageTitle: (role) => `Klíčová slova životopisu pro ${role}`,
    pageDescription: (role) =>
      `Tento průvodce ukazuje, jak vytvořit silnější životopis pro ${role} díky ATS souladu, měřitelným bullet bodům a kontrole kvality.`,
    topKeywordsTitle: (role) => `Top ATS klíčová slova pro ${role}`,
    topKeywordsText: () =>
      "Pro tuto roli je klíčová relevance, ne keyword stuffing. Použijte prioritní termíny v summary, skills a recent experience.",
    mistakesTitle: (role) => `Nejčastější chyby životopisu pro ${role}`,
    mistakesText: (role) =>
      `Slabší životopisy pro ${role} často trpí obecným jazykem, slabými důkazy a nízkým keyword matchem.`,
    examplesTitle: (role) => `Příklady přepisu bullet bodů pro ${role}`,
    examplesText:
      "Používejte vzorec akce + kontext + měřitelný výsledek. Nahraďte vágní formulace konkrétním dopadem.",
    fifteenMinTitle: (role) => `Jak upravit životopis pro ${role} za 15 minut`,
    fifteenMinText:
      "Krok 1: najděte opakující se požadavky ve vacancy. Krok 2: upravte summary. Krok 3: seřaďte skills. Krok 4: přepište top bullet body. Krok 5: proveďte finální ATS check.",
    longTailText: "Long-tail fráze této stránky",
    faqTitle: "FAQ",
    nextStepTitle: "Další krok",
    nextStepText:
      "Použijte tento průvodce na svůj životopis s live ATS zpětnou vazbou a detekcí chybějících klíčových slov.",
    freeChecker: "Bezplatný ATS Checker",
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
    topKeywordsTitle: (role) => `Top palabras clave ATS para ${role}`,
    topKeywordsText: () =>
      "Para este rol, la clave es la relevancia, no el relleno de keywords. Coloca términos prioritarios en summary, skills y experiencia reciente.",
    mistakesTitle: (role) => `Errores comunes de CV para ${role}`,
    mistakesText: (role) =>
      `Los CV débiles para ${role} suelen fallar por lenguaje genérico, poca evidencia e insuficiente keyword match.`,
    examplesTitle: (role) => `Ejemplos de reescritura de bullets para ${role}`,
    examplesText:
      "Usa la fórmula acción + contexto + resultado medible. Sustituye frases vagas por impacto concreto.",
    fifteenMinTitle: (role) => `Cómo adaptar tu CV para ${role} en 15 minutos`,
    fifteenMinText:
      "Paso 1: detecta requisitos repetidos en la vacancy. Paso 2: mejora el summary. Paso 3: reordena skills. Paso 4: reescribe los top bullets con resultados. Paso 5: haz un ATS check final.",
    longTailText: "Frases long-tail de esta página",
    faqTitle: "FAQ",
    nextStepTitle: "Siguiente paso",
    nextStepText:
      "Aplica esta guía a tu CV con feedback ATS en vivo y detección de palabras clave faltantes.",
    freeChecker: "Free ATS Resume Checker",
    optimizeCv: "Optimizar CV",
    before: "Antes",
    after: "Después",
  },
};

type Dict = Array<[string, string]>;

const CONTENT_DICT: Record<Exclude<Language, "en">, Dict> = {
  uk: [
    ["resume", "резюме"],
    ["Resume", "Резюме"],
    ["keywords", "ключові слова"],
    ["Keywords", "Ключові слова"],
    ["ATS", "ATS"],
    ["role", "роль"],
    ["Role", "Роль"],
    ["summary", "summary"],
    ["skills", "skills"],
    ["experience", "досвід"],
    ["result", "результат"],
    ["results", "результати"],
    ["vacancy", "вакансія"],
  ],
  pl: [
    ["resume", "cv"],
    ["Resume", "CV"],
    ["keywords", "słowa kluczowe"],
    ["Keywords", "Słowa kluczowe"],
    ["role", "rola"],
    ["Role", "Rola"],
    ["experience", "doświadczenie"],
    ["result", "wynik"],
    ["results", "wyniki"],
    ["vacancy", "oferta"],
  ],
  sk: [
    ["resume", "životopis"],
    ["Resume", "Životopis"],
    ["keywords", "kľúčové slová"],
    ["Keywords", "Kľúčové slová"],
    ["role", "rola"],
    ["Role", "Rola"],
    ["experience", "skúsenosť"],
    ["result", "výsledok"],
    ["results", "výsledky"],
    ["vacancy", "ponuka"],
  ],
  cs: [
    ["resume", "životopis"],
    ["Resume", "Životopis"],
    ["keywords", "klíčová slova"],
    ["Keywords", "Klíčová slova"],
    ["role", "role"],
    ["Role", "Role"],
    ["experience", "zkušenost"],
    ["result", "výsledek"],
    ["results", "výsledky"],
    ["vacancy", "nabídka"],
  ],
  es: [
    ["resume", "CV"],
    ["Resume", "CV"],
    ["keywords", "palabras clave"],
    ["Keywords", "Palabras clave"],
    ["role", "rol"],
    ["Role", "Rol"],
    ["experience", "experiencia"],
    ["result", "resultado"],
    ["results", "resultados"],
    ["vacancy", "vacante"],
  ],
};

function localizeText(text: string, language: Language): string {
  if (language === "en") {
    return text;
  }
  let next = text;
  for (const [from, to] of CONTENT_DICT[language]) {
    next = next.split(from).join(to);
  }
  return next;
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
    keywords: cluster.keywords.map((k) => localizeText(k, language)),
    mistakes: cluster.mistakes.map((m) => localizeText(m, language)),
    examples: cluster.examples.map((e) => ({
      before: localizeText(e.before, language),
      after: localizeText(e.after, language),
    })),
    faq: cluster.faq.map((f) => ({
      question: localizeText(f.question, language),
      answer: localizeText(f.answer, language),
    })),
  };
}
