import type { Language } from "./translations";
import type { ResumeKeywordCluster } from "./resumeKeywordClusters";

type SectionBlueprintItem = {
  section: string;
  purpose: string;
  keywordPlacement: string;
};

type LongFormSection = {
  heading: string;
  paragraphs: string[];
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
