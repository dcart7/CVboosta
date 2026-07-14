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
              <span className="legal-chip">{t("results.lastUpdatedPrefix")}: July 14, 2026</span>
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

              <div className="legal-block">
                <h3>Scope</h3>
                <p>
                  This policy applies to CVBoosta services made available through:
                </p>
                <ul className="legal-list">
                  <li>
                    <code>https://cvboosta.com</code>
                  </li>
                  <li>the CVBoosta iOS application</li>
                </ul>
              </div>

              <div className="legal-block">
                <h3>Data We Collect</h3>
                <p>
                  We may collect the following categories of data when you use CVBoosta:
                </p>

                <h4 className="legal-subheading">Account and contact data</h4>
                <ul className="legal-list">
                  <li>name</li>
                  <li>email address</li>
                  <li>account or user identifiers</li>
                  <li>authentication and session records</li>
                </ul>

                <h4 className="legal-subheading">Resume and application content</h4>
                <ul className="legal-list">
                  <li>resume files you upload</li>
                  <li>resume text extracted for analysis</li>
                  <li>job descriptions, tailoring inputs, and generated resume suggestions</li>
                  <li>
                    application tracker entries such as company, role, status, notes, links,
                    and interview reflections
                  </li>
                  <li>
                    other user-generated content submitted through the app or website to power
                    CVBoosta features
                  </li>
                </ul>

                <h4 className="legal-subheading">Subscription and transaction data</h4>
                <ul className="legal-list">
                  <li>App Store product identifiers</li>
                  <li>entitlement and subscription status</li>
                  <li>purchase history metadata</li>
                  <li>transaction identifiers and related validation records</li>
                </ul>

                <h4 className="legal-subheading">Device and service data</h4>
                <ul className="legal-list">
                  <li>
                    push notification tokens and live activity push tokens used to deliver
                    notifications
                  </li>
                  <li>
                    basic service and security logs needed to operate, secure, and debug the
                    product
                  </li>
                </ul>

                <h4 className="legal-subheading">
                  Data we generally do not collect from the current iOS app version
                </h4>
                <ul className="legal-list">
                  <li>payment card numbers or bank details</li>
                  <li>precise or coarse location</li>
                  <li>contacts</li>
                  <li>advertising identifiers for cross-app tracking</li>
                </ul>

                <p>
                  If you choose a profile photo in the current iOS app, that photo is stored
                  locally on your device unless and until CVBoosta explicitly adds a server sync
                  feature for it.
                </p>
              </div>

              <div className="legal-block">
                <h3>How We Use Data</h3>
                <p>We use collected data to:</p>
                <ul className="legal-list">
                  <li>create and authenticate accounts</li>
                  <li>
                    deliver resume scanning, tailoring, export, and application tracking
                    features
                  </li>
                  <li>sync account state, subscription access, and saved workspace data</li>
                  <li>validate purchases and restore App Store entitlements</li>
                  <li>send optional notifications and live activity updates</li>
                  <li>prevent fraud, abuse, and unauthorized access</li>
                  <li>operate, secure, maintain, and improve the service</li>
                  <li>provide customer support</li>
                </ul>
              </div>

              <div className="legal-block">
                <h3>CVBoosta for iOS</h3>
                <p>For the current iOS app version:</p>
                <ul className="legal-list">
                  <li>CVBoosta collects data primarily to provide app functionality.</li>
                  <li>
                    CVBoosta does not use iOS app data for cross-app tracking or targeted
                    advertising.
                  </li>
                  <li>
                    CVBoosta does not receive your payment card number from Apple when you
                    purchase through the App Store.
                  </li>
                </ul>
              </div>

              <div className="legal-block">
                <h3>Data Retention</h3>
                <p>
                  We retain data for as long as it is reasonably needed for the purposes
                  described above, including to provide the service, maintain account access,
                  validate purchases, protect the service, and comply with legal obligations.
                </p>
                <p>In practice, this means:</p>
                <ul className="legal-list">
                  <li>
                    account profile, login, subscription, and workspace data are generally
                    retained while your account is active
                  </li>
                  <li>
                    resume analysis inputs, generated outputs, tracker records, and related
                    user content are generally retained while your account is active unless
                    deleted earlier
                  </li>
                  <li>
                    notification tokens are retained until they are replaced, invalidated, no
                    longer needed for notifications, or your account is deleted
                  </li>
                  <li>
                    operational and security logs may be retained for limited periods needed
                    for security, fraud prevention, debugging, backup restoration, or legal
                    compliance
                  </li>
                  <li>
                    backup copies may persist for a limited time before they age out under
                    routine backup cycles
                  </li>
                </ul>
              </div>

              <div className="legal-block">
                <h3>Account and Data Deletion</h3>
                <p>
                  You can request deletion of your CVBoosta account directly inside the iOS
                  app:
                </p>
                <ul className="legal-list">
                  <li>
                    <code>Settings</code> -&gt; <code>Delete Account</code>
                  </li>
                </ul>
                <p>
                  When you delete your account, CVBoosta will remove or de-identify the
                  associated account data from active systems, subject to limited retention
                  needed for legal compliance, fraud prevention, security, financial reporting,
                  and backup expiration cycles.
                </p>
                <p>
                  Deleting your CVBoosta account does not automatically cancel an App Store
                  subscription. App Store subscriptions are managed by Apple and must be
                  canceled separately through your Apple account subscription settings.
                </p>
                <p>
                  If you cannot access the app and need help with account deletion or privacy
                  questions, contact:
                </p>
                <ul className="legal-list">
                  <li>
                    <code>support@virelsolutions.com</code>
                  </li>
                </ul>
              </div>

              <div className="legal-block">
                <h3>Policy Updates</h3>
                <p>
                  We may update this Privacy Policy from time to time. When we do, we will
                  update the &quot;Last updated&quot; date on this page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
