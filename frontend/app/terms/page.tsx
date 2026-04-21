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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
