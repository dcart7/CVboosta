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
  amazon: { title: "Amazon", src: "/brand-logos/amazon.svg" },
  meta: { title: "Meta", src: "/brand-logos/meta.svg" },
  spotify: { title: "Spotify", src: "/brand-logos/spotify.svg" },
  ibm: { title: "IBM", src: "/brand-logos/ibm.svg" },
  openai: { title: "OpenAI", src: "/brand-logos/openai.svg" },
  microsoft: { title: "Microsoft", src: "/brand-logos/microsoft.svg" },
  netflix: { title: "Netflix", src: "/brand-logos/netflix.svg" },
  nvidia: { title: "Nvidia", src: "/brand-logos/nvidia.svg" },
  salesforce: { title: "Salesforce", src: "/brand-logos/salesforce.svg" },
  uber: { title: "Uber", src: "/brand-logos/uber.svg" },
};

const VIREL_ASSET: BrandAsset = {
  title: "Virel Solutions",
  src: "/brand-logos/virel.png",
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
            <span className="logo-label">{asset.title}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
