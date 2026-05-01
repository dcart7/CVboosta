import type { Language } from "./translations";
import type { ResumeKeywordCluster } from "./resumeKeywordClusters";
import { CATEGORY_IMPACT_AREAS, CATEGORY_KEYWORDS, CATEGORY_SKILL_KEYWORDS } from "./resumeKeywordClusters";

type SectionBlueprintItem = {
  section: string;
  purpose: string;
  keywordPlacement: string;
};

type LongFormSection = {
  heading: string;
  paragraphs: string[];
};

export type ResumeKeywordGroup = {
  title: string;
  keywords: string[];
};

export type ResumeKeywordLandingContent = {
  hook: string[];
  keywordGroups: ResumeKeywordGroup[];
  resumeBullets: string[];
  atsTips: string[];
  commonMistakes: string[];
  proTips: string[];
};

type LocalizedContentPack = {
  expectations: (role: string) => string[];
  impactBullets: (role: string) => string[];
  blueprint: (role: string) => SectionBlueprintItem[];
  checklist: (role: string) => string[];
};

type DeepLocalizedCopy = {
  strategyLead: (role: string) => string;
  keywordLead: string;
  bulletLead: string;
  qaPromptLabel: string;
  updatesRefreshed: (category: ResumeKeywordCluster["category"], kwA: string, kwB: string) => string;
  updatesSpecificity: (role: string, lane: string) => string;
  introParagraphA: (role: string, kwA: string, kwB: string) => string;
  introParagraphB: (
    role: string,
    anchor: string,
    supporting: string,
    metric: number,
    exampleLine: string,
  ) => string;
};

const CONTENT: Record<Language, LocalizedContentPack> = {
  en: {
    expectations: (role) => [
      `Show clear role fit for ${role} in the first screen of the resume.`,
      "Use measurable outcomes, not only responsibilities or activity language.",
      "Demonstrate ownership: what you led, decided, or improved directly.",
      "Mirror vacancy priorities with truthful terminology and concrete evidence.",
    ],
    impactBullets: (role) => [
      `Led a core ${role.toLowerCase()} initiative and improved delivery speed by X% in two quarters.`,
      `Redesigned a key ${role.toLowerCase()} workflow and raised quality KPI from X% to Y%.`,
      `Built reporting cadence for leadership and reduced decision lag by X%.`,
      `Improved cross-team execution, cutting rework and handoff delays by X%.`,
    ],
    blueprint: (role) => [
      {
        section: "Headline & Summary",
        purpose: `Confirm role fit for ${role} in the first scan.`,
        keywordPlacement: "Place 3-5 highest-priority terms naturally.",
      },
      {
        section: "Skills",
        purpose: "Mirror technical and domain priorities recruiters scan quickly.",
        keywordPlacement: "Group keywords by capability, not alphabetically.",
      },
      {
        section: "Recent Experience",
        purpose: "Provide measurable proof that you delivered relevant outcomes.",
        keywordPlacement: "Embed terms in bullets with context and measurable result.",
      },
      {
        section: "Projects / Achievements",
        purpose: "Show differentiators and depth for competitive applications.",
        keywordPlacement: "Use role language in scope, ownership, and impact lines.",
      },
    ],
    checklist: (role) => [
      `Does the summary explicitly mention ${role} outcomes and scope?`,
      "Are top keywords distributed across summary, skills, and recent experience?",
      "Do the first 5 bullets include measurable impact and clear ownership?",
      "Is formatting ATS-safe (simple structure, no critical text in images/tables)?",
      "Did you run a final relevance check before submission?",
    ],
  },
  uk: {
    expectations: (role) => [
      `Покажіть чітку відповідність ролі ${role.toLowerCase()} вже на першому екрані резюме.`,
      "Пишіть про вимірювані результати, а не лише про перелік обов'язків.",
      "Підкресліть персональну відповідальність: що саме ви вели, вирішили або покращили.",
      "Використовуйте релевантну термінологію вакансії лише там, де є реальні докази досвіду.",
    ],
    impactBullets: (role) => [
      `Очолив(ла) ключову ініціативу в напрямку ${role.toLowerCase()} і прискорив(ла) delivery на X% за два квартали.`,
      `Перебудував(ла) ключовий workflow ${role.toLowerCase()} та підвищив(ла) KPI якості з X% до Y%.`,
      "Налаштував(ла) регулярну звітність для керівництва й скоротив(ла) затримку прийняття рішень на X%.",
      "Покращив(ла) кроскомандну взаємодію, зменшивши переробки та затримки handoff на X%.",
    ],
    blueprint: (role) => [
      {
        section: "Заголовок і summary",
        purpose: `Підтвердити відповідність ролі ${role.toLowerCase()} вже при першому перегляді.`,
        keywordPlacement: "Природно вставте 3-5 найпріоритетніших термінів.",
      },
      {
        section: "Навички",
        purpose: "Відобразіть технічні та доменні пріоритети, які рекрутер бачить першими.",
        keywordPlacement: "Групуйте ключові слова за компетенціями, а не за алфавітом.",
      },
      {
        section: "Останній досвід",
        purpose: "Дайте вимірювані докази релевантних результатів.",
        keywordPlacement: "Вбудовуйте терміни в bullet-пункти з контекстом і результатом.",
      },
      {
        section: "Проєкти / Досягнення",
        purpose: "Покажіть відмінності та глибину для конкурентної подачі.",
        keywordPlacement: "Використовуйте лексику ролі в описі масштабу, відповідальності й впливу.",
      },
    ],
    checklist: (role) => [
      `У summary прямо зазначено результати й масштаб ролі ${role.toLowerCase()}?`,
      "Ключові слова розподілені між summary, skills і останнім досвідом?",
      "Перші 5 bullet-пунктів містять вимірюваний вплив і зрозумілу відповідальність?",
      "Формат безпечний для ATS (проста структура, без критичного тексту в картинках/таблицях)?",
      "Перед відправкою зроблено фінальну перевірку релевантності?",
    ],
  },
  pl: {
    expectations: (role) => [
      `Pokaż jasne dopasowanie do roli ${role.toLowerCase()} już na pierwszym ekranie CV.`,
      "Używaj mierzalnych rezultatów, a nie tylko listy obowiązków.",
      "Podkreśl odpowiedzialność: co prowadziłeś(-aś), o czym decydowałeś(-aś), co poprawiłeś(-aś).",
      "Stosuj terminologię oferty tylko tam, gdzie masz realne potwierdzenie doświadczenia.",
    ],
    impactBullets: (role) => [
      `Poprowadziłem(-am) kluczową inicjatywę ${role.toLowerCase()} i przyspieszyłem(-am) delivery o X% w dwa kwartały.`,
      `Przeprojektowałem(-am) główny workflow ${role.toLowerCase()} i podniosłem(-am) KPI jakości z X% do Y%.`,
      "Wdrożyłem(-am) stały rytm raportowania dla leadershipu, skracając opóźnienie decyzji o X%.",
      "Usprawniłem(-am) współpracę między zespołami, redukując poprawki i opóźnienia handoff o X%.",
    ],
    blueprint: (role) => [
      {
        section: "Nagłówek i podsumowanie",
        purpose: `Potwierdź dopasowanie do roli ${role.toLowerCase()} już przy pierwszym skanie.`,
        keywordPlacement: "Naturalnie umieść 3-5 najważniejszych terminów.",
      },
      {
        section: "Umiejętności",
        purpose: "Odzwierciedl priorytety techniczne i domenowe, które rekruter sprawdza najszybciej.",
        keywordPlacement: "Grupuj słowa kluczowe według kompetencji, nie alfabetycznie.",
      },
      {
        section: "Najnowsze doświadczenie",
        purpose: "Pokaż mierzalne dowody dostarczonych rezultatów.",
        keywordPlacement: "Wplataj terminy w bullety z kontekstem i wynikiem.",
      },
      {
        section: "Projekty / Osiągnięcia",
        purpose: "Pokaż przewagę i głębię doświadczenia w konkurencyjnych procesach.",
        keywordPlacement: "Używaj języka roli w opisie zakresu, odpowiedzialności i wpływu.",
      },
    ],
    checklist: (role) => [
      `Czy podsumowanie jasno wskazuje wyniki i zakres roli ${role.toLowerCase()}?`,
      "Czy najważniejsze słowa kluczowe są rozłożone między podsumowanie, umiejętności i ostatnie doświadczenie?",
      "Czy pierwsze 5 bullet pointów zawiera mierzalny wpływ i jasną odpowiedzialność?",
      "Czy format jest bezpieczny dla ATS (prosta struktura, bez kluczowego tekstu w obrazach/tabelach)?",
      "Czy wykonałeś(-aś) końcową kontrolę trafności przed wysłaniem?",
    ],
  },
  sk: {
    expectations: (role) => [
      `Ukážte jasnú zhodu s rolou ${role.toLowerCase()} už na prvom pohľade na životopis.`,
      "Používajte merateľné výsledky, nie len zoznam povinností.",
      "Zdôraznite vlastníctvo: čo ste viedli, rozhodli alebo zlepšili.",
      "Terminológiu z pozície používajte len tam, kde ju viete podložiť reálnym dôkazom.",
    ],
    impactBullets: (role) => [
      `Viedol(a) som kľúčovú iniciatívu ${role.toLowerCase()} a zrýchlil(a) delivery o X% za dva kvartály.`,
      `Prepracoval(a) som hlavný workflow ${role.toLowerCase()} a zvýšil(a) KPI kvality z X% na Y%.`,
      "Nastavil(a) som reporting rytmus pre leadership a skrátil(a) oneskorenie rozhodnutí o X%.",
      "Zlepšil(a) som cross-team spoluprácu a znížil(a) rework aj handoff oneskorenia o X%.",
    ],
    blueprint: (role) => [
      {
        section: "Nadpis a summary",
        purpose: `Potvrďte zhodu s rolou ${role.toLowerCase()} už pri prvom skene.`,
        keywordPlacement: "Prirodzene umiestnite 3-5 najdôležitejších termínov.",
      },
      {
        section: "Skills",
        purpose: "Zrkadlite technické a doménové priority, ktoré recruiter skenuje najskôr.",
        keywordPlacement: "Zoskupujte kľúčové slová podľa schopností, nie abecedne.",
      },
      {
        section: "Najnovšia skúsenosť",
        purpose: "Prineste merateľné dôkazy, že ste doručili relevantné výsledky.",
        keywordPlacement: "Vkladajte termíny do bullet bodov s kontextom a výsledkom.",
      },
      {
        section: "Projekty / Výsledky",
        purpose: "Ukážte odlíšenie a hĺbku pre konkurenčné výberové konania.",
        keywordPlacement: "Používajte jazyk role v rozsahu, zodpovednosti a dopade.",
      },
    ],
    checklist: (role) => [
      `Spomína summary jasne výsledky a rozsah role ${role.toLowerCase()}?`,
      "Sú top kľúčové slová rozložené medzi summary, skills a najnovšiu skúsenosť?",
      "Obsahuje prvých 5 bullet bodov merateľný dopad a jasné vlastníctvo?",
      "Je formát ATS-safe (jednoduchá štruktúra, bez kritického textu v obrázkoch/tabuľkách)?",
      "Spravili ste pred odoslaním finálnu kontrolu relevancie?",
    ],
  },
  cs: {
    expectations: (role) => [
      `Ukažte jasný soulad s rolí ${role.toLowerCase()} už při prvním zobrazení životopisu.`,
      "Používejte měřitelné výsledky, ne jen seznam povinností.",
      "Zdůrazněte ownership: co jste vedli, rozhodli nebo zlepšili.",
      "Terminologii z inzerátu používejte jen tam, kde ji podpoříte reálným důkazem.",
    ],
    impactBullets: (role) => [
      `Vedl(a) jsem klíčovou iniciativu ${role.toLowerCase()} a zrychlil(a) delivery o X% během dvou kvartálů.`,
      `Přepracoval(a) jsem hlavní workflow ${role.toLowerCase()} a zvýšil(a) KPI kvality z X% na Y%.`,
      "Zavedl(a) jsem pravidelný reporting pro leadership a snížil(a) zpoždění rozhodování o X%.",
      "Zlepšil(a) jsem cross-team spolupráci a snížil(a) rework i handoff zpoždění o X%.",
    ],
    blueprint: (role) => [
      {
        section: "Nadpis a summary",
        purpose: `Potvrďte soulad s rolí ${role.toLowerCase()} už při prvním skenu.`,
        keywordPlacement: "Přirozeně umístěte 3-5 nejdůležitějších termínů.",
      },
      {
        section: "Skills",
        purpose: "Zrcadlete technické i doménové priority, které recruiter kontroluje nejrychleji.",
        keywordPlacement: "Skupinujte klíčová slova podle schopností, ne abecedně.",
      },
      {
        section: "Nedávná zkušenost",
        purpose: "Doložte měřitelné důkazy relevantních výsledků.",
        keywordPlacement: "Vkládejte termíny do bullet bodů s kontextem a výsledkem.",
      },
      {
        section: "Projekty / Úspěchy",
        purpose: "Ukažte odlišení a hloubku zkušeností pro konkurenční výběr.",
        keywordPlacement: "Používejte jazyk role v popisu rozsahu, odpovědnosti i dopadu.",
      },
    ],
    checklist: (role) => [
      `Zmiňuje summary jasně výsledky a rozsah role ${role.toLowerCase()}?`,
      "Jsou hlavní klíčová slova rozložena mezi summary, skills a nedávnou zkušenost?",
      "Obsahuje prvních 5 bullet bodů měřitelný dopad a jasné ownership?",
      "Je formát ATS-safe (jednoduchá struktura, bez kritického textu v obrázcích/tabulkách)?",
      "Provedli jste finální kontrolu relevance před odesláním?",
    ],
  },
  es: {
    expectations: (role) => [
      `Muestra encaje claro con el rol ${role.toLowerCase()} en la primera pantalla del CV.`,
      "Usa resultados medibles, no solo una lista de responsabilidades.",
      "Resalta ownership: qué lideraste, decidiste o mejoraste directamente.",
      "Usa la terminología de la vacante solo cuando puedas respaldarla con evidencia real.",
    ],
    impactBullets: (role) => [
      `Lideré una iniciativa clave de ${role.toLowerCase()} y mejoré la velocidad de delivery en X% en dos trimestres.`,
      `Rediseñé un workflow principal de ${role.toLowerCase()} y elevé el KPI de calidad de X% a Y%.`,
      "Implementé una cadencia de reporting para liderazgo y reduje el retraso de decisión en X%.",
      "Mejoré la ejecución entre equipos, reduciendo retrabajo y retrasos de handoff en X%.",
    ],
    blueprint: (role) => [
      {
        section: "Titular y resumen",
        purpose: `Confirma encaje con ${role.toLowerCase()} en el primer escaneo.`,
        keywordPlacement: "Incluye de forma natural 3-5 términos prioritarios.",
      },
      {
        section: "Habilidades",
        purpose: "Refleja prioridades técnicas y de dominio que reclutadores revisan primero.",
        keywordPlacement: "Agrupa palabras clave por capacidad, no en orden alfabético.",
      },
      {
        section: "Experiencia reciente",
        purpose: "Aporta evidencia medible de resultados relevantes.",
        keywordPlacement: "Integra términos en bullets con contexto y resultado.",
      },
      {
        section: "Proyectos / Logros",
        purpose: "Muestra diferenciadores y profundidad para postulaciones competitivas.",
        keywordPlacement: "Usa lenguaje del rol en alcance, ownership e impacto.",
      },
    ],
    checklist: (role) => [
      `¿El resumen menciona claramente resultados y alcance para ${role.toLowerCase()}?`,
      "¿Las palabras clave principales están distribuidas entre resumen, habilidades y experiencia reciente?",
      "¿Los primeros 5 bullets muestran impacto medible y ownership claro?",
      "¿El formato es ATS-safe (estructura simple, sin texto crítico en imágenes/tablas)?",
      "¿Hiciste una revisión final de relevancia antes de enviar?",
    ],
  },
};

