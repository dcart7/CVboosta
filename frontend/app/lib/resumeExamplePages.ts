import type { ResumeKeywordCluster, RoleCategory } from "./resumeKeywordClusters";
import type { Language } from "./translations";

export type SeoFaqItem = { question: string; answer: string };
export type SeoInternalLink = { href: string; anchor: string };
export type SeoRelatedPage = { href: string; title: string };

export type SeoSection = {
  title: string;
  body: string; // markdown-lite
};

export type ResumeExampleSeoPage = {
  slug: string; // role slug
  role: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  updatedAt: string; // YYYY-MM-DD
  sections: SeoSection[];
  faq: SeoFaqItem[];
  internalLinks: SeoInternalLink[];
  relatedPages: SeoRelatedPage[];
  similarRoles: Array<{ slug: string; role: string }>;
  imageIdeas: string[];
  estimatedWordCount: number;
};

const EXAMPLE_UI: Record<Language, {
  intro: string;
  hiring: string;
  template: string;
  summary: string;
  skills: string;
  realistic: string;
  tailoring: string;
  bullets: string;
  ats: string;
  mistakes: string;
  beforeAfter: string;
  faq: string;
  links: string;
  images: string;
  cta: string;
}> = {
  en: {
    intro: "Introduction",
    hiring: "How hiring teams screen (ATS → recruiter → hiring manager)",
    template: "ATS-safe resume template (structure + formatting)",
    summary: "Illustrative resume summary templates (3 options you can adapt)",
    skills: "Skills section example (grouped, ATS-safe)",
    realistic: "Illustrative resume template (copy the structure, then tailor)",
    tailoring: "How to tailor this resume with a repeatable workflow",
    bullets: "Illustrative bullet templates and rewrites",
    ats: "ATS optimization (parsing, keywords, recruiter scan)",
    mistakes: "Common mistakes (and why they hurt)",
    beforeAfter: "Before/after transformation (weak → optimized)",
    faq: "FAQ",
    links: "Internal links (next reads)",
    images: "Suggested image ideas (optional)",
    cta: "Soft CTA",
  },
  uk: {
    intro: "Вступ",
    hiring: "Як найм-команди сканують резюме (ATS → рекрутер → hiring manager)",
    template: "ATS-безпечний шаблон резюме (структура + форматування)",
    summary: "Ілюстративні шаблони summary для резюме (3 варіанти)",
    skills: "Приклад секції Skills (згруповано, ATS-safe)",
    realistic: "Ілюстративний шаблон резюме (копіюйте структуру, потім адаптуйте)",
    tailoring: "Як адаптувати це резюме за повторюваним процесом",
    bullets: "Ілюстративні bullet-шаблони та переписування",
    ats: "ATS-оптимізація (парсинг, ключові слова, скан рекрутера)",
    mistakes: "Типові помилки (і чому вони шкодять)",
    beforeAfter: "Трансформація до/після (слабко → сильніше)",
    faq: "FAQ",
    links: "Внутрішні посилання (що читати далі)",
    images: "Ідеї для зображень (опційно)",
    cta: "Наступний крок",
  },
  pl: {
    intro: "Wprowadzenie",
    hiring: "Jak zespoły rekrutacyjne skanują CV (ATS → rekruter → hiring manager)",
    template: "Szablon CV bezpieczny dla ATS (struktura + formatowanie)",
    summary: "Ilustracyjne szablony podsumowania CV (3 warianty)",
    skills: "Przykład sekcji Skills (grupowane, ATS-safe)",
    realistic: "Ilustracyjny szablon CV (skopiuj strukturę, potem dopasuj)",
    tailoring: "Jak dopasować to CV w powtarzalnym procesie",
    bullets: "Ilustracyjne szablony bullet points i przeróbki",
    ats: "Optymalizacja ATS (parsowanie, keywords, skan rekrutera)",
    mistakes: "Typowe błędy (i dlaczego szkodzą)",
    beforeAfter: "Transformacja before/after (słabo → lepiej)",
    faq: "FAQ",
    links: "Linki wewnętrzne (co czytać dalej)",
    images: "Pomysły na grafiki (opcjonalnie)",
    cta: "Następny krok",
  },
  sk: {
    intro: "Úvod",
    hiring: "Ako hiring tímy skenujú životopis (ATS → recruiter → hiring manager)",
    template: "ATS-safe šablóna životopisu (štruktúra + formátovanie)",
    summary: "Ilustračné šablóny summary do životopisu (3 verzie)",
    skills: "Príklad sekcie Skills (zoskupené, ATS-safe)",
    realistic: "Ilustračná šablóna životopisu (skopírujte štruktúru a prispôsobte)",
    tailoring: "Ako prispôsobiť tento životopis opakovateľným postupom",
    bullets: "Ilustračné šablóny bulletov a prepisy",
    ats: "ATS optimalizácia (parsing, kľúčové slová, recruiter scan)",
    mistakes: "Typické chyby (a prečo škodia)",
    beforeAfter: "Transformácia pred/po (slabé → silnejšie)",
    faq: "FAQ",
    links: "Interné odkazy (čo čítať ďalej)",
    images: "Návrhy obrázkov (voliteľné)",
    cta: "Ďalší krok",
  },
  cs: {
    intro: "Úvod",
    hiring: "Jak hiring týmy skenují životopis (ATS → recruiter → hiring manager)",
    template: "ATS-safe šablona životopisu (struktura + formátování)",
    summary: "Ilustrační šablony summary do životopisu (3 varianty)",
    skills: "Příklad sekce Skills (seskupené, ATS-safe)",
    realistic: "Ilustrační šablona životopisu (zkopírujte strukturu a pak upravte)",
    tailoring: "Jak upravit tento životopis opakovatelným postupem",
    bullets: "Ilustrační šablony bulletů a přepisy",
    ats: "ATS optimalizace (parsování, klíčová slova, recruiter scan)",
    mistakes: "Typické chyby (a proč škodí)",
    beforeAfter: "Transformace před/po (slabé → silnější)",
    faq: "FAQ",
    links: "Interní odkazy (co číst dál)",
    images: "Nápady na obrázky (volitelné)",
    cta: "Další krok",
  },
  es: {
    intro: "Introducción",
    hiring: "Cómo los equipos de contratación escanean el CV (ATS → recruiter → hiring manager)",
    template: "Plantilla de CV compatible con ATS (estructura + formato)",
    summary: "Plantillas ilustrativas de resumen para CV (3 opciones)",
    skills: "Ejemplo de sección Skills (agrupada, ATS-safe)",
    realistic: "Plantilla ilustrativa de CV (copia la estructura y luego adáptala)",
    tailoring: "Cómo adaptar este CV con un proceso repetible",
    bullets: "Plantillas ilustrativas de bullets y reescrituras",
    ats: "Optimización ATS (parsing, palabras clave, escaneo del recruiter)",
    mistakes: "Errores comunes (y por qué perjudican)",
    beforeAfter: "Transformación antes/después (débil → mejor)",
    faq: "FAQ",
    links: "Enlaces internos (sigue leyendo)",
    images: "Ideas de imágenes (opcional)",
    cta: "Siguiente paso",
  },
};

function replaceSectionTitle(title: string, language: Language): string {
  if (language === "en") return title;
  const ui = EXAMPLE_UI[language] || EXAMPLE_UI.en;
  const mapping = new Map<string, string>([
    ["Introduction", ui.intro],
    ["How hiring teams screen (ATS → recruiter → hiring manager)", ui.hiring],
    ["ATS-safe resume template (structure + formatting)", ui.template],
    ["Resume summary examples (3 options you can adapt)", ui.summary],
    ["Skills section example (grouped, ATS-safe)", ui.skills],
    ["Realistic resume example (copy the structure, then tailor)", ui.realistic],
    [/^How to tailor a .+ resume with a repeatable workflow$/ as unknown as string, ui.tailoring],
    ["Realistic examples (bullets + rewrites)", ui.bullets],
    ["ATS optimization (parsing, keywords, recruiter scan)", ui.ats],
    ["Common mistakes (and why they hurt)", ui.mistakes],
    ["Before/after transformation (weak → optimized)", ui.beforeAfter],
    ["FAQ", ui.faq],
    ["Internal links (next reads)", ui.links],
    ["Suggested image ideas (optional)", ui.images],
    ["Soft CTA", ui.cta],
  ]);

  if (mapping.has(title)) return mapping.get(title)!;
  if (/^How to tailor a .+ resume with a repeatable workflow$/.test(title)) return ui.tailoring;
  return title;
}

