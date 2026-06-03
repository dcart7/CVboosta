import type { Language } from "./translations";

type UiTexts = {
  hubKicker: string;
  hubTitle: string;
  hubSubtitle: string;
  rolesLabel: string;
  openExample: string;
  filterLabel: string;
  allSectors: string;
  searchPlaceholder: string;
  noResults: string;
  checkSpelling: string;
  roleCardKicker: string;
  roleCardCopy: string;
  freeChecker: string;
  optimizeCv: string;
  register: string;
  loadMoreLabel: string;
  backToHub: string;
  updatedLabel: string;
  wordsLabel: string;
  resumeKeywordsForRole: (role: string) => string;
  relatedExamplesTitle: string;
  relatedExamplesLead: string;
  onThisPageTitle: string;
  similarKeywordGuidesTitle: string;
  similarKeywordGuidesLead: string;
};

const UI: Record<Language, UiTexts> = {
  en: {
    hubKicker: "SEO Cluster Hub",
    hubTitle: "Resume Examples by Role",
    hubSubtitle: "ATS-safe resume examples with summaries, skills, bullets, and FAQs.",
    rolesLabel: "Roles",
    openExample: "Open example",
    filterLabel: "Sector",
    allSectors: "All sectors",
    searchPlaceholder: "Search role (e.g. Product Manager)",
    noResults: "No roles found",
    checkSpelling: "Try another role name or clear filters.",
    roleCardKicker: "Resume Example",
    roleCardCopy: "ATS-friendly structure with realistic bullet rewrites and a tailoring checklist.",
    freeChecker: "Free ATS resume checker",
    optimizeCv: "Optimize my resume",
    register: "Create free account",
    loadMoreLabel: "Load more roles",
    backToHub: "Back to resume examples",
    updatedLabel: "Updated",
    wordsLabel: "words",
    resumeKeywordsForRole: (role) => `Resume keywords for ${role}`,
    relatedExamplesTitle: "Related examples",
    relatedExamplesLead: "Explore adjacent role examples to compare keyword patterns and bullet styles.",
    onThisPageTitle: "On this page",
    similarKeywordGuidesTitle: "Keyword guides for similar roles",
    similarKeywordGuidesLead: "Open role-specific keyword pages to see what ATS systems and recruiters scan for first.",
  },
  uk: {
    hubKicker: "SEO кластер",
    hubTitle: "Приклади резюме за ролями",
    hubSubtitle: "ATS-безпечні приклади резюме: summary, skills, bullets і FAQ.",
    rolesLabel: "Ролі",
    openExample: "Відкрити приклад",
    filterLabel: "Сфера",
    allSectors: "Усі сфери",
    searchPlaceholder: "Пошук ролі (наприклад, Product Manager)",
    noResults: "Ролі не знайдено",
    checkSpelling: "Спробуйте іншу назву ролі або очистіть фільтри.",
    roleCardKicker: "Приклад резюме",
    roleCardCopy: "ATS-friendly структура з реалістичними прикладами bullet-пунктів і чеклістом адаптації.",
    freeChecker: "Безкоштовний ATS Resume Checker",
    optimizeCv: "Оптимізувати резюме",
    register: "Створити акаунт безкоштовно",
    loadMoreLabel: "Показати більше ролей",
    backToHub: "Назад до прикладів резюме",
    updatedLabel: "Оновлено",
    wordsLabel: "слів",
    resumeKeywordsForRole: (role) => `Ключові слова резюме для ${role}`,
    relatedExamplesTitle: "Схожі приклади",
    relatedExamplesLead: "Перегляньте суміжні приклади, щоб порівняти ключові слова та стиль bullet-пунктів.",
    onThisPageTitle: "На цій сторінці",
    similarKeywordGuidesTitle: "Гайди по ключових словах для схожих ролей",
    similarKeywordGuidesLead: "Відкрийте рольові сторінки з ключовими словами, щоб побачити, що найчастіше сканують ATS і рекрутери.",
  },
  pl: {
    hubKicker: "Klaster SEO",
    hubTitle: "Przykłady CV według roli",
    hubSubtitle: "Przykłady CV przyjazne ATS: podsumowanie, umiejętności, bullet pointy i FAQ.",
    rolesLabel: "Role",
    openExample: "Otwórz przykład",
    filterLabel: "Sektor",
    allSectors: "Wszystkie sektory",
    searchPlaceholder: "Szukaj roli (np. Product Manager)",
    noResults: "Nie znaleziono ról",
    checkSpelling: "Spróbuj innej nazwy roli lub wyczyść filtry.",
    roleCardKicker: "Przykład CV",
    roleCardCopy: "Struktura przyjazna ATS z realistycznymi przeróbkami bulletów i checklistą dopasowania.",
    freeChecker: "Darmowy ATS Resume Checker",
    optimizeCv: "Zoptymalizuj CV",
    register: "Załóż darmowe konto",
    loadMoreLabel: "Pokaż więcej ról",
    backToHub: "Wróć do przykładów CV",
    updatedLabel: "Zaktualizowano",
    wordsLabel: "słów",
    resumeKeywordsForRole: (role) => `Słowa kluczowe CV dla ${role}`,
    relatedExamplesTitle: "Powiązane przykłady",
    relatedExamplesLead: "Zobacz podobne przykłady ról, aby porównać keywords i styl bulletów.",
    onThisPageTitle: "Na tej stronie",
    similarKeywordGuidesTitle: "Poradniki słów kluczowych dla podobnych ról",
    similarKeywordGuidesLead: "Otwórz strony ze słowami kluczowymi dla ról, aby zobaczyć, co ATS i rekruterzy skanują najpierw.",
  },
  sk: {
    hubKicker: "SEO klaster",
    hubTitle: "Príklady životopisu podľa roly",
    hubSubtitle: "ATS-safe príklady životopisu: summary, skills, bullet body a FAQ.",
    rolesLabel: "Roly",
    openExample: "Otvoriť príklad",
    filterLabel: "Sektor",
    allSectors: "Všetky sektory",
    searchPlaceholder: "Hľadať rolu (napr. Product Manager)",
    noResults: "Nenašli sa žiadne roly",
    checkSpelling: "Skúste inú rolu alebo zrušte filtre.",
    roleCardKicker: "Príklad životopisu",
    roleCardCopy: "ATS-friendly štruktúra s realistickými prepismi bulletov a checklistom na tailoring.",
    freeChecker: "Bezplatný ATS Resume Checker",
    optimizeCv: "Optimalizovať životopis",
    register: "Vytvoriť účet zadarmo",
    loadMoreLabel: "Zobraziť viac rolí",
    backToHub: "Späť na príklady životopisu",
    updatedLabel: "Aktualizované",
    wordsLabel: "slov",
    resumeKeywordsForRole: (role) => `Kľúčové slová životopisu pre ${role}`,
    relatedExamplesTitle: "Súvisiace príklady",
    relatedExamplesLead: "Pozrite si príbuzné príklady rolí a porovnajte kľúčové slová a štýl bullet bodov.",
    onThisPageTitle: "Na tejto stránke",
    similarKeywordGuidesTitle: "Keyword návody pre podobné roly",
    similarKeywordGuidesLead: "Otvorte role-specific stránky s kľúčovými slovami a uvidíte, čo ATS a recruiteri skenujú ako prvé.",
  },
  cs: {
    hubKicker: "SEO klastr",
    hubTitle: "Příklady životopisu podle role",
    hubSubtitle: "ATS-safe příklady životopisu: summary, skills, bullet body a FAQ.",
    rolesLabel: "Role",
    openExample: "Otevřít příklad",
    filterLabel: "Sektor",
    allSectors: "Všechny sektory",
    searchPlaceholder: "Hledat roli (např. Product Manager)",
    noResults: "Žádné role nebyly nalezeny",
    checkSpelling: "Zkuste jiný název role nebo vyčistěte filtry.",
    roleCardKicker: "Příklad životopisu",
    roleCardCopy: "ATS-friendly struktura s realistickými přepisy bulletů a checklistem pro tailoring.",
    freeChecker: "Bezplatný ATS Resume Checker",
    optimizeCv: "Optimalizovat životopis",
    register: "Vytvořit účet zdarma",
    loadMoreLabel: "Zobrazit více rolí",
    backToHub: "Zpět na příklady životopisu",
    updatedLabel: "Aktualizováno",
    wordsLabel: "slov",
    resumeKeywordsForRole: (role) => `Klíčová slova životopisu pro ${role}`,
    relatedExamplesTitle: "Související příklady",
    relatedExamplesLead: "Prohlédněte si podobné příklady rolí a porovnejte klíčová slova i styl bulletů.",
    onThisPageTitle: "Na této stránce",
    similarKeywordGuidesTitle: "Průvodci klíčovými slovy pro podobné role",
    similarKeywordGuidesLead: "Otevřete role-specific stránky s klíčovými slovy a uvidíte, co ATS a recruiteri skenují nejdřív.",
  },
  es: {
    hubKicker: "Clúster SEO",
    hubTitle: "Ejemplos de currículum por rol",
    hubSubtitle: "Ejemplos compatibles con ATS: resumen, habilidades, bullets y FAQ.",
    rolesLabel: "Roles",
    openExample: "Abrir ejemplo",
    filterLabel: "Sector",
    allSectors: "Todos los sectores",
    searchPlaceholder: "Buscar rol (p. ej., Product Manager)",
    noResults: "No se encontraron roles",
    checkSpelling: "Prueba con otro nombre de rol o borra los filtros.",
    roleCardKicker: "Ejemplo de CV",
    roleCardCopy: "Estructura ATS-friendly con bullets realistas y checklist de adaptación.",
    freeChecker: "ATS Resume Checker gratis",
    optimizeCv: "Optimizar mi CV",
    register: "Crear cuenta gratis",
    loadMoreLabel: "Ver más roles",
    backToHub: "Volver a ejemplos de CV",
    updatedLabel: "Actualizado",
    wordsLabel: "palabras",
    resumeKeywordsForRole: (role) => `Palabras clave del CV para ${role}`,
    relatedExamplesTitle: "Ejemplos relacionados",
    relatedExamplesLead: "Explora ejemplos de roles similares para comparar keywords y el estilo de los bullets.",
    onThisPageTitle: "En esta página",
    similarKeywordGuidesTitle: "Guías de palabras clave para roles similares",
    similarKeywordGuidesLead: "Abre páginas de palabras clave por rol para ver qué suelen escanear primero los ATS y los recruiters.",
  },
};

export function getResumeExamplesUi(language: Language): UiTexts {
  return UI[language] || UI.en;
}
