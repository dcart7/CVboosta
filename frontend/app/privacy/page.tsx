"use client";

import TopNav from "../components/TopNav";
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
    },
    uk: {
      noStorageTitle: "Відсутність зберігання особистих файлів і вмісту документів",
      noStorageDesc:
        "CVboosta не зберігає завантажені CV-файли, вміст CV або файли опису вакансій у постійному файловому сховищі. Документи обробляються у тимчасовій пам'яті для аналізу та генерації результату, після чого видаляються.",
      billingTitle: "Оплата та платіжні дані",
      billingDesc:
        "Оплата обробляється через Stripe. CVboosta не збирає і не зберігає повні номери карток, CVV/CVC або інші сирі платіжні реквізити.",
    },
    pl: {
      noStorageTitle: "Brak trwałego przechowywania plików i treści dokumentów",
      noStorageDesc:
        "CVboosta nie przechowuje przesłanych plików CV, treści CV ani plików opisów ofert w trwałym magazynie plików. Dokumenty są przetwarzane tymczasowo w pamięci operacyjnej, a następnie usuwane.",
      billingTitle: "Płatności i dane rozliczeniowe",
      billingDesc:
        "Płatności są przetwarzane przez Stripe. CVboosta nie zbiera ani nie przechowuje pełnych numerów kart, CVV/CVC ani surowych danych instrumentów płatniczych.",
    },
    sk: {
      noStorageTitle: "Bez trvalého ukladania osobných súborov a obsahu dokumentov",
      noStorageDesc:
        "CVboosta neukladá nahrané CV súbory, obsah CV ani súbory popisu pracovnej pozície do trvalého úložiska. Dokumenty sa spracúvajú dočasne v pamäti a po spracovaní sa odstránia.",
      billingTitle: "Platby a fakturačné údaje",
      billingDesc:
        "Platby sú spracované cez Stripe. CVboosta nezhromažďuje ani neukladá celé čísla kariet, CVV/CVC ani surové údaje platobných nástrojov.",
    },
    cs: {
      noStorageTitle: "Bez trvalého ukládání osobních souborů a obsahu dokumentů",
      noStorageDesc:
        "CVboosta neukládá nahrané soubory CV, obsah CV ani soubory popisu pozice do trvalého úložiště. Dokumenty jsou zpracovány dočasně v paměti a po zpracování odstraněny.",
      billingTitle: "Platby a platební údaje",
      billingDesc:
        "Platby jsou zpracovány přes Stripe. CVboosta neshromažďuje ani neukládá úplná čísla karet, CVV/CVC ani surové údaje platebních prostředků.",
    },
    es: {
      noStorageTitle: "Sin almacenamiento persistente de archivos personales ni contenido",
      noStorageDesc:
        "CVboosta no almacena archivos CV subidos, contenido del CV ni archivos de descripción de vacante en almacenamiento persistente. Los documentos se procesan de forma temporal en memoria y luego se eliminan.",
      billingTitle: "Facturación y datos de pago",
      billingDesc:
        "Los pagos se procesan mediante Stripe. CVboosta no recopila ni almacena números completos de tarjeta, CVV/CVC ni datos crudos del instrumento de pago.",
    },
  }[language];

  return (
    <main className="page">
      <TopNav />
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