function getLocalizedExampleCopy(language: Language, role: string, roleSlug: string, lane: string, keywords: string[]) {
  const keywordA = keywords[0] ?? "role fit";
  const keywordB = keywords[1] ?? "clear outcomes";
  const keywordC = keywords[2] ?? "ATS readability";

  if (language === "uk") {
    return {
      seoTitle: `${role} — приклад резюме (ATS-friendly)`,
      meta: `Приклад резюме для ${role}: ATS-безпечна структура, summary, skills, bullet-переписування, типові помилки та FAQ.`,
      h1: `${role} — приклад резюме (ATS-friendly)`,
      lead: `Практичний приклад резюме для ${role} з фокусом на ${lane}, ATS-парсинг і сильні bullet-пункти.`,
      intro: `Ця сторінка показує, як зробити резюме для **${role}** зрозумілим і для ATS, і для рекрутера. Найсильніші резюме швидко підтверджують рольову відповідність, дають 2–4 релевантні сигнали і підкріплюють їх цифрами.\n\nПочинайте з простої структури, далі вирівнюйте ключові слова, а вже потім допрацьовуйте формулювання. Для цієї ролі важливо підсвітити **${keywordA}**, **${keywordB}** і **${keywordC}**.\n\nЯкщо хочете спочатку подивитися keyword-чекліст, відкрийте [ключові слова для ${role}](/resume-keywords/${roleSlug}).`,
      hiring: `Сильне резюме проходить три короткі перевірки:\n1. **ATS** читає файл як текст і намагається знайти секції та ключові слова.\n2. **Рекрутер** за перші 10–30 секунд оцінює рольову відповідність, scope і credibility.\n3. **Hiring manager** дивиться, чи справді ваші bullet-пункти доводять потрібний рівень роботи.\n\nЩо швидше ви робите ${lane} очевидним, то менше невизначеності залишається у скринінгу.`,
      template: `Найбезпечніший шаблон для ATS — це **одна колонка**, стандартні заголовки та читабельний текст.\n\n### Рекомендований порядок секцій\n- Contact\n- Headline + Summary\n- Skills\n- Experience\n- Education\n\n### Що працює краще за все\n- стандартні headings\n- прості bullets\n- однаковий формат дат\n- без таблиць, sidebar і критичного тексту в header/footer\n\nЯкщо потрібні глибші правила форматування, відкрийте [ATS guides](/ats).`,
      summary: `Сильне summary для ${role} має бути коротким: **2–4 речення**. Воно повинно назвати цільову роль, кілька ключових слів і один сигнал довіри.\n\n### Що включити\n- назву ролі\n- 2–4 must-have keywords\n- один вимірюваний результат або scope line\n\nПісля цього адаптуйте summary під конкретну вакансію, замінюючи ключові слова на ті, що реально повторюються в job description.`,
      skills: `Секція Skills не повинна виглядати як довгий хаотичний список. Краще групувати навички за змістом, щоб їх було легко сканувати і ATS, і рекрутеру.\n\n### Практичний принцип\n- **Core:** ${keywords.slice(0, 8).join(", ")}\n- **Tools / Systems:** ${keywords.slice(8, 16).join(", ")}\n- **Methods / Workflow:** ${keywords.slice(16, 24).join(", ")}\n\nЯкщо термін справді важливий, він має з’явитися хоча б в одному bullet-пункті з доказом.`,
      realistic: `Нижче логіка прикладу: спершу структура, потім зміст.\n\n- поставте найсильніші докази у перші 3–6 bullet-пунктів\n- залиште standard headings\n- не ховайте важливий текст у декоративних елементах\n\nКопіюйте каркас, але не копіюйте слова без перевірки на правдивість.`,
      tailoring: `Адаптація не означає переписати все з нуля.\n\n### Повторюваний workflow\n1. Витягніть 8–15 повторюваних вимог із вакансії.\n2. Оновіть summary під роль.\n3. Підніміть ключові skills вище.\n4. Перепишіть перші 3–6 bullet-пунктів у найбільш релевантному досвіді.\n5. Перевірте parsed preview перед відправкою.\n\nПісля цього варто запустити [безкоштовний ATS scan](/free-ats-resume-checker).`,
      bullets: `Найкращі bullet-пункти для ${role} показують **дію + контекст + результат**. Уникайте фраз на кшталт “responsible for” без доказу.\n\nШукайте формулювання, які показують ownership, scope і вимірюваний вплив на ${lane}.`,
      ats: `ATS не “розуміє” резюме як людина — він спочатку парсить структуру, а потім індексує терміни. Тому важливо:\n- використовувати стандартні секції\n- розміщувати keywords у Summary, Skills і Experience\n- не перенасичувати текст повтореннями\n- перевіряти parsed preview\n\nНайсильніший ATS-match виникає там, де ключове слово підтверджене реальним результатом.`,
      mistakes: `Типові помилки для ${role}:\n- занадто загальне summary\n- список tools без доказів у досвіді\n- двоколонковий layout або таблиці\n- keyword stuffing без контексту\n- розмиті bullet-пункти без ownership і цифр`,
      beforeAfter: `Слабка версія bullet-пункту зазвичай описує активність. Сильніша версія описує результат, контекст і вимірюваний вплив.\n\nПереписуйте так, щоб recruiter одразу бачив: що змінилося, на скільки і завдяки чому.`,
      faqTitle: "FAQ",
      links: `Що читати далі:\n- [Ключові слова для ${role}](/resume-keywords/${roleSlug})\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)\n- [ATS guides](/ats)\n- [Free ATS resume checker](/free-ats-resume-checker)`,
      images: `Ідеї для візуалів:\n- clean one-column resume mockup\n- before/after bullet card\n- keyword placement diagram\n- ATS parsing flow`,
      cta: `Хочете застосувати це до конкретної вакансії? Перейдіть у продукт:\n- [Запустити ATS scan](/free-ats-resume-checker)\n- [Оптимізувати резюме](/app)`,
    };
  }

  const generic = {
    pl: {
      seoTitle: `${role} — przykład CV (ATS-friendly)`,
      meta: `Przykład CV dla ${role}: bezpieczna struktura ATS, summary, skills, przeróbki bulletów, błędy i FAQ.`,
      h1: `${role} — przykład CV (ATS-friendly)`,
      lead: `Praktyczny przykład CV dla ${role} z naciskiem na ${lane}, parsing ATS i mocniejsze bullet points.`,
      intro: `Ta strona pokazuje, jak zbudować CV dla **${role}**, które jest czytelne dla ATS i dla rekrutera. Najlepsze CV szybko potwierdza dopasowanie do roli, pokazuje 2–4 ważne sygnały i wspiera je dowodami.\n\nNa tej roli warto wyraźnie zaznaczyć **${keywordA}**, **${keywordB}** i **${keywordC}**.\n\nZobacz też [słowa kluczowe CV dla ${role}](/resume-keywords/${roleSlug}).`,
      hiring: `Silne CV przechodzi trzy krótkie etapy: ATS, szybki skan rekrutera i przegląd hiring managera. Im szybciej pokażesz ${lane}, tym mniejsze ryzyko, że CV zostanie pominięte.`,
      template: `Najbezpieczniejszy układ dla ATS to jedna kolumna, standardowe nagłówki i prosty tekst. Unikaj tabel, sidebarów i ważnych treści w header/footer.`,
      summary: `Summary powinno być krótkie: 2–4 zdania, nazwa roli, kilka keywords i jeden sygnał wiarygodności.`,
      skills: `Sekcję Skills grupuj logicznie, zamiast wrzucać długą listę. Kluczowe terms powinny pojawiać się też w Experience z dowodem.`,
      realistic: `Traktuj ten przykład jako strukturę bazową. Najmocniejsze 3–6 bulletów powinny być na górze ostatniego istotnego doświadczenia.`,
      tailoring: `Dopasowanie CV to krótka seria zmian: wyciągnij wymagania z ogłoszenia, popraw summary, podnieś ważne skills i przepisz lead bullets.`,
      bullets: `Najlepsze bullet points pokazują działanie, kontekst i wynik. Unikaj ogólnych zdań bez liczb i ownership.`,
      ats: `ATS najpierw parsuje strukturę, potem indeksuje terms. Dlatego standardowe sekcje, dobre rozmieszczenie keywords i czysty layout są ważniejsze niż ozdobniki.`,
      mistakes: `Najczęstsze błędy to ogólne summary, tools bez dowodu, keyword stuffing, zbyt ozdobny layout i słabe bullets.`,
      beforeAfter: `Słaba wersja opisuje czynność. Mocniejsza wersja pokazuje zmianę, wynik i wpływ biznesowy.`,
      faqTitle: "FAQ",
      links: `Czytaj dalej:\n- [Słowa kluczowe CV dla ${role}](/resume-keywords/${roleSlug})\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)\n- [ATS guides](/ats)`,
      images: `Pomysły na grafiki:\n- one-column CV mockup\n- before/after bullet card\n- keyword placement diagram`,
      cta: `Chcesz zastosować to do realnej oferty?\n- [Uruchom ATS scan](/free-ats-resume-checker)\n- [Optymalizuj CV](/app)`,
    },
    sk: {
      seoTitle: `${role} — príklad životopisu (ATS-friendly)`,
      meta: `Príklad životopisu pre ${role}: ATS-safe štruktúra, summary, skills, prepisy bulletov, chyby a FAQ.`,
      h1: `${role} — príklad životopisu (ATS-friendly)`,
      lead: `Praktický príklad životopisu pre ${role} so zameraním na ${lane}, ATS parsing a silnejšie bullet body.`,
      intro: `Táto stránka ukazuje, ako pripraviť životopis pre **${role}**, ktorý je čitateľný pre ATS aj recruitera. Dôležité je rýchlo ukázať role fit a dôkaz.\n\nPre túto rolu zvýraznite **${keywordA}**, **${keywordB}** a **${keywordC}**.\n\nPozrite si aj [kľúčové slová životopisu pre ${role}](/resume-keywords/${roleSlug}).`,
      hiring: `Silný životopis prechádza cez ATS, krátky recruiter scan a potom cez hiring managera. Čím skôr ukážete ${lane}, tým lepšie.`,
      template: `Najbezpečnejší ATS layout je jedna kolóna, štandardné headings a čistý text. Vyhnite sa tabuľkám a sidebarom.`,
      summary: `Summary má byť krátke: 2–4 vety, názov roly, pár kľúčových slov a jeden dôveryhodný výsledok.`,
      skills: `Skills sekciu zoskupujte logicky. Dôležité terms by sa mali objaviť aj v Experience s dôkazom.`,
      realistic: `Tento príklad berte ako kostru. Najsilnejšie bullet body presuňte hore do poslednej relevantnej pozície.`,
      tailoring: `Prispôsobenie je krátky workflow: vytiahnite požiadavky z job postu, upravte summary, zoraďte skills a prepíšte lead bullets.`,
      bullets: `Najlepšie bullet body ukazujú akciu, kontext a výsledok. Vyhýbajte sa všeobecným frázam bez metrík.`,
      ats: `ATS najprv parsuje štruktúru a potom indexuje terms. Preto je dôležitá čistá štruktúra, dobré umiestnenie kľúčových slov a preview kontrola.`,
      mistakes: `Typické chyby: príliš všeobecné summary, tools bez dôkazu, keyword stuffing, ozdobný layout a slabé bullets.`,
      beforeAfter: `Slabá verzia opisuje aktivitu. Silnejšia verzia ukazuje zmenu, výsledok a dopad.`,
      faqTitle: "FAQ",
      links: `Čítajte ďalej:\n- [Kľúčové slová životopisu pre ${role}](/resume-keywords/${roleSlug})\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)\n- [ATS guides](/ats)`,
      images: `Návrhy obrázkov:\n- one-column resume mockup\n- before/after bullet card\n- ATS flow diagram`,
      cta: `Chcete to použiť na reálnu pozíciu?\n- [Spustiť ATS scan](/free-ats-resume-checker)\n- [Optimalizovať životopis](/app)`,
    },
    cs: {
      seoTitle: `${role} — příklad životopisu (ATS-friendly)`,
      meta: `Příklad životopisu pro ${role}: ATS-safe struktura, summary, skills, přepisy bulletů, chyby a FAQ.`,
      h1: `${role} — příklad životopisu (ATS-friendly)`,
      lead: `Praktický příklad životopisu pro ${role} se zaměřením na ${lane}, ATS parsování a silnější bullet body.`,
      intro: `Tato stránka ukazuje, jak připravit životopis pro **${role}**, který je čitelný pro ATS i recruitera. Silný životopis rychle potvrdí role fit a důkaz výsledků.\n\nPro tuto roli zvýrazněte **${keywordA}**, **${keywordB}** a **${keywordC}**.\n\nPodívejte se i na [klíčová slova životopisu pro ${role}](/resume-keywords/${roleSlug}).`,
      hiring: `Silný životopis prochází přes ATS, rychlý recruiter scan a pak hiring managera. Čím dřív ukážete ${lane}, tím lépe.`,
      template: `Nejbezpečnější ATS layout je jeden sloupec, standardní headings a čistý text. Vyhněte se tabulkám a sidebarům.`,
      summary: `Summary má být krátké: 2–4 věty, název role, pár klíčových slov a jeden důvěryhodný výsledek.`,
      skills: `Sekci Skills seskupujte logicky. Důležité terms se mají objevit i v Experience s důkazem.`,
      realistic: `Tento příklad berte jako kostru. Nejsilnější bullet body patří nahoru do poslední relevantní pozice.`,
      tailoring: `Úprava CV je krátký workflow: vytáhněte požadavky z job postu, upravte summary, přesuňte důležité skills a přepište lead bullets.`,
      bullets: `Nejlepší bullet body ukazují akci, kontext a výsledek. Vyhýbejte se obecným frázím bez metrik.`,
      ats: `ATS nejdřív parsuje strukturu a pak indexuje terms. Proto je důležitá čistá struktura, dobré rozmístění keywords a kontrola preview.`,
      mistakes: `Typické chyby: příliš obecné summary, tools bez důkazu, keyword stuffing, přeplácaný layout a slabé bullets.`,
      beforeAfter: `Slabá verze popisuje aktivitu. Silnější verze ukazuje změnu, výsledek a dopad.`,
      faqTitle: "FAQ",
      links: `Čtěte dál:\n- [Klíčová slova životopisu pro ${role}](/resume-keywords/${roleSlug})\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)\n- [ATS guides](/ats)`,
      images: `Nápady na obrázky:\n- one-column resume mockup\n- before/after bullet card\n- ATS flow diagram`,
      cta: `Chcete to použít na reálnou pozici?\n- [Spustit ATS scan](/free-ats-resume-checker)\n- [Optimalizovat životopis](/app)`,
    },
    es: {
      seoTitle: `${role} — ejemplo de CV (ATS-friendly)`,
      meta: `Ejemplo de CV para ${role}: estructura segura para ATS, summary, skills, reescrituras de bullets, errores y FAQ.`,
      h1: `${role} — ejemplo de CV (ATS-friendly)`,
      lead: `Ejemplo práctico de CV para ${role} con foco en ${lane}, parsing ATS y bullets más fuertes.`,
      intro: `Esta página muestra cómo construir un CV para **${role}** que sea claro tanto para ATS como para recruiters. Un buen CV confirma rápido el role fit y lo respalda con pruebas.\n\nPara este rol conviene destacar **${keywordA}**, **${keywordB}** y **${keywordC}**.\n\nTambién puedes abrir [palabras clave del CV para ${role}](/resume-keywords/${roleSlug}).`,
      hiring: `Un CV fuerte pasa por ATS, por el primer escaneo del recruiter y luego por el hiring manager. Cuanto antes hagas visible ${lane}, mejor.`,
      template: `El layout más seguro para ATS es una sola columna, headings estándar y texto limpio. Evita tablas y sidebars.`,
      summary: `El summary debe ser corto: 2–4 frases, el título objetivo, algunas keywords y una señal de credibilidad.`,
      skills: `Agrupa la sección Skills de forma lógica. Los terms importantes también deben aparecer en Experience con prueba.`,
      realistic: `Usa este ejemplo como estructura base. Los 3–6 bullets más fuertes deben ir arriba en la experiencia más relevante.`,
      tailoring: `Adaptar el CV es un workflow corto: extrae requisitos del job post, ajusta el summary, sube las skills relevantes y reescribe los lead bullets.`,
      bullets: `Los mejores bullets muestran acción, contexto y resultado. Evita frases genéricas sin métricas.`,
      ats: `ATS primero parsea la estructura y luego indexa los terms. Por eso importan más la estructura limpia, la colocación de keywords y la revisión del preview.`,
      mistakes: `Errores comunes: summary demasiado genérico, tools sin prueba, keyword stuffing, layout decorativo y bullets débiles.`,
      beforeAfter: `La versión débil describe actividad. La versión fuerte muestra cambio, resultado e impacto.`,
      faqTitle: "FAQ",
      links: `Sigue leyendo:\n- [Palabras clave del CV para ${role}](/resume-keywords/${roleSlug})\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)\n- [ATS guides](/ats)`,
      images: `Ideas de imágenes:\n- one-column resume mockup\n- before/after bullet card\n- ATS flow diagram`,
      cta: `¿Quieres aplicarlo a una vacante real?\n- [Ejecutar ATS scan](/free-ats-resume-checker)\n- [Optimizar CV](/app)`,
    },
  } as const;

  return generic[language as keyof typeof generic] ?? generic.pl;
}