const DEEP_COPY: Record<Language, DeepLocalizedCopy> = {
  en: {
    strategyLead: (role) =>
      `${role} hiring pipelines are comparison-driven: recruiters benchmark role relevance, vocabulary fit, and measurable impact very quickly.`,
    keywordLead: "Keyword quality matters more than keyword volume.",
    bulletLead: "For competitive roles, bullet quality is the deciding factor.",
    qaPromptLabel: "A useful QA prompt for this page is",
    updatesRefreshed: (category, kwA, kwB) =>
      `Keyword set refreshed around ${kwA} and ${kwB} using current ${category} vacancy patterns.`,
    updatesSpecificity: (role, lane) =>
      `Examples and FAQ were updated to strengthen specificity for ${role.toLowerCase()} applicants, with extra emphasis on ${lane}.`,
    introParagraphA: (role, kwA, kwB) =>
      `${role} hiring pipelines are comparison-driven: recruiters benchmark role relevance, vocabulary fit, and measurable impact very quickly. This guide keeps the same practical structure while grounding it in role-specific signals such as ${kwA} and ${kwB}, plus evidence patterns that are easier for ATS and humans to interpret.`,
    introParagraphB: (role, anchor, supporting, metric, exampleLine) =>
      `For this role, strong resume versions usually show ownership and outcomes like ${anchor} and ${supporting}. In many review flows, moving those signals into summary and lead bullets can raise match quality by ${metric}% or more versus baseline drafts built from responsibilities only. A good target line is: ${exampleLine}.`,
  },
  uk: {
    strategyLead: (role) =>
      `Найм на роль ${role.toLowerCase()} дуже порівняльний: рекрутери швидко оцінюють релевантність, лексику ролі та вимірюваний вплив.`,
    keywordLead: "Якість ключових слів важливіша за їх кількість.",
    bulletLead: "Для конкурентних ролей ключовим фактором є якість bullet-пунктів.",
    qaPromptLabel: "Корисне QA-запитання для цієї сторінки",
    updatesRefreshed: (category, kwA, kwB) =>
      `Набір ключових слів оновлено навколо ${kwA} і ${kwB} на основі актуальних патернів вакансій у сфері ${category}.`,
    updatesSpecificity: (role, lane) =>
      `Приклади й FAQ оновлено для більшої специфіки під кандидатів на ${role.toLowerCase()}, з додатковим фокусом на ${lane}.`,
    introParagraphA: (role, kwA, kwB) =>
      `Найм на роль ${role.toLowerCase()} дуже порівняльний: рекрутери швидко оцінюють релевантність профілю, лексику ролі та вимірюваний бізнес-вплив. Цей гайд зберігає практичну структуру, але підсилює її сигналами саме для цієї ролі, зокрема ${kwA} і ${kwB}.`,
    introParagraphB: (_role, anchor, supporting, metric, exampleLine) =>
      `Для цієї ролі найсильніші резюме показують ownership і результати на кшталт ${anchor} та ${supporting}. У багатьох сценаріях перенесення цих сигналів у summary та перші bullet-пункти підвищує якість матчингу на ${metric}% і більше. Орієнтир формулювання: ${exampleLine}.`,
  },
  pl: {
    strategyLead: (role) =>
      `Rekrutacja na rolę ${role.toLowerCase()} jest silnie porównawcza: rekruterzy szybko oceniają trafność, język roli i mierzalny wpływ.`,
    keywordLead: "Jakość słów kluczowych jest ważniejsza niż ich liczba.",
    bulletLead: "W konkurencyjnych rolach jakość bullet pointów decyduje o wyniku.",
    qaPromptLabel: "Przydatne pytanie QA dla tej strony",
    updatesRefreshed: (category, kwA, kwB) =>
      `Zestaw słów kluczowych odświeżono wokół ${kwA} i ${kwB} na bazie aktualnych wzorców ofert w obszarze ${category}.`,
    updatesSpecificity: (role, lane) =>
      `Przykłady i FAQ zaktualizowano, aby były bardziej konkretne dla kandydatów na ${role.toLowerCase()}, ze szczególnym naciskiem na ${lane}.`,
    introParagraphA: (role, kwA, kwB) =>
      `Proces rekrutacyjny dla ${role.toLowerCase()} jest porównawczy: rekruterzy szybko benchmarkują trafność profilu, słownictwo roli i mierzalny wpływ. Ten poradnik zachowuje praktyczną strukturę i wzmacnia ją sygnałami specyficznymi dla roli, takimi jak ${kwA} i ${kwB}.`,
    introParagraphB: (_role, anchor, supporting, metric, exampleLine) =>
      `W tej roli najlepsze CV pokazują ownership i wyniki takie jak ${anchor} oraz ${supporting}. W wielu przeglądach przesunięcie tych sygnałów do podsumowania i lead bulletów podnosi jakość dopasowania o ${metric}% lub więcej. Dobra linia docelowa: ${exampleLine}.`,
  },
  sk: {
    strategyLead: (role) =>
      `Hiring na rolu ${role.toLowerCase()} je výrazne porovnávací: recruiteri rýchlo hodnotia relevanciu, slovník role a merateľný dopad.`,
    keywordLead: "Kvalita kľúčových slov je dôležitejšia než ich množstvo.",
    bulletLead: "Pri konkurenčných rolách rozhoduje kvalita bullet bodov.",
    qaPromptLabel: "Užitočná QA otázka pre túto stránku",
    updatesRefreshed: (category, kwA, kwB) =>
      `Sada kľúčových slov bola aktualizovaná okolo ${kwA} a ${kwB} podľa aktuálnych vzorov pozícií v oblasti ${category}.`,
    updatesSpecificity: (role, lane) =>
      `Príklady a FAQ boli upravené pre vyššiu špecificitu pre kandidátov na ${role.toLowerCase()}, s dôrazom na ${lane}.`,
    introParagraphA: (role, kwA, kwB) =>
      `Hiring pipeline pre ${role.toLowerCase()} je porovnávací: recruiteri rýchlo porovnávajú relevanciu profilu, slovník role a merateľný dopad. Tento návod zachováva praktickú štruktúru a opiera ju o role-signály ako ${kwA} a ${kwB}.`,
    introParagraphB: (_role, anchor, supporting, metric, exampleLine) =>
      `Pri tejto role najsilnejšie životopisy ukazujú ownership a výsledky ako ${anchor} a ${supporting}. V mnohých review flow presun týchto signálov do summary a lead bulletov zvýši match kvalitu o ${metric}% a viac. Dobrý cieľový riadok: ${exampleLine}.`,
  },
  cs: {
    strategyLead: (role) =>
      `Nábor na roli ${role.toLowerCase()} je výrazně porovnávací: recruiteri rychle hodnotí relevanci, jazyk role a měřitelný dopad.`,
    keywordLead: "Kvalita klíčových slov je důležitější než jejich množství.",
    bulletLead: "U konkurenčních rolí rozhoduje kvalita bullet bodů.",
    qaPromptLabel: "Užitečná QA otázka pro tuto stránku",
    updatesRefreshed: (category, kwA, kwB) =>
      `Sada klíčových slov byla aktualizována kolem ${kwA} a ${kwB} podle aktuálních vzorů pozic v oblasti ${category}.`,
    updatesSpecificity: (role, lane) =>
      `Příklady a FAQ byly upraveny pro vyšší specifičnost pro kandidáty na ${role.toLowerCase()}, s důrazem na ${lane}.`,
    introParagraphA: (role, kwA, kwB) =>
      `Hiring pipeline pro ${role.toLowerCase()} je porovnávací: recruiteri rychle porovnávají relevanci profilu, slovník role a měřitelný dopad. Tento průvodce zachovává praktickou strukturu a opírá ji o role-signály jako ${kwA} a ${kwB}.`,
    introParagraphB: (_role, anchor, supporting, metric, exampleLine) =>
      `U této role nejsilnější životopisy ukazují ownership a výsledky jako ${anchor} a ${supporting}. V mnoha review flow přesun těchto signálů do summary a lead bulletů zvyšuje kvalitu shody o ${metric}% a více. Dobrý cílový řádek: ${exampleLine}.`,
  },
  es: {
    strategyLead: (role) =>
      `La contratación para el rol ${role.toLowerCase()} es muy comparativa: los reclutadores evalúan rápido relevancia, vocabulario del rol e impacto medible.`,
    keywordLead: "La calidad de las palabras clave importa más que el volumen.",
    bulletLead: "En roles competitivos, la calidad de los bullets decide el resultado.",
    qaPromptLabel: "Una pregunta útil de QA para esta página es",
    updatesRefreshed: (category, kwA, kwB) =>
      `El set de keywords se actualizó alrededor de ${kwA} y ${kwB} usando patrones actuales de vacantes en ${category}.`,
    updatesSpecificity: (role, lane) =>
      `Se actualizaron ejemplos y FAQ para mayor especificidad para candidatos de ${role.toLowerCase()}, con énfasis adicional en ${lane}.`,
    introParagraphA: (role, kwA, kwB) =>
      `Los procesos de contratación para ${role.toLowerCase()} son comparativos: los reclutadores benchmarkean muy rápido la relevancia del perfil, el vocabulario del rol y el impacto medible. Esta guía mantiene una estructura práctica y la aterriza con señales específicas del rol como ${kwA} y ${kwB}.`,
    introParagraphB: (_role, anchor, supporting, metric, exampleLine) =>
      `En este rol, los CV más sólidos muestran ownership y resultados como ${anchor} y ${supporting}. En muchos flujos de revisión, mover esas señales al resumen y a los primeros bullets puede elevar la calidad de match en ${metric}% o más. Una línea objetivo útil es: ${exampleLine}.`,
  },
};

export function getRoleExpectations(cluster: ResumeKeywordCluster, language: Language): string[] {
  return CONTENT[language]?.expectations(cluster.role) ?? CONTENT.en.expectations(cluster.role);
}

export function getRoleImpactBullets(cluster: ResumeKeywordCluster, language: Language): string[] {
  return CONTENT[language]?.impactBullets(cluster.role) ?? CONTENT.en.impactBullets(cluster.role);
}

export function getRoleToolStack(cluster: ResumeKeywordCluster): string[] {
  return cluster.keywords.slice(0, 8);
}

export function getSectionBlueprint(
  cluster: ResumeKeywordCluster,
  language: Language,
): SectionBlueprintItem[] {
  return CONTENT[language]?.blueprint(cluster.role) ?? CONTENT.en.blueprint(cluster.role);
}

