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
    "resume-summary-for-career-switch": {
      title: "Resume Summary для Career Switch: швидка формула",
      excerpt:
        "Як написати summary для переходу в нову сферу так, щоб зберегти ваші сильні сторони й підсвітити релевантність до нової ролі.",
      lead: "Резюме для зміни кар'єри працює краще, коли спочатку показує переносимі навички, а не старі назви посад.",
      sections: [
        {
          title: "1) Почніть із language цільової ролі",
          body: "Назвіть роль, у яку переходите, і додайте 2-3 релевантні компетенції. Це допомагає ATS і рекрутеру швидко зрозуміти ваш напрям.",
        },
        {
          title: "2) Додайте доказ із попередньої сфери",
          body: "Дайте один вимірюваний приклад із минулого досвіду, який напряму переноситься в нову роль.",
        },
        {
          title: "3) Перевірте терміни через CVboosta",
          body: "Візьміть рольові терміни з [Resume Keywords by Role](/resume-keywords), додайте їх у summary природно, а потім прогоніть CVboosta, щоб закрити keyword gaps.",
        },
      ],
      takeawayTitle: "Порада",
      takeawayBody:
        "Сильне summary для career switch - конкретне, орієнтоване на роль і підкріплене доказами.",
    },
    "how-to-choose-a-profession": {
      title: "Як обрати професію: практичний гайд з кар'єрного напряму",
      excerpt:
        "Чіткий фреймворк, як обрати кар'єрний шлях за сильними сторонами, попитом ринку та реалістичними першими кроками.",
      lead: "Вам не потрібен ідеальний вибір з першого дня. Потрібен напрям, який можна швидко перевірити.",
      sections: [
        {
          title: "1) Почніть із сильних сторін та енергії, а не лише трендів",
          body: "Складіть список задач, які вас заряджають, навичок, які ви швидко опановуєте, і проблем, які вам цікаво вирішувати. Так ви отримаєте реалістичний шортлист ролей.",
        },
        {
          title: "2) Перевірте ринок до того, як фіксуватися на виборі",
          body: "Перегляньте реальні вакансії у вашому регіоні: інструменти, рівні зарплат і вимоги до junior. Обирайте роль там, де перетинаються попит і ваш інтерес.",
        },
        {
          title: "3) Зберіть перше role-focused резюме з CVboosta",
          body: "Використайте [Resume Keywords by Role](/resume-keywords), щоб зібрати потрібні терміни для цільової професії, а потім запустіть CVboosta, щоб адаптувати резюме під роль без keyword stuffing.",
        },
      ],
      takeawayTitle: "Ключова думка",
      takeawayBody:
        "Професію варто обирати через паралельну перевірку власної відповідності й ринкового попиту, а далі точково адаптувати резюме під одну роль.",
    },
    "how-to-write-a-resume-step-by-step": {
      title: "Як скласти резюме крок за кроком",
      excerpt:
        "Дружня для початківців структура резюме, яка добре працює і для ATS, і для рекрутерів.",
      lead: "Сильне резюме - це структурована історія впливу, а не повна автобіографія.",
      sections: [
        {
          title: "1) Спочатку зберіть базову структуру",
          body: "Створіть чіткі секції: summary, skills, experience, education і посилання. Тримайте макет простим та одноколонковим, щоб ATS коректно парсив документ.",
        },
        {
          title: "2) Перетворіть обов'язки на вимірювані результати",
          body: "Для кожного bullet використовуйте модель дія + контекст + результат. Додавайте цифри, коли можливо, щоб показати масштаб, швидкість, зростання або економію.",
        },
        {
          title: "3) Узгодьте формулювання з роллю через CVboosta",
          body: "Відкрийте [Resume Keywords by Role](/resume-keywords), оберіть роль і природно додайте релевантні терміни в summary та experience. Потім перевірте прогалини у CVboosta і підвищіть ATS alignment перед відправкою.",
        },
      ],
      takeawayTitle: "Ключова думка",
      takeawayBody:
        "Якісне резюме поєднує зрозумілу структуру, доказові bullets і wording, прив'язаний до конкретної ролі.",
    },
    "how-to-find-your-first-job": {
      title: "Як знайти першу роботу: реалістичний стартовий план",
      excerpt:
        "Практична щотижнева система для початківців, щоб швидше виходити на співбесіди без вигорання.",
      lead: "Пошук першої роботи має бути повторюваним процесом, а не випадковою розсилкою заявок.",
      sections: [
        {
          title: "1) Оберіть одну цільову роль і одну резервну",
          body: "Не подавайтеся на все підряд. Тримайте фокус на одній основній ролі та одній суміжній, щоб резюме і портфоліо залишалися цілісними.",
        },
        {
          title: "2) Подавайтеся якісно й стабільно щотижня",
          body: "Побудуйте ритм: shortlist вакансій, адаптація резюме, відправка, трекінг результатів і покращення на основі фідбеку.",
        },
        {
          title: "3) Використовуйте CVboosta для зростання конверсії",
          body: "Перед кожним батчем заявок переглядайте [Resume Keywords by Role](/resume-keywords), а потім оптимізуйте резюме в CVboosta, щоб підвищити ATS-релевантність і шанси на інтерв'ю.",
        },
      ],
      takeawayTitle: "Ключова думка",
      takeawayBody:
        "Успіх першої роботи будується на фокусі, щотижневій дисципліні та точковій оптимізації резюме.",
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
    "resume-summary-for-career-switch": {
      title: "Resume Summary dla Career Switch: szybka formuła",
      excerpt:
        "Jak napisać summary do zmiany kariery tak, aby zachować Twoje mocne strony i jednocześnie dopasować się do nowej roli.",
      lead: "CV przy zmianie kariery działa najlepiej, gdy najpierw pokazuje umiejętności transferowalne, a dopiero potem wcześniejsze stanowiska.",
      sections: [
        {
          title: "1) Zacznij od language roli docelowej",
          body: "Nazwij rolę, do której przechodzisz, i dodaj 2-3 kluczowe kompetencje. To pomaga ATS i rekruterowi szybko zrozumieć kierunek.",
        },
        {
          title: "2) Dodaj dowód z poprzedniej branży",
          body: "Podaj jeden mierzalny przykład z wcześniejszego doświadczenia, który bezpośrednio przenosi się na nową rolę.",
        },
        {
          title: "3) Sprawdź terminy przez CVboosta",
          body: "Weź terminy roli z [Resume Keywords by Role](/resume-keywords), dodaj je naturalnie do summary i uruchom CVboosta, żeby domknąć keyword gaps.",
        },
      ],
      takeawayTitle: "Wskazówka",
      takeawayBody:
        "Mocne summary dla career switch jest konkretne, ukierunkowane na rolę i oparte na dowodach.",
    },
    "how-to-choose-a-profession": {
      title: "Jak wybrać zawód: praktyczny przewodnik kierunku kariery",
      excerpt:
        "Jasny framework wyboru ścieżki kariery na podstawie mocnych stron, popytu rynkowego i realistycznych pierwszych kroków.",
      lead: "Nie potrzebujesz idealnej decyzji pierwszego dnia. Potrzebujesz kierunku, który da się szybko przetestować.",
      sections: [
        {
          title: "1) Zacznij od mocnych stron i energii, nie tylko od trendów",
          body: "Wypisz zadania, które dodają Ci energii, umiejętności, których szybko się uczysz, oraz problemy, które lubisz rozwiązywać. To tworzy realistyczną shortlistę ról.",
        },
        {
          title: "2) Zweryfikuj rynek zanim się zdecydujesz",
          body: "Przejrzyj realne oferty w Twoim regionie: wymagane narzędzia, widełki płacowe i oczekiwania dla juniorów. Wybierz rolę, w której spotykają się popyt i Twoje zainteresowania.",
        },
        {
          title: "3) Zbuduj pierwsze role-focused CV z CVboosta",
          body: "Użyj [Resume Keywords by Role](/resume-keywords), aby zebrać właściwe terminy dla wybranego zawodu, a potem uruchom CVboosta, by dopasować CV do roli bez keyword stuffing.",
        },
      ],
      takeawayTitle: "Najważniejszy wniosek",
      takeawayBody:
        "Wybór zawodu to równoległe testowanie dopasowania i popytu rynkowego, a następnie dopracowanie CV pod jedną konkretną rolę.",
    },
    "how-to-write-a-resume-step-by-step": {
      title: "Jak napisać CV krok po kroku",
      excerpt:
        "Przyjazna dla początkujących struktura CV, która działa zarówno dla ATS, jak i dla rekruterów.",
      lead: "Mocne CV to uporządkowana historia wpływu, a nie pełna autobiografia.",
      sections: [
        {
          title: "1) Najpierw zbuduj podstawową strukturę",
          body: "Przygotuj czytelne sekcje: summary, skills, experience, education i linki. Utrzymaj prosty, jednokolumnowy układ, aby ATS poprawnie parsował dokument.",
        },
        {
          title: "2) Zamieniaj obowiązki na mierzalne wyniki",
          body: "W każdym bulletu stosuj model działanie + kontekst + rezultat. Gdzie to możliwe, dodawaj liczby pokazujące skalę, tempo, wzrost lub oszczędności.",
        },
        {
          title: "3) Dopasuj wording do roli z CVboosta",
          body: "Otwórz [Resume Keywords by Role](/resume-keywords), wybierz rolę i naturalnie dodaj kluczowe terminy do summary oraz experience. Następnie użyj CVboosta, aby znaleźć luki i podnieść ATS alignment przed wysłaniem.",
        },
      ],
      takeawayTitle: "Najważniejszy wniosek",
      takeawayBody:
        "Dobre CV łączy czytelną strukturę, bullet points z dowodami i słownictwo dopasowane do docelowej roli.",
    },
    "how-to-find-your-first-job": {
      title: "Jak znaleźć pierwszą pracę: realistyczny plan startowy",
      excerpt:
        "Praktyczny tygodniowy system dla początkujących, który przyspiesza zaproszenia na rozmowy bez wypalenia.",
      lead: "Szukanie pierwszej pracy powinno być powtarzalnym procesem, a nie losowym wysyłaniem aplikacji.",
      sections: [
        {
          title: "1) Wybierz jedną rolę docelową i jedną zapasową",
          body: "Nie aplikuj na wszystko. Skup się na jednej głównej roli i jednej pokrewnej, aby CV i portfolio były spójne.",
        },
        {
          title: "2) Aplikuj jakościowo i konsekwentnie co tydzień",
          body: "Ustal rytm tygodnia: shortlist ofert, dopasowanie CV, wysyłka, analiza wyników i poprawki na bazie odpowiedzi.",
        },
        {
          title: "3) Użyj CVboosta, by poprawić konwersję",
          body: "Przed każdym batch'em aplikacji sprawdzaj [Resume Keywords by Role](/resume-keywords), a potem optymalizuj CV w CVboosta, aby podnieść trafność ATS i szanse na rozmowę.",
        },
      ],
      takeawayTitle: "Najważniejszy wniosek",
      takeawayBody:
        "Sukces w pierwszej pracy buduje fokus, tygodniowa konsekwencja i celowana optymalizacja CV.",
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
    "resume-summary-for-career-switch": {
      title: "Resume Summary pre Career Switch: rýchly vzorec",
      excerpt:
        "Ako napísať transition-friendly summary, ktoré zachová vaše silné stránky a zároveň sa zladí s novou rolou.",
      lead: "Životopis pri zmene kariéry funguje lepšie, keď najprv ukáže prenositeľné schopnosti a až potom minulé job title.",
      sections: [
        {
          title: "1) Začnite language cieľovej roly",
          body: "Pomenujte rolu, do ktorej prechádzate, a doplňte 2-3 relevantné kompetencie. ATS aj recruiter tak rýchlo pochopia váš smer.",
        },
        {
          title: "2) Pridajte dôkaz z predchádzajúceho odboru",
          body: "Uveďte jeden merateľný výsledok z minulých skúseností, ktorý sa priamo prenáša do novej role.",
        },
        {
          title: "3) Skontrolujte termíny cez CVboosta",
          body: "Použite [Resume Keywords by Role](/resume-keywords) na výber správnych termínov, prirodzene ich vložte do summary a potom spustite CVboosta na uzavretie keyword gaps.",
        },
      ],
      takeawayTitle: "Tip",
      takeawayBody:
        "Silné summary pre career switch je konkrétne, role-focused a podložené dôkazmi.",
    },
    "how-to-choose-a-profession": {
      title: "Ako si vybrať profesiu: praktický sprievodca kariérnym smerom",
      excerpt:
        "Jasný framework na výber kariérnej cesty podľa silných stránok, dopytu trhu a realistických prvých krokov.",
      lead: "Nepotrebujete perfektné rozhodnutie v prvý deň. Potrebujete smer, ktorý viete rýchlo otestovať.",
      sections: [
        {
          title: "1) Začnite silnými stránkami a energiou, nie iba trendmi",
          body: "Spíšte si úlohy, ktoré vám dávajú energiu, skills, ktoré sa učíte rýchlo, a problémy, ktoré radi riešite. Tak vznikne realistický shortlist rolí.",
        },
        {
          title: "2) Overte trh ešte pred finálnym rozhodnutím",
          body: "Pozrite si reálne vacancy vo vašom regióne: požadované nástroje, platové rozpätia a očakávania pre juniorov. Vyberte rolu, kde sa pretína dopyt a váš záujem.",
        },
        {
          title: "3) Vytvorte prvý role-focused životopis cez CVboosta",
          body: "Použite [Resume Keywords by Role](/resume-keywords), aby ste získali správne termíny pre cieľovú profesiu, a potom spustite CVboosta na úpravu životopisu bez keyword stuffing.",
        },
      ],
      takeawayTitle: "Hlavná myšlienka",
      takeawayBody:
        "Profesiu vyberajte cez paralelné testovanie fitu a dopytu, potom životopis prispôsobte jednej jasnej cieľovej role.",
    },
    "how-to-write-a-resume-step-by-step": {
      title: "Ako napísať životopis krok za krokom",
      excerpt:
        "Začiatočnícky friendly štruktúra životopisu, ktorá funguje pre ATS aj recruiterov.",
      lead: "Silný životopis je štruktúrovaný príbeh dopadu, nie úplná autobiografia.",
      sections: [
        {
          title: "1) Najprv postavte základnú štruktúru",
          body: "Vytvorte jasné sekcie: summary, skills, experience, education a odkazy. Držte layout jednoduchý a jednokolónový, aby ATS dokument správne parsoval.",
        },
        {
          title: "2) Zmeňte povinnosti na merateľné výsledky",
          body: "V každom bullet pointe použite model akcia + kontext + výsledok. Kde sa dá, pridajte čísla pre rozsah, rýchlosť, rast alebo úsporu.",
        },
        {
          title: "3) Zlaďte wording s rolou cez CVboosta",
          body: "Otvorte [Resume Keywords by Role](/resume-keywords), vyberte rolu a prirodzene doplňte relevantné termíny do summary a experience. Potom použite CVboosta na odhalenie medzier a zlepšenie ATS alignment pred odoslaním.",
        },
      ],
      takeawayTitle: "Hlavná myšlienka",
      takeawayBody:
        "Dobrý životopis kombinuje jasnú štruktúru, dôkazové bullet points a wording zladený s cieľovou rolou.",
    },
    "how-to-find-your-first-job": {
      title: "Ako nájsť prvú prácu: realistický štartovací plán",
      excerpt:
        "Praktický týždenný systém pre začiatočníkov, ktorý urýchli pozvánky na pohovor bez vyhorenia.",
      lead: "Hľadanie prvej práce má byť opakovateľný proces, nie náhodné posielanie žiadostí.",
      sections: [
        {
          title: "1) Vyberte jednu cieľovú rolu a jednu záložnú",
          body: "Neaplikujte na všetko. Sústreďte sa na jednu hlavnú rolu a jednu blízku záložnú, aby životopis aj portfólio ostali konzistentné.",
        },
        {
          title: "2) Aplikujte kvalitne a konzistentne každý týždeň",
          body: "Nastavte týždenný rytmus: shortlist rolí, úprava životopisu, odoslanie, tracking výsledkov a zlepšenia podľa odpovedí.",
        },
        {
          title: "3) Použite CVboosta na vyššiu konverziu",
          body: "Pred každým batchom žiadostí si prejdite [Resume Keywords by Role](/resume-keywords) a potom optimalizujte životopis v CVboosta, aby ste zvýšili ATS relevantnosť aj šancu na interview.",
        },
      ],
      takeawayTitle: "Hlavná myšlienka",
      takeawayBody:
        "Úspech pri prvej práci stojí na fokuse, týždennej konzistentnosti a cielenej optimalizácii životopisu.",
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
    "resume-summary-for-career-switch": {
      title: "Resume Summary pro Career Switch: rychlý vzorec",
      excerpt:
        "Jak napsat transition-friendly summary, které zachová vaše silné stránky a zároveň se sladí s novou rolí.",
      lead: "Životopis při změně kariéry funguje lépe, když nejdřív ukáže přenositelné schopnosti a až potom dřívější job titles.",
      sections: [
        {
          title: "1) Začněte language cílové role",
          body: "Pojmenujte roli, do které přecházíte, a doplňte 2-3 relevantní kompetence. ATS i recruiter tak rychle pochopí váš směr.",
        },
        {
          title: "2) Přidejte důkaz z předchozího oboru",
          body: "Uveďte jeden měřitelný výsledek z předchozí zkušenosti, který se přímo přenáší do nové role.",
        },
        {
          title: "3) Ověřte termíny přes CVboosta",
          body: "Vezměte role terms z [Resume Keywords by Role](/resume-keywords), přirozeně je vložte do summary a pak spusťte CVboosta pro uzavření keyword gaps.",
        },
      ],
      takeawayTitle: "Tip",
      takeawayBody:
        "Silné summary pro career switch je konkrétní, orientované na roli a podložené důkazy.",
    },
    "how-to-choose-a-profession": {
      title: "Jak si vybrat profesi: praktický průvodce kariérním směrem",
      excerpt:
        "Jasný framework pro výběr kariérní cesty podle silných stránek, poptávky trhu a realistických prvních kroků.",
      lead: "Nepotřebujete perfektní volbu hned první den. Potřebujete směr, který lze rychle otestovat.",
      sections: [
        {
          title: "1) Začněte silnými stránkami a energií, ne jen trendy",
          body: "Sepište si úkoly, které vám dávají energii, skills, které se učíte rychle, a problémy, které vás baví řešit. Tím vznikne realistický shortlist rolí.",
        },
        {
          title: "2) Ověřte trh dřív, než se definitivně rozhodnete",
          body: "Projděte reálné vacancy ve vašem regionu: požadované nástroje, mzdová rozpětí a očekávání pro juniory. Vyberte roli, kde se potkává poptávka a váš zájem.",
        },
        {
          title: "3) Postavte první role-focused životopis s CVboosta",
          body: "Použijte [Resume Keywords by Role](/resume-keywords) pro správné termíny k cílové profesi a pak spusťte CVboosta, který životopis upraví pro konkrétní roli bez keyword stuffing.",
        },
      ],
      takeawayTitle: "Hlavní myšlenka",
      takeawayBody:
        "Profesní směr vybírejte paralelním testováním osobního fitu a poptávky, pak životopis přizpůsobte jedné jasné cílové roli.",
    },
    "how-to-write-a-resume-step-by-step": {
      title: "Jak napsat životopis krok za krokem",
      excerpt:
        "Začátečnicky friendly struktura životopisu, která funguje pro ATS i pro recruitery.",
      lead: "Silný životopis je strukturovaný příběh dopadu, ne kompletní autobiografie.",
      sections: [
        {
          title: "1) Nejprve postavte základní strukturu",
          body: "Vytvořte jasné sekce: summary, skills, experience, education a odkazy. Držte layout jednoduchý a jednokolónový, aby ATS dokument správně parsoval.",
        },
        {
          title: "2) Převádějte povinnosti na měřitelné výsledky",
          body: "V každém bullet pointu použijte model akce + kontext + výsledek. Kde to jde, přidejte čísla pro rozsah, rychlost, růst nebo úsporu.",
        },
        {
          title: "3) Slaďte wording s rolí přes CVboosta",
          body: "Otevřete [Resume Keywords by Role](/resume-keywords), zvolte roli a přirozeně doplňte relevantní termíny do summary a experience. Poté použijte CVboosta na odhalení mezer a zvýšení ATS alignment před odesláním.",
        },
      ],
      takeawayTitle: "Hlavní myšlenka",
      takeawayBody:
        "Dobrý životopis spojuje jasnou strukturu, důkazové bullet points a wording sladěný s cílovou rolí.",
    },
    "how-to-find-your-first-job": {
      title: "Jak najít první práci: realistický startovní plán",
      excerpt:
        "Praktický týdenní systém pro začátečníky, který urychlí pozvánky na pohovor bez vyhoření.",
      lead: "Hledání první práce má být opakovatelný proces, ne náhodné rozesílání žádostí.",
      sections: [
        {
          title: "1) Vyberte jednu cílovou roli a jednu záložní",
          body: "Neaplikujte na všechno. Držte fokus na jedné hlavní roli a jedné blízké záložní, aby životopis i portfolio zůstaly konzistentní.",
        },
        {
          title: "2) Aplikujte kvalitně a konzistentně každý týden",
          body: "Nastavte týdenní rytmus: shortlist rolí, úprava životopisu, odeslání, tracking výsledků a zlepšování podle odpovědí.",
        },
        {
          title: "3) Použijte CVboosta pro vyšší konverzi",
          body: "Před každým batchem žádostí projděte [Resume Keywords by Role](/resume-keywords) a pak optimalizujte životopis v CVboosta, abyste zvýšili ATS relevanci i šanci na interview.",
        },
      ],
      takeawayTitle: "Hlavní myšlenka",
      takeawayBody:
        "Úspěch první práce stojí na fokusu, týdenní konzistenci a cílené optimalizaci životopisu.",
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
    "resume-summary-for-career-switch": {
      title: "Resume Summary para Career Switch: fórmula rápida",
      excerpt:
        "Cómo redactar un summary transition-friendly que mantenga tus fortalezas y al mismo tiempo se alinee con un rol nuevo.",
      lead: "Un CV para cambio de carrera funciona mejor cuando primero muestra habilidades transferibles y después tus job titles anteriores.",
      sections: [
        {
          title: "1) Empieza con el language del rol objetivo",
          body: "Nombra el rol al que quieres transicionar y añade 2-3 capacidades relevantes. Así ATS y recruiters entienden tu dirección en segundos.",
        },
        {
          title: "2) Añade evidencia de tu campo anterior",
          body: "Incluye un resultado medible de tu experiencia previa que se transfiera de forma directa al nuevo rol.",
        },
        {
          title: "3) Valida términos con CVboosta",
          body: "Toma los términos del rol en [Resume Keywords by Role](/resume-keywords), intégralos de forma natural en el summary y luego usa CVboosta para cerrar keyword gaps.",
        },
      ],
      takeawayTitle: "Consejo",
      takeawayBody:
        "Un summary fuerte para career switch es específico, orientado al rol y respaldado por evidencia.",
    },
    "how-to-choose-a-profession": {
      title: "Cómo elegir una profesión: guía práctica de dirección profesional",
      excerpt:
        "Un framework claro para elegir un camino profesional según fortalezas, demanda del mercado y primeros pasos realistas.",
      lead: "No necesitas una decisión perfecta el primer día. Necesitas una dirección que puedas probar rápido.",
      sections: [
        {
          title: "1) Empieza por fortalezas y energía, no solo por tendencias",
          body: "Lista tareas que te dan energía, skills que aprendes rápido y problemas que disfrutas resolver. Así construyes una shortlist realista de roles sostenibles.",
        },
        {
          title: "2) Valida el mercado antes de comprometerte",
          body: "Revisa vacantes reales en tu región: herramientas solicitadas, rangos salariales y expectativas para nivel inicial. Elige un rol donde se crucen demanda e interés personal.",
        },
        {
          title: "3) Crea tu primer CV role-focused con CVboosta",
          body: "Usa [Resume Keywords by Role](/resume-keywords) para reunir términos clave de tu profesión objetivo y luego ejecuta CVboosta para adaptar tu CV sin keyword stuffing.",
        },
      ],
      takeawayTitle: "Idea clave",
      takeawayBody:
        "Elige profesión probando en paralelo tu fit y la demanda de mercado, y después adapta tu CV a un rol objetivo claro.",
    },
    "how-to-write-a-resume-step-by-step": {
      title: "Cómo escribir un CV paso a paso",
      excerpt:
        "Una estructura beginner-friendly que funciona tanto para ATS como para recruiters.",
      lead: "Un CV fuerte es una historia estructurada de impacto, no una autobiografía completa.",
      sections: [
        {
          title: "1) Construye primero la estructura base",
          body: "Crea secciones claras: summary, skills, experience, education y enlaces. Mantén un layout simple de una sola columna para que ATS lo procese bien.",
        },
        {
          title: "2) Convierte responsabilidades en resultados medibles",
          body: "En cada bullet point usa acción + contexto + resultado. Añade números cuando sea posible para mostrar alcance, velocidad, crecimiento o ahorro.",
        },
        {
          title: "3) Ajusta el wording al rol con CVboosta",
          body: "Abre [Resume Keywords by Role](/resume-keywords), elige tu rol y añade términos relevantes de forma natural en summary y experience. Luego usa CVboosta para detectar gaps y mejorar el ATS alignment antes de enviar.",
        },
      ],
      takeawayTitle: "Idea clave",
      takeawayBody:
        "Un buen CV combina estructura clara, bullets con evidencia y wording específico del rol.",
    },
    "how-to-find-your-first-job": {
      title: "Cómo encontrar tu primer trabajo: plan realista para empezar",
      excerpt:
        "Un sistema semanal práctico para principiantes que acelera entrevistas sin caer en burnout.",
      lead: "Tu búsqueda del primer empleo debe ser un proceso repetible, no aplicaciones aleatorias.",
      sections: [
        {
          title: "1) Elige un rol objetivo y un rol backup",
          body: "No apliques a todo. Enfócate en un rol principal y uno cercano de respaldo para mantener coherencia entre CV y portafolio.",
        },
        {
          title: "2) Aplica con calidad y constancia cada semana",
          body: "Define una rutina semanal: shortlist de vacantes, adaptación del CV, envío, seguimiento de resultados y mejora según respuestas.",
        },
        {
          title: "3) Usa CVboosta para subir conversión",
          body: "Antes de cada batch de aplicaciones, revisa [Resume Keywords by Role](/resume-keywords) y luego optimiza tu CV en CVboosta para aumentar relevancia ATS y probabilidad de entrevista.",
        },
      ],
      takeawayTitle: "Idea clave",
      takeawayBody:
        "El éxito del primer trabajo viene de foco, constancia semanal y optimización dirigida del CV.",
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