const CONTENT_REVIEWED_AT = "2026-08-03";

const CATEGORY_LANES: Record<RoleCategory, string[]> = {
  engineering: ["systems", "delivery", "reliability", "performance", "ownership"],
  data: ["insights", "reporting", "experimentation", "data quality", "stakeholders"],
  product: ["roadmaps", "execution", "growth", "discovery", "alignment"],
  design: ["usability", "research", "design systems", "accessibility", "collaboration"],
  marketing: ["pipeline", "channel performance", "creative testing", "positioning", "measurement"],
  sales: ["pipeline", "quota", "discovery", "deal execution", "forecasting"],
  operations: ["process", "SLA performance", "cost control", "execution", "scaling"],
  finance: ["forecasting", "reporting", "controls", "stakeholder support", "decision quality"],
  hr: ["hiring", "people ops", "performance", "policy", "enablement"],
  customer: ["onboarding", "retention", "support quality", "expansion", "customer health"],
  legal: ["contracts", "risk", "compliance", "stakeholder partnership", "governance"],
  healthcare: ["care delivery", "documentation", "patient safety", "operations", "coordination"],
  education: ["instruction", "curriculum", "student outcomes", "program delivery", "assessment"],
  security: ["incident response", "risk reduction", "controls", "detection", "hardening"],
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

function pick<T>(items: T[], h: number, salt = 0): T {
  return items[(h + salt) % items.length];
}

function truncateTo(raw: string, maxChars: number): string {
  const s = (raw || "").replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 25) return cut.slice(0, lastSpace).trimEnd() + "…";
  return cut.trimEnd() + "…";
}