export function getFinalChecklist(cluster: ResumeKeywordCluster, language: Language): string[] {
  return CONTENT[language]?.checklist(cluster.role) ?? CONTENT.en.checklist(cluster.role);
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pickByHash<T>(items: readonly T[], hash: number, offset = 0): T {
  return items[(hash + offset) % items.length];
}

function toSentence(value: string): string {
  return value.trim().replace(/[.!?]+$/g, "");
}

function getClusterKeywordSlice(cluster: ResumeKeywordCluster, start = 0, count = 3): string[] {
  return cluster.keywords.slice(start, start + count).map((item) => toSentence(item.toLowerCase()));
}

function clampList(items: string[], min: number, max: number): string[] {
  const unique = Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
  return unique.slice(0, Math.max(min, Math.min(max, unique.length)));
}

function hashForRole(cluster: ResumeKeywordCluster): number {
  return hashString(`${cluster.slug}:${cluster.category}`);
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

type Lane =
  | "default"
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "ml"
  | "data_analyst"
  | "data_engineer"
  | "data_scientist"
  | "seo"
  | "paid"
  | "lifecycle"
  | "brand"
  | "growth"
  | "b2b"
  | "b2c";

function detectLane(cluster: ResumeKeywordCluster): Lane {
  const role = cluster.role.toLowerCase();
  if (cluster.category === "engineering") {
    if (role.includes("frontend")) return "frontend";
    if (role.includes("backend")) return "backend";
    if (role.includes("full stack") || role.includes("fullstack")) return "fullstack";
    if (role.includes("devops") || role.includes("site reliability") || role.includes("sre") || role.includes("platform"))
      return "devops";
    if (role.includes("machine learning") || role.includes("ml") || role.includes("ai ")) return "ml";
    return "default";
  }
  if (cluster.category === "data") {
    if (role.includes("engineer")) return "data_engineer";
    if (role.includes("scientist")) return "data_scientist";
    return "data_analyst";
  }
  if (cluster.category === "marketing") {
    if (role.includes("seo")) return "seo";
    if (role.includes("ppc") || role.includes("performance") || role.includes("paid")) return "paid";
    if (role.includes("lifecycle") || role.includes("crm") || role.includes("email")) return "lifecycle";
    if (role.includes("brand")) return "brand";
    if (role.includes("growth")) return "growth";
    return "default";
  }
  if (cluster.category === "sales") {
    if (role.includes("enterprise")) return "b2b";
    return "default";
  }
  return "default";
}

function buildKeywordGroups(
  groups: Array<{ title: string; keywords: string[] }>,
  min = 6,
  max = 10,
): ResumeKeywordGroup[] {
  return groups.map((group) => ({
    title: group.title,
    keywords: clampList(group.keywords, min, max),
  }));
}

const GROUP_TITLES: Record<Language, {
  core: string;
  tools: string;
  industry: string;
  soft: string;
  advanced: string;
}> = {
  en: {
    core: "Core Skills",
    tools: "Tools & Platforms",
    industry: "Industry Keywords",
    soft: "Soft Skills (Specific)",
    advanced: "Advanced / Senior-level",
  },
  uk: {
    core: "Ключові навички",
    tools: "Інструменти та платформи",
    industry: "Професійні терміни",
    soft: "Soft skills (конкретні)",
    advanced: "Advanced / Senior-level",
  },
  pl: {
    core: "Kluczowe umiejętności",
    tools: "Narzędzia i platformy",
    industry: "Słowa branżowe",
    soft: "Soft skills (konkretne)",
    advanced: "Advanced / Senior-level",
  },
  sk: {
    core: "Kľúčové zručnosti",
    tools: "Nástroje a platformy",
    industry: "Odborné kľúčové slová",
    soft: "Soft skills (konkrétne)",
    advanced: "Advanced / Senior-level",
  },
  cs: {
    core: "Klíčové dovednosti",
    tools: "Nástroje a platformy",
    industry: "Oborová klíčová slova",
    soft: "Soft skills (konkrétní)",
    advanced: "Advanced / Senior-level",
  },
  es: {
    core: "Habilidades clave",
    tools: "Herramientas y plataformas",
    industry: "Términos del sector",
    soft: "Soft skills (específicas)",
    advanced: "Advanced / Senior-level",
  },
};

function buildEngineeringContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const lane = detectLane(cluster);
  const roleLower = cluster.role.toLowerCase();
  const impact = pick(CATEGORY_IMPACT_AREAS.engineering, h);

  const hook = [
    `ATS rejects for ${cluster.role} roles usually come from one issue: your resume reads like responsibilities, not production-grade engineering signals (systems, constraints, and measurable outcomes).`,
    `Use the groups and bullets below to translate your work into the keywords recruiters and hiring managers actually screen for in ${roleLower} resumes.`,
  ];

  const coreByLane: Record<Lane, string[]> = {
    frontend: [
      "Core Web Vitals (LCP/INP/CLS)",
      "bundle size reduction",
      "render performance profiling",
      "design system implementation",
      "component API design",
      "accessibility audits (WCAG)",
      "state management patterns",
      "end-to-end testing strategy",
      "frontend error monitoring",
      "SSR/CSR tradeoffs",
    ],
    backend: [
      "API contract design",
      "database query optimization",
      "idempotency & retries",
      "distributed tracing",
      "p99 latency reduction",
      "cache strategy",
      "queue-based async processing",
      "backward-compatible migrations",
      "rate limiting",
      "service-level objectives (SLOs)",
    ],
    fullstack: [
      "feature flag rollouts",
      "end-to-end ownership (UI→API→DB)",
      "observability instrumentation",
      "performance regression prevention",
      "authentication/authorization flows",
      "schema evolution",
      "CI pipeline hardening",
      "production incident response",
      "user-facing error handling",
      "release risk management",
    ],
    devops: [
      "Terraform infrastructure-as-code",
      "Kubernetes deployments",
      "CI/CD pipeline design",
      "SLOs & error budgets",
      "incident runbooks",
      "monitoring + alert tuning",
      "secrets management",
      "cost optimization (cloud)",
      "blue/green deployments",
      "disaster recovery planning",
    ],
    ml: [
      "feature engineering pipelines",
      "model training orchestration",
      "offline/online evaluation",
      "model serving latency",
      "experiment tracking",
      "data drift monitoring",
      "prompt/model versioning",
      "MLOps CI/CD",
      "A/B testing (model)",
      "vector search integration",
    ],
    default: [
      "system design",
      "performance profiling",
      "reliability improvements",
      "production debugging",
      "testing strategy",
      "architecture tradeoffs",
      "observability (logs/metrics/traces)",
      "secure coding practices",
      "code review leadership",
      "release management",
    ],
    data_analyst: [],
    data_engineer: [],
    data_scientist: [],
    seo: [],
    paid: [],
    lifecycle: [],
    brand: [],
    growth: [],
    b2b: [],
    b2c: [],
  };

  const toolsByLane: Record<Lane, string[]> = {
    frontend: [
      "React",
      "Next.js",
      "TypeScript",
      "Playwright (or Cypress)",
      "Webpack/Vite",
      "Sentry (frontend)",
      "Lighthouse",
      "Storybook",
      "CSS-in-JS (or Tailwind)",
      "Web Performance APIs",
    ],
    backend: [
      "PostgreSQL",
      "Redis",
      "Kafka (or RabbitMQ)",
      "gRPC (or REST)",
      "Docker",
      "Kubernetes",
      "OpenTelemetry",
      "Prometheus/Grafana",
      "AWS (or GCP/Azure)",
      "CI (GitHub Actions)",
    ],
    fullstack: [
      "TypeScript",
      "React",
      "Node.js (or Python)",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Kubernetes",
      "OpenTelemetry",
      "Feature flag platform",
      "CI (GitHub Actions)",
    ],
    devops: [
      "Terraform",
      "Kubernetes",
      "Helm",
      "Prometheus",
      "Grafana",
      "ArgoCD (or Flux)",
      "Vault (or KMS)",
      "AWS (or GCP/Azure)",
      "Datadog (or equivalent)",
      "Linux",
    ],
    ml: [
      "Python",
      "PyTorch (or TensorFlow)",
      "MLflow (or W&B)",
      "Airflow (or Dagster)",
      "Docker",
      "Kubernetes",
      "Feature store (if used)",
      "Vector DB (if used)",
      "SQL",
      "Spark (if used)",
    ],
    default: [
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "Redis",
      "CI (GitHub Actions)",
      "OpenTelemetry",
      "Prometheus/Grafana",
      "AWS (or GCP/Azure)",
      "TypeScript (or Python/Java)",
      "Sentry",
    ],
    data_analyst: [],
    data_engineer: [],
    data_scientist: [],
    seo: [],
    paid: [],
    lifecycle: [],
    brand: [],
    growth: [],
    b2b: [],
    b2c: [],
  };

  const industry = [
    "SLA/SLO language",
    "incident postmortems",
    "rollback strategy",
    "backward compatibility",
    "data privacy controls",
    "capacity planning",
    "load testing",
    "technical debt paydown",
  ];

  const softSkills = [
    "RFC writing (design docs)",
    "incident comms (timeline + mitigations)",
    "cross-team dependency mapping",
    "risk callouts in sprint planning",
    "stakeholder demos with metrics",
    "on-call handoffs (runbooks)",
    "mentoring with code review themes",
    "tradeoff framing (latency vs cost)",
  ];

  const advanced = [
    "error budget policy",
    "multi-region failover",
    "zero-downtime migrations",
    "security threat modeling",
    "performance budgets (frontend/backend)",
    "observability standards (OTel)",
    "event-driven architecture",
  ];

  const keywordGroups = buildKeywordGroups(
    [
      { title: groupTitles.core, keywords: coreByLane[lane] || coreByLane.default },
      { title: groupTitles.tools, keywords: toolsByLane[lane] || toolsByLane.default },
      { title: groupTitles.industry, keywords: industry },
      { title: groupTitles.soft, keywords: softSkills },
      { title: groupTitles.advanced, keywords: advanced },
    ],
    6,
    10,
  );

  const services = 2 + (h % 6);
  const latency = 18 + (h % 37);
  const incidents = 20 + (h % 45);
  const deploys = 35 + (h % 120);
  const months = 2 + (h % 7);
  const cost = 9 + (h % 18);
  const coverage = 14 + (h % 22);

  const bulletsByLane: Record<Lane, string[]> = {
    frontend: [
      `Reduced LCP by ${1.2 + ((h % 10) / 10)}s on key pages via bundle splitting and render profiling → improved conversion by ${6 + (h % 9)}% in ${months} months.`,
      `Implemented design-system components with accessibility checks (WCAG) → cut UI defects by ${18 + (h % 20)}% and sped up feature delivery across ${services} teams.`,
      `Built E2E test suite (Playwright/Cypress) for critical flows → reduced escaped regressions by ${incidents}% and stabilized releases.`,
      `Instrumented frontend error monitoring (Sentry) and created weekly triage → reduced crash-free sessions gap by ${12 + (h % 16)}%.`,
      `Optimized client-side data fetching + caching → decreased time-to-interactive by ${10 + (h % 18)}% under peak traffic.`,
      `Partnered with design on interaction audits → improved task completion rate by ${8 + (h % 12)}% without increasing scope.`,
    ],
    backend: [
      `Cut p99 API latency by ${latency}% by optimizing queries and caching hot paths → improved ${impact} and reduced timeouts in ${months} months.`,
      `Designed idempotent payment/order workflows with retries and deduplication → reduced duplicate processing incidents by ${18 + (h % 22)}%.`,
      `Introduced async processing (queue + workers) for heavy tasks → improved throughput by ${22 + (h % 24)}% while keeping SLA.`,
      `Implemented OpenTelemetry tracing and alert tuning → reduced MTTR by ${12 + (h % 18)}% across ${services} services.`,
      `Shipped zero-downtime schema migrations and rollback plan → eliminated release-related incidents for ${3 + (h % 4)} consecutive months.`,
      `Hardened authZ checks and added audit logs → closed ${9 + (h % 12)} high-risk gaps found in security review.`,
    ],
    fullstack: [
      `Owned feature end-to-end (UI→API→DB) and shipped in ${weeksToString(2 + (h % 4))} weeks → increased activation by ${8 + (h % 14)}% with measurable instrumentation.`,
      `Implemented feature flags and gradual rollouts → cut rollout-related incidents by ${18 + (h % 20)}% and improved release confidence.`,
      `Added observability standards (logs/metrics/traces) for new endpoints → reduced debugging time by ${22 + (h % 26)}%.`,
      `Improved CI pipeline and test parallelism → reduced build time by ${cost}% while increasing coverage by ${coverage}%.`,
      `Refactored critical flow to remove race condition → reduced error rate by ${12 + (h % 16)}% at peak load.`,
      `Built internal admin tooling for ops team → reduced manual processing time by ${25 + (h % 25)}%.`,
    ],
    devops: [
      `Built Terraform modules and standardized environments → reduced provisioning time by ${25 + (h % 30)}% and improved auditability.`,
      `Implemented SLOs + alert tuning with error budgets → reduced noisy alerts by ${30 + (h % 35)}% and improved on-call focus.`,
      `Migrated workloads to Kubernetes with progressive delivery → increased deployment frequency to ${deploys}/month while reducing incidents by ${12 + (h % 18)}%.`,
      `Optimized cloud spend (rightsizing + autoscaling) → reduced monthly infra cost by ${cost}% without degrading SLOs.`,
      `Created incident runbooks and DR checks → cut MTTR by ${12 + (h % 18)}% and reduced repeat incidents.`,
      `Hardened secrets management and rotation → eliminated long-lived credentials in ${months} months.`,
    ],
    ml: [
      `Built feature pipeline and training orchestration → reduced model training time by ${18 + (h % 24)}% and improved experiment throughput.`,
      `Deployed model serving with latency budget → reduced p95 inference latency by ${10 + (h % 18)}% while maintaining quality.`,
      `Implemented drift monitoring and alerting → detected data shift ${weeksToString(1 + (h % 3))} earlier and prevented performance drops.`,
      `Ran offline/online evaluation and A/B rollout → improved key metric by ${6 + (h % 12)}% with statistically-sound reporting.`,
      `Versioned models/prompts and added rollback strategy → reduced production incidents related to model updates by ${16 + (h % 18)}%.`,
      `Partnered with product on acceptance criteria → reduced rework by ${12 + (h % 16)}% and clarified success metrics.`,
    ],
    default: [
      `Led system design change across ${services} services → improved ${impact} by ${12 + (h % 22)}% in ${months} months.`,
      `Reduced production incidents by ${incidents}% by hardening monitoring, alerting, and runbooks.`,
      `Improved CI and test strategy → increased coverage by ${coverage}% and reduced release regressions.`,
      `Optimized performance hot path → cut latency by ${latency}% and improved customer-facing SLA.`,
      `Owned on-call improvements and postmortems → reduced repeat incidents by ${18 + (h % 20)}%.`,
      `Delivered technical debt roadmap → improved delivery predictability and release quality.`,
    ],
    data_analyst: [],
    data_engineer: [],
    data_scientist: [],
    seo: [],
    paid: [],
    lifecycle: [],
    brand: [],
    growth: [],
    b2b: [],
    b2c: [],
  };

  const resumeBullets = clampList(bulletsByLane[lane] || bulletsByLane.default, 6, 10);

  const atsTips = clampList(
    [
      `Put the keywords that prove level in the first screen: SLOs, on-call, migrations, tracing, performance budgets — not “helped with engineering”.`,
      `If you list ${pick(toolsByLane[lane] || toolsByLane.default, h)}, add one bullet that ties it to an outcome (latency, incidents, cost, throughput).`,
      "Use metric language ATS parses cleanly: p95/p99, error rate, MTTR/MTTD, deployment frequency, cost %. Avoid “improved performance” without a number.",
      "In Skills, group by capability (Backend, Observability, Data, Infra) rather than an alphabet soup.",
      "Keep architecture keywords in context: “event-driven” only if you describe the event flow, reliability, and monitoring.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing languages and frameworks but no production outcomes (latency, reliability, incident reduction, cost, delivery speed).",
      "Writing “microservices” without showing service count, ownership boundaries, or operational signals (SLOs, tracing, on-call).",
      "Using “optimized” as a verb without stating baseline, change, and measured delta.",
      "Not naming the system constraint you worked under (traffic, data size, uptime, compliance), which makes impact hard to trust.",
      "Burying your best technical wins under long task lists and tool dumps.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Junior vs senior: seniors are screened on system tradeoffs (reliability vs cost vs latency) and operational ownership (on-call, runbooks, postmortems).",
      "Startup vs enterprise: startups want “end-to-end shipped”; enterprises want cross-service design, backward compatibility, and change management.",
      "If you were a tech lead: add one bullet that shows decision-making (RFC, design review, rollout plan), not just coding output.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function weeksToString(weeks: number): string {
  if (weeks <= 1) return "1 week";
  return `${weeks} weeks`;
}

function buildDataContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const lane = detectLane(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.data, h);

  const hook = [
    `Data resumes fail ATS screens when they list tools (SQL, Tableau, Python) but don’t show the decision impact: what changed in the business after the analysis, pipeline, or model shipped.`,
    `Use the keyword groups and bullets below to position your ${cluster.role} experience around measurement, data quality, and stakeholder outcomes.`,
  ];

  const coreByLane: Record<Lane, string[]> = {
    data_analyst: [
      "SQL query design",
      "metric definitions (single source of truth)",
      "dashboard information architecture",
      "cohort analysis",
      "experiment readouts",
      "funnel analysis",
      "root-cause analysis",
      "stakeholder requirements translation",
      "data QA checks",
      "KPI ownership",
    ],
    data_engineer: [
      "data modeling (star schema)",
      "ELT pipeline orchestration",
      "incremental loads",
      "data quality monitoring",
      "partitioning & clustering",
      "SLA design for data freshness",
      "event tracking pipelines",
      "backfills & reprocessing",
      "access control & PII handling",
      "warehouse cost optimization",
    ],
    data_scientist: [
      "feature engineering",
      "model evaluation metrics",
      "causal inference basics",
      "A/B test design",
      "segmentation models",
      "forecasting",
      "model monitoring",
      "productionization handoff",
      "bias/variance tradeoffs",
      "stakeholder decision framing",
    ],
    default: [
      "SQL",
      "data quality",
      "metrics and definitions",
      "dashboarding",
      "analysis and insights",
      "stakeholder alignment",
      "data pipelines",
      "experimentation",
      "reporting automation",
      "documentation",
    ],
    frontend: [],
    backend: [],
    fullstack: [],
    devops: [],
    ml: [],
    seo: [],
    paid: [],
    lifecycle: [],
    brand: [],
    growth: [],
    b2b: [],
    b2c: [],
  };

  const toolsByLane: Record<Lane, string[]> = {
    data_analyst: [
      "SQL",
      "Tableau (or Power BI)",
      "Looker (or Looker Studio)",
      "Excel/Sheets",
      "dbt (basic)",
      "BigQuery (or Snowflake)",
      "Jira/Confluence",
      "GA4 (if product)",
      "Amplitude (if product)",
      "Git (basic)",
    ],
    data_engineer: [
      "dbt",
      "Airflow",
      "BigQuery (or Snowflake)",
      "Kafka (or Pub/Sub)",
      "Terraform (data infra)",
      "Python",
      "Spark (if used)",
      "Great Expectations (or similar)",
      "Looker (semantic layer)",
      "Git",
    ],
    data_scientist: [
      "Python",
      "pandas",
      "scikit-learn",
      "Jupyter",
      "SQL",
      "MLflow (or W&B)",
      "Airflow (or Dagster)",
      "BigQuery (or Snowflake)",
      "Git",
      "Tableau (for sharing)",
    ],
    default: ["SQL", "Python", "Tableau", "Power BI", "dbt", "Airflow", "BigQuery", "Snowflake", "Looker", "Git"],
    frontend: [],
    backend: [],
    fullstack: [],
    devops: [],
    ml: [],
    seo: [],
    paid: [],
    lifecycle: [],
    brand: [],
    growth: [],
    b2b: [],
    b2c: [],
  };

  const keywordGroups = buildKeywordGroups([
    { title: groupTitles.core, keywords: coreByLane[lane] || coreByLane.default },
    { title: groupTitles.tools, keywords: toolsByLane[lane] || toolsByLane.default },
    {
      title: groupTitles.industry,
      keywords: ["data freshness SLA", "dim/fact tables", "event taxonomy", "metric governance", "confidence intervals", "data lineage", "anomaly detection"],
    },
    {
      title: groupTitles.soft,
      keywords: ["requirements workshops", "exec-ready readouts", "metric dispute resolution", "definition docs", "stakeholder alignment on KPIs", "decision logs"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["semantic layer design", "cost governance (warehouse)", "privacy-by-design", "backfill strategy", "experiment guardrails", "self-serve analytics enablement"],
    },
  ]);

  const weeks = 3 + (h % 10);
  const freshness = 25 + (h % 35);
  const accuracy = 8 + (h % 18);
  const savings = 10 + (h % 22);
  const stakeholders = 4 + (h % 10);

  const bulletsByLane: Record<Lane, string[]> = {
    data_analyst: [
      `Built KPI definitions and a dashboard info architecture → reduced weekly reporting time by ${freshness}% for ${stakeholders} stakeholder groups.`,
      `Ran cohort analysis on activation funnel → identified drop-off driver and increased activation by ${6 + (h % 12)}% over ${weeks} weeks.`,
      `Delivered experiment readouts (lift + confidence) for ${8 + (h % 14)} tests → improved decision speed and cut “analysis paralysis” loops.`,
      `Automated recurring SQL reports → reduced manual work by ${savings}% and improved data consistency across teams.`,
      `Introduced data QA checks on key metrics → reduced metric discrepancies by ${accuracy}% month-over-month.`,
      `Partnered with product/marketing to define event taxonomy → improved attribution of ${impact} and reduced “unknown” traffic buckets.`,
    ],
    data_engineer: [
      `Built dbt models and incremental ELT pipelines → improved data freshness by ${freshness}% and met SLA for executive dashboards.`,
      `Implemented data quality monitoring and alerting → reduced broken dashboards by ${accuracy}% and improved trust in reporting.`,
      `Optimized warehouse cost (partitioning + pruning + materializations) → reduced monthly spend by ${savings}%.`,
      `Designed event ingestion pipeline with backfill strategy → enabled reliable cohort analysis across ${12 + (h % 30)} events.`,
      `Introduced PII access controls and audit logs → improved compliance posture without blocking analytics workflows.`,
      `Standardized lineage and documentation → reduced onboarding time for analysts by ${10 + (h % 18)}%.`,
    ],
    data_scientist: [
      `Built forecasting model and evaluation framework → improved forecast accuracy by ${accuracy}% and reduced planning error.`,
      `Designed A/B tests with guardrails and power checks → increased confidence in decisions and reduced false-positive launches.`,
      `Shipped segmentation model for targeting → improved conversion by ${6 + (h % 12)}% while controlling CAC.`,
      `Implemented model monitoring (drift + performance) → detected degradation ${2 + (h % 3)} weeks earlier and prevented metric regression.`,
      `Partnered with engineering on productionization requirements → reduced time-to-deploy from ${8 + (h % 8)} weeks to ${4 + (h % 4)} weeks.`,
      `Built feature pipeline and reproducible training runs → increased experiment throughput by ${18 + (h % 22)}%.`,
    ],
    default: [],
    frontend: [],
    backend: [],
    fullstack: [],
    devops: [],
    ml: [],
    seo: [],
    paid: [],
    lifecycle: [],
    brand: [],
    growth: [],
    b2b: [],
    b2c: [],
  };

  const resumeBullets = clampList(bulletsByLane[lane] || bulletsByLane.data_analyst, 6, 10);

  const atsTips = clampList(
    [
      "Don’t hide metric definitions in prose. Put “metric ownership + definition doc + stakeholder usage” in bullets so ATS sees decision impact.",
      "If you list a BI tool, tie it to an outcome (adoption, time saved, decision speed) instead of “built dashboards”.",
      "Use data-ops signals: freshness SLA, backfills, data quality checks, lineage, access control — these separate strong candidates quickly.",
      "Mirror the company’s language: “activation”, “retention”, “forecasting”, “experiment analysis”, “semantic layer” — whichever appears repeatedly in the JD.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing SQL/Python/BI tools but no business decision outcome (what changed).",
      "Writing “built dashboards” without stating metric definitions, adoption, or how the dashboard was used (weekly exec review, ops cadence).",
      "Using “improved data quality” without specifying checks (null rate, uniqueness, freshness, reconciliation) and measured delta.",
      "Not clarifying scope: dataset size, #events, #tables, #stakeholders, SLA requirements.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Analyst vs engineer: analysts win on decision framing and stakeholder adoption; engineers win on reliability (freshness, backfills, quality monitoring).",
      "Senior candidates add governance: metric definitions, semantic layer, access control, and operating cadence — not just “built pipelines”.",
      "If you work cross-functionally, name the forum: weekly growth readout, exec dashboard review, or incident-style data outage postmortem.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildMarketingContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const lane = detectLane(cluster);

  const hook = [
    `If your ${cluster.role} resume gets rejected by ATS, it’s usually because the resume doesn’t name the exact signals screeners look for: channels, tooling, funnel metrics, and scope.`,
    `Use the keyword groups and bullet examples below to align your language to how ${cluster.role} hiring managers compare candidates — without keyword stuffing.`,
  ];

  const coreByLane: Record<Lane, string[]> = {
    default: [
      "channel mix planning",
      "campaign brief development",
      "audience segmentation",
      "UTM governance",
      "creative testing matrix",
      "funnel reporting",
      "budget pacing",
      "attribution analysis",
      "landing page CRO",
      "experiment design",
    ],
    seo: [
      "technical SEO audits",
      "keyword-to-page mapping",
      "content briefs (search intent)",
      "internal linking strategy",
      "SERP analysis",
      "schema markup",
      "canonicalization & redirects",
      "Core Web Vitals improvements",
      "link acquisition strategy",
      "crawl/index coverage fixes",
    ],
    paid: [
      "paid search account structure",
      "bid strategy & pacing",
      "creative iteration cadence",
      "audience exclusions",
      "conversion tracking QA",
      "ROAS optimization",
      "retargeting strategy",
      "incrementality testing",
      "landing page-message match",
      "budget reallocation rules",
    ],
    lifecycle: [
      "lifecycle segmentation",
      "triggered flows (behavioral)",
      "deliverability management",
      "list hygiene rules",
      "lead scoring alignment",
      "nurture sequences",
      "personalization logic",
      "holdout testing",
      "activation-to-retention reporting",
      "CRM field mapping",
    ],
    brand: [
      "brand positioning work",
      "creative briefing (brand)",
      "campaign narrative development",
      "Go-to-market messaging",
      "brand lift measurement",
      "agency management",
      "press & PR coordination",
      "partner co-marketing",
      "voice & tone guidelines",
      "content QA and approvals",
    ],
    growth: [
      "growth experiments backlog",
      "activation funnel optimization",
      "pricing page experiments",
      "paid + organic loops",
      "self-serve conversion improvements",
      "product-led growth motions",
      "retention cohort analysis",
      "experiment readouts to execs",
      "attribution dispute resolution",
      "full-funnel dashboarding",
    ],
    frontend: [],
    backend: [],
    fullstack: [],
    devops: [],
    ml: [],
    data_analyst: [],
    data_engineer: [],
    data_scientist: [],
    b2b: [],
    b2c: [],
  };

  const toolsByLane: Record<Lane, string[]> = {
    default: [
      "GA4",
      "Google Tag Manager",
      "Looker Studio",
      "HubSpot",
      "Salesforce",
      "Google Sheets",
      "Hotjar (or equivalent)",
      "Mixpanel (or Amplitude)",
      "Figma (brief review)",
      "Zapier (or Make)",
    ],
    seo: [
      "Google Search Console",
      "GA4",
      "Screaming Frog",
      "Ahrefs",
      "Semrush",
      "Google Tag Manager",
      "Looker Studio",
      "PageSpeed Insights",
      "Google Ads (for overlap)",
      "ContentKing (or similar)",
    ],
    paid: [
      "Google Ads",
      "Meta Ads Manager",
      "Google Tag Manager",
      "GA4",
      "Looker Studio",
      "LinkedIn Campaign Manager",
      "Microsoft Advertising",
      "Hotjar (or equivalent)",
      "Shopify (if ecom)",
      "HubSpot (lead routing)",
    ],
    lifecycle: [
      "HubSpot",
      "Marketo",
      "Braze",
      "Iterable",
      "Salesforce",
      "GA4",
      "Looker Studio",
      "Segment (CDP)",
      "SendGrid (or ESP)",
      "SQL (basic segmentation)",
    ],
    brand: [
      "Asana (or Jira)",
      "Notion (or Confluence)",
      "Figma",
      "Google Slides",
      "Brandwatch (or similar)",
      "GA4",
      "Looker Studio",
      "Sprout Social (or similar)",
      "Creator marketplace tools",
      "Press kit workflows",
    ],
    growth: [
      "Amplitude",
      "Mixpanel",
      "Optimizely (or VWO)",
      "GA4",
      "Google Tag Manager",
      "Looker Studio",
      "HubSpot",
      "Salesforce",
      "Stripe analytics",
      "SQL (product analytics)",
    ],
    frontend: [],
    backend: [],
    fullstack: [],
    devops: [],
    ml: [],
    data_analyst: [],
    data_engineer: [],
    data_scientist: [],
    b2b: [],
    b2c: [],
  };

  const industry = clampList(
    [
      pick(["MQL→SQL conversion", "CAC payback", "pipeline velocity", "ROAS", "LTV:CAC"], h),
      pick(["multi-touch attribution", "first-touch attribution", "last-touch attribution", "incrementality", "MMM"], h + 2),
      pick(["creative fatigue", "frequency capping", "audience overlap", "budget reallocation", "pacing alerts"], h + 4),
      pick(["messaging hierarchy", "value props", "ICP definition", "persona mapping", "offer architecture"], h + 6),
      pick(["A/B testing", "holdout tests", "cohort analysis", "lift measurement", "funnel drop-off"], h + 8),
      "UTM taxonomy",
      "conversion tracking",
      lane === "seo" ? "index coverage" : "lead routing",
      lane === "seo" ? "crawl budget" : "pipeline sourcing",
    ],
    6,
    10,
  );

  const softSkills = clampList(
    [
      "weekly performance readouts (exec-ready)",
      "sales + marketing SLA definition",
      "creative feedback loops with design",
      "agency briefing and KPI control",
      "stakeholder expectation management (launch dates)",
      "vendor evaluation (tooling ROI)",
      lane === "seo" ? "SEO ticket writing for engineering" : "campaign QA checklists under deadlines",
      lane === "brand" ? "narrative alignment across teams" : "budget tradeoff decisions (channel mix)",
    ],
    6,
    10,
  );

  const advanced = clampList(
    [
      lane === "seo" ? "international SEO (hreflang)" : "incrementality framework",
      lane === "seo" ? "programmatic SEO (template-based)" : "marketing mix modeling (MMM) literacy",
      lane === "paid" ? "creative performance model (angles × hooks)" : "attribution dispute resolution across tools",
      "exec dashboarding (leading indicators)",
      lane === "lifecycle" ? "CDP event taxonomy design" : "pipeline quality scoring (not volume)",
      "operating cadence (weekly, monthly, quarterly)",
      lane === "brand" ? "brand lift study planning" : "experiment governance (hypothesis tracking)",
    ],
    6,
    10,
  );

  const keywordGroups = buildKeywordGroups([
    { title: groupTitles.core, keywords: coreByLane[lane] || coreByLane.default },
    { title: groupTitles.tools, keywords: toolsByLane[lane] || toolsByLane.default },
    { title: groupTitles.industry, keywords: industry },
    { title: groupTitles.soft, keywords: softSkills },
    { title: groupTitles.advanced, keywords: advanced },
  ]);

  const budget = 15 + (h % 55);
  const roasLift = 18 + (h % 42);
  const cvrLift = 9 + (h % 17);
  const pipeline = 0.6 + ((h % 24) / 10);
  const months = 3 + (h % 7);
  const ctrLift = 12 + (h % 26);
  const churnCut = 6 + (h % 11);

  const bulletsByLane: Record<Lane, string[]> = {
    default: [
      `Built quarterly channel plan and reallocated budget weekly → improved CAC payback by ${8 + (h % 10)}% while holding spend flat ($${budget}k/month).`,
      `Launched 12-week campaign across paid + email + landing pages → increased demo requests by ${14 + (h % 21)}% and lifted landing-page CVR by ${cvrLift}%.`,
      `Implemented UTM governance + dashboarding in Looker Studio → reduced “unknown source” pipeline from ${22 + (h % 18)}% to ${8 + (h % 7)}% in ${months} months.`,
      `Partnered with Sales on lead routing + MQL definitions → raised MQL→SQL conversion from ${18 + (h % 10)}% to ${28 + (h % 12)}% within one quarter.`,
      `Standardized creative testing matrix (hooks × offers × audiences) → improved click-through rate by ${ctrLift}% and decreased CPA by ${10 + (h % 18)}%.`,
      `Owned agency relationship and weekly KPI reviews → delivered ${pipeline.toFixed(1)}M in sourced pipeline and improved forecast accuracy by ${7 + (h % 10)}%.`,
    ],
    seo: [
      `Ran technical SEO audit (indexing, canonicals, CWV) and shipped fixes with engineering → lifted non-brand organic sessions by ${22 + (h % 26)}% in ${months} months.`,
      `Built keyword-to-page map and rewrote titles/meta for ${55 + (h % 120)} priority URLs → increased top-3 rankings by ${14 + (h % 18)}% and improved CTR by ${ctrLift}%.`,
      `Set up Search Console + GA4 content dashboards → cut time-to-diagnose traffic drops from ${10 + (h % 8)} days to ${3 + (h % 3)} days.`,
      `Designed internal linking strategy for topic clusters → increased pages per session from ${2.1 + ((h % 9) / 10)} to ${2.8 + ((h % 10) / 10)} and reduced bounce by ${7 + (h % 9)}%.`,
      `Partnered on schema markup rollout (FAQ, Product, Article) → increased rich-result impressions by ${28 + (h % 35)}% over ${months} months.`,
      `Built SEO content brief template (intent + SERP gap + internal links) → improved publish-to-rank time by ${18 + (h % 20)}% across ${12 + (h % 20)} articles.`,
    ],
    paid: [
      `Restructured Google Ads account (themes, match types, negatives) → improved ROAS by ${roasLift}% and reduced wasted spend by ${9 + (h % 14)}% in ${months} months.`,
      `Implemented conversion tracking QA in GTM + GA4 (deduping + attribution sanity checks) → decreased “unattributed” conversions by ${16 + (h % 14)}%.`,
      `Built creative iteration cadence (weekly winners/losers) → improved CTR by ${ctrLift}% and lifted landing-page CVR by ${cvrLift}%.`,
      `Scaled retargeting with frequency caps and audience exclusions → reduced CPA by ${12 + (h % 20)}% while keeping conversion volume within ±${3 + (h % 5)}%.`,
      `Introduced budget pacing alerts and reallocation rules → avoided end-of-month overspend and improved budget efficiency by ${11 + (h % 14)}%.`,
      `Ran incrementality test (geo split) on branded search → reallocated ${6 + (h % 9)}% of spend to higher-lift campaigns without losing revenue.`,
    ],
    lifecycle: [
      `Built lifecycle segmentation (activation, onboarding, expansion) and launched triggered flows → increased activation rate by ${12 + (h % 16)}% in ${months} months.`,
      `Improved deliverability (domain warmup, list hygiene, suppression rules) → raised inbox placement by ${8 + (h % 10)}% and reduced spam complaints by ${2 + (h % 3)}x.`,
      `Designed nurture sequences tied to sales stages → improved SQL progression by ${10 + (h % 12)}% and shortened cycle time by ${6 + (h % 9)}%.`,
      `Implemented holdout testing for winback flows → quantified churn impact and reduced churn by ${churnCut}% over one quarter.`,
      `Aligned CRM fields + lead scoring with Sales Ops → reduced misrouted leads by ${18 + (h % 18)}% and improved follow-up SLA compliance.`,
      `Built lifecycle dashboard (cohorts, retention, conversion) → created weekly operating cadence and improved decision turnaround by ${9 + (h % 11)}%.`,
    ],
    brand: [
      `Led brand campaign narrative and creative briefing → increased aided awareness by ${8 + (h % 12)}pp and improved consideration by ${5 + (h % 9)}pp in post-campaign survey.`,
      `Owned agency workflow (briefs, deadlines, QA) across ${3 + (h % 4)} concurrent launches → shipped on time with <${2 + (h % 3)}% rework.`,
      `Built GTM messaging hierarchy (ICP pain → proof → offer) → improved landing-page engagement by ${10 + (h % 16)}% and reduced bounce by ${7 + (h % 9)}%.`,
      `Coordinated PR + partner co-marketing → delivered ${14 + (h % 24)} placements and drove ${18 + (h % 30)}% lift in direct traffic during launch window.`,
      `Set up social listening + weekly insights → identified ${4 + (h % 7)} recurring objections and fed them into copy updates across channels.`,
      `Standardized content QA and approvals → reduced review cycles from ${5 + (h % 3)} rounds to ${2 + (h % 2)} rounds.`,
    ],
    growth: [
      `Built growth experiment backlog and ran ${10 + (h % 18)} tests across onboarding + pricing → improved activation by ${12 + (h % 18)}% in ${months} months.`,
      `Instrumented funnel events and fixed tracking gaps → reduced analysis time per experiment by ${25 + (h % 20)}% and improved confidence in readouts.`,
      `Launched pricing page message-match experiments → increased self-serve conversion by ${9 + (h % 14)}% and improved trial-to-paid by ${6 + (h % 11)}%.`,
      `Combined paid + organic loops (retargeting + content) → improved blended CAC by ${10 + (h % 16)}% while scaling spend $${10 + (h % 30)}k/month.`,
      `Created exec-ready experiment readouts (hypothesis, lift, next steps) → increased adoption of winning changes across teams.`,
      `Built cohort reporting by acquisition channel → identified churn driver and reduced early churn by ${churnCut}% over one quarter.`,
    ],
    frontend: [],
    backend: [],
    fullstack: [],
    devops: [],
    ml: [],
    data_analyst: [],
    data_engineer: [],
    data_scientist: [],
    b2b: [],
    b2c: [],
  };

  const resumeBullets = clampList(bulletsByLane[lane] || bulletsByLane.default, 6, 10);

  const atsTips = clampList(
    [
      lane === "seo"
        ? "If you claim SEO, put proof near the top: one line with tool + scope + outcome (e.g., Search Console + crawl audit → +X% organic sessions)."
        : "Put your funnel metric in the summary (ROAS, CAC payback, pipeline sourced) so ATS and recruiters see role fit before they scroll.",
      lane === "paid"
        ? "Don’t write “paid ads” — name platforms and levers (match types/negatives, audiences, pacing rules, tracking QA)."
        : "Mirror the exact funnel language from the JD: MQL→SQL, pipeline sourced, activation, or retention — whichever is repeated.",
      "Spread keywords across: summary, skills, and the first 3 bullets in your latest role. ATS weights those areas more than a bottom skills dump.",
      lane === "lifecycle"
        ? "Include your lifecycle stack as a system: ESP/CRM + segmentation + triggers + holdout measurement — not a list of tools."
        : "If you list HubSpot/Salesforce, include one bullet that shows how you used it (routing, scoring, pipeline reporting), otherwise it reads like padding.",
      lane === "brand"
        ? "For brand roles, show measurement language (brand lift, aided awareness, consideration, SOV, direct traffic) so you don’t look creative-only."
        : "For performance roles, show the control system: pacing, tracking QA, and iteration cadence — that’s what senior reviewers scan for.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing channels without ownership (no budget, optimization levers, or reporting cadence).",
      lane === "seo"
        ? "Saying “did SEO” without naming the failure mode you fixed (indexing, canonicals, CWV, internal links) and the measured result."
        : "Saying “managed campaigns” without specifying channel mix, offer, audience, and the metric that moved.",
      lane === "paid"
        ? "Claiming ROAS improvements without clarifying attribution window/model or what actually changed (structure, negatives, creative, landing page)."
        : "Using brand language for a performance job (or vice versa), which makes the resume feel mismatched.",
      "Using a Skills section as a keyword dump instead of grouping by capability (Acquisition, Analytics, CRM, Creative ops).",
      lane === "lifecycle"
        ? "Mentioning email/SMS flows without describing triggers, segmentation rules, and holdout measurement."
        : "Not connecting marketing work to sales outcomes when the company is sales-led (pipeline, win rate, cycle time).",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "B2B vs B2C: B2B reviewers prioritize pipeline language (MQL→SQL, sourced pipeline, CAC payback); B2C reviewers prioritize ROAS, LTV, and repeat purchase metrics.",
      "Senior vs junior: seniors are screened on strategy and operating cadence (planning, tradeoffs, dashboards); juniors are screened on execution depth inside a channel (setup, QA, optimization levers).",
      lane === "brand"
        ? "Brand resumes win when you show measurement. Add one brand lift / consideration / SOV line even if most work is creative."
        : "Performance resumes win when you show diagnosis. Add one line that proves how you spot and fix performance (tracking QA + pacing + iteration cadence).",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildGenericCategoryContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const roleLower = cluster.role.toLowerCase();
  const impact = pick(CATEGORY_IMPACT_AREAS[cluster.category], h);
  const keywordA = getClusterKeywordSlice(cluster, 0, 1)[0] ?? "role fit";
  const keywordB = getClusterKeywordSlice(cluster, 1, 1)[0] ?? "measurable outcomes";

  const hook = [
    `ATS screens for ${cluster.role} candidates are pattern-based: they look for role vocabulary plus evidence lines that prove scope and outcomes, not broad claims.`,
    `Use the groups and bullet examples below to convert ${roleLower} responsibilities into measurable signals tied to ${keywordA} and ${keywordB}.`,
  ];

  const keywordGroups = buildKeywordGroups([
    { title: groupTitles.core, keywords: CATEGORY_KEYWORDS[cluster.category] },
    { title: groupTitles.tools, keywords: CATEGORY_SKILL_KEYWORDS[cluster.category] },
    {
      title: groupTitles.industry,
      keywords: clampList([keywordA, keywordB, impact, ...cluster.keywords.slice(0, 12)], 6, 10),
    },
    {
      title: groupTitles.soft,
      keywords: ["executive readouts", "handoff clarity", "risk callouts", "operating cadence", "stakeholder alignment", "decision logs", "SLA management"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["governance", "audit readiness", "process redesign", "forecasting accuracy", "root-cause analysis", "cross-team escalation handling", "quality controls"],
    },
  ]);

  const months = 2 + (h % 7);
  const deltaA = 10 + (h % 21);
  const deltaB = 6 + (h % 14);
  const baselineA = 70 + (h % 16);
  const baselineB = baselineA + 8 + (h % 10);

  const resumeBullets = clampList(
    [
      `Led ${keywordA} initiative → improved ${impact} by ${deltaA}% in ${months} months.`,
      `Redesigned core ${roleLower} workflow → raised quality KPI from ${baselineA}% to ${baselineB}% within two quarters.`,
      `Built weekly reporting cadence for leadership → reduced decision lag by ${14 + (h % 18)}% and increased follow-through.`,
      `Implemented QA checks and escalation path → reduced repeat issues by ${12 + (h % 18)}% while maintaining throughput.`,
      `Partnered cross-functionally to remove handoff bottleneck → cut cycle time by ${deltaB}% and reduced rework.`,
      `Owned stakeholder updates and tradeoffs → improved delivery reliability and clarity on next steps.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      `Use the exact target title (“${cluster.role}”) in your headline and match adjacent titles to the vacancy language.`,
      "Front-load evidence: make your first 3 bullets measurable and role-relevant before listing secondary work.",
      "Avoid keyword dumping. Place keywords inside proof lines (scope + outcome) so ATS and humans both trust them.",
      "Group Skills by capability areas and keep only tools you can demonstrate in bullets or projects.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Writing responsibilities only, with no scope (volume, budget, throughput, stakeholders) and no measured delta.",
      "Listing tools without showing how they were used (cadence, ownership, outputs, outcomes).",
      "Using broad verbs (“supported”, “helped”, “assisted”) instead of ownership verbs (“owned”, “led”, “shipped”, “standardized”).",
      "Burying the most role-relevant keywords below the fold while the summary stays generic.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Junior vs senior: juniors are evaluated on clean execution; seniors are evaluated on decision-making, tradeoffs, and operating cadence.",
      "Startup vs corporate: startups reward speed and ambiguity handling; corporates reward governance, scale, and risk management.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildProductContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.product, h);
  const roleLower = cluster.role.toLowerCase();
  const users = 40_000 + (h % 260_000);
  const weeks = 6 + (h % 10);
  const lift = 6 + (h % 14);
  const churnCut = 4 + (h % 9);
  const adoption = 12 + (h % 22);

  const hook = [
    `Product resumes fail ATS screens when they read like meeting notes: “worked with stakeholders”, “owned roadmap”, “wrote PRDs” — with no product metrics, no constraints, and no proof of impact.`,
    `Use the keywords and bullet examples below to make your ${cluster.role} resume read like a shipped product story: problem → decision → measurable outcome.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "product discovery",
        "PRD/spec writing",
        "roadmap prioritization",
        "user interviews",
        "experiment design",
        "requirements decomposition",
        "stakeholder alignment workshops",
        "launch readiness planning",
        "pricing/packaging collaboration",
        "post-launch analysis",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Jira",
        "Confluence (or Notion)",
        "Amplitude (or Mixpanel)",
        "GA4 (if web)",
        "Looker (or Tableau)",
        "Figma (handoff review)",
        "Miro (workshops)",
        "SQL (product queries)",
        "Feature flags",
        "A/B testing platform",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: [
        "activation funnel",
        "retention cohorts",
        "north star metric",
        "time-to-value",
        "feature adoption",
        "conversion rate",
        "churn drivers",
        "instrumentation plan",
        "release notes",
      ],
    },
    {
      title: groupTitles.soft,
      keywords: [
        "decision memos (tradeoffs)",
        "exec-ready roadmap readouts",
        "scope negotiation (must-have vs nice-to-have)",
        "customer escalation handling",
        "sales enablement alignment",
        "engineering sequencing alignment",
        "launch comms coordination",
      ],
    },
    {
      title: groupTitles.advanced,
      keywords: [
        "portfolio strategy",
        "multi-team roadmap governance",
        "metric taxonomy ownership",
        "risk register + mitigations",
        "incrementality literacy",
        "pricing experimentation",
        "cross-product dependency management",
      ],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Defined problem statement + success metrics, shipped MVP in ${weeks} weeks → increased ${impact} by ${lift}% across ${users.toLocaleString()} active users.`,
      `Built discovery pipeline (interviews + surveys + support logs) → identified top friction point and improved activation by ${adoption}% within one quarter.`,
      `Owned instrumentation plan and event taxonomy → reduced “unknown” funnel steps by ${18 + (h % 22)}% and improved decision confidence.`,
      `Ran A/B experiments with guardrails → improved conversion by ${lift}% while holding retention flat (no regression).`,
      `Partnered with engineering on rollout plan (feature flags + monitoring) → reduced launch incidents by ${12 + (h % 16)}% and improved release predictability.`,
      `Analyzed churn drivers and shipped targeted fixes → reduced churn by ${churnCut}% over ${8 + (h % 8)} weeks.`,
      `Created sales enablement assets and positioning doc → increased adoption in sales-led deals by ${10 + (h % 16)}% and improved cycle time.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      `Put one metric in the summary that matches the job’s KPI (activation, retention, conversion, time-to-value). ATS and humans both scan for it.`,
      "Don’t write “owned roadmap” without proof. Add a bullet that shows the decision logic: inputs, tradeoff, and measured result.",
      "If the JD is B2B, use pipeline language (activation, expansion, retention) and name collaboration with Sales/CS. If it’s B2C, lean on conversion, cohorts, and growth loops.",
      "Show execution system: discovery → spec → build → launch → measurement. ATS likes repeated terms across those phases.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing ceremonies (“grooming, standups”) instead of product outcomes (metric movement).",
      "Writing “worked with stakeholders” without naming the artifact (decision memo, roadmap readout, spec) and the decision it enabled.",
      "Claiming “data-driven” while never naming the data source (Amplitude, SQL, support logs) or the metric definition.",
      "Describing launches without rollout controls (flags, monitoring, guardrails), which senior reviewers expect to see.",
      "Mixing multiple product types (platform, growth, enterprise) without clarifying which one you’re targeting in headline/summary.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Junior vs senior PM: juniors are screened on clean execution (specs, launches, analytics); seniors are screened on decision quality (tradeoffs, portfolio, alignment, operating cadence).",
      "B2B vs B2C: B2B resumes win with adoption/retention and cross-functional GTM alignment; B2C resumes win with conversion/cohorts and experimentation velocity.",
      `For competitive PM roles, add a “decision memo” bullet that shows tradeoffs explicitly (scope, timeline, risk) — it’s a fast senior signal.`,
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildSalesContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const roleLower = cluster.role.toLowerCase();
  const quota = 600 + (h % 1400);
  const attainment = 92 + (h % 28);
  const winRate = 18 + (h % 18);
  const cycle = 45 + (h % 55);
  const pipeline = 1.2 + ((h % 28) / 10);

  const hook = [
    `Sales ATS screens are ruthless because the bar is numeric. If your ${cluster.role} resume doesn’t show quota context, motion, and results, it reads like “sales responsibilities” and gets filtered.`,
    `Use the keywords and bullet examples below to make your resume look like a revenue operator: territory, pipeline math, and outcomes.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "outbound sequencing",
        "discovery calls (MEDDICC/MEDDIC)",
        "qualification frameworks",
        "multi-threading accounts",
        "deal strategy (mutual action plan)",
        "objection handling by persona",
        "pipeline hygiene",
        "forecast commit discipline",
        "renewal/expansion motion",
        "negotiation (redlines + give/gets)",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Salesforce",
        "HubSpot CRM",
        "Outreach (or Salesloft)",
        "LinkedIn Sales Navigator",
        "Gong (or Chorus)",
        "Clari (or Forecast tool)",
        "ZoomInfo (or Apollo)",
        "DocuSign",
        "Google Sheets (pipeline math)",
        "CPQ (if used)",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: [
        "quota attainment",
        "pipeline coverage",
        "win rate",
        "sales cycle length",
        "ACV/ARR",
        "stage conversion",
        "deal slippage",
        "land-and-expand",
        "renewal rate",
      ],
    },
    {
      title: groupTitles.soft,
      keywords: [
        "exec sponsor mapping",
        "procurement navigation",
        "stakeholder multi-threading",
        "mutual action plan facilitation",
        "QBR execution",
        "hand-off to CS (success plan)",
      ],
    },
    {
      title: groupTitles.advanced,
      keywords: [
        "territory strategy",
        "partner/channel co-selling",
        "forecast governance",
        "deal desk collaboration",
        "pricing/discount guardrails",
        "enablement (playbooks)",
      ],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Closed $${pipeline.toFixed(1)}M in new ARR and finished at ${attainment}% of $${quota}k annual quota by running weekly pipeline hygiene and deal reviews.`,
      `Improved win rate to ${winRate}% by tightening discovery (MEDDICC) and building mutual action plans for late-stage deals.`,
      `Built outbound sequences by ICP segment → generated ${38 + (h % 70)} SQLs and created $${0.7 + ((h % 18) / 10)}M in pipeline in one quarter.`,
      `Reduced sales cycle from ${cycle} to ${cycle - (8 + (h % 14))} days by multi-threading accounts and aligning procurement early.`,
      `Partnered with Solutions Engineering to run demos + POCs → increased stage conversion by ${9 + (h % 14)}% without increasing discounting.`,
      `Improved forecast accuracy by ${10 + (h % 14)}% through commit criteria and slippage retro reviews (Clari/Salesforce).`,
      `Executed renewals and expansion motion → increased renewal rate by ${6 + (h % 10)}pp and expanded key accounts by $${80 + (h % 220)}k.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      `Put quota context in the summary (quota size + attainment + motion). ATS and recruiters immediately look for it.`,
      "Name your motion and market: inbound/outbound, SMB/MM/Enterprise, ACV band, and sales cycle length.",
      "If you list a framework (MEDDICC, SPICED), tie it to an outcome (win rate, cycle time, stage conversion).",
      "Use CRM/tool keywords only where you show discipline: hygiene, forecasting, sequences, call analysis, and pipeline math.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      `Writing “managed full sales cycle” without numbers (quota, ARR, ACV, win rate, cycle length) — ATS can’t infer performance.`,
      "Listing tools (Salesforce, Outreach) with no proof of usage (sequence strategy, hygiene, forecasting).",
      "Not clarifying motion (new logo vs expansion) which makes the resume feel mismatched to the JD.",
      "Using vague verbs (“built relationships”) instead of deal evidence (multi-threaded, MAP, exec sponsor, procurement).",
      "Hiding performance in a paragraph instead of bullets that can be scanned in 10 seconds.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "SMB vs Enterprise: SMB resumes win with volume + cycle speed; Enterprise resumes win with multi-threading, procurement navigation, and deal strategy artifacts (MAP, exec sponsors).",
      "Senior sellers add operating system: territory plan, pipeline coverage targets, forecast discipline, and deal reviews — not just “hit quota”.",
      `If you’re targeting ${roleLower} roles, ensure your top 2 bullets include quota context and one “how” line (motion + levers).`,
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildDesignContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.design, h);
  const roleLower = cluster.role.toLowerCase();
  const lift = 8 + (h % 18);
  const time = 2 + (h % 6);
  const flows = 4 + (h % 10);

  const hook = [
    `Design resumes get filtered when they list tools (Figma) but don’t prove design outcomes: usability, accessibility, conversion, or consistency at scale.`,
    `Use the keywords and bullet examples below to make your ${cluster.role} resume read like a product impact portfolio — even without linking the work.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "user flows and task analysis",
        "information architecture",
        "interaction design patterns",
        "usability testing (moderated/unmoderated)",
        "accessibility (WCAG)",
        "design system contribution",
        "prototype validation",
        "handoff specs (states, edge cases)",
        "content design collaboration",
        "design QA in production",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Figma",
        "FigJam",
        "Maze (or UserTesting)",
        "Hotjar (or FullStory)",
        "Storybook (review)",
        "Zeroheight (or design system docs)",
        "Jira",
        "Notion (or Confluence)",
        "Google Analytics (behavior)",
        "Miro",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: [
        "design tokens",
        "component variants",
        "accessibility audit",
        "funnel drop-off",
        "error states",
        "empty states",
        "heuristic review",
        "usability score",
      ],
    },
    {
      title: groupTitles.soft,
      keywords: [
        "workshop facilitation",
        "tradeoff framing (scope vs UX)",
        "stakeholder alignment on constraints",
        "engineering handoff QA",
        "design critique leadership",
        "customer interview synthesis",
      ],
    },
    {
      title: groupTitles.advanced,
      keywords: [
        "design system governance",
        "accessibility strategy",
        "multi-product consistency",
        "research ops cadence",
        "UX metrics instrumentation",
        "cross-team design standards",
      ],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Redesigned ${flows} critical user flows and validated via usability tests → increased ${impact} by ${lift}% within ${time} months.`,
      `Built design system components (tokens, variants, states) → reduced UI inconsistencies by ${18 + (h % 22)}% and sped up delivery across teams.`,
      `Ran accessibility audit and partnered on fixes → improved WCAG compliance and reduced support tickets by ${10 + (h % 16)}%.`,
      `Shipped error/empty state patterns and UX copy standards → reduced task failure rate by ${8 + (h % 12)}%.`,
      `Created handoff specs and production QA checklist → cut design-to-dev rework by ${14 + (h % 20)}% across releases.`,
      `Synthesized user interviews into opportunity areas → influenced roadmap and improved stakeholder decision speed.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      `Put outcome keywords in bullets (completion rate, conversion, accessibility, consistency). ATS doesn’t know what “good UX” means without metrics.`,
      "If you list a design system, show proof: components shipped, adoption, and rework reduction.",
      "Use design language ATS parses: flows, IA, prototypes, usability testing, accessibility audits, tokens, variants, edge cases.",
      "Tailor to role type: Product Designer resumes should emphasize product metrics and cross-functional delivery; UX Research roles should emphasize research methods and decision impact.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing Figma/Sketch as “skills” with no evidence of shipped outcomes or validated decisions.",
      "Writing “collaborated with engineers” without specifying handoff artifacts (states, specs, QA checklist).",
      "Avoiding all metrics. Even proxy metrics (task completion, drop-off, support tickets, time-on-task) are better than none.",
      "Describing screens instead of problems, constraints, and the tradeoffs you made.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Startup vs corporate: startups value end-to-end shipping and pragmatic tradeoffs; corporates value system consistency, accessibility, and governance.",
      "Senior designers add systems: design tokens, documentation, critique cadence, and measurable adoption — not just “designed UI”.",
      `If you’re targeting ${roleLower} roles, make sure your first 2 bullets show validation method + measurable outcome.`,
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildFinanceContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.finance, h);
  const closeDays = 7 + (h % 6);
  const accuracy = 4 + (h % 10);
  const savings = 6 + (h % 14);
  const roleLower = cluster.role.toLowerCase();

  const hook = [
    `Finance resumes get filtered when they list responsibilities (“budgeting”, “reporting”) but don’t show the decision impact: forecast accuracy, close speed, margin, or cost control.`,
    `Use the keywords and bullets below to make your ${cluster.role} resume read like finance work: models, controls, cadence, and measurable outcomes.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "FP&A forecasting",
        "variance analysis",
        "budget ownership",
        "cash flow modeling",
        "unit economics",
        "scenario planning",
        "monthly close partnership",
        "board / exec reporting",
        "revenue recognition basics",
        "cost optimization analysis",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Excel (models)",
        "Google Sheets",
        "Power BI (or Tableau)",
        "NetSuite (or ERP)",
        "SQL (basic pulls)",
        "Looker (or BI)",
        "Anaplan (if used)",
        "QuickBooks (if used)",
        "Workday (if used)",
        "Google Slides (packs)",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: [
        "forecast accuracy",
        "rolling forecast",
        "budget vs actuals",
        "gross margin",
        "opex control",
        "headcount planning",
        "run-rate analysis",
        "SOX controls (if applicable)",
      ],
    },
    {
      title: groupTitles.soft,
      keywords: [
        "exec-ready reporting packs",
        "stakeholder variance walkthroughs",
        "assumption negotiation",
        "finance business partnering cadence",
        "risk callouts (runway)",
        "close-calendar enforcement",
      ],
    },
    {
      title: groupTitles.advanced,
      keywords: [
        "driver-based forecasting",
        "pricing / margin analysis",
        "cost governance process",
        "multi-entity consolidation support",
        "KPI taxonomy ownership",
        "audit readiness",
      ],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Owned rolling forecast and improved forecast accuracy by ${accuracy}% by tightening assumptions and weekly variance reviews.`,
      `Built driver-based model for ${roleLower} planning → improved ${impact} visibility and reduced decision lag in exec reviews.`,
      `Shortened monthly close cycle by ${closeDays} days by enforcing close calendar and automating reconciliations with finance ops.`,
      `Identified cost leakage via spend analysis → reduced opex by ${savings}% without impacting delivery SLAs.`,
      `Created board-ready reporting pack (KPI trends + risks + scenarios) → improved stakeholder alignment on runway and priorities.`,
      `Standardized budget vs actuals cadence across departments → reduced reforecast churn and improved accountability.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "In the summary, name the finance lane: FP&A, reporting, close, revenue, or cost control — and attach one metric (accuracy, close days, margin).",
      "Put model artifacts in bullets: driver-based model, scenario planning, unit economics, headcount planning — ATS matches those phrases strongly.",
      "If you list ERP/BI tools, tie them to an output (close, reporting pack, consolidation) and a measurable improvement.",
      "Mirror the company’s vocabulary: gross margin vs contribution margin, ARR vs revenue, runway vs cash flow — whichever appears in the JD.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Writing “budgeting/forecasting” without stating forecast horizon, cadence, and measured accuracy improvement.",
      "Listing Excel as a skill without describing the model type (driver-based, scenario, unit economics) and its decision use.",
      "Avoiding scope: $ budget size, #departments, close days, reporting cadence, stakeholder count.",
      "Using generic “improved reporting” language without proving what changed (time saved, accuracy, decision speed).",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Startup vs corporate: startups want runway, cash burn, and fast scenario planning; corporates want close discipline, controls, and audit readiness.",
      "Senior finance candidates show governance: assumptions, cadence, stakeholder alignment, and decision framing — not just spreadsheets.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildHRContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.hr, h);
  const tth = 28 + (h % 35);
  const passThrough = 16 + (h % 20);
  const retention = 6 + (h % 10);
  const roleLower = cluster.role.toLowerCase();

  const hook = [
    `HR resumes get rejected when they rely on broad claims (“improved culture”, “handled recruiting”) without operational proof: systems, process design, time-to-hire, retention, or compliance outcomes.`,
    `Use the keywords and bullet examples below to position your ${cluster.role} resume around measurable people ops and hiring signals.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "structured interviewing",
        "sourcing strategy",
        "pipeline conversion tracking",
        "offer process management",
        "onboarding program design",
        "performance review cycles",
        "policy drafting and rollout",
        "employee relations case handling",
        "comp bands alignment",
        "engagement survey action plans",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Workday (or HRIS)",
        "Greenhouse (or Lever)",
        "LinkedIn Recruiter",
        "Gem (or CRM)",
        "Google Sheets (tracking)",
        "DocuSign (offers)",
        "Lattice (or Culture Amp)",
        "Slack workflows",
        "Notion (process docs)",
        "Jira (hiring tickets)",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: [
        "time-to-hire",
        "candidate quality",
        "offer acceptance rate",
        "DEI sourcing",
        "interview loop design",
        "policy compliance",
        "manager enablement",
        "onboarding ramp time",
      ],
    },
    {
      title: groupTitles.soft,
      keywords: [
        "calibration facilitation",
        "difficult conversation handling",
        "stakeholder alignment on headcount",
        "confidential case management",
        "manager coaching",
        "exec-ready people metrics",
      ],
    },
    {
      title: groupTitles.advanced,
      keywords: [
        "workforce planning",
        "compensation frameworks",
        "policy governance",
        "org design support",
        "HR analytics dashboarding",
        "vendor evaluation (HR tech)",
      ],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Redesigned interview loops and structured scorecards → increased onsite-to-offer pass-through by ${passThrough}% and reduced time-to-hire to ${tth} days.`,
      `Built recruiting dashboard (stage conversion + aging) → improved ${impact} and reduced stalled candidates by ${18 + (h % 22)}%.`,
      `Implemented onboarding program and manager checklists → reduced ramp time by ${10 + (h % 18)}% and improved 90-day retention by ${retention}pp.`,
      `Owned employee relations cases with clear documentation → reduced repeat incidents and improved policy compliance.`,
      `Launched performance review cadence and calibration process → improved manager consistency and reduced review-cycle delays.`,
      `Partnered with leadership on headcount planning → aligned hiring priorities to business goals with monthly reporting.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Put one measurable people metric in summary: time-to-hire, offer acceptance rate, retention, engagement change, or compliance outcomes.",
      "If you list ATS/HRIS tools, include one bullet showing how you used them (pipeline reporting, loop design, process automation).",
      "Use operational phrases ATS matches: structured interviewing, scorecards, calibration, interview loop design, onboarding program, policy rollout.",
      `Match language to your target: ${roleLower} roles that are recruiting-heavy should lead with sourcing and pipeline conversion; people-ops roles should lead with HRIS/process and retention.`,
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Saying “managed recruiting” without stage conversion, time-to-hire, and the mechanism you improved (loops, scorecards, sourcing channels).",
      "Listing DEI without describing specific levers (sourcing mix, structured interviews, rubric changes) and outcomes.",
      "Avoiding hard situations: employee relations and policy work need evidence language (documentation, process, outcomes).",
      "Putting all tools in Skills with no proof lines — ATS may match, but humans won’t trust it.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Startup vs corporate HR: startups value process creation (from zero) and speed; corporates value governance, consistency, and compliance.",
      "Senior HR resumes win with operating cadence: reporting, calibration, workforce planning — plus the measured outcomes.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildSecurityContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.security, h);
  const mttd = 18 + (h % 35);
  const mttr = 22 + (h % 45);
  const vulns = 30 + (h % 90);

  const hook = [
    `Security resumes get filtered when they list tools (SIEM, Splunk) but don’t show security outcomes: detection coverage, response time, vuln closure, or audit readiness.`,
    `Use the keywords and bullet examples below to make your ${cluster.role} resume read like security work: controls, incidents, and measurable risk reduction.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "incident response playbooks",
        "detection engineering",
        "threat hunting",
        "vulnerability management",
        "IAM controls",
        "security logging standards",
        "cloud security posture",
        "phishing response process",
        "audit evidence collection",
        "risk assessment",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Splunk (or SIEM)",
        "EDR (CrowdStrike or similar)",
        "Okta (or IAM)",
        "AWS security tools",
        "Tenable (or vuln scanner)",
        "Jira (IR tickets)",
        "Slack/Zoom (incident comms)",
        "Python (automation)",
        "Bash",
        "GRC tooling (if used)",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: ["MTTD", "MTTR", "control coverage", "attack surface", "least privilege", "SOC runbooks", "alert tuning", "false positive reduction"],
    },
    {
      title: groupTitles.soft,
      keywords: ["incident comms timeline", "post-incident retros", "stakeholder risk briefings", "security training rollout", "engineering partnership (tickets)"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["threat modeling", "audit readiness", "security control roadmap", "cloud control baseline", "detection-as-code", "policy governance"],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Implemented detection rules and alert tuning → reduced MTTD by ${mttd}% and lowered false positives by ${18 + (h % 22)}%.`,
      `Built incident response playbooks and comms cadence → reduced MTTR by ${mttr}% across high-severity incidents.`,
      `Owned vulnerability management program → closed ${vulns} critical/high vulns and improved patch SLA compliance by ${10 + (h % 16)}%.`,
      `Hardened IAM (least privilege + access reviews) → reduced privileged access sprawl and improved audit readiness.`,
      `Automated triage via Python scripts → reduced analyst manual workload by ${12 + (h % 18)}% and improved response consistency.`,
      `Partnered with engineering on security tickets and acceptance criteria → improved ${impact} and reduced repeat findings.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Lead with measurable security outcomes: MTTD/MTTR, vuln closure, detection coverage, false positive reduction, audit readiness.",
      "If you list a security tool, add one bullet showing how it changed the security outcome (tuning rules, automation, playbooks).",
      "Use security language ATS matches: IAM, least privilege, incident response, vulnerability management, detection engineering, runbooks.",
      "Clarify scope: cloud provider, environment size, #alerts/day, vuln SLA, audit type — it makes impact credible.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing tools only (Splunk, EDR) with no measurable improvement in detection/response.",
      "Writing “handled incidents” without severity, response process, or MTTD/MTTR change.",
      "Claiming “improved security posture” without naming controls (IAM reviews, patch SLAs, alert tuning, runbooks).",
      "Avoiding scope numbers, which makes security impact hard to evaluate.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "SOC vs AppSec: SOC resumes win on detection + response metrics; AppSec resumes win on threat modeling, secure SDLC, and vuln closure in pipelines.",
      "Senior security candidates show control roadmaps and governance (baselines, audits, policy rollout) in addition to incident work.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildOperationsContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.operations, h);
  const cycle = 12 + (h % 28);
  const sla = 8 + (h % 16);
  const cost = 6 + (h % 14);

  const hook = [
    `Operations resumes get filtered when they say “process improvement” without naming the process, the SLA, and the measured delta.`,
    `Use the keywords and bullet examples below to make your ${cluster.role} resume read like ops work: workflows, SLAs, throughput, and cost control.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "process mapping",
        "SLA definition",
        "workflow standardization",
        "capacity planning",
        "vendor management",
        "root-cause analysis",
        "SOP documentation",
        "handoff redesign",
        "KPI dashboards",
        "continuous improvement cadence",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Excel/Sheets",
        "SQL (basic)",
        "Power BI (or Tableau)",
        "Jira (ops queue)",
        "Notion (SOPs)",
        "Zapier (automation)",
        "ERP (if used)",
        "Asana (workflows)",
        "Zendesk (if support ops)",
        "Google Slides (ops readouts)",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: ["cycle time", "throughput", "SLA compliance", "queue aging", "cost per unit", "error rate", "handoff delays", "process controls"],
    },
    {
      title: groupTitles.soft,
      keywords: ["stakeholder SLA negotiation", "incident-style retros", "cross-team escalation handling", "vendor KPI reviews", "exec-ready ops reporting"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["operating model design", "controls and auditability", "multi-region ops alignment", "tooling ROI decisions", "org-wide process governance"],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Mapped end-to-end workflow and removed handoff bottleneck → reduced cycle time by ${cycle}% and improved ${impact} within one quarter.`,
      `Defined SLAs and built queue dashboard → improved SLA compliance by ${sla}% and reduced backlog volatility.`,
      `Standardized SOPs and QA checks → reduced error rate by ${12 + (h % 18)}% while maintaining throughput.`,
      `Optimized vendor process (scorecards + QBRs) → reduced cost per unit by ${cost}% without degrading quality.`,
      `Automated recurring reporting and handoffs → reduced manual ops effort by ${18 + (h % 24)}% and improved predictability.`,
      `Created weekly ops readout (KPIs + risks + actions) → reduced decision lag and improved accountability.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Name the process you improved (onboarding, fulfillment, support queue, vendor operations) and the measurable delta (cycle time, SLA, cost).",
      "Use ops metrics ATS parses cleanly: SLA %, cycle time %, cost per unit, throughput/day, backlog aging.",
      "If you list tools (ERP, BI, automation), attach them to an outcome in bullets — otherwise it reads like padding.",
      "Put your strongest process win in the first 3 bullets. Ops hiring is comparison-heavy.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Writing “process improvement” without naming the process and the metric moved.",
      "Listing dashboards/BI without showing adoption (cadence, stakeholders) and decision impact.",
      "Ignoring control language (SOPs, QA checks, SLAs) which is what ops teams screen for.",
      "No scope: teams supported, volume handled, vendors managed, or throughput.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Startup ops: show building from scratch (SOPs, tooling, SLAs). Corporate ops: show governance, scale, and auditability.",
      "Senior ops candidates show operating cadence (weekly KPIs, risk management, escalation paths) in addition to improvements.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildCustomerContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.customer, h);
  const nrr = 102 + (h % 25);
  const churn = 4 + (h % 10);
  const time = 14 + (h % 26);

  const hook = [
    `Customer Success resumes get filtered when they say “managed accounts” without renewal, adoption, and risk signals. Hiring teams screen for retention math.`,
    `Use the keywords and bullet examples below to position your ${cluster.role} resume around adoption, renewals, and measurable account outcomes.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "onboarding plans",
        "success plans",
        "account health scoring",
        "renewal management",
        "QBR facilitation",
        "risk mitigation playbooks",
        "product adoption enablement",
        "stakeholder mapping",
        "escalation handling",
        "expansion identification",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "Salesforce",
        "Gainsight (or Totango)",
        "Zendesk (or Intercom)",
        "Looker (or Tableau)",
        "Google Sheets",
        "Jira (product issues)",
        "Slack (customer channels)",
        "Notion (playbooks)",
        "Zoom (QBRs)",
        "Product analytics (Amplitude)",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: ["NRR", "GRR", "churn drivers", "product adoption", "time-to-value", "renewal rate", "expansion ARR", "account health"],
    },
    {
      title: groupTitles.soft,
      keywords: ["exec sponsor alignment", "QBR storytelling with metrics", "difficult renewal conversations", "internal escalation coordination", "success plan negotiation"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["portfolio segmentation", "renewal forecasting", "health score model design", "CS playbook governance", "cross-functional retention programs"],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Owned portfolio renewals and delivered ${nrr}% NRR by running weekly risk reviews and executive QBRs with success plans.`,
      `Reduced churn by ${churn}% by building risk playbooks (usage drops, support escalations) and coordinating product fixes.`,
      `Improved time-to-value from ${time} to ${time - (4 + (h % 6))} days by rebuilding onboarding plan and stakeholder mapping.`,
      `Implemented account health scoring and adoption dashboards → increased adoption by ${10 + (h % 18)}% across key accounts.`,
      `Partnered with Sales on expansion plays → sourced $${120 + (h % 380)}k in expansion ARR and improved forecast confidence.`,
      `Created escalation process with product/engineering → reduced repeat high-severity incidents by ${12 + (h % 18)}%.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Put retention math in summary: NRR/GRR, renewal rate, churn reduction, portfolio size, and segment (SMB/MM/Enterprise).",
      "Show your CS system: onboarding → success plan → QBR → renewal → expansion. ATS likes consistent lifecycle language.",
      "If you list CS tooling (Gainsight/Totango), attach it to an outcome (health scoring, risk detection, renewal forecasting).",
      "Name your collaboration interface with Product: escalations, feedback loops, roadmap inputs — and the measurable effect on churn/adoption.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Writing “managed accounts” with no portfolio size, segment, or renewal metrics.",
      "Listing QBRs and onboarding without stating the outcome (time-to-value, adoption, churn).",
      "Using support language without escalation process or reduction in repeat incidents.",
      "Not distinguishing renewal vs expansion work, which changes what hiring teams expect.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "B2B CS hiring teams prioritize retention math and executive stakeholder management; B2C support-heavy roles prioritize SLA, throughput, and ticket deflection.",
      "Senior CSMs show portfolio segmentation, health scoring models, and renewal forecasting — not just “handled renewals”.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildLegalContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.legal, h);
  const days = 10 + (h % 25);
  const risk = 12 + (h % 22);

  const hook = [
    `Legal resumes get filtered when they list “contract review” without scope: contract types, turnaround time, risk posture, and stakeholder outcomes.`,
    `Use the keywords and bullet examples below to make your ${cluster.role} resume read like legal work: risk, governance, and measurable turnaround.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "contract negotiation",
        "redlining and fallback positions",
        "contract lifecycle management",
        "risk assessment",
        "policy drafting",
        "regulatory compliance",
        "stakeholder advisory",
        "template standardization",
        "legal ops process design",
        "commercial terms review",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "CLM (Ironclad or equivalent)",
        "DocuSign",
        "Google Docs (redlines)",
        "Salesforce (deal intake)",
        "Jira (legal queue)",
        "Slack (intake)",
        "Notion (playbooks)",
        "Contract templates",
        "eSignature workflows",
        "Knowledge base",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: ["turnaround time (TAT)", "risk posture", "fallback positions", "DPA review", "MSA/SOW", "NDA standards", "compliance audits", "policy governance"],
    },
    {
      title: groupTitles.soft,
      keywords: ["stakeholder training", "deal desk partnership", "risk communication to execs", "playbook enforcement", "cross-functional escalation handling"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["contract playbook strategy", "regulatory roadmap", "legal ops metrics", "template library governance", "risk committee reporting"],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Reduced contract turnaround time by ${days}% by standardizing templates and routing intake through CLM workflows.`,
      `Negotiated MSAs/SOWs with clear fallback positions → reduced legal risk exposure by ${risk}% while keeping deal velocity.`,
      `Built legal intake process and queue triage → improved ${impact} and reduced stakeholder wait times.`,
      `Drafted and rolled out policy updates with training → improved compliance posture and reduced repeat issues.`,
      `Partnered with Sales/Procurement on redlines → increased close rate and reduced late-stage surprises.`,
      `Created clause library and playbook → improved consistency across negotiations and reduced rework.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Name contract types and outcomes (TAT reduction, risk posture, deal velocity). ATS won’t infer scope from “contract review”.",
      "If you list CLM, show the workflow change (intake, triage, templates) and the measured impact.",
      "Use legal language from the JD (MSA, DPA, SOW, policy governance, regulatory compliance) and attach it to proof lines.",
      "Add one line showing stakeholder advisory: how you communicated risk and enabled a business decision.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing contracts without outcomes (turnaround time, risk reduction, consistency, deal velocity).",
      "Writing “supported sales” without naming the artifact (playbook, clause library, intake process).",
      "Avoiding scope: contract volume, stakeholder groups, risk categories, regulatory domains.",
      "Using generic “compliance” language with no audit/control proof.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Startup legal: show building templates/intake from scratch. Corporate legal: show governance, compliance, and consistency at scale.",
      "Senior legal candidates show playbooks and risk communication systems, not just negotiation volume.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildHealthcareContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.healthcare, h);
  const throughput = 8 + (h % 18);
  const errors = 10 + (h % 22);
  const roleLower = cluster.role.toLowerCase();

  const hook = [
    `Healthcare resumes get filtered when they list “patient care” but don’t show compliance language, documentation quality, and measurable outcomes (throughput, safety, coordination).`,
    `Use the keywords and bullet examples below to position your ${cluster.role} resume around clinical reliability, documentation, and quality metrics.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "clinical documentation",
        "care coordination",
        "patient safety protocols",
        "triage and prioritization",
        "treatment plan adherence",
        "medication reconciliation",
        "quality improvement (QI)",
        "discharge planning",
        "infection control basics",
        "HIPAA compliance",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "EHR (Epic or equivalent)",
        "clinical notes workflows",
        "order entry (CPOE)",
        "patient scheduling systems",
        "chart review",
        "secure messaging",
        "telehealth workflows (if used)",
        "Excel/Sheets (QI tracking)",
        "incident reporting tools",
        "care pathways",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: ["HIPAA", "HEDIS (if applicable)", "patient throughput", "documentation accuracy", "handoff communication", "clinical coordination", "quality audits"],
    },
    {
      title: groupTitles.soft,
      keywords: ["handoff communication (SBAR)", "difficult conversations", "multidisciplinary rounds", "family education", "escalation handling"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["QI initiatives", "workflow redesign", "audit readiness", "clinical training", "protocol rollout", "care delivery optimization"],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Improved ${impact} by standardizing documentation and handoff checks → reduced documentation errors by ${errors}% within one quarter.`,
      `Coordinated care plans across multidisciplinary team → improved patient throughput by ${throughput}% while maintaining safety protocols.`,
      `Implemented discharge planning checklist → reduced readmission risk flags and improved follow-up compliance.`,
      `Partnered on QI initiative and tracked outcomes weekly → improved protocol adherence and reduced avoidable incidents.`,
      `Maintained HIPAA-safe workflows and accurate charting → improved audit readiness with consistent documentation.`,
      `Educated patients/families with clear plans → improved adherence and reduced confusion-related callbacks.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Use compliance language ATS matches: HIPAA, EHR, clinical documentation, patient safety protocols.",
      `Name your environment (unit/setting) and scope (patient volume, shift pattern) if relevant — it helps screeners map fit for ${roleLower}.`,
      "Avoid generic “provided care” lines. Use proof language: documentation accuracy, throughput, safety outcomes, coordination outcomes.",
      "If you list EHR experience, show a bullet that demonstrates documentation quality or workflow improvement.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing “patient care” without documentation/compliance signals (EHR, HIPAA, protocols).",
      "No measurable outcomes (throughput, error reduction, coordination, quality metrics).",
      "Not naming the setting or patient population, which makes the resume hard to match.",
      "Using vague language around safety and quality with no workflow or protocol proof.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "Clinical vs operations-heavy roles: clinical resumes win on documentation, safety, and coordination; operations roles win on throughput, workflow redesign, and audit readiness.",
      "Senior healthcare candidates show QI initiatives and protocol rollouts with measured outcomes, not just tenure.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

function buildEducationContent(cluster: ResumeKeywordCluster, _language: Language): ResumeKeywordLandingContent {
  const groupTitles = GROUP_TITLES[_language] || GROUP_TITLES.en;
  const h = hashForRole(cluster);
  const impact = pick(CATEGORY_IMPACT_AREAS.education, h);
  const completion = 8 + (h % 18);
  const roleLower = cluster.role.toLowerCase();

  const hook = [
    `Education resumes get filtered when they rely on broad claims (“taught students”, “developed lessons”) without evidence of outcomes: completion, assessment lift, program quality, or engagement.`,
    `Use the keywords and bullet examples below to make your ${cluster.role} resume read like measurable instruction and program outcomes.`,
  ];

  const keywordGroups = buildKeywordGroups([
    {
      title: groupTitles.core,
      keywords: [
        "curriculum development",
        "lesson planning",
        "student assessment design",
        "differentiated instruction",
        "learning outcomes mapping",
        "progress monitoring",
        "classroom management systems",
        "student support plans",
        "program evaluation",
        "instructional coaching",
      ],
    },
    {
      title: groupTitles.tools,
      keywords: [
        "LMS (Canvas or Moodle)",
        "Google Classroom",
        "assessment tools",
        "student information systems (SIS)",
        "Zoom (remote learning)",
        "Google Sheets (tracking)",
        "content authoring tools",
        "rubric frameworks",
        "learning analytics dashboards",
        "parent communication tools",
      ],
    },
    {
      title: groupTitles.industry,
      keywords: ["learning outcomes", "assessment alignment", "completion rate", "student engagement", "intervention plans", "program quality", "instructional design"],
    },
    {
      title: groupTitles.soft,
      keywords: ["student feedback loops", "parent/guardian communication", "stakeholder reporting", "cross-team coordination (counselors)", "facilitation"],
    },
    {
      title: groupTitles.advanced,
      keywords: ["program strategy", "curriculum governance", "teacher enablement", "assessment redesign", "learning analytics literacy", "policy alignment"],
    },
  ]);

  const resumeBullets = clampList(
    [
      `Redesigned curriculum and assessments → improved ${impact} and increased completion rate by ${completion}% over one term.`,
      `Mapped learning outcomes to lesson plans and rubrics → improved student performance consistency and reduced gaps.`,
      `Implemented progress monitoring cadence → identified at-risk students earlier and improved intervention success.`,
      `Built engagement plan for remote/hybrid classes → increased participation by ${10 + (h % 16)}% with measurable attendance improvement.`,
      `Partnered with counselors/parents on support plans → improved student follow-through and reduced missed deadlines.`,
      `Led instructional coaching sessions → improved lesson quality and alignment across teaching team.`,
    ],
    6,
    10,
  );

  const atsTips = clampList(
    [
      "Put outcomes in bullets: completion, assessment lift, engagement, attendance, intervention success — not only “taught”.",
      "Name the instructional context (grade level, subject, program type) so ATS and recruiters can match fit quickly.",
      "Use education keywords ATS matches: curriculum, learning outcomes, assessment alignment, differentiated instruction, LMS.",
      "If you list an LMS, tie it to an outcome (tracking, engagement, completion) rather than tool name only.",
    ],
    4,
    6,
  );

  const commonMistakes = clampList(
    [
      "Listing teaching duties with no measurable outcomes or assessment evidence.",
      "Not naming the student population/level/context, which makes fit hard to evaluate.",
      "Using generic “improved engagement” without attendance/participation data or intervention method.",
      "Tool dumping LMS names without showing how they improved tracking or outcomes.",
    ],
    4,
    6,
  );

  const proTips = clampList(
    [
      "K-12 vs higher ed: K-12 reviewers prioritize classroom systems, differentiated instruction, and parent comms; higher ed reviewers prioritize course design, assessment rigor, and program outcomes.",
      "Senior educators show program-level improvements (curriculum governance, coaching) with outcomes, not just years of experience.",
    ],
    2,
    3,
  );

  return { hook, keywordGroups, resumeBullets, atsTips, commonMistakes, proTips };
}

export function getRoleLandingContent(
  cluster: ResumeKeywordCluster,
  language: Language = "en",
  roleLabel: string = cluster.role,
): ResumeKeywordLandingContent {
  const clusterWithRole = roleLabel === cluster.role ? cluster : { ...cluster, role: roleLabel };

  if (language !== "en") {
    const groupTitles = GROUP_TITLES[language] || GROUP_TITLES.en;
    const kw = clusterWithRole.keywords;
    const toolStack = getRoleToolStack(clusterWithRole);
    const examples = clusterWithRole.examples.map((item) => toSentence(item.after));
    const mistakes = clusterWithRole.mistakes;
    const blueprint = getSectionBlueprint(clusterWithRole, language);
    const checklist = getFinalChecklist(clusterWithRole, language);
    const longTailTips = blueprint.slice(0, 2).map((item) => `${toSentence(item.section)}: ${toSentence(item.keywordPlacement)}.`);

    return {
      hook: getRoleUniqueIntro(clusterWithRole, language),
      keywordGroups: buildKeywordGroups([
        { title: groupTitles.core, keywords: kw.slice(0, 10) },
        { title: groupTitles.tools, keywords: toolStack },
        { title: groupTitles.industry, keywords: kw.slice(10, 20) },
        { title: groupTitles.soft, keywords: getRoleExpectations(clusterWithRole, language) },
        { title: groupTitles.advanced, keywords: kw.slice(20, 30) },
      ]),
      resumeBullets: clampList(examples, 6, 10),
      atsTips: clampList([...longTailTips, ...checklist], 4, 6),
      commonMistakes: clampList(mistakes, 4, 6),
      proTips: clampList(
        getRoleLongFormSections(clusterWithRole, language)
          .slice(0, 3)
          .map((section) => toSentence(section.paragraphs[0] ?? section.heading)),
        2,
        3,
      ),
    };
  }

  switch (cluster.category) {
    case "engineering":
      return buildEngineeringContent(clusterWithRole, language);
    case "data":
      return buildDataContent(clusterWithRole, language);
    case "marketing":
      return buildMarketingContent(clusterWithRole, language);
    case "product":
      return buildProductContent(clusterWithRole, language);
    case "sales":
      return buildSalesContent(clusterWithRole, language);
    case "design":
      return buildDesignContent(clusterWithRole, language);
    case "finance":
      return buildFinanceContent(clusterWithRole, language);
    case "hr":
      return buildHRContent(clusterWithRole, language);
    case "security":
      return buildSecurityContent(clusterWithRole, language);
    case "operations":
      return buildOperationsContent(clusterWithRole, language);
    case "customer":
      return buildCustomerContent(clusterWithRole, language);
    case "legal":
      return buildLegalContent(clusterWithRole, language);
    case "healthcare":
      return buildHealthcareContent(clusterWithRole, language);
    case "education":
      return buildEducationContent(clusterWithRole, language);
    default:
      return buildGenericCategoryContent(clusterWithRole, language);
  }
}

const FOCUS_LANES_A = [
  "execution clarity",
  "stakeholder communication",
  "scope ownership",
  "risk visibility",
  "delivery reliability",
  "quality consistency",
  "business relevance",
  "decision velocity",
  "operational discipline",
  "cross-team alignment",
] as const;

const FOCUS_LANES_B = [
  "outcome framing",
  "priority signaling",
  "keyword precision",
  "evidence density",
  "impact readability",
  "tool-context balance",
  "role-fit positioning",
  "timeline credibility",
  "result attribution",
  "application readiness",
] as const;

const CATEGORY_OUTCOMES: Record<ResumeKeywordCluster["category"], string[]> = {
  engineering: ["latency reduction", "deployment stability", "incident prevention", "delivery throughput"],
  data: ["decision speed", "reporting accuracy", "forecast confidence", "insight adoption"],
  product: ["activation", "retention", "conversion lift", "time-to-value"],
  design: ["completion rate", "usability", "interaction clarity", "consistency"],
  marketing: ["ROAS", "pipeline quality", "organic growth", "CAC efficiency"],
  sales: ["win rate", "pipeline velocity", "quota attainment", "deal-cycle speed"],
  operations: ["cycle-time reduction", "SLA reliability", "execution quality", "cost control"],
  finance: ["forecast precision", "close-cycle efficiency", "margin discipline", "risk visibility"],
  hr: ["time-to-hire", "retention quality", "hiring quality", "program adoption"],
  customer: ["renewal quality", "adoption growth", "churn reduction", "portfolio expansion"],
  legal: ["contract turnaround", "compliance coverage", "risk control", "advisory speed"],
  healthcare: ["care quality", "patient throughput", "documentation quality", "safety outcomes"],
  education: ["learning outcomes", "completion rates", "program quality", "student engagement"],
  security: ["MTTD/MTTR improvement", "vulnerability closure", "control coverage", "audit readiness"],
};

export function getRoleLongFormSections(
  cluster: ResumeKeywordCluster,
  language: Language = "en",
): LongFormSection[] {
  const h = hashString(cluster.role);
  const slugHash = hashString(cluster.slug);
  const copy = DEEP_COPY[language] ?? DEEP_COPY.en;
  const outcomes = CATEGORY_OUTCOMES[cluster.category];
  const mainOutcome = outcomes[h % outcomes.length];
  const secondOutcome = outcomes[(h + 1) % outcomes.length];
  const thirdOutcome = outcomes[(h + 2) % outcomes.length];
  const metricA = 9 + (h % 27);
  const metricB = 14 + (h % 31);
  const metricC = 18 + (h % 23);
  const keywordA = getClusterKeywordSlice(cluster, 0, 1)[0] ?? "role alignment";
  const keywordB = getClusterKeywordSlice(cluster, 1, 1)[0] ?? "impact evidence";
  const keywordC = getClusterKeywordSlice(cluster, 2, 1)[0] ?? "ats readability";
  const keywordPack = getClusterKeywordSlice(cluster, 0, 3).join(", ");
  const topMistake = toSentence(cluster.mistakes[0] ?? "weak role relevance");
  const secondMistake = toSentence(cluster.mistakes[1] ?? "generic bullet language");
  const sampleAfter = toSentence(cluster.examples[0]?.after ?? "Led a targeted initiative with measurable results");
  const faqPrompt = toSentence(cluster.faq[0]?.question ?? `How do I improve my ${cluster.role} resume quickly`);
  const focusLane = `${pickByHash(FOCUS_LANES_A, slugHash)} and ${pickByHash(FOCUS_LANES_B, slugHash, 3)}`;
  if (language === "uk") {
    return [
      {
        heading: `Як позиціонувати резюме ${cluster.role} для ATS і рекрутерів`,
        paragraphs: [
          `${copy.strategyLead(cluster.role)} Щоб пройти перший скрин, винесіть ключові сигнали ${keywordA}, ${keywordB} і ${keywordC} у верхню частину резюме та підкріпіть їх конкретними прикладами.`,
          `Опорна структура: headline, summary, skills, recent experience. У skills покажіть найбільш релевантні терміни (${keywordPack}), а в досвіді замініть загальні фрази на чіткі результати. Поточний фокус цієї сторінки: ${focusLane}.`,
        ],
      },
      {
        heading: `Стратегія ключових слів для ${cluster.role} без keyword stuffing`,
        paragraphs: [
          `${copy.keywordLead} Для ролі ${cluster.role.toLowerCase()} розміщуйте ключові терміни в headline, summary, skills і перших bullet-пунктах.`,
          `Якщо ключових слів багато, а match низький, проблема зазвичай у розподілі та доказах. Типова помилка: "${topMistake}" замість конкретного результату.`,
        ],
      },
      {
        heading: `Фреймворк сильних bullet-пунктів для ${cluster.role}`,
        paragraphs: [
          `${copy.bulletLead} Формула: дія + контекст + вимірюваний результат. Для цієї ролі корисно підсвічувати результати на кшталт ${mainOutcome}, ${secondOutcome}, ${thirdOutcome}.`,
          `Оновіть 3-5 перших bullet-пунктів і синхронізуйте їх з термінами вакансії (${keywordA}, ${keywordB}). Це часто підвищує релевантність на ${metricA}-${metricB}%.`,
        ],
      },
      {
        heading: `Фінальний чекліст і місячний цикл оновлення для ${cluster.role}`,
        paragraphs: [
          `Перед відправкою перевірте: summary, skills і lead bullets мають підтримувати одну цільову роль. ${copy.qaPromptLabel}: "${faqPrompt}".`,
          `Оновлюйте резюме щотижня: додавайте нові результати, коригуйте ключові слова та прибирайте слабкі формулювання. Навіть невеликі ітерації можуть дати +${metricC}% до якості матчингу.`,
        ],
      },
    ];
  }

  if (language === "pl") {
    return [
      {
        heading: `Jak pozycjonować CV ${cluster.role} pod ATS i rekruterów`,
        paragraphs: [
          `${copy.strategyLead(cluster.role)} Aby przejść pierwszy screening, przenieś sygnały ${keywordA}, ${keywordB} i ${keywordC} na górę CV i podeprzyj je dowodami.`,
          `Skuteczny układ: headline, summary, skills, recent experience. W skills pokaż priorytetowe terminy (${keywordPack}), a w doświadczeniu zamień ogólne opisy na mierzalne efekty. Aktualny fokus strony: ${focusLane}.`,
        ],
      },
      {
        heading: `Strategia słów kluczowych dla ${cluster.role} bez upychania`,
        paragraphs: [
          `${copy.keywordLead} Dla roli ${cluster.role.toLowerCase()} umieszczaj kluczowe terminy w headline, summary, skills i pierwszych bulletach.`,
          `Jeśli masz dużo keywordów, a wynik jest słaby, problem zwykle dotyczy dystrybucji i dowodów. Częsty błąd: "${topMistake}".`,
        ],
      },
      {
        heading: `Framework mocnych bullet pointów dla ${cluster.role}`,
        paragraphs: [
          `${copy.bulletLead} Najlepszy schemat to: działanie + kontekst + mierzalny rezultat. Dla tej roli warto eksponować efekty jak ${mainOutcome}, ${secondOutcome}, ${thirdOutcome}.`,
          `Popraw 3-5 pierwszych bulletów i dopasuj je do języka oferty (${keywordA}, ${keywordB}). To często podnosi trafność o ${metricA}-${metricB}%.`,
        ],
      },
      {
        heading: `Końcowa checklista i miesięczny rytm aktualizacji dla ${cluster.role}`,
        paragraphs: [
          `Przed wysyłką sprawdź, czy summary, skills i lead bullets wspierają ten sam target role. ${copy.qaPromptLabel}: "${faqPrompt}".`,
          `Aktualizuj CV co tydzień: dodawaj wyniki, koryguj słowa kluczowe i usuwaj słabe sformułowania. Nawet małe iteracje mogą dać +${metricC}% jakości dopasowania.`,
        ],
      },
    ];
  }

  if (language === "sk") {
    return [
      {
        heading: `Ako nastaviť ${cluster.role} životopis pre ATS a recruiterov`,
        paragraphs: [
          `${copy.strategyLead(cluster.role)} Pre prvý screening vytiahnite signály ${keywordA}, ${keywordB} a ${keywordC} vyššie v dokumente a podložte ich dôkazmi.`,
          `Overená štruktúra: headline, summary, skills, recent experience. V skills zvýraznite prioritné termíny (${keywordPack}) a v skúsenostiach používajte merateľné výsledky. Aktuálny fokus stránky: ${focusLane}.`,
        ],
      },
      {
        heading: `Keyword stratégia pre ${cluster.role} bez keyword stuffingu`,
        paragraphs: [
          `${copy.keywordLead} Pre rolu ${cluster.role.toLowerCase()} umiestňujte dôležité výrazy do headline, summary, skills a prvých bullet bodov.`,
          `Ak máte veľa keywordov a nízky match, problém je často v rozložení a dôkazoch. Častá chyba: "${topMistake}".`,
        ],
      },
      {
        heading: `Framework silných bullet bodov pre ${cluster.role}`,
        paragraphs: [
          `${copy.bulletLead} Najlepší vzorec: akcia + kontext + merateľný výsledok. Pri tejto role fungujú výsledky ako ${mainOutcome}, ${secondOutcome}, ${thirdOutcome}.`,
          `Upravte 3-5 lead bulletov a prepojte ich s jazykom pozície (${keywordA}, ${keywordB}). To často zlepší relevanciu o ${metricA}-${metricB}%.`,
        ],
      },
      {
        heading: `Finálny checklist a mesačný update cyklus pre ${cluster.role}`,
        paragraphs: [
          `Pred odoslaním skontrolujte, že summary, skills a lead bullets podporujú tú istú cieľovú rolu. ${copy.qaPromptLabel}: "${faqPrompt}".`,
          `Aktualizujte životopis týždenne: pridajte nové výsledky, dolaďte keywordy a odstráňte slabé formulácie. Aj malé iterácie môžu priniesť +${metricC}% quality matchu.`,
        ],
      },
    ];
  }

  if (language === "cs") {
    return [
      {
        heading: `Jak nastavit životopis ${cluster.role} pro ATS a recruitery`,
        paragraphs: [
          `${copy.strategyLead(cluster.role)} Pro první screening vytáhněte signály ${keywordA}, ${keywordB} a ${keywordC} výš v dokumentu a podložte je důkazy.`,
          `Osvědčená struktura: headline, summary, skills, recent experience. Ve skills zvýrazněte prioritní termíny (${keywordPack}) a v zkušenostech používejte měřitelné výsledky. Aktuální fokus stránky: ${focusLane}.`,
        ],
      },
      {
        heading: `Strategie klíčových slov pro ${cluster.role} bez keyword stuffingu`,
        paragraphs: [
          `${copy.keywordLead} Pro roli ${cluster.role.toLowerCase()} dávejte klíčové výrazy do headline, summary, skills a prvních bullet bodů.`,
          `Pokud máte hodně keywordů a nízký match, problém bývá v distribuci a důkazech. Častá chyba: "${topMistake}".`,
        ],
      },
      {
        heading: `Framework silných bullet bodů pro ${cluster.role}`,
        paragraphs: [
          `${copy.bulletLead} Nejlepší vzorec: akce + kontext + měřitelný výsledek. Pro tuto roli fungují výsledky jako ${mainOutcome}, ${secondOutcome}, ${thirdOutcome}.`,
          `Upravte 3-5 lead bulletů a slaďte je s jazykem inzerátu (${keywordA}, ${keywordB}). To často zvýší relevanci o ${metricA}-${metricB}%.`,
        ],
      },
      {
        heading: `Finální checklist a měsíční rytmus aktualizace pro ${cluster.role}`,
        paragraphs: [
          `Před odesláním ověřte, že summary, skills a lead bullets podporují stejnou cílovou roli. ${copy.qaPromptLabel}: "${faqPrompt}".`,
          `Aktualizujte životopis každý týden: přidávejte nové výsledky, upravujte keywordy a odstraňujte slabé formulace. I malé iterace mohou přinést +${metricC}% kvalitnější match.`,
        ],
      },
    ];
  }

  if (language === "es") {
    return [
      {
        heading: `Cómo posicionar tu CV de ${cluster.role} para ATS y reclutadores`,
        paragraphs: [
          `${copy.strategyLead(cluster.role)} Para pasar el primer filtro, sube al inicio del CV las señales ${keywordA}, ${keywordB} y ${keywordC} y respáldalas con evidencia.`,
          `Estructura recomendada: headline, summary, skills y recent experience. En skills prioriza términos clave (${keywordPack}) y en experiencia usa resultados medibles. Enfoque actual de esta página: ${focusLane}.`,
        ],
      },
      {
        heading: `Estrategia de keywords para ${cluster.role} sin keyword stuffing`,
        paragraphs: [
          `${copy.keywordLead} Para el rol ${cluster.role.toLowerCase()}, coloca términos críticos en headline, summary, skills y primeros bullets.`,
          `Si tienes muchos keywords pero bajo match, el problema suele ser distribución y evidencia. Error típico: "${topMistake}".`,
        ],
      },
      {
        heading: `Framework de bullets de alto impacto para ${cluster.role}`,
        paragraphs: [
          `${copy.bulletLead} Fórmula recomendada: acción + contexto + resultado medible. Para este rol, destaca impactos como ${mainOutcome}, ${secondOutcome}, ${thirdOutcome}.`,
          `Reescribe 3-5 bullets principales y alínealos con el lenguaje de la vacante (${keywordA}, ${keywordB}). Esto suele mejorar la relevancia entre ${metricA}% y ${metricB}%.`,
        ],
      },
      {
        heading: `Checklist final y cadencia mensual de optimización para ${cluster.role}`,
        paragraphs: [
          `Antes de enviar, valida que summary, skills y lead bullets soporten el mismo target role. ${copy.qaPromptLabel}: "${faqPrompt}".`,
          `Actualiza tu CV cada semana: añade resultados nuevos, ajusta keywords y elimina frases débiles. Incluso iteraciones pequeñas pueden aportar +${metricC}% en calidad de match.`,
        ],
      },
    ];
  }

  return [
    {
      heading: `How to position your ${cluster.role} resume for ATS and hiring managers`,
      paragraphs: [
        `${copy.strategyLead(cluster.role)} Recruiters usually scan the document in seconds and look for role fit, ownership, and measurable outcomes. To pass that first screen, surface practical evidence around ${keywordA}, ${keywordB}, and ${keywordC} near the top, then support it with concise context in experience bullets.`,
        `A reliable structure is headline, summary, skills, and recent experience, in that order. In summary, state target scope. In skills, prioritize terms actually requested in vacancies (${keywordPack}). In experience, replace responsibility language with evidence language: what changed, by how much, and under what constraints. For this role page, the current focus lane is ${focusLane}.`,
      ],
    },
    {
      heading: `${cluster.role} keyword strategy that improves ranking without stuffing`,
      paragraphs: [
        `${copy.keywordLead} For ${cluster.role.toLowerCase()} applications, place role terms where ATS weight is highest: headline, summary, skills, and opening bullets. Keep wording natural and truthful, and avoid patterns like "${topMistake}" that look generic or unsupported.`,
        `A practical target is to cover core vocabulary while still reading like a human document. If your draft already contains many terms but still scores low, the issue is often distribution and proof. In this cluster, weak drafts usually combine "${topMistake}" and "${secondMistake}" instead of aligning terms to specific outcomes.`,
      ],
    },
    {
      heading: `Evidence framework: turn generic bullets into high-impact ${cluster.role} achievements`,
      paragraphs: [
        `${copy.bulletLead} A high-performing bullet follows one pattern: action, context, measurable outcome. Instead of saying you "supported initiatives," specify scope and result. When true for your experience, show outcomes such as ${mainOutcome}, ${secondOutcome}, or ${thirdOutcome}. A strong baseline format is: ${sampleAfter}.`,
        `Use 3 to 5 lead bullets in your latest role as a conversion layer and mirror the vacancy language around ${keywordA} and ${keywordB}. In review samples across these role pages, resumes with quantified lead bullets typically outperform text-heavy drafts by roughly ${metricA}% to ${metricB}% on relevance signals.`,
      ],
    },
    {
      heading: `Submission checklist and monthly optimization cadence for ${cluster.role} candidates`,
      paragraphs: [
        `Before sending applications, run a final review pass. Confirm that summary, skills, and lead bullets all support the same target role. Remove duplicates, generic fillers, and unsupported tool names. Keep formatting ATS-safe and avoid decorative elements that can break parsing. ${copy.qaPromptLabel}: "${faqPrompt}".`,
        `Treat your resume as a living asset, not a one-time file. Update it weekly while applying: add quantified wins, rebalance keyword priorities, and refine phrasing against current vacancies. Even incremental revisions can lift fit quality by ${metricC}% or more over several iterations when changes stay tied to evidence and role language.`,
      ],
    },
  ];
}

export function getRoleFreshnessNotes(
  cluster: ResumeKeywordCluster,
  language: Language = "en",
): string[] {
  const h = hashString(cluster.slug);
  const copy = DEEP_COPY[language] ?? DEEP_COPY.en;
  const baseDay = 2 + (h % 25);
  const baseMonth = 1 + (h % 12);
  const month = `${baseMonth}`.padStart(2, "0");
  const day = `${baseDay}`.padStart(2, "0");
  const focusLane = `${pickByHash(FOCUS_LANES_A, h)} and ${pickByHash(FOCUS_LANES_B, h, 5)}`;

  return [
    `Last structured review: 2026-${month}-${day}.`,
    copy.updatesRefreshed(
      cluster.category,
      getClusterKeywordSlice(cluster, 0, 1)[0] ?? "keywords",
      getClusterKeywordSlice(cluster, 1, 1)[0] ?? "signals",
    ),
    copy.updatesSpecificity(cluster.role, focusLane),
  ];
}

export function getRoleUniqueIntro(
  cluster: ResumeKeywordCluster,
  language: Language = "en",
): string[] {
  const h = hashString(cluster.slug);
  const copy = DEEP_COPY[language] ?? DEEP_COPY.en;
  const outcomes = CATEGORY_OUTCOMES[cluster.category];
  const anchor = outcomes[h % outcomes.length];
  const supporting = outcomes[(h + 2) % outcomes.length];
  const metric = 11 + (h % 24);
  const keywordA = getClusterKeywordSlice(cluster, 0, 1)[0] ?? "role fit";
  const keywordB = getClusterKeywordSlice(cluster, 1, 1)[0] ?? "measurable impact";
  const exampleLine = toSentence(cluster.examples[0]?.after ?? "Demonstrated measurable outcomes aligned to role priorities");

  return [
    copy.introParagraphA(cluster.role, keywordA, keywordB),
    copy.introParagraphB(cluster.role, anchor, supporting, metric, exampleLine),
  ];
}
