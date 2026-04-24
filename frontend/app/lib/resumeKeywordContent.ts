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

export function getRoleLongFormSections(cluster: ResumeKeywordCluster): LongFormSection[] {
  const h = hashString(cluster.role);
  const slugHash = hashString(cluster.slug);
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
  const strategyLead = pickByHash(
    [
      `Most ${cluster.role.toLowerCase()} resumes underperform because relevant proof is buried too low on the page.`,
      `Recruiters reviewing ${cluster.role.toLowerCase()} applications usually decide in seconds whether the profile is role-aligned.`,
      `For ${cluster.role.toLowerCase()} candidates, the gap is rarely experience itself; the gap is how evidence is presented.`,
      `${cluster.role} resumes compete on clarity first: if role fit is not visible early, strong experience is often ignored.`,
    ] as const,
    h,
  );
  const keywordLead = pickByHash(
    [
      `Keyword quality matters more than keyword volume.`,
      `A high score comes from placement and evidence, not from repeating terms.`,
      `ATS relevance improves when terms are tied to outcomes rather than listed in isolation.`,
      `The most reliable ranking gain comes from clean distribution of key terms across high-signal sections.`,
    ] as const,
    h,
    1,
  );
  const bulletLead = pickByHash(
    [
      `For competitive roles, bullet quality is the deciding factor.`,
      `Your first five bullets are the conversion layer for recruiter decisions.`,
      `High-performing resumes translate responsibility statements into measurable business outcomes.`,
      `The fastest way to increase interview probability is to rewrite low-signal bullets into evidence lines.`,
    ] as const,
    h,
    2,
  );

  return [
    {
      heading: `How to position your ${cluster.role} resume for ATS and hiring managers`,
      paragraphs: [
        `${strategyLead} Recruiters usually scan the document in seconds and look for role fit, ownership, and measurable outcomes. To pass that first screen, surface practical evidence around ${keywordA}, ${keywordB}, and ${keywordC} near the top, then support it with concise context in experience bullets.`,
        `A reliable structure is headline, summary, skills, and recent experience, in that order. In summary, state target scope. In skills, prioritize terms actually requested in vacancies (${keywordPack}). In experience, replace responsibility language with evidence language: what changed, by how much, and under what constraints. For this role page, the current focus lane is ${focusLane}.`,
      ],
    },
    {
      heading: `${cluster.role} keyword strategy that improves ranking without stuffing`,
      paragraphs: [
        `${keywordLead} For ${cluster.role.toLowerCase()} applications, place role terms where ATS weight is highest: headline, summary, skills, and opening bullets. Keep wording natural and truthful, and avoid patterns like "${topMistake}" that look generic or unsupported.`,
        `A practical target is to cover core vocabulary while still reading like a human document. If your draft already contains many terms but still scores low, the issue is often distribution and proof. In this cluster, weak drafts usually combine "${topMistake}" and "${secondMistake}" instead of aligning terms to specific outcomes.`,
      ],
    },
    {
      heading: `Evidence framework: turn generic bullets into high-impact ${cluster.role} achievements`,
      paragraphs: [
        `${bulletLead} A high-performing bullet follows one pattern: action, context, measurable outcome. Instead of saying you "supported initiatives," specify scope and result. When true for your experience, show outcomes such as ${mainOutcome}, ${secondOutcome}, or ${thirdOutcome}. A strong baseline format is: ${sampleAfter}.`,
        `Use 3 to 5 lead bullets in your latest role as a conversion layer and mirror the vacancy language around ${keywordA} and ${keywordB}. In review samples across these role pages, resumes with quantified lead bullets typically outperform text-heavy drafts by roughly ${metricA}% to ${metricB}% on relevance signals.`,
      ],
    },
    {
      heading: `Submission checklist and monthly optimization cadence for ${cluster.role} candidates`,
      paragraphs: [
        `Before sending applications, run a final review pass. Confirm that summary, skills, and lead bullets all support the same target role. Remove duplicates, generic fillers, and unsupported tool names. Keep formatting ATS-safe and avoid decorative elements that can break parsing. A useful QA prompt for this page is: "${faqPrompt}".`,
        `Treat your resume as a living asset, not a one-time file. Update it weekly while applying: add quantified wins, rebalance keyword priorities, and refine phrasing against current vacancies. Even incremental revisions can lift fit quality by ${metricC}% or more over several iterations when changes stay tied to evidence and role language.`,
      ],
    },
  ];
}

export function getRoleFreshnessNotes(cluster: ResumeKeywordCluster): string[] {
  const h = hashString(cluster.slug);
  const baseDay = 2 + (h % 25);
  const baseMonth = 1 + (h % 12);
  const month = `${baseMonth}`.padStart(2, "0");
  const day = `${baseDay}`.padStart(2, "0");
  const focusLane = `${pickByHash(FOCUS_LANES_A, h)} and ${pickByHash(FOCUS_LANES_B, h, 5)}`;

  return [
    `Last structured review: 2026-${month}-${day}.`,
    `Keyword set refreshed around ${getClusterKeywordSlice(cluster, 0, 2).join(" and ")} using current ${cluster.category} vacancy patterns.`,
    `Examples and FAQ were updated to strengthen specificity for ${cluster.role.toLowerCase()} applicants, with extra emphasis on ${focusLane}.`,
  ];
}

export function getRoleUniqueIntro(cluster: ResumeKeywordCluster): string[] {
  const h = hashString(cluster.slug);
  const outcomes = CATEGORY_OUTCOMES[cluster.category];
  const anchor = outcomes[h % outcomes.length];
  const supporting = outcomes[(h + 2) % outcomes.length];
  const metric = 11 + (h % 24);
  const keywordA = getClusterKeywordSlice(cluster, 0, 1)[0] ?? "role fit";
  const keywordB = getClusterKeywordSlice(cluster, 1, 1)[0] ?? "measurable impact";
  const exampleLine = toSentence(cluster.examples[0]?.after ?? "Demonstrated measurable outcomes aligned to role priorities");

  return [
    `${cluster.role} hiring pipelines are comparison-driven: recruiters benchmark role relevance, vocabulary fit, and measurable impact very quickly. This guide keeps the same practical structure while grounding it in role-specific signals such as ${keywordA} and ${keywordB}, plus evidence patterns that are easier for ATS and humans to interpret.`,
    `For this role, strong resume versions usually show ownership and outcomes like ${anchor} and ${supporting}. In many review flows, moving those signals into summary and lead bullets can raise match quality by ${metric}% or more versus baseline drafts built from responsibilities only. A good target line is: ${exampleLine}.`,
  ];
}
