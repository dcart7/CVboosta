"use client";

import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

export default function TermsPage() {
  const { t, language } = useTranslation();

  const localizedBlocks = {
    en: {
      dataTitle: "Data and File Handling",
      dataDesc:
        "CVboosta does not persistently store user-uploaded CV files or job-description files. Files are processed only for generating optimization outputs and are removed from transient processing context after completion.",
      morTitle: "Payment Processing (Stripe)",
      morDesc:
        "Payments are processed securely by Stripe. CVboosta does not receive or store full payment card numbers, CVV/CVC, or raw payment credentials.",
      refundTitle: "Refund Policy",
      refundDesc:
        "Single Scan purchases are non-refundable after any included feature is used. Any subscription is non-refundable once any included feature has been used. Subscriptions can be canceled at any time to stop future renewals. Already-processed charges are generally non-refundable, except where required by law or when Stripe confirms a billing error.",
      fairUseTitle: "Fair Use Policy",
      fairUseDesc:
        "For unlimited plans (Pro Weekly, Pro Monthly, and Lifetime), Fair Use limits apply: maximum 10 requests per minute and maximum 100 requests per rolling 24-hour window across CV optimization, cover letters, and interview prep.",
      faqTitle: "Service FAQ",
      faq: [
        {
          q: "Can I use CVboosta without a subscription?",
          a: "Yes. You can use single-scan purchases, and you can upgrade to a subscription if you need recurring access.",
        },
        {
          q: "Are purchases refundable after I use features?",
          a: "No. Once included features are used, Single Scan and subscription charges are generally non-refundable unless required by law or confirmed billing error.",
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes. You can cancel anytime to stop future renewals. Cancellation does not retroactively refund already processed charges.",
        },
        {
          q: "Do unlimited plans have usage limits?",
          a: "Yes. Fair Use applies to protect platform stability, including request-per-minute and rolling 24-hour limits.",
        },
      ],
    },
    uk: {
      dataTitle: "Обробка даних і файлів",
      dataDesc:
        "CVboosta не зберігає завантажені користувачем CV-файли або файли опису вакансій у постійному сховищі. Файли обробляються лише для генерації результатів оптимізації та видаляються після завершення обробки.",
      morTitle: "Обробка платежів (Stripe)",
      morDesc:
        "Платежі безпечно обробляються через Stripe. CVboosta не отримує і не зберігає повні номери карток, CVV/CVC або сирі платіжні реквізити.",
      refundTitle: "Політика повернення коштів",
      refundDesc:
        "Покупка Single Scan не підлягає поверненню після використання будь-якої включеної функції. Будь-яка підписка не підлягає поверненню після використання будь-якої включеної функції. Підписку можна скасувати у будь-який момент, щоб зупинити наступні списання. Уже проведені платежі зазвичай не повертаються, окрім випадків, передбачених законом, або підтвердженої Stripe помилки білінгу.",
      fairUseTitle: "Політика справедливого використання",
      fairUseDesc:
        "Для безлімітних планів (Pro Weekly, Pro Monthly та Lifetime) діють обмеження Fair Use: максимум 10 запитів за хвилину і максимум 100 запитів за rolling-вікно 24 години для оптимізації CV, супровідних листів та тренажера співбесіди.",
      faqTitle: "FAQ по сервісу",
      faq: [
        {
          q: "Чи можна користуватися CVboosta без підписки?",
          a: "Так. Доступні разові покупки Single Scan, а за потреби ви можете перейти на підписку.",
        },
        {
          q: "Чи є повернення після використання функцій?",
          a: "Ні. Після використання включених функцій платежі Single Scan і підписки зазвичай не повертаються, окрім випадків, передбачених законом, або підтвердженої помилки білінгу.",
        },
        {
          q: "Чи можна скасувати підписку в будь-який момент?",
          a: "Так. Підписку можна скасувати в будь-який момент, щоб зупинити наступні списання. Вже проведені списання не повертаються автоматично.",
        },
        {
          q: "Чи мають безлімітні плани обмеження?",
          a: "Так. Діє Fair Use для стабільності платформи, включно з лімітом запитів за хвилину та у 24-годинному вікні.",
        },
      ],
    },
    pl: {
      dataTitle: "Przetwarzanie danych i plików",
      dataDesc:
        "CVboosta nie przechowuje trwale przesłanych przez użytkownika plików CV ani plików opisu stanowiska. Pliki są przetwarzane wyłącznie do wygenerowania wyników optymalizacji i usuwane po zakończeniu.",
      morTitle: "Przetwarzanie płatności (Stripe)",
      morDesc:
        "Płatności są bezpiecznie przetwarzane przez Stripe. CVboosta nie otrzymuje ani nie przechowuje pełnych numerów kart, CVV/CVC ani surowych danych instrumentów płatniczych.",
      refundTitle: "Polityka zwrotów",
      refundDesc:
        "Zakup Single Scan nie podlega zwrotowi po użyciu dowolnej funkcji z pakietu. Każda subskrypcja nie podlega zwrotowi po użyciu dowolnej funkcji z pakietu. Subskrypcję można anulować w dowolnym momencie, aby zatrzymać kolejne odnowienia. Już zrealizowane płatności zasadniczo nie podlegają zwrotowi, chyba że wymagają tego przepisy prawa lub Stripe potwierdzi błąd rozliczenia.",
      fairUseTitle: "Fair Use Policy",
      fairUseDesc:
        "Dla planów nielimitowanych (Pro Weekly, Pro Monthly i Lifetime) obowiązują limity Fair Use: maksymalnie 10 żądań na minutę i maksymalnie 100 żądań w ruchomym oknie 24 godzin dla optymalizacji CV, listów motywacyjnych i przygotowania do rozmowy.",
      faqTitle: "FAQ usługi",
      faq: [
        {
          q: "Czy można korzystać z CVboosta bez subskrypcji?",
          a: "Tak. Dostępne są zakupy Single Scan, a subskrypcję możesz włączyć, gdy potrzebujesz regularnego dostępu.",
        },
        {
          q: "Czy po użyciu funkcji przysługuje zwrot?",
          a: "Nie. Po użyciu funkcji opłaty Single Scan i subskrypcji zasadniczo nie podlegają zwrotowi, chyba że wymagają tego przepisy lub potwierdzony błąd rozliczenia.",
        },
        {
          q: "Czy mogę anulować subskrypcję w dowolnym momencie?",
          a: "Tak. Możesz anulować subskrypcję w dowolnym momencie, aby zatrzymać kolejne odnowienia. Już zrealizowane opłaty nie są automatycznie zwracane.",
        },
        {
          q: "Czy plany nielimitowane mają limity?",
          a: "Tak. Obowiązuje Fair Use dla stabilności platformy, w tym limity żądań na minutę i w oknie 24-godzinnym.",
        },
      ],
    },
    sk: {
      dataTitle: "Spracovanie dát a súborov",
      dataDesc:
        "CVboosta neukladá používateľom nahrané CV súbory ani súbory popisu pracovnej pozície do trvalého úložiska. Súbory sa spracúvajú len na účel generovania optimalizovaného výstupu a po dokončení sa odstránia.",
      morTitle: "Spracovanie platieb (Stripe)",
      morDesc:
        "Platby sú bezpečne spracované cez Stripe. CVboosta nezhromažďuje ani neukladá celé čísla kariet, CVV/CVC ani surové údaje platobných nástrojov.",
      refundTitle: "Refund Policy",
      refundDesc:
        "Nákup Single Scan je nevratný po použití akejkoľvek zahrnutej funkcie. Akékoľvek predplatné je nevratné po použití akejkoľvek zahrnutej funkcie. Predplatné môžete kedykoľvek zrušiť, aby sa zastavili ďalšie obnovenia. Už spracované platby sú spravidla nevratné, okrem prípadov vyžadovaných zákonom alebo keď Stripe potvrdí chybu fakturácie.",
      fairUseTitle: "Fair Use Policy",
      fairUseDesc:
        "Pre neobmedzené plány (Pro Weekly, Pro Monthly a Lifetime) platia limity Fair Use: maximálne 10 požiadaviek za minútu a maximálne 100 požiadaviek v kĺzavom 24-hodinovom okne pre optimalizáciu CV, motivačné listy a prípravu na pohovor.",
      faqTitle: "FAQ služby",
      faq: [
        {
          q: "Môžem používať CVboosta bez predplatného?",
          a: "Áno. K dispozícii sú jednorazové nákupy Single Scan a podľa potreby môžete prejsť na predplatné.",
        },
        {
          q: "Sú platby vratné po použití funkcií?",
          a: "Nie. Po použití zahrnutých funkcií sú platby Single Scan a predplatného spravidla nevratné, okrem prípadov vyžadovaných zákonom alebo potvrdenej chyby fakturácie.",
        },
        {
          q: "Môžem predplatné kedykoľvek zrušiť?",
          a: "Áno. Predplatné môžete kedykoľvek zrušiť, aby sa zastavili budúce obnovenia. Už spracované platby sa automaticky nevracajú.",
        },
        {
          q: "Majú neobmedzené plány limity?",
          a: "Áno. Platí Fair Use na ochranu stability platformy, vrátane limitov požiadaviek za minútu a v 24-hodinovom okne.",
        },
      ],
    },
    cs: {
      dataTitle: "Zpracování dat a souborů",
      dataDesc:
        "CVboosta trvale neukládá uživatelské soubory CV ani soubory popisu pozice. Soubory jsou zpracovány pouze pro vytvoření optimalizovaného výstupu a po dokončení odstraněny.",
      morTitle: "Zpracování plateb (Stripe)",
      morDesc:
        "Platby jsou bezpečně zpracovány přes Stripe. CVboosta neshromažďuje ani neukládá úplná čísla karet, CVV/CVC ani surové platební údaje.",
      refundTitle: "Zásady vrácení peněz",
      refundDesc:
        "Nákup Single Scan je nevratný po použití jakékoli zahrnuté funkce. Jakékoli předplatné je nevratné po použití jakékoli zahrnuté funkce. Předplatné lze kdykoli zrušit, aby se zastavilo další obnovování. Již zpracované platby jsou obecně nevratné, kromě případů vyžadovaných zákonem nebo když Stripe potvrdí chybu účtování.",
      fairUseTitle: "Fair Use Policy",
      fairUseDesc:
        "Pro neomezené plány (Pro Weekly, Pro Monthly a Lifetime) platí Fair Use limity: maximálně 10 požadavků za minutu a maximálně 100 požadavků v klouzavém 24hodinovém okně pro optimalizaci CV, motivační dopisy a přípravu na pohovor.",
      faqTitle: "FAQ služby",
      faq: [
        {
          q: "Mohu používat CVboosta bez předplatného?",
          a: "Ano. K dispozici jsou jednorázové nákupy Single Scan a podle potřeby můžete přejít na předplatné.",
        },
        {
          q: "Jsou platby vratné po použití funkcí?",
          a: "Ne. Po použití zahrnutých funkcí jsou platby Single Scan a předplatného obecně nevratné, kromě případů vyžadovaných zákonem nebo potvrzené chyby účtování.",
        },
        {
          q: "Mohu předplatné kdykoli zrušit?",
          a: "Ano. Předplatné můžete kdykoli zrušit, aby se zastavila budoucí obnovení. Již zpracované platby se automaticky nevracejí.",
        },
        {
          q: "Mají neomezené plány limity?",
          a: "Ano. Platí Fair Use pro stabilitu platformy, včetně limitu požadavků za minutu a v 24hodinovém okně.",
        },
      ],
    },
    es: {
      dataTitle: "Gestión de datos y archivos",
      dataDesc:
        "CVboosta no almacena de forma persistente archivos CV subidos por el usuario ni archivos de descripción de vacante. Los archivos se procesan solo para generar resultados de optimización y se eliminan al finalizar.",
      morTitle: "Procesamiento de pagos (Stripe)",
      morDesc:
        "Los pagos se procesan de forma segura a través de Stripe. CVboosta no recopila ni almacena números completos de tarjeta, CVV/CVC ni credenciales de pago en bruto.",
      refundTitle: "Política de reembolsos",
      refundDesc:
        "Las compras de Single Scan no son reembolsables después de usar cualquier función incluida. Cualquier suscripción no es reembolsable después de usar cualquier función incluida. Las suscripciones pueden cancelarse en cualquier momento para detener renovaciones futuras. Los cargos ya procesados generalmente no son reembolsables, salvo que la ley lo exija o Stripe confirme un error de facturación.",
      fairUseTitle: "Política de uso justo",
      fairUseDesc:
        "Para los planes ilimitados (Pro Weekly, Pro Monthly y Lifetime) se aplican límites de uso justo: máximo 10 solicitudes por minuto y máximo 100 solicitudes por ventana móvil de 24 horas para optimización de CV, cartas de presentación y preparación de entrevistas.",
      faqTitle: "FAQ del servicio",
      faq: [
        {
          q: "¿Puedo usar CVboosta sin suscripción?",
          a: "Sí. Puedes usar compras de Single Scan y cambiar a suscripción si necesitas acceso recurrente.",
        },
        {
          q: "¿Hay reembolso después de usar funciones?",
          a: "No. Después de usar funciones incluidas, los cobros de Single Scan y suscripción generalmente no son reembolsables, salvo ley aplicable o error de facturación confirmado.",
        },
        {
          q: "¿Puedo cancelar la suscripción en cualquier momento?",
          a: "Sí. Puedes cancelar en cualquier momento para detener renovaciones futuras. Los cobros ya procesados no se reembolsan automáticamente.",
        },
        {
          q: "¿Los planes ilimitados tienen límites?",
          a: "Sí. Se aplica uso justo para mantener la estabilidad de la plataforma, con límites por minuto y en ventana de 24 horas.",
        },
      ],
    },
  }[language];

  return (
    <main className="page">
      <TopNav />
      <div className="shell legal-page-shell">
        <section className="legal-section fade-up" style={{ padding: "80px 0 56px" }}>
          <div className="legal-hero">
            <h1 className="hero-title" style={{ fontSize: "48px", marginBottom: "20px" }}>
              {t("legal.termsTitle")}
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: "860px", marginBottom: 0 }}>
              {t("legal.termsIntro")}
            </p>
          </div>

          <div className="legal-doc">
            <div className="legal-meta">
              <span className="legal-chip">{t("results.legalDocumentLabel")}</span>
              <span className="legal-chip">{t("results.lastUpdatedPrefix")}: April 16, 2026</span>
            </div>

            <div className="legal-content">
              <div className="legal-block">
                <h3>{t("legal.termsUsageTitle")}</h3>
                <p>{t("legal.termsUsage")}</p>
              </div>
              <div className="legal-block">
                <h3>{localizedBlocks.dataTitle}</h3>
                <p>{localizedBlocks.dataDesc}</p>
              </div>
              <div className="legal-block">
                <h3>{localizedBlocks.morTitle}</h3>
                <p>{localizedBlocks.morDesc}</p>
              </div>
              <div className="legal-block">
                <h3>{localizedBlocks.refundTitle}</h3>
                <p>{localizedBlocks.refundDesc}</p>
              </div>
              <div className="legal-block">
                <h3>{localizedBlocks.fairUseTitle}</h3>
                <p>{localizedBlocks.fairUseDesc}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.termsDisclaimerTitle")}</h3>
                <p>{t("legal.termsDisclaimer")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.termsLiabilityTitle")}</h3>
                <p>{t("legal.termsLiability")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.termsUserRespTitle")}</h3>
                <p>{t("legal.termsUserRespDesc")}</p>
              </div>
              <div className="legal-block" id="service-faq">
                <h3>{localizedBlocks.faqTitle}</h3>
                <div className="legal-faq-list">
                  {localizedBlocks.faq.map((item) => (
                    <details key={item.q} className="legal-faq-item">
                      <summary>{item.q}</summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
