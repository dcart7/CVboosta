import type { Language } from "./translations";
import type { BlogPost } from "./blogPosts";

type Dict = Array<[string, string]>;

const DICTS: Record<Exclude<Language, "en">, Dict> = {
  uk: [
    ["How to ", "Як "],
    ["Top ", "Топ "],
    ["Use ", "Використовуйте "],
    ["Resume", "Резюме"],
    ["resume", "резюме"],
    ["CV", "CV"],
    ["ATS", "ATS"],
    ["score", "бал"],
    ["Score", "Бал"],
    ["job description", "опис вакансії"],
    ["keywords", "ключові слова"],
    ["Keyword", "Ключове слово"],
    ["checklist", "чекліст"],
    ["guide", "гайд"],
    ["tips", "поради"],
    ["workflow", "процес"],
    ["optimization", "оптимізація"],
    ["optimize", "оптимізувати"],
    ["published", "опубліковано"],
    ["Key takeaway", "Ключова думка"],
    ["Tip", "Порада"],
    ["career switch", "зміна кар'єри"],
    ["impact", "вплив"],
    ["interview", "співбесіда"],
    ["cover letter", "супровідний лист"],
    ["remote", "віддалена робота"],
    ["weekly", "щотижневий"],
    ["application", "заявка"],
    ["history", "історія"],
    ["before", "до"],
    ["after", "після"],
    [" and ", " та "],
    [" with ", " з "],
    [" for ", " для "],
    [" to ", " щоб "],
  ],
  pl: [
    ["How to ", "Jak "],
    ["Top ", "Najważniejsze "],
    ["Use ", "Użyj "],
    ["Resume", "CV"],
    ["resume", "cv"],
    ["CV", "CV"],
    ["ATS", "ATS"],
    ["score", "wynik"],
    ["Score", "Wynik"],
    ["job description", "opis stanowiska"],
    ["keywords", "słowa kluczowe"],
    ["checklist", "checklista"],
    ["guide", "poradnik"],
    ["tips", "wskazówki"],
    ["workflow", "proces"],
    ["optimization", "optymalizacja"],
    ["optimize", "optymalizować"],
    ["published", "opublikowano"],
    ["Key takeaway", "Najważniejszy wniosek"],
    ["Tip", "Wskazówka"],
    ["career switch", "zmiana kariery"],
    ["impact", "wpływ"],
    ["interview", "rozmowa rekrutacyjna"],
    ["cover letter", "list motywacyjny"],
    ["remote", "zdalna"],
    ["weekly", "tygodniowy"],
    ["application", "aplikacja"],
    ["history", "historia"],
    ["before", "przed"],
    ["after", "po"],
    [" and ", " i "],
    [" with ", " z "],
    [" for ", " dla "],
    [" to ", " aby "],
  ],
  sk: [
    ["How to ", "Ako "],
    ["Top ", "Top "],
    ["Use ", "Použite "],
    ["Resume", "Životopis"],
    ["resume", "životopis"],
    ["CV", "CV"],
    ["ATS", "ATS"],
    ["score", "skóre"],
    ["Score", "Skóre"],
    ["job description", "popis práce"],
    ["keywords", "kľúčové slová"],
    ["checklist", "kontrolný zoznam"],
    ["guide", "sprievodca"],
    ["tips", "tipy"],
    ["workflow", "postup"],
    ["optimization", "optimalizácia"],
    ["optimize", "optimalizovať"],
    ["published", "publikované"],
    ["Key takeaway", "Hlavná myšlienka"],
    ["Tip", "Tip"],
    ["career switch", "zmena kariéry"],
    ["impact", "dopad"],
    ["interview", "pohovor"],
    ["cover letter", "motivačný list"],
    ["remote", "remote"],
    ["weekly", "týždenný"],
    ["application", "žiadosť"],
    ["history", "história"],
    ["before", "pred"],
    ["after", "po"],
    [" and ", " a "],
    [" with ", " s "],
    [" for ", " pre "],
    [" to ", " na "],
  ],
  cs: [
    ["How to ", "Jak "],
    ["Top ", "Top "],
    ["Use ", "Použijte "],
    ["Resume", "Životopis"],
    ["resume", "životopis"],
    ["CV", "CV"],
    ["ATS", "ATS"],
    ["score", "skóre"],
    ["Score", "Skóre"],
    ["job description", "popis pozice"],
    ["keywords", "klíčová slova"],
    ["checklist", "checklist"],
    ["guide", "průvodce"],
    ["tips", "tipy"],
    ["workflow", "postup"],
    ["optimization", "optimalizace"],
    ["optimize", "optimalizovat"],
    ["published", "publikováno"],
    ["Key takeaway", "Hlavní myšlenka"],
    ["Tip", "Tip"],
    ["career switch", "změna kariéry"],
    ["impact", "dopad"],
    ["interview", "pohovor"],
    ["cover letter", "motivační dopis"],
    ["remote", "na dálku"],
    ["weekly", "týdenní"],
    ["application", "žádost"],
    ["history", "historie"],
    ["before", "před"],
    ["after", "po"],
    [" and ", " a "],
    [" with ", " s "],
    [" for ", " pro "],
    [" to ", " pro "],
  ],
  es: [
    ["How to ", "Cómo "],
    ["Top ", "Principales "],
    ["Use ", "Usa "],
    ["Resume", "Currículum"],
    ["resume", "currículum"],
    ["CV", "CV"],
    ["ATS", "ATS"],
    ["score", "puntuación"],
    ["Score", "Puntuación"],
    ["job description", "descripción del puesto"],
    ["keywords", "palabras clave"],
    ["checklist", "checklist"],
    ["guide", "guía"],
    ["tips", "consejos"],
    ["workflow", "flujo de trabajo"],
    ["optimization", "optimización"],
    ["optimize", "optimizar"],
    ["published", "publicado"],
    ["Key takeaway", "Idea clave"],
    ["Tip", "Consejo"],
    ["career switch", "cambio de carrera"],
    ["impact", "impacto"],
    ["interview", "entrevista"],
    ["cover letter", "carta de presentación"],
    ["remote", "remoto"],
    ["weekly", "semanal"],
    ["application", "solicitud"],
    ["history", "historial"],
    ["before", "antes"],
    ["after", "después"],
    [" and ", " y "],
    [" with ", " con "],
    [" for ", " para "],
    [" to ", " para "],
  ],
};

