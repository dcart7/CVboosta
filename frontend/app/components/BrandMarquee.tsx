"use client";

import {
  siApple,
  siGoogle,
  siMeta,
  siNetflix,
  siNvidia,
  siSpotify,
  siUber,
} from "simple-icons";

type BrandKey =
  | "apple"
  | "google"
  | "amazon"
  | "meta"
  | "spotify"
  | "ibm"
  | "openai"
  | "microsoft"
  | "netflix"
  | "nvidia"
  | "salesforce"
  | "uber"
  | "virel";

type BrandIcon = { title: string; path: string };

const BRAND_ICONS: Record<Exclude<BrandKey, "virel">, BrandIcon> = {
  apple: siApple,
  google: siGoogle,
  meta: siMeta,
  spotify: siSpotify,
  netflix: siNetflix,
  nvidia: siNvidia,
  uber: siUber,
  // Custom simplified marks (not official logos).
  amazon: { title: "Amazon", path: "M4 16c6 4 10 4 16 0l-1.2-1.6c-5.2 3.2-8.4 3.2-13.6 0L4 16Zm11.4-6.3 2.8 2.8-1.1 1.1-2.8-2.8a4.8 4.8 0 1 1 1.1-1.1ZM12 6.7a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" },
  ibm: { title: "IBM", path: "M3 6h18v2H3V6Zm0 4h18v2H3v-2Zm0 4h18v2H3v-2Zm0 4h18v1H3v-1Z" },
  microsoft: { title: "Microsoft", path: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" },
  salesforce: { title: "Salesforce", path: "M8.5 18.5h7.6a3.9 3.9 0 0 0 0-7.8c-.3 0-.6 0-.9.1A4.8 4.8 0 0 0 6.2 13a3.2 3.2 0 0 0 2.3 5.5Zm7.6-9.6a5.6 5.6 0 0 1 0 11.2H8.5A4.9 4.9 0 1 1 5.4 11a6.6 6.6 0 0 1 12.6-1.6c-.6-.3-1.2-.5-1.9-.5Z" },
  openai: { title: "OpenAI", path: "M12 3.8c2.5 0 4.6 1.7 5.2 4.1 2 .7 3.3 2.6 3 4.8-.2 2-1.7 3.6-3.6 4.1-.6 2.4-2.7 4.1-5.2 4.1-1.2 0-2.4-.4-3.3-1.1-2.1.4-4.2-.7-5-2.7-.7-1.8-.2-3.8 1.2-5.1-.3-2.2.9-4.3 2.9-5 1-1.9 3-3.2 4.8-3.2Zm0 1.6c-1.3 0-2.7 1-3.4 2.3l-.2.4-.4.1c-1.6.4-2.6 2-2.2 3.7l.1.5-.4.3c-1.2.9-1.7 2.5-1.1 4 .6 1.5 2.2 2.3 3.8 1.9l.5-.1.3.3c.8.7 1.8 1.1 3 1.1 1.9 0 3.5-1.4 3.8-3.3l.1-.5.5-.1c1.6-.3 2.8-1.6 3-3.2.2-1.6-.8-3.1-2.4-3.6l-.4-.1-.1-.5c-.3-1.9-1.9-3.3-3.8-3.3Z" },
};

const VIREL_ICON: BrandIcon = {
  title: "Virel Solutions",
  // Simple custom mark (not an official logo).
  path: "M4 4h2.6l5.4 11.6L17.4 4H20l-8 16h-1.9L4 4Z",
};

export default function BrandMarquee({
  brands,
}: {
  brands: BrandKey[];
}) {
  const icons = brands.map((key) =>
    key === "virel" ? VIREL_ICON : BRAND_ICONS[key],
  );

  return (
    <div className="marquee-wrapper logo-marquee">
      <div className="marquee-track">
        {[...icons, ...icons].map((icon, index) => (
          <span
            key={`${icon.title}-${index}`}
            className="logo-chip"
            aria-label={icon.title}
            title={icon.title}
          >
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d={icon.path} />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
