"use client";

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

type BrandAsset = { title: string; src: string };

const BRAND_ASSETS: Record<Exclude<BrandKey, "virel">, BrandAsset> = {
  apple: { title: "Apple", src: "/brand-logos/apple.svg" },
  google: { title: "Google", src: "/brand-logos/google.svg" },
  amazon: { title: "Amazon", src: "/brand-logos/amazon-icon.svg" },
  meta: { title: "Meta", src: "/brand-logos/meta.svg" },
  spotify: { title: "Spotify", src: "/brand-logos/spotify.svg" },
  ibm: { title: "IBM", src: "/brand-logos/ibm.svg" },
  openai: { title: "OpenAI", src: "/brand-logos/openai-icon.svg" },
  microsoft: { title: "Microsoft", src: "/brand-logos/microsoft-icon.svg" },
  netflix: { title: "Netflix", src: "/brand-logos/netflix.svg" },
  nvidia: { title: "Nvidia", src: "/brand-logos/nvidia.svg" },
  salesforce: { title: "Salesforce", src: "/brand-logos/salesforce-icon.svg" },
  uber: { title: "Uber", src: "/brand-logos/uber.svg" },
};

const VIREL_ASSET: BrandAsset = {
  title: "Virel Solutions",
  src: "/brand-logos/virel.png",
};

const LABEL_SAFE: Partial<Record<BrandKey, boolean>> = {
  // Hide label only for pure wordmark logos to prevent duplication.
  // (If we later switch to icon-only assets, enable labels for all.)
  ibm: false,
  netflix: false,
  nvidia: false,
  google: false,
  meta: false,
  spotify: false,
  apple: true,
  amazon: true,
  openai: true,
  microsoft: true,
  salesforce: true,
  uber: true,
  virel: true,
};

export default function BrandMarquee({
  brands,
}: {
  brands: BrandKey[];
}) {
  const assets = brands.map((key) =>
    key === "virel" ? VIREL_ASSET : BRAND_ASSETS[key],
  );

  return (
    <div className="marquee-wrapper logo-marquee">
      <div className="marquee-track">
        {[...assets, ...assets].map((asset, index) => (
          <span
            key={`${asset.title}-${index}`}
            className="logo-chip"
            aria-label={asset.title}
            title={asset.title}
          >
            <img
              src={asset.src}
              alt={asset.title}
              loading="lazy"
              decoding="async"
            />
            {LABEL_SAFE[brands[index % brands.length]] ? (
              <span className="logo-label">{asset.title}</span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