type LocalizedPostFields = Pick<
  BlogPost,
  "title" | "excerpt" | "lead" | "sections" | "takeawayTitle" | "takeawayBody"
>;

const BLOG_OVERRIDES: Record<Exclude<Language, "en">, Record<string, LocalizedPostFields>> = {
  uk: {
    "how-to-pass-ats-screening": {
      title: "Як пройти ATS-відбір: 7 практичних кроків",
      excerpt:
        "Чіткий ATS-чекліст, щоб покращити читаність резюме, релевантність ключових слів і видимість для рекрутера.",
      lead: "Щоб пройти ATS, потрібні структура, релевантність і докази, а не спам ключовими словами.",
      sections: [
        {
          title: "1) Використовуйте чистий одноколонковий формат",
          body: "Уникайте складних макетів, таблиць, текстових блоків і декоративної графіки, які можуть зламати ATS-парсинг. Чіткі заголовки та стабільні відступи безпечніші.",
        },
        {
          title: "2) Розміщуйте ключові слова у правильних секціях",
          body: "Додавайте ключові терміни з вакансії в summary, skills і останній досвід. Використовуйте їх природно лише там, де це реально підтверджено вашим бекграундом.",
        },
        {
          title: "3) Переписуйте слабкі bullet points у доказові",
          body: "Замінюйте загальні фрази на дія + контекст + вимірюваний результат. Це покращує ATS-оцінку і пришвидшує перевірку рекрутером.",
        },
        {
          title: "4) Тримайте дати, посади й компанії у стандартному вигляді",
          body: "Використовуйте звичні формати дат і назви посад, щоб системи коректно зчитували вашу кар'єрну хронологію.",
        },
        {
          title: "5) Додавайте релевантні hard skills",
          body: "Пріоритезуйте інструменти, платформи та методи, які прямо запитуються у вакансії.",
        },
        {
          title: "6) Прибирайте непідтверджені ключові слова",
          body: "Не додавайте терміни, які не можете підтвердити у досвіді. Рекрутери швидко помічають завищені твердження.",
        },
        {
          title: "7) Робіть фінальний ATS-QA перед відправкою",
          body: "Перед відгуком перевірте, що документ лишився читабельним, фокусним під роль і фактично точним після всіх правок.",
        },
      ],
      takeawayTitle: "Ключова думка",
      takeawayBody:
        "ATS проходиться тоді, коли резюме легко парситься, відповідає мові ролі та підтверджене реальними результатами.",
    },
    "how-to-write-high-quality-resume": {
      title: "Як скласти якісне резюме, яке приводить до співбесід",
      excerpt:
        "Практичний фреймворк для резюме, яке є зрозумілим, достовірним і оптимізованим і для ATS, і для hiring-команди.",
      lead: "Якісне резюме - це не більше тексту, а точніші докази в правильній структурі.",
      sections: [
        {
          title: "1) Почніть із цільового заголовка та summary",
          body: "Вкажіть цільову роль, ключові сильні сторони й бізнес-вплив у перших рядках, щоб вашу цінність було видно одразу.",
        },
        {
          title: "2) Ставте релевантність вище за повноту",
          body: "Залишайте лише досвід, що підтримує цільову роль. Прибирайте низькосигнальні деталі, які розмивають позиціонування.",
        },
        {
          title: "3) Додавайте вимірювані досягнення у ключові bullets",
          body: "Показуйте результат через числа, масштаб і контекст. Квантифікований вплив підвищує довіру та відрізняє вас від інших.",
        },
        {
          title: "4) Будуйте сфокусовану секцію skills",
          body: "Групуйте навички за компетенціями й узгоджуйте формулювання з вакансією. Уникайте випадкових списків без доказів.",
        },
        {
          title: "5) Тримайте формат дружнім до рекрутера",
          body: "Використовуйте читабельні шрифти, чітку ієрархію секцій і стабільні відступи. Це покращує швидкість читання і для ATS, і для людини.",
        },
        {
          title: "6) Адаптуйте резюме під кожну заявку",
          body: "Підлаштовуйте summary, топ-навички й перші bullets досвіду під конкретну вакансію, а не надсилайте один універсальний файл.",
        },
        {
          title: "7) Робіть фінальну перевірку якості",
          body: "Перевірте узгодженість, граматику, дати й посилання. Дрібні помилки часто знижують довіру ще до етапу співбесіди.",
        },
      ],
      takeawayTitle: "Ключова думка",
      takeawayBody:
        "Якісне резюме - це конкретика, релевантність до ролі та докази результатів від першого до останнього блоку.",
    },
  },
  pl: {
    "how-to-pass-ats-screening": {
      title: "Jak przejść screening ATS: 7 praktycznych kroków",
      excerpt:
        "Jasna checklista ATS, która poprawia czytelność CV, trafność słów kluczowych i widoczność dla rekrutera.",
      lead: "Przejście ATS opiera się na strukturze, trafności i dowodach, a nie na spamie słowami kluczowymi.",
      sections: [
        {
          title: "1) Użyj czystego, jednokolumnowego układu",
          body: "Unikaj złożonych layoutów, tabel, pól tekstowych i dekoracyjnej grafiki, które psują parsowanie ATS. Czytelne nagłówki i spójne odstępy są bezpieczniejsze.",
        },
        {
          title: "2) Dopasuj słowa kluczowe do właściwych sekcji",
          body: "Umieść kluczowe terminy z ogłoszenia w podsumowaniu, sekcji umiejętności i ostatnim doświadczeniu. Używaj ich naturalnie, tylko tam gdzie masz potwierdzenie.",
        },
        {
          title: "3) Zamień słabe bullet points na bullet points z dowodem",
          body: "Zastąp ogólne zdania schematem działanie + kontekst + mierzalny wynik. To poprawia wynik ATS i przyspiesza ocenę rekrutera.",
        },
        {
          title: "4) Zachowaj standard dat, stanowisk i nazw firm",
          body: "Stosuj typowe formaty dat i nazw stanowisk, aby system poprawnie odczytał Twoją oś czasu.",
        },
        {
          title: "5) Dodaj twarde umiejętności zgodne z rolą",
          body: "Priorytetyzuj narzędzia, platformy i metody, których oferta wymaga wprost.",
        },
        {
          title: "6) Usuń niepotwierdzone słowa kluczowe",
          body: "Nie dodawaj terminów, których nie możesz udowodnić w doświadczeniu. Rekruterzy szybko wyłapują zawyżone deklaracje.",
        },
        {
          title: "7) Zrób końcowy ATS QA-pass",
          body: "Przed wysyłką sprawdź, czy dokument po edycjach nadal jest czytelny, zgodny z rolą i merytorycznie poprawny.",
        },
      ],
      takeawayTitle: "Najważniejszy wniosek",
      takeawayBody:
        "ATS przechodzisz wtedy, gdy CV jest łatwe do parsowania, zgodne z językiem roli i poparte realnymi wynikami.",
    },
    "how-to-write-high-quality-resume": {
      title: "Jak napisać wysokiej jakości CV, które daje zaproszenia na rozmowy",
      excerpt:
        "Praktyczny framework tworzenia CV, które jest czytelne, wiarygodne i zoptymalizowane pod ATS oraz zespół rekrutacyjny.",
      lead: "Dobre CV to nie więcej tekstu, tylko lepsze dowody w odpowiedniej strukturze.",
      sections: [
        {
          title: "1) Zacznij od docelowego nagłówka i podsumowania",
          body: "W pierwszych liniach nazwij docelową rolę, kluczowe mocne strony i wpływ biznesowy, by szybko pokazać wartość.",
        },
        {
          title: "2) Stawiaj trafność ponad kompletność",
          body: "Zostaw tylko doświadczenie wspierające docelową rolę. Usuń detale o niskim sygnale, które rozmywają pozycjonowanie.",
        },
        {
          title: "3) Dodaj mierzalne osiągnięcia do kluczowych bullet points",
          body: "Pokazuj wynik liczbami, skalą i kontekstem. Mierzalny wpływ zwiększa wiarygodność i odróżnia Cię od innych.",
        },
        {
          title: "4) Zbuduj skupioną sekcję umiejętności",
          body: "Grupuj umiejętności według kompetencji i dopasowuj nazewnictwo do ogłoszenia. Unikaj losowych list bez potwierdzenia.",
        },
        {
          title: "5) Zadbaj o format przyjazny rekruterowi",
          body: "Używaj czytelnych fontów, jasnej hierarchii sekcji i spójnych odstępów. To poprawia szybkość skanowania przez ATS i ludzi.",
        },
        {
          title: "6) Dostosowuj CV do każdej aplikacji",
          body: "Modyfikuj podsumowanie, top umiejętności i pierwsze bullet points doświadczenia pod konkretną ofertę, zamiast wysyłać jedną wersję.",
        },
        {
          title: "7) Zrób finalny przegląd jakości",
          body: "Sprawdź spójność, gramatykę, daty i linki. Drobne błędy potrafią obniżyć zaufanie jeszcze przed rozmową.",
        },
      ],
      takeawayTitle: "Najważniejszy wniosek",
      takeawayBody:
        "Wysokiej jakości CV jest konkretne, dopasowane do roli i oparte na dowodach od pierwszej do ostatniej sekcji.",
    },
  },
  sk: {
    "how-to-pass-ats-screening": {
      title: "Ako prejsť ATS screeningom v 7 praktických krokoch",
      excerpt:
        "Jasný ATS checklist na lepšie spracovanie životopisu, relevantnosť kľúčových slov a vyššiu viditeľnosť pre recruiterov.",
      lead: "Prejsť ATS znamená mať správnu štruktúru, relevantnosť a dôkazy, nie spam kľúčovými slovami.",
      sections: [
        {
          title: "1) Použite čistý jednokolónový formát",
          body: "Vyhnite sa zložitým layoutom, tabuľkám, textovým boxom a dekoratívnej grafike, ktoré môžu pokaziť ATS parsing. Jasné nadpisy a konzistentné rozostupy sú bezpečnejšie.",
        },
        {
          title: "2) Dajte kľúčové slová do správnych sekcií",
          body: "Hlavné termíny z pracovného inzerátu vložte do summary, skills a posledných skúseností. Používajte ich prirodzene tam, kde ich viete podložiť.",
        },
        {
          title: "3) Premeňte slabé bullet points na dôkazové",
          body: "Nahraďte všeobecné vety modelom akcia + kontext + merateľný výsledok. Zlepší to ATS skóre aj rýchlosť ľudskej kontroly.",
        },
        {
          title: "4) Udržte štandardné dátumy, názvy pozícií a firiem",
          body: "Používajte bežné formáty dátumov a názvy rolí, aby systém spoľahlivo prečítal vašu časovú os.",
        },
        {
          title: "5) Pridajte hard skills relevantné pre rolu",
          body: "Uprednostnite nástroje, platformy a metodiky, ktoré sú priamo uvedené vo vacancy texte.",
        },
        {
          title: "6) Odstráňte nepodložené kľúčové slová",
          body: "Nepridávajte termíny, ktoré neviete dokázať v časti skúseností. Recruiteri nadsadené tvrdenia rýchlo odhalia.",
        },
        {
          title: "7) Urobte finálny ATS QA-pass",
          body: "Pred odoslaním overte, že dokument je po úpravách stále čitateľný, role-focused a fakticky presný.",
        },
      ],
      takeawayTitle: "Hlavná myšlienka",
      takeawayBody:
        "ATS prejdete vtedy, keď je životopis dobre parsovateľný, jazykovo zladený s rolou a podložený reálnymi výsledkami.",
    },
    "how-to-write-high-quality-resume": {
      title: "Ako napísať kvalitný životopis, ktorý prináša pozvania na pohovor",
      excerpt:
        "Praktický framework na vytvorenie životopisu, ktorý je jasný, dôveryhodný a optimalizovaný pre ATS aj hiring tím.",
      lead: "Kvalitný životopis nie je viac textu, ale presnejšie dôkazy v správnej štruktúre.",
      sections: [
        {
          title: "1) Začnite cieleným nadpisom a summary",
          body: "V prvých riadkoch uveďte cieľovú rolu, hlavné silné stránky a business impact, aby bola vaša hodnota hneď zrejmá.",
        },
        {
          title: "2) Uprednostnite relevantnosť pred úplnosťou",
          body: "Nechajte len skúsenosti, ktoré podporujú cieľovú rolu. Odstráňte low-signal detaily, ktoré oslabujú positioning.",
        },
        {
          title: "3) Do hlavných bullet points pridajte merateľné výsledky",
          body: "Ukazujte výsledky cez čísla, rozsah a kontext. Kvantifikovaný dopad zvyšuje dôveryhodnosť a odlíšenie.",
        },
        {
          title: "4) Vytvorte fokusovanú skills sekciu",
          body: "Zoskupte skills podľa kompetencií a zlaďte formulácie s vacancy textom. Vyhnite sa náhodným zoznamom bez dôkazov.",
        },
        {
          title: "5) Použite formát priateľský pre recruiterov",
          body: "Zvoľte čitateľné písmo, jasnú hierarchiu sekcií a konzistentné rozostupy. Zlepší to skenovanie pre ATS aj ľudí.",
        },
        {
          title: "6) Prispôsobujte životopis každej aplikácii",
          body: "Upravte summary, top skills a prvé bullets v skúsenostiach podľa konkrétnej pozície, nie jednou univerzálnou verziou.",
        },
        {
          title: "7) Urobte finálnu kontrolu kvality",
          body: "Skontrolujte konzistenciu, gramatiku, dátumy a odkazy. Malé chyby môžu znížiť dôveru ešte pred pohovorom.",
        },
      ],
      takeawayTitle: "Hlavná myšlienka",
      takeawayBody:
        "Kvalitný životopis je konkrétny, zladený s rolou a postavený na dôkazoch od prvého po posledný blok.",
    },
  },
  cs: {
    "how-to-pass-ats-screening": {
      title: "Jak projít ATS screeningem v 7 praktických krocích",
      excerpt:
        "Jasný ATS checklist pro lepší čitelnost životopisu, relevanci klíčových slov a vyšší viditelnost pro recruitery.",
      lead: "Projít ATS znamená mít správnou strukturu, relevanci a důkazy, ne spam klíčovými slovy.",
      sections: [
        {
          title: "1) Použijte čistý jednokolónový formát",
          body: "Vyhněte se složitým layoutům, tabulkám, textovým boxům a dekorativní grafice, které mohou rozbít ATS parsing. Jasné nadpisy a konzistentní mezery jsou bezpečnější.",
        },
        {
          title: "2) Umístěte klíčová slova do správných sekcí",
          body: "Hlavní termíny z inzerátu vložte do summary, skills a posledních zkušeností. Používejte je přirozeně tam, kde je umíte doložit.",
        },
        {
          title: "3) Převeďte slabé bullet points na důkazové",
          body: "Nahraďte obecné věty modelem akce + kontext + měřitelný výsledek. Zlepší to ATS skóre i rychlost lidského čtení.",
        },
        {
          title: "4) Držte standardní data, názvy rolí a firem",
          body: "Používejte běžné formáty dat a názvy pozic, aby systém správně načetl vaši časovou osu.",
        },
        {
          title: "5) Doplňte hard skills relevantní pro roli",
          body: "Upřednostněte nástroje, platformy a metody, které jsou explicitně uvedené v nabídce.",
        },
        {
          title: "6) Odstraňte nepodložená klíčová slova",
          body: "Nepřidávejte termíny, které neumíte doložit ve zkušenostech. Recruiteri nadsazená tvrzení rychle poznají.",
        },
        {
          title: "7) Udělejte finální ATS QA-pass",
          body: "Před odesláním ověřte, že dokument zůstal po úpravách čitelný, role-focused a věcně přesný.",
        },
      ],
      takeawayTitle: "Hlavní myšlenka",
      takeawayBody:
        "ATS projdete tehdy, když je životopis dobře parsovatelný, jazykově sladěný s rolí a podložený reálnými výsledky.",
    },
    "how-to-write-high-quality-resume": {
      title: "Jak napsat kvalitní životopis, který přináší pozvánky na pohovor",
      excerpt:
        "Praktický framework pro tvorbu životopisu, který je jasný, důvěryhodný a optimalizovaný pro ATS i hiring tým.",
      lead: "Kvalitní životopis není víc textu, ale přesnější důkazy ve správné struktuře.",
      sections: [
        {
          title: "1) Začněte cíleným nadpisem a summary",
          body: "V prvních řádcích uveďte cílovou roli, hlavní silné stránky a business impact, aby byla vaše hodnota okamžitě jasná.",
        },
        {
          title: "2) Dejte přednost relevanci před úplností",
          body: "Nechte jen zkušenosti, které podporují cílovou roli. Odstraňte low-signal detaily, které oslabují positioning.",
        },
        {
          title: "3) Přidejte měřitelné výsledky do klíčových bullet points",
          body: "Ukazujte výsledky pomocí čísel, rozsahu a kontextu. Kvantifikovaný dopad zvyšuje důvěryhodnost i odlišení.",
        },
        {
          title: "4) Vytvořte fokusovanou skills sekci",
          body: "Seskupejte skills podle kompetencí a slaďte formulace s textem vacancy. Vyhněte se náhodným seznamům bez důkazů.",
        },
        {
          title: "5) Udržte formát přehledný pro recruitery",
          body: "Použijte čitelné písmo, jasnou hierarchii sekcí a konzistentní rozestupy. Zlepší to skenování pro ATS i lidi.",
        },
        {
          title: "6) Přizpůsobujte životopis každé žádosti",
          body: "Upravte summary, top skills a první bullets ve zkušenostech podle konkrétní pozice místo jedné univerzální verze.",
        },
        {
          title: "7) Proveďte finální kontrolu kvality",
          body: "Zkontrolujte konzistenci, gramatiku, data a odkazy. Drobné chyby mohou snížit důvěru ještě před pohovorem.",
        },
      ],
      takeawayTitle: "Hlavní myšlenka",
      takeawayBody:
        "Kvalitní životopis je konkrétní, sladěný s rolí a postavený na důkazech od první do poslední části.",
    },
  },
  es: {
    "how-to-pass-ats-screening": {
      title: "Cómo pasar el filtro ATS en 7 pasos prácticos",
      excerpt:
        "Una checklist clara de ATS para mejorar el análisis del CV, la relevancia de palabras clave y la visibilidad ante recruiters.",
      lead: "Pasar ATS depende de estructura, relevancia y evidencia, no de spam de palabras clave.",
      sections: [
        {
          title: "1) Usa un formato limpio de una sola columna",
          body: "Evita layouts complejos, tablas, cuadros de texto y gráficos decorativos que pueden romper el ATS parsing. Encabezados claros y espaciado consistente son más seguros.",
        },
        {
          title: "2) Coloca las palabras clave en secciones correctas",
          body: "Incluye términos clave de la vacante en summary, skills y experiencia reciente. Úsalos de forma natural solo donde realmente estén respaldados.",
        },
        {
          title: "3) Convierte bullets débiles en bullets con evidencia",
          body: "Sustituye frases vagas por acción + contexto + resultado medible. Esto mejora el ATS score y acelera la revisión del recruiter.",
        },
        {
          title: "4) Mantén fechas, cargos y empresas en formato estándar",
          body: "Usa formatos de fecha comunes y títulos de puesto habituales para que el sistema lea tu trayectoria correctamente.",
        },
        {
          title: "5) Añade hard skills relevantes para la vacante",
          body: "Prioriza herramientas, plataformas y métodos solicitados explícitamente en la oferta.",
        },
        {
          title: "6) Elimina palabras clave no respaldadas",
          body: "No agregues términos que no puedas demostrar en tu experiencia. Los recruiters detectan rápido las afirmaciones infladas.",
        },
        {
          title: "7) Haz un ATS QA-pass final",
          body: "Antes de enviar, valida que el documento siga siendo legible, enfocado en el rol y preciso en hechos tras las ediciones.",
        },
      ],
      takeawayTitle: "Idea clave",
      takeawayBody:
        "Pasas ATS cuando tu CV es fácil de analizar, está alineado con el lenguaje del rol y respaldado por resultados reales.",
    },
    "how-to-write-high-quality-resume": {
      title: "Cómo redactar un CV de alta calidad que consiga entrevistas",
      excerpt:
        "Un framework práctico para crear un CV claro, creíble y optimizado tanto para ATS como para el equipo de contratación.",
      lead: "Un CV de calidad no es más texto; es evidencia más precisa en la estructura correcta.",
      sections: [
        {
          title: "1) Empieza con un titular y summary orientados al rol",
          body: "Indica en las primeras líneas el rol objetivo, tus fortalezas clave y el impacto de negocio para mostrar valor de inmediato.",
        },
        {
          title: "2) Prioriza relevancia sobre exhaustividad",
          body: "Conserva solo experiencia que respalde el rol objetivo. Elimina detalles de bajo valor que diluyen tu posicionamiento.",
        },
        {
          title: "3) Usa logros medibles en los bullets principales",
          body: "Muestra resultados con números, alcance y contexto. El impacto cuantificado aumenta credibilidad y diferenciación.",
        },
        {
          title: "4) Construye una sección de skills enfocada",
          body: "Agrupa skills por capacidades y alinea la redacción con la vacante. Evita listas aleatorias sin evidencia.",
        },
        {
          title: "5) Mantén un formato amigable para recruiters",
          body: "Usa tipografías legibles, jerarquía clara de secciones y espaciado consistente. Mejora la velocidad de lectura para ATS y personas.",
        },
        {
          title: "6) Adapta el CV para cada candidatura",
          body: "Ajusta summary, skills clave y primeros bullets de experiencia para cada vacante, en lugar de enviar una versión genérica.",
        },
        {
          title: "7) Haz una revisión final de calidad",
          body: "Verifica consistencia, gramática, fechas y enlaces. Errores pequeños pueden reducir confianza antes de la entrevista.",
        },
      ],
      takeawayTitle: "Idea clave",
      takeawayBody:
        "Un CV de alta calidad es específico, alineado al rol y basado en evidencia desde la primera línea hasta el último bloque.",
    },
  },
};

function localizeText(text: string, lang: Language): string {
  if (lang === "en") {
    return text;
  }

  const dict = DICTS[lang];
  let next = text;
  for (const [from, to] of dict) {
    next = next.split(from).join(to);
  }
  return next;
}

export function localizeBlogPost(post: BlogPost, lang: Language): BlogPost {
  if (lang === "en") {
    return post;
  }

  const override = BLOG_OVERRIDES[lang][post.slug];
  if (override) {
    return {
      ...post,
      ...override,
    };
  }

  return {
    ...post,
    title: localizeText(post.title, lang),
    excerpt: localizeText(post.excerpt, lang),
    lead: localizeText(post.lead, lang),
    sections: post.sections.map((section) => ({
      title: localizeText(section.title, lang),
      body: localizeText(section.body, lang),
    })),
    takeawayTitle: localizeText(post.takeawayTitle, lang),
    takeawayBody: localizeText(post.takeawayBody, lang),
  };
}
