import type { Language } from "./translations";
import type { ResumeKeywordCluster } from "./resumeKeywordClusters";

type SectionBlueprintItem = {
  section: string;
  purpose: string;
  keywordPlacement: string;
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
