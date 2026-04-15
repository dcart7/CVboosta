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
      morTitle: "Merchant of Record and Billing",
      morDesc:
        "Paddle is the Merchant of Record for purchases made through this service. Paddle manages checkout, tax, and payment processing operations. Any billing dispute or refund request is handled under Paddle-enabled billing policies shown at checkout and in your invoice records.",
    },
    uk: {
      dataTitle: "Обробка даних і файлів",
      dataDesc:
        "CVboosta не зберігає завантажені користувачем CV-файли або файли опису вакансій у постійному сховищі. Файли обробляються лише для генерації результатів оптимізації та видаляються після завершення обробки.",
      morTitle: "Merchant of Record та білінг",
      morDesc:
        "Paddle є Merchant of Record для покупок у сервісі. Paddle керує checkout, податками та обробкою платежів. Спори щодо білінгу чи запити на повернення обробляються за політиками Paddle, які відображаються під час оплати та в інвойсах.",
    },
    pl: {
      dataTitle: "Przetwarzanie danych i plików",
      dataDesc:
        "CVboosta nie przechowuje trwale przesłanych przez użytkownika plików CV ani plików opisu stanowiska. Pliki są przetwarzane wyłącznie do wygenerowania wyników optymalizacji i usuwane po zakończeniu.",
      morTitle: "Merchant of Record i rozliczenia",
      morDesc:
        "Paddle jest Merchant of Record dla zakupów realizowanych w usłudze. Paddle obsługuje checkout, podatki i przetwarzanie płatności. Spory rozliczeniowe i zwroty są obsługiwane zgodnie z politykami Paddle dostępnymi przy zakupie i na fakturach.",
    },
    sk: {
      dataTitle: "Spracovanie dát a súborov",
      dataDesc:
        "CVboosta neukladá používateľom nahrané CV súbory ani súbory popisu pracovnej pozície do trvalého úložiska. Súbory sa spracúvajú len na účel generovania optimalizovaného výstupu a po dokončení sa odstránia.",
      morTitle: "Merchant of Record a billing",
      morDesc:
        "Paddle je Merchant of Record pre nákupy v tejto službe. Paddle spravuje checkout, dane a spracovanie platieb. Spory o fakturáciu a žiadosti o refundáciu sa riadia politikami Paddle zobrazenými pri platbe a vo faktúrach.",
    },
    cs: {
      dataTitle: "Zpracování dat a souborů",
      dataDesc:
        "CVboosta trvale neukládá uživatelské soubory CV ani soubory popisu pozice. Soubory jsou zpracovány pouze pro vytvoření optimalizovaného výstupu a po dokončení odstraněny.",
      morTitle: "Merchant of Record a billing",
      morDesc:
        "Paddle je Merchant of Record pro nákupy v této službě. Paddle zajišťuje checkout, daně a zpracování plateb. Spory k billingům a žádosti o refundaci se řídí politikami Paddle uvedenými při platbě a na fakturách.",
    },
    es: {
      dataTitle: "Gestión de datos y archivos",
      dataDesc:
        "CVboosta no almacena de forma persistente archivos CV subidos por el usuario ni archivos de descripción de vacante. Los archivos se procesan solo para generar resultados de optimización y se eliminan al finalizar.",
      morTitle: "Merchant of Record y facturación",
      morDesc:
        "Paddle es el Merchant of Record para compras realizadas en este servicio. Paddle gestiona checkout, impuestos y procesamiento de pagos. Cualquier disputa de facturación o solicitud de reembolso se rige por las políticas de Paddle mostradas durante la compra y en las facturas.",
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
              <span className="legal-chip">{t("results.lastUpdatedPrefix")}: April 15, 2026</span>
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
