"use client";

import { useTranslation } from "../lib/LanguageContext";

export default function PrivacyPage() {
  const { t, language } = useTranslation();

  const localizedBlocks = {
    en: {
      noStorageTitle: "No Storage of Personal Files or Document Content",
      noStorageDesc:
        "CVboosta does not store uploaded CV files, CV document content, or job-description files in a persistent file storage system. Documents are processed in transient runtime memory for analysis and output generation, then discarded.",
      billingTitle: "Billing and Payment Data",
      billingDesc:
        "Payments are processed by Stripe. CVboosta does not collect or store full card numbers, CVV/CVC, or other raw payment instrument details.",
      faqTitle: "Service FAQ",
      faq: [
        {
          q: "Do you store my uploaded CV files permanently?",
          a: "No. CVboosta processes files in transient memory for analysis and does not keep uploaded CV files in persistent storage.",
        },
        {
          q: "Who handles my payments?",
          a: "Stripe handles payment processing. CVboosta does not store full card numbers or CVV/CVC.",
        },
        {
          q: "Is my data used to train public models?",
          a: "CVboosta uses AI providers to generate outputs securely. Your data is not used for training public general-purpose models.",
        },
        {
          q: "How long do you keep account-related data?",
          a: "Account and billing-related records are retained only as needed for service operation, security, and legal obligations.",
        },
      ],
    },
    uk: {
      noStorageTitle: "Відсутність зберігання особистих файлів і вмісту документів",
      noStorageDesc:
        "CVboosta не зберігає завантажені CV-файли, вміст CV або файли опису вакансій у постійному файловому сховищі. Документи обробляються у тимчасовій пам'яті для аналізу та генерації результату, після чого видаляються.",
      billingTitle: "Оплата та платіжні дані",
      billingDesc:
        "Оплата обробляється через Stripe. CVboosta не збирає і не зберігає повні номери карток, CVV/CVC або інші сирі платіжні реквізити.",
      faqTitle: "FAQ по сервісу",
      faq: [
        {
          q: "Ви зберігаєте мої завантажені CV-файли назавжди?",
          a: "Ні. CVboosta обробляє файли у тимчасовій пам'яті для аналізу та не зберігає завантажені CV-файли у постійному сховищі.",
        },
        {
          q: "Хто обробляє платежі?",
          a: "Платежі обробляє Stripe. CVboosta не зберігає повні номери карток або CVV/CVC.",
        },
        {
          q: "Мої дані використовуються для навчання публічних моделей?",
          a: "CVboosta безпечно використовує AI-провайдерів для генерації результатів. Ваші дані не використовуються для навчання публічних універсальних моделей.",
        },
        {
          q: "Як довго зберігаються дані акаунта?",
          a: "Дані акаунта та білінгу зберігаються лише стільки, скільки потрібно для роботи сервісу, безпеки та виконання юридичних вимог.",
        },
      ],
    },
    pl: {
      noStorageTitle: "Brak trwałego przechowywania plików i treści dokumentów",
      noStorageDesc:
        "CVboosta nie przechowuje przesłanych plików CV, treści CV ani plików opisów ofert w trwałym magazynie plików. Dokumenty są przetwarzane tymczasowo w pamięci operacyjnej, a następnie usuwane.",
      billingTitle: "Płatności i dane rozliczeniowe",
      billingDesc:
        "Płatności są przetwarzane przez Stripe. CVboosta nie zbiera ani nie przechowuje pełnych numerów kart, CVV/CVC ani surowych danych instrumentów płatniczych.",
      faqTitle: "FAQ usługi",
      faq: [
        {
          q: "Czy przechowujecie przesłane pliki CV na stałe?",
          a: "Nie. CVboosta przetwarza pliki tymczasowo w pamięci i nie przechowuje ich trwale.",
        },
        {
          q: "Kto obsługuje płatności?",
          a: "Płatności obsługuje Stripe. CVboosta nie przechowuje pełnych numerów kart ani CVV/CVC.",
        },
        {
          q: "Czy moje dane służą do trenowania publicznych modeli?",
          a: "CVboosta bezpiecznie korzysta z dostawców AI do generowania wyników. Twoje dane nie są używane do trenowania publicznych modeli ogólnego przeznaczenia.",
        },
        {
          q: "Jak długo przechowujecie dane konta?",
          a: "Dane konta i rozliczeń są przechowywane tylko tak długo, jak to konieczne do działania usługi, bezpieczeństwa i obowiązków prawnych.",
        },
      ],
    },
    sk: {
      noStorageTitle: "Bez trvalého ukladania osobných súborov a obsahu dokumentov",
      noStorageDesc:
        "CVboosta neukladá nahrané CV súbory, obsah CV ani súbory popisu pracovnej pozície do trvalého úložiska. Dokumenty sa spracúvajú dočasne v pamäti a po spracovaní sa odstránia.",
      billingTitle: "Platby a fakturačné údaje",
      billingDesc:
        "Platby sú spracované cez Stripe. CVboosta nezhromažďuje ani neukladá celé čísla kariet, CVV/CVC ani surové údaje platobných nástrojov.",
      faqTitle: "FAQ služby",
      faq: [
        {
          q: "Ukladáte moje nahrané CV súbory natrvalo?",
          a: "Nie. CVboosta spracúva súbory dočasne v pamäti a nahrané CV súbory neukladá do trvalého úložiska.",
        },
        {
          q: "Kto spracúva platby?",
          a: "Platby spracúva Stripe. CVboosta neukladá celé čísla kariet ani CVV/CVC.",
        },
        {
          q: "Používajú sa moje dáta na tréning verejných modelov?",
          a: "CVboosta bezpečne používa AI poskytovateľov na generovanie výstupov. Vaše dáta sa nepoužívajú na tréning verejných všeobecných modelov.",
        },
        {
          q: "Ako dlho uchovávate údaje účtu?",
          a: "Údaje účtu a fakturácie uchovávame len tak dlho, ako je potrebné pre prevádzku služby, bezpečnosť a právne povinnosti.",
        },
      ],
    },
    cs: {
      noStorageTitle: "Bez trvalého ukládání osobních souborů a obsahu dokumentů",
      noStorageDesc:
        "CVboosta neukládá nahrané soubory CV, obsah CV ani soubory popisu pozice do trvalého úložiště. Dokumenty jsou zpracovány dočasně v paměti a po zpracování odstraněny.",
      billingTitle: "Platby a platební údaje",
      billingDesc:
        "Platby jsou zpracovány přes Stripe. CVboosta neshromažďuje ani neukládá úplná čísla karet, CVV/CVC ani surové údaje platebních prostředků.",
      faqTitle: "FAQ služby",
      faq: [
        {
          q: "Ukládáte trvale nahrané soubory CV?",
          a: "Ne. CVboosta zpracovává soubory dočasně v paměti a nahrané CV soubory neukládá do trvalého úložiště.",
        },
        {
          q: "Kdo zpracovává platby?",
          a: "Platby zpracovává Stripe. CVboosta neukládá úplná čísla karet ani CVV/CVC.",
        },
        {
          q: "Používají se moje data k trénování veřejných modelů?",
          a: "CVboosta bezpečně využívá AI poskytovatele pro generování výstupů. Vaše data se nepoužívají k trénování veřejných obecných modelů.",
        },
        {
          q: "Jak dlouho uchováváte data účtu?",
          a: "Data účtu a fakturace uchováváme pouze po dobu nutnou pro provoz služby, bezpečnost a právní povinnosti.",
        },
      ],
    },
    es: {
      noStorageTitle: "Sin almacenamiento persistente de archivos personales ni contenido",
      noStorageDesc:
        "CVboosta no almacena archivos CV subidos, contenido del CV ni archivos de descripción de vacante en almacenamiento persistente. Los documentos se procesan de forma temporal en memoria y luego se eliminan.",
      billingTitle: "Facturación y datos de pago",
      billingDesc:
        "Los pagos se procesan mediante Stripe. CVboosta no recopila ni almacena números completos de tarjeta, CVV/CVC ni datos crudos del instrumento de pago.",
      faqTitle: "FAQ del servicio",
      faq: [
        {
          q: "¿Guardan permanentemente mis archivos CV subidos?",
          a: "No. CVboosta procesa los archivos temporalmente en memoria y no guarda los archivos CV en almacenamiento persistente.",
        },
        {
          q: "¿Quién procesa los pagos?",
          a: "Los pagos los procesa Stripe. CVboosta no almacena números completos de tarjeta ni CVV/CVC.",
        },
        {
          q: "¿Mis datos se usan para entrenar modelos públicos?",
          a: "CVboosta usa proveedores de IA de forma segura para generar resultados. Tus datos no se usan para entrenar modelos públicos de uso general.",
        },
        {
          q: "¿Cuánto tiempo conservan los datos de la cuenta?",
          a: "Los datos de cuenta y facturación se conservan solo el tiempo necesario para operar el servicio, seguridad y obligaciones legales.",
        },
      ],
    },
  }[language];

  return (
    <main className="page">
      <div className="shell legal-page-shell">
        <section className="legal-section fade-up" style={{ padding: "80px 0 56px" }}>
          <div className="legal-hero">
            <h1 className="hero-title" style={{ fontSize: "48px", marginBottom: "20px" }}>
              {t("legal.privacyTitle")}
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: "860px", marginBottom: 0 }}>
              {t("legal.privacyIntro")}
            </p>
          </div>

          <div className="legal-doc">
            <div className="legal-meta">
              <span className="legal-chip">{t("results.legalDocumentLabel")}</span>
              <span className="legal-chip">{t("results.lastUpdatedPrefix")}: April 16, 2026</span>
            </div>

            <div className="legal-content">
              <div className="legal-block">
                <h3>{t("legal.privacyDataTitle")}</h3>
                <p>{t("legal.privacyData")}</p>
              </div>
              <div className="legal-block">
                <h3>{localizedBlocks.noStorageTitle}</h3>
                <p>{localizedBlocks.noStorageDesc}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.privacyRetentionTitle")}</h3>
                <p>{t("legal.privacyRetention")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.privacyAiTitle")}</h3>
                <p>{t("legal.privacyAiDesc")}</p>
              </div>
              <div className="legal-block">
                <h3>{localizedBlocks.billingTitle}</h3>
                <p>{localizedBlocks.billingDesc}</p>
              </div>
              <div className="legal-block">
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