function countWords(text: string): number {
  const matches = (text || "").match(/[A-Za-z0-9']+/g);
  return matches ? matches.length : 0;
}

function titleForRole(role: string, h: number): string {
  const variants = [
    `${role} Resume Example (ATS-Friendly)`,
    `${role} Resume Example: Template + Bullet Tips`,
    `${role} Resume Example: Summary + Skills`,
    `${role} Resume Example for ATS`,
  ];
  return pick(variants, h, 19);
}

function metaForRole(role: string, lane: string, h: number): string {
  const variants = [
    `ATS-friendly ${role} resume example with template, summary, skills, and bullet rewrites. Includes mistakes to avoid and a checklist for ${lane}.`,
    `Copy-ready ${role} resume example for ATS with a clean template, summary ideas, bullet formulas, and a fast tailoring checklist for ${lane}.`,
    `A realistic ${role} resume example with ATS-safe layout, keyword strategy, measurable bullets, FAQ, and a practical submit checklist.`,
  ];
  return truncateTo(pick(variants, h, 23), 160);
}

function buildLead(role: string, lane: string, h: number): string {
  const variants = [
    `A realistic, ATS-safe ${role} resume example with bullets that prove impact in ${lane}. Copy the structure, then tailor to the vacancy.`,
    `Use this ${role} resume example to fix the two biggest problems: weak proof and missing keywords. Includes before/after rewrites and a fast checklist.`,
    `If your ${role} resume gets “no response”, this example shows what recruiters scan first: scope, keywords, and measurable outcomes.`,
  ];
  return pick(variants, h, 3);
}

function buildIntro(role: string, category: RoleCategory, lane: string, h: number): string {
  const openers = [
    `If you’re applying as a **${role}** and your resume isn’t converting to interviews, the problem is usually not “experience” — it’s signal.`,
    `Many ${role} resumes fail silently: the ATS parses them imperfectly, or recruiters can’t confirm value fast enough.`,
    `A ${role} resume can be strong and still get ignored if it doesn’t make ${lane} obvious in the first screen.`,
  ];

  const contextByCategory: Record<RoleCategory, string[]> = {
    engineering: [
      "Hiring teams look for evidence of ownership, shipped work, and measurable reliability or performance impact.",
      "Recruiters scan for stack fit, product context, and the kind of problems you’ve solved at real scale.",
    ],
    data: [
      "Hiring teams want proof you can turn messy data into decisions: metrics, dashboards, experiments, and business impact.",
      "Recruiters scan for tools (SQL, BI, Python) and how you measure outcomes, not just tasks.",
    ],
    product: [
      "Hiring teams look for clarity on product scope, cross-functional leadership, and measurable outcomes like activation or retention.",
      "Recruiters scan for bets you made, what shipped, and how success was measured.",
    ],
    design: [
      "Hiring teams look for outcomes (conversion, usability, accessibility) backed by process and collaboration evidence.",
      "Recruiters scan for a coherent narrative: problem → approach → tradeoffs → result.",
    ],
    marketing: [
      "Hiring teams want channel clarity and measurement: pipeline, CAC, conversion rates, and experiments.",
      "Recruiters scan for ownership, budget/scale, and outcomes—not generic “campaign” language.",
    ],
    sales: [
      "Hiring teams look for quota attainment, pipeline creation, deal cycles, and how you ran discovery.",
      "Recruiters scan for segment fit (SMB/Enterprise), motion, and measurable performance.",
    ],
    operations: [
      "Hiring teams want measurable process improvements: cycle time, SLAs, cost reduction, and execution under constraints.",
      "Recruiters scan for scope, cross-team coordination, and operational outcomes.",
    ],
    finance: [
      "Hiring teams look for accuracy, rigor, and stakeholder impact: forecasting, reporting, controls, and decision support.",
      "Recruiters scan for the type of finance work (FP&A, accounting, strategy) and measurable business outcomes.",
    ],
    hr: [
      "Hiring teams want proof of hiring outcomes, programs delivered, and operational excellence (time-to-hire, retention, enablement).",
      "Recruiters scan for systems, process ownership, and credibility signals.",
    ],
    customer: [
      "Hiring teams look for retention impact, customer outcomes, and how you reduced churn or improved adoption.",
      "Recruiters scan for segment fit, playbooks, and measurable customer health improvements.",
    ],
    legal: [
      "Hiring teams look for speed + rigor: contract cycles, risk mitigation, and stakeholder partnership.",
      "Recruiters scan for domains (commercial, privacy, corporate) and measurable workflow improvements.",
    ],
    healthcare: [
      "Hiring teams look for safety, documentation quality, and operational consistency under real constraints.",
      "Recruiters scan for coordination, patient outcomes, and compliance-aware work.",
    ],
    education: [
      "Hiring teams look for student outcomes, program delivery, and evidence-based instruction or support.",
      "Recruiters scan for measurable results, not only responsibilities.",
    ],
    security: [
      "Hiring teams look for concrete risk reduction: controls, detections, incidents handled, and measurable improvements.",
      "Recruiters scan for the security lane (SOC, cloud, appsec) and proof of ownership.",
    ],
  };

  const middle = pick(contextByCategory[category], h, 11);
  const closerOptions = [
    "Below is a copy-ready template with realistic bullets, a summary, a skills layout, and the exact before/after rewrite logic that improves ATS match *and* recruiter trust.",
    "This page gives you a clean ATS-safe structure, plus examples you can adapt without sounding robotic or exaggerating.",
    "Use this as a baseline: clean parsing first, then keyword alignment, then stronger proof in your recent experience.",
  ];

  return [pick(openers, h, 7), middle, pick(closerOptions, h, 31)].join("\n\n");
}

function buildTemplateSection(role: string, lane: string, h: number): SeoSection {
  const font = pick(["Calibri", "Arial", "Helvetica", "Times New Roman", "Verdana"], h, 41);
  const fileType = pick(["PDF", "DOCX"], h, 43);
  const table = [
    "| Element | ATS-safe default | Risky choice |",
    "| --- | --- | --- |",
    "| Layout | Single column | Two columns / sidebars |",
    "| Sections | Standard headings | Custom headings (“My Story”) |",
    "| Skills | Plain text lists | Icons, charts, or images |",
    "| Dates | Consistent format | Mixed formats and missing months |",
    "| Export | " + fileType + " with selectable text | Image-based PDF |",
  ].join("\n");

  return {
    title: "ATS-safe resume template (structure + formatting)",
    body:
      "Recruiters don’t read your resume like a blog post. Their initial scan focuses on **role fit** and **proof**.\n\n" +
      `To avoid ATS parsing issues, use a simple structure with predictable headings and readable text. This is the safest default for ${lane} roles.\n\n` +
      "### Recommended section order\n" +
      "- Contact (in the body, not in header/footer)\n" +
      "- Headline + Summary (2–4 sentences)\n" +
      "- Skills (grouped)\n" +
      "- Experience (reverse chronological)\n" +
      "- Education (and certifications if relevant)\n\n" +
      "### Formatting settings that rarely break parsing\n" +
      `- Font: **${font}** (10.5–12pt body)\n` +
      "- Margins: 0.5–1.0 inch\n" +
      "- Bullets: simple hyphen bullets `-` or standard round bullets\n" +
      "- Avoid tables/text boxes for critical content\n\n" +
      "### Quick “safe vs risky” table\n" +
      `${table}\n\n` +
      "Tip: the fastest test is the application portal preview. If your content reorders or disappears, simplify layout and re-upload.\n\n" +
      "If you want deeper formatting rules, start here: [ATS guides](/ats).",
  };
}

function buildHiringContextSection(role: string, category: RoleCategory, lane: string, h: number): SeoSection {
  const funnel = pick(
    [
      "High-volume hiring funnels reward speed. Your resume must make the *right* story obvious fast.",
      "Most rejections aren’t explicit “no” decisions — they’re non-decisions caused by uncertainty.",
      "In many pipelines, the ATS is not the enemy — ambiguity is. The ATS just surfaces what’s easy to index and confirm.",
    ],
    h,
    103,
  );

  const categoryNotes: Record<RoleCategory, string[]> = {
    engineering: [
      "For engineering roles, hiring teams want evidence of shipped work, ownership, and reliability/performance wins.",
      "Engineering resumes win when they show system context (what you built) and measurable outcomes (what improved).",
    ],
    data: [
      "For data roles, teams want decision impact: what changed because of your work, not just dashboards created.",
      "Data resumes win when they prove rigor (definitions, quality) and stakeholder outcomes (adoption, speed).",
    ],
    product: [
      "For product roles, teams want scope clarity and outcomes: what shipped, why it mattered, and how success was measured.",
      "Product resumes win when they show tradeoffs, alignment, and measurable impact on activation/retention/conversion.",
    ],
    design: [
      "For design roles, teams want outcome-driven work: usability improvements, accessibility, and collaboration evidence.",
      "Design resumes win when they connect research → decisions → results in plain language.",
    ],
    marketing: [
      "For marketing roles, teams want measurement: channel performance, pipeline impact, and experiments with learnings.",
      "Marketing resumes win when they show ownership, budget/scale, and metrics beyond vanity numbers.",
    ],
    sales: [
      "For sales roles, teams want performance: pipeline creation, win rate, quota attainment, and deal cycle evidence.",
      "Sales resumes win when they show motion fit (SMB/Enterprise), segment, and measurable outcomes.",
    ],
    operations: [
      "For operations roles, teams want execution: cycle time reductions, SLA improvements, and cost/control outcomes.",
      "Operations resumes win when they show how you improved systems under constraints.",
    ],
    finance: [
      "For finance roles, teams want rigor and stakeholder value: forecasting accuracy, close speed, decision support.",
      "Finance resumes win when they show what decisions improved because of your analysis or controls.",
    ],
    hr: [
      "For HR roles, teams want outcomes: hiring velocity, program adoption, retention improvements, and operational excellence.",
      "HR resumes win when they show systems thinking and credible metrics.",
    ],
    customer: [
      "For customer roles, teams want customer outcomes: retention, adoption, churn reduction, and playbooks that scale.",
      "Customer resumes win when they show measurable improvements and stakeholder partnership.",
    ],
    legal: [
      "For legal roles, teams want speed + rigor: contract cycle improvements, risk mitigation, compliance outcomes.",
      "Legal resumes win when they show business partnership and measurable workflow wins.",
    ],
    healthcare: [
      "For healthcare roles, teams want safety, documentation quality, coordination, and operational reliability.",
      "Healthcare resumes win when they show measurable outcomes and compliance-aware execution.",
    ],
    education: [
      "For education roles, teams want student outcomes, program delivery, and evidence-based instruction/support.",
      "Education resumes win when they show measurable improvements and clear scope.",
    ],
    security: [
      "For security roles, teams want provable risk reduction: detections, incidents handled, controls improved.",
      "Security resumes win when they show ownership and measurable reduction in exposure or incidents.",
    ],
  };

  return {
    title: "How hiring teams screen (ATS → recruiter → hiring manager)",
    body:
      `${funnel}\n\n` +
      `A typical flow looks like this:\n` +
      "1. **ATS parsing + indexing** (file → text → sections → searchable terms)\n" +
      "2. **Recruiter scan** (initial review: role alignment + keywords + credibility)\n" +
      "3. **Hiring manager skim** (do your bullets prove the work at the right scope?)\n\n" +
      `${pick(categoryNotes[category], h, 107)}\n\n` +
      `When your resume makes ${lane} obvious early, you remove uncertainty — and that increases shortlist probability.`,
  };
}

function buildSummaryExamplesSection(cluster: ResumeKeywordCluster, h: number): SeoSection {
  const role = cluster.role;
  const kwA = cluster.keywords[h % cluster.keywords.length];
  const kwB = cluster.keywords[(h + 5) % cluster.keywords.length];
  const kwC = cluster.keywords[(h + 11) % cluster.keywords.length];
  const lane = pick(CATEGORY_LANES[cluster.category], h, 61);

  return {
    title: "Illustrative resume summary templates (3 options you can adapt)",
    body:
      "These are illustrative templates, not claims to copy. Replace every bracketed placeholder with information you can verify.\n\n" +
      "A strong summary is short: **2–4 sentences**. It should include your target title, 2–4 role keywords, and one credibility signal.\n\n" +
      "### Option A: concise + keyword-aware\n" +
      `- ${role} with [years]+ years delivering ${lane} outcomes. Experience with ${kwA}, ${kwB}, and cross-functional execution. Known for clear ownership, verified results, and ATS-friendly communication.\n\n` +
      "### Option B: metric-first (credible proof)\n" +
      `- ${role} specializing in ${kwA} and ${kwC}. Improved ${lane} results by [X%] by tightening process, aligning to KPIs, and upgrading evidence in delivery. Comfortable partnering with stakeholders and shipping iteratively.\n\n` +
      "### Option C: fast tailoring version (for a specific vacancy)\n" +
      `- ${role} aligned to this role’s core requirements: ${kwA}, ${kwB}, ${kwC}. Proven track record delivering measurable outcomes in ${lane}. Seeking to bring the same execution and clarity to this team.\n\n` +
      "Tip: tailor Option C by swapping the three keywords to match the job post’s repeated must-haves.\n\n" +
      "Related: [Resume summary examples hub](/resume-summary).",
  };
}

function buildSkillsSection(cluster: ResumeKeywordCluster, h: number): SeoSection {
  const role = cluster.role;
  const lanes = CATEGORY_LANES[cluster.category];
  const lane = pick(lanes, h, 71);
  const pool = cluster.keywords.slice(0, 36);
  const chunkA = pool.slice(0, 12);
  const chunkB = pool.slice(12, 24);
  const chunkC = pool.slice(24, 36);

  return {
    title: "Skills section example (grouped, ATS-safe)",
    body:
      "Most weak resumes hide keywords in a long Skills wall. A better approach is grouping skills by capability so ATS can index them and recruiters can scan them.\n\n" +
      `### Example (for ${role})\n` +
      `- **Core (${lane}):** ${chunkA.join(", ")}\n` +
      `- **Tools / Systems:** ${chunkB.join(", ")}\n` +
      `- **Methods / Workflow:** ${chunkC.join(", ")}\n\n` +
      "Rule of thumb: if a term matters, it should also appear at least once in an Experience bullet with proof.\n\n" +
      `Next: compare your Skills to a role checklist: [Resume keywords for ${role}](/resume-keywords/${cluster.slug}).`,
  };
}

function buildTailoringWorkflowSection(cluster: ResumeKeywordCluster, h: number): SeoSection {
  const role = cluster.role;
  const mustHaveA = cluster.keywords[h % cluster.keywords.length];
  const mustHaveB = cluster.keywords[(h + 4) % cluster.keywords.length];
  const mustHaveC = cluster.keywords[(h + 9) % cluster.keywords.length];

  const table = [
    "| Job post signal | Where to reflect it | Proof idea (bullet) |",
    "| --- | --- | --- |",
    `| ${mustHaveA} | Summary + Skills + 1 bullet | Used ${mustHaveA} to improve a KPI (time/quality/cost) |`,
    `| ${mustHaveB} | Skills + 1 bullet | Delivered work with ${mustHaveB}; reduced rework or improved throughput |`,
    `| ${mustHaveC} | Summary + 1 bullet | Owned ${mustHaveC} scope; measurable result + stakeholder impact |`,
  ].join("\n");

  return {
    title: `How to tailor a ${role} resume with a repeatable workflow`,
    body:
      "Tailoring is not a full rewrite. It’s a short, high-leverage edit pass that increases match and readability.\n\n" +
      "### The repeatable workflow\n" +
      "1. Clean parsing first (one column, standard headings).\n" +
      "2. Extract repeated must-haves from the vacancy (8–15 terms).\n" +
      "3. Update summary (title + 2–4 must-haves + one proof signal).\n" +
      "4. Reorder skills (put must-haves first).\n" +
      "5. Rewrite the first 3–6 bullets in your most recent relevant role.\n" +
      "6. Re-check the application preview for parsing.\n\n" +
      "### Mapping table (example)\n" +
      `${table}\n\n` +
      "This keeps your resume honest and specific while improving ATS match.\n\n" +
      "Practical next step: run one scan and fix only the biggest gaps: [Free ATS resume checker](/free-ats-resume-checker).",
  };
}

function buildResumeSnippet(role: string, cluster: ResumeKeywordCluster, h: number): string {
  const lane = pick(CATEGORY_LANES[cluster.category], h, 9);
  const kwA = cluster.keywords[h % cluster.keywords.length];
  const kwB = cluster.keywords[(h + 7) % cluster.keywords.length];
  const titleLine = pick(
    [
      `${role} • ${kwA} • ${kwB}`,
      `${role} • ${kwA} • ${lane}`,
      `${role} • ${kwB} • measurable impact`,
    ],
    h,
    17,
  );

  return (
    "```text\n" +
    "ILLUSTRATIVE TEMPLATE — REPLACE ALL BRACKETED PLACEHOLDERS WITH VERIFIED FACTS\n" +
    "FIRST LAST\n" +
    "City, Country | email@domain.com | +1 (555) 555-5555 | linkedin.com/in/handle\n" +
    "\n" +
    `${titleLine}\n` +
    "\n" +
    "SUMMARY\n" +
    `- ${role} focused on ${lane}; proved impact with measurable outcomes and ATS-aligned keywords.\n` +
    `- Experience with ${kwA}, ${kwB}, and cross-functional delivery.\n` +
    "\n" +
    "SKILLS\n" +
    `- Core: ${cluster.keywords.slice(0, 10).join(", ")}\n` +
    "\n" +
    "EXPERIENCE\n" +
    "Role Title | Company | [Start date]–[End date or Present]\n" +
    `- Improved ${lane} outcomes by [X%] by aligning work to priority metrics and tightening execution.\n` +
    `- Built repeatable process for ${kwA}; reduced verified rework by [X%] with clearer ownership and QA checkpoints.\n` +
    "\n" +
    "EDUCATION\n" +
    "Degree | University | [Graduation date]\n" +
    "```\n"
  );
}

function buildExampleBullets(cluster: ResumeKeywordCluster, h: number): string {
  const lanes = CATEGORY_LANES[cluster.category];
  const lane = pick(lanes, h, 5);

  const exampleLines = [
    `- Drove ${lane} improvements; reduced verified cycle time by [X%] by clarifying ownership and removing duplicate steps.`,
    `- Partnered cross-functionally to deliver ${cluster.keywords[(h + 3) % cluster.keywords.length]}; improved a verified KPI from [baseline] to [measured result].`,
    `- Built a repeatable workflow around ${cluster.keywords[(h + 9) % cluster.keywords.length]}; cut verified avoidable rework by [X%].`,
    "- Created a reporting cadence for stakeholders; reduced verified decision lag by [X%] by standardizing metrics and cadence.",
  ];

  const fromCluster = cluster.examples
    .slice(0, 4)
    .map((ex) => `- **Before:** ${ex.before}\n- **After:** ${ex.after}`)
    .join("\n\n");

  return (
    "### Illustrative resume bullet templates (replace placeholders with verified results)\n" +
    exampleLines.join("\n") +
    "\n\n" +
    "### Illustrative before/after rewrites (keep only facts you can verify)\n" +
    fromCluster
  );
}

function buildAtsOptimizationSection(cluster: ResumeKeywordCluster, role: string, h: number): SeoSection {
  const kwFocus = cluster.keywords.slice(0, 14);
  const keywordHint = kwFocus.slice(0, 6).join(", ");

  const paragraphA = pick(
    [
      "ATS systems don’t “understand” your resume like a human. They convert your file to text, try to detect sections, and index terms for searching and matching.",
      "Most ATS friction is not rejection logic—it’s parsing and matching. If your content is mis-parsed, your strongest keywords can land in the wrong place.",
      "The ATS layer is usually two steps: parse → index. You win by making parsing predictable and keywords easy to confirm in context.",
    ],
    h,
    47,
  );

  return {
    title: "ATS optimization (parsing, keywords, recruiter scan)",
    body:
      `${paragraphA}\n\n` +
      "### How to improve ATS match without keyword stuffing\n" +
      `- Extract 8–15 must-have terms from the job post (start with: ${keywordHint}).\n` +
      "- Place keywords in 3 places: Summary, Skills, and Experience bullets.\n" +
      "- Prove keywords in bullets (scope + outcome). Proof beats lists.\n" +
      "- Keep headings standard: Summary, Skills, Experience, Education.\n\n" +
      `### Recruiter scan behavior (what gets you shortlisted as ${role})\n` +
      "- First screen: title alignment, scope, and relevance.\n" +
      "- Recent role: the first 3–6 bullets carry most weight.\n" +
      "- Evidence: numbers, ownership language, and credible tools.\n\n" +
      "### Fast test\n" +
      "Upload your resume to the employer portal and review the parsed preview. If sections scramble, simplify layout and re-export before optimizing wording.\n\n" +
      "Want the fastest keyword gap check against a specific vacancy? Try: [Free ATS resume checker](/free-ats-resume-checker).",
  };
}

function buildCommonMistakesSection(cluster: ResumeKeywordCluster, role: string, h: number): SeoSection {
  const lane = pick(CATEGORY_LANES[cluster.category], h, 13);
  const mistakes = [
    `Using a generic summary that never mentions ${lane} outcomes for ${role}.`,
    "Listing tools/skills without proof in Experience (recruiters want evidence, not a shopping list).",
    "Over-formatting: columns, tables, sidebars, or icons that break ATS parsing.",
    "Keyword stuffing: repeating terms without new context or measurable results.",
    "Vague bullets (“helped”, “worked on”, “responsible for”) that hide ownership and impact.",
    ...cluster.mistakes.slice(0, 4).map((m) => `${m}`),
  ];
  return {
    title: "Common mistakes (and why they hurt)",
    body:
      "### Mistakes recruiters and ATS systems penalize\n" +
      mistakes
        .map((m) => `- ${m}`)
        .join("\n") +
      "\n\n" +
      "Tip: if you fix parsing + proof quality, your keyword alignment usually improves automatically.",
  };
}

function buildBeforeAfterSection(role: string, cluster: ResumeKeywordCluster, h: number): SeoSection {
  const lane = pick(CATEGORY_LANES[cluster.category], h, 27);
  const kw = cluster.keywords[(h + 5) % cluster.keywords.length];
  const weak = [
    `- Worked on ${kw} and helped the team deliver projects.`,
    `- Responsible for improving ${lane} and supporting stakeholders.`,
    "- Created reports and communicated status updates.",
  ];
  const strong = [
    `- Delivered ${kw} improvements; increased reliability and reduced verified rework by [X%] by adding clear validation + ownership.`,
    `- Improved verified ${lane} outcomes by [X%] by prioritizing high-signal work and tightening execution against KPIs.`,
    "- Built a reporting cadence; reduced verified decision lag by [X%] with standardized metrics and consistent updates.",
  ];

  return {
    title: "Before/after transformation (weak → optimized)",
    body:
      "These are illustrative templates. Replace bracketed placeholders with verified facts and preserve the truth of your original experience.\n\n" +
      "### Weak version (common but low-signal)\n" +
      weak.map((l) => `- ${l}`).join("\n") +
      "\n\n" +
      "### Optimized version (same truth, better signal)\n" +
      strong.map((l) => `- ${l}`).join("\n") +
      "\n\n" +
      "### Why the optimized version performs better\n" +
      "- It names a keyword once (so ATS can match) and proves it with context.\n" +
      "- It uses measurable outcomes (so recruiters can trust the claim).\n" +
      "- It uses ownership language (so your responsibility is clear).\n",
  };
}

function buildFaq(role: string, cluster: ResumeKeywordCluster, h: number): SeoFaqItem[] {
  const lane = pick(CATEGORY_LANES[cluster.category], h, 37);
  const kwA = cluster.keywords[h % cluster.keywords.length];
  const kwB = cluster.keywords[(h + 6) % cluster.keywords.length];

  const faq: SeoFaqItem[] = [
    {
      question: `How long should a ${role} resume be?`,
      answer:
        "Most candidates: 1–2 pages. Prioritize high-signal bullets and recent relevant work over listing every task. Clarity beats volume.",
    },
    {
      question: `Should I use a ${role} resume template?`,
      answer:
        "Use a simple single-column template with standard headings. Avoid design-heavy templates that rely on tables, sidebars, or icons for critical text.",
    },
    {
      question: `How do I tailor a ${role} resume to a job description fast?`,
      answer:
        "Extract the top 8–15 must-have terms, update your summary, reorder skills, and rewrite the first 3–6 bullets in your most recent relevant role to prove the requirements.",
    },
    {
      question: `Where do keywords matter most for a ${role} resume?`,
      answer:
        `Experience bullets with proof, then summary, then skills. Put terms like ${kwA} and ${kwB} in context with outcomes; do not paste a list.`,
    },
    {
      question: "Can I reuse job description phrasing?",
      answer:
        "Yes when it’s true. Mirror terminology once, then prove it. Avoid copying full sentences—recruiters notice and it reduces trust.",
    },
    {
      question: `What metrics should a ${role} resume include?`,
      answer:
        `Pick outcomes tied to ${lane}: time saved, quality gains, cost reduction, pipeline/retention impact, reliability improvements, or decision speed. Use before/after or baseline→result framing.`,
    },
    {
      question: "PDF or DOCX for ATS?",
      answer:
        "Follow the employer’s instruction. If none is provided, test both and choose the one that parses cleanly in the application preview. Clean parsing matters more than the format name.",
    },
    {
      question: "What’s the #1 reason good resumes still get ignored?",
      answer:
        "Weak proof density. Recruiters need to confirm fit fast: role scope, keywords, and measurable outcomes in the first few bullets.",
    },
  ];

  return faq;
}

function buildInternalLinks(roleSlug: string, role: string): SeoInternalLink[] {
  return [
    { href: `/resume-keywords/${roleSlug}`, anchor: `Resume keywords for ${role}` },
    { href: "/resume-examples", anchor: "Browse more resume examples by role" },
    { href: "/resume-summary", anchor: "Resume summary examples" },
    { href: "/resume-bullets", anchor: "Resume bullet examples and formulas" },
    { href: "/ats", anchor: "ATS guides and formatting rules" },
    { href: "/resume-for", anchor: "Resume guides for special cases (career change, remote, etc.)" },
    { href: "/free-ats-resume-checker", anchor: "Free ATS resume checker" },
  ];
}

export function buildResumeExampleSeoPage(
  cluster: ResumeKeywordCluster,
  relatedRoles: ResumeKeywordCluster[],
  language: Language = "en",
): ResumeExampleSeoPage {
  if (language !== "en") {
    const h = hashString(`${cluster.slug}:${language}`);
    const lane = pick(CATEGORY_LANES[cluster.category], h, 2);
    const copy = getLocalizedExampleCopy(language, cluster.role, cluster.slug, lane, cluster.keywords);
    const sections: SeoSection[] = [
      { title: replaceSectionTitle("Introduction", language), body: copy.intro },
      { title: replaceSectionTitle("How hiring teams screen (ATS → recruiter → hiring manager)", language), body: copy.hiring },
      { title: replaceSectionTitle("ATS-safe resume template (structure + formatting)", language), body: copy.template },
      { title: replaceSectionTitle("Resume summary examples (3 options you can adapt)", language), body: copy.summary },
      { title: replaceSectionTitle("Skills section example (grouped, ATS-safe)", language), body: copy.skills },
      { title: replaceSectionTitle("Realistic resume example (copy the structure, then tailor)", language), body: copy.realistic },
      { title: replaceSectionTitle(`How to tailor a ${cluster.role} resume with a repeatable workflow`, language), body: copy.tailoring },
      { title: replaceSectionTitle("Realistic examples (bullets + rewrites)", language), body: copy.bullets },
      { title: replaceSectionTitle("ATS optimization (parsing, keywords, recruiter scan)", language), body: copy.ats },
      { title: replaceSectionTitle("Common mistakes (and why they hurt)", language), body: copy.mistakes },
      { title: replaceSectionTitle("Before/after transformation (weak → optimized)", language), body: copy.beforeAfter },
      { title: replaceSectionTitle("FAQ", language), body: `- **${copy.faqTitle}?** ${copy.lead}` },
      { title: replaceSectionTitle("Internal links (next reads)", language), body: copy.links },
      { title: replaceSectionTitle("Suggested image ideas (optional)", language), body: copy.images },
      { title: replaceSectionTitle("Soft CTA", language), body: copy.cta },
    ];

    const faq: SeoFaqItem[] = [
      {
        question: `${copy.faqTitle}?`,
        answer: copy.lead,
      },
    ];

    const relatedPages: SeoRelatedPage[] = relatedRoles.slice(0, 10).map((item) => ({
      href: `/resume-examples/${item.slug}`,
      title: `${item.role} Resume Example (ATS-Friendly)`,
    }));

    const similarRoles = relatedRoles.slice(0, 10).map((item) => ({
      slug: item.slug,
      role: item.role,
    }));

    const internalLinks = buildInternalLinks(cluster.slug, cluster.role);
    const estimatedWordCount = countWords(
      [copy.seoTitle, copy.meta, copy.h1, copy.lead, ...sections.map((section) => `${section.title}\n${section.body}`)].join("\n\n"),
    );

    return {
      slug: cluster.slug,
      role: cluster.role,
      seoTitle: truncateTo(copy.seoTitle, 60),
      metaDescription: truncateTo(copy.meta, 160),
      h1: copy.h1,
      lead: copy.lead,
      updatedAt: CONTENT_REVIEWED_AT,
      sections,
      faq,
      internalLinks,
      relatedPages,
      similarRoles,
      imageIdeas: [],
      estimatedWordCount,
    };
  }

  const h = hashString(cluster.slug);
  const lane = pick(CATEGORY_LANES[cluster.category], h, 2);

  const seoTitle = truncateTo(titleForRole(cluster.role, h), 60);
  const metaDescription = metaForRole(cluster.role, lane, h);
  const h1 = `${cluster.role} Resume Example (ATS-Friendly)`;
  const lead = buildLead(cluster.role, lane, h);

  const intro: SeoSection = {
    title: "Introduction",
    body:
      buildIntro(cluster.role, cluster.category, lane, h) +
      "\n\n" +
      `If you want the role keyword checklist, start here: [Resume keywords for ${cluster.role}](/resume-keywords/${cluster.slug}).`,
  };

  const hiringContext = buildHiringContextSection(cluster.role, cluster.category, lane, h);
  const template = buildTemplateSection(cluster.role, lane, h);
  const summaryExamples = buildSummaryExamplesSection(cluster, h);
  const skillsSection = buildSkillsSection(cluster, h);
  const tailoringSection = buildTailoringWorkflowSection(cluster, h);

  const exampleSection: SeoSection = {
    title: "Illustrative resume template (copy the structure, then tailor)",
    body:
      "Below is a **structure-first** example. Replace placeholders with your truth, then tailor keywords to the vacancy.\n\n" +
      buildResumeSnippet(cluster.role, cluster, h) +
      "### Notes\n" +
      "- Keep contact info in the body (not header/footer).\n" +
      "- Use standard headings.\n" +
      "- Make your first 3–6 bullets the strongest proof.\n",
  };

  const bulletsSection: SeoSection = {
    title: "Illustrative bullet templates and rewrites",
    body: buildExampleBullets(cluster, h),
  };

  const atsSection = buildAtsOptimizationSection(cluster, cluster.role, h);
  const mistakesSection = buildCommonMistakesSection(cluster, cluster.role, h);
  const beforeAfterSection = buildBeforeAfterSection(cluster.role, cluster, h);

  const faq = buildFaq(cluster.role, cluster, h);
  const faqSection: SeoSection = {
    title: "FAQ",
    body:
      faq
        .map((item) => `- **${item.question}** ${item.answer}`)
        .join("\n"),
  };

  const internalLinks = buildInternalLinks(cluster.slug, cluster.role);
  const internalLinkSection: SeoSection = {
    title: "Internal links (next reads)",
    body: internalLinks.map((l) => `- [${l.anchor}](${l.href})`).join("\n"),
  };

  const ctaSection: SeoSection = {
    title: "Soft CTA",
    body:
      "Want to see how ATS systems interpret your resume against a specific vacancy? CVBoosta can highlight keyword gaps, formatting risks, and give you a draft you can review before exporting:\n\n" +
      "- [Run a free ATS scan](/free-ats-resume-checker)\n" +
      "- [Optimize my resume](/app)\n",
  };

  const relatedPages: SeoRelatedPage[] = relatedRoles.slice(0, 10).map((item) => ({
    href: `/resume-examples/${item.slug}`,
    title: `${item.role} Resume Example (ATS-Friendly)`,
  }));

  const similarRoles = relatedRoles.slice(0, 10).map((item) => ({
    slug: item.slug,
    role: item.role,
  }));

  const imageIdeas = [
    `A clean one-column ${cluster.role} resume mockup (ATS-safe)`,
    "Before/after bullet rewrite card (weak vs optimized)",
    "Keyword placement diagram (Summary → Skills → Experience)",
    "ATS parsing flow illustration (upload → parse → index → match)",
  ];

  const imageIdeasSection: SeoSection = {
    title: "Suggested image ideas (optional)",
    body: imageIdeas.map((idea) => `- ${idea}`).join("\n"),
  };

  const sections = [
    intro,
    hiringContext,
    template,
    summaryExamples,
    skillsSection,
    exampleSection,
    tailoringSection,
    bulletsSection,
    atsSection,
    mistakesSection,
    beforeAfterSection,
    faqSection,
    internalLinkSection,
    imageIdeasSection,
    ctaSection,
  ];

  const estimatedWordCount = countWords(
    [
      seoTitle,
      metaDescription,
      h1,
      lead,
      ...sections.map((s) => `${s.title}\n${s.body}`),
    ].join("\n\n"),
  );

  // Ensure pages are not thin: if low, append a role-specific appendix.
  const minWords = 1800;
  if (estimatedWordCount < minWords) {
    const kwSlice = cluster.keywords.slice(0, 30);
    const appendix: SeoSection = {
      title: "Appendix: keyword + proof bank (role-specific)",
      body:
        `Use these terms as a checklist, then **prove** them in bullets (scope + outcome). For ${cluster.role}, start with:\n\n` +
        kwSlice.map((k) => `- ${k}`).join("\n") +
        "\n\n" +
        "### Proof patterns recruiters trust\n" +
        "- Baseline → change → verified result (e.g., [baseline] → [measured result])\n" +
        "- Time saved / cycle time reduced\n" +
        "- Quality improved / incidents reduced\n" +
        "- Revenue protected / pipeline improved\n" +
        "- SLA/SLO improvements (where applicable)\n",
    };
    sections.splice(6, 0, appendix); // before FAQ
  }

  const finalWordCount = countWords(
    [
      seoTitle,
      metaDescription,
      h1,
      lead,
      ...sections.map((s) => `${s.title}\n${s.body}`),
    ].join("\n\n"),
  );

  return {
    slug: cluster.slug,
    role: cluster.role,
    seoTitle,
    metaDescription,
    h1,
    lead,
    updatedAt: CONTENT_REVIEWED_AT,
    sections,
    faq,
    internalLinks,
    relatedPages,
    similarRoles,
    imageIdeas,
    estimatedWordCount: finalWordCount,
  };
}
