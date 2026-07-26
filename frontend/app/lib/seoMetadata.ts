import type { Metadata } from "next";

const SITE_NAME = "CVboosta";

export type SeoMetadataInput = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  type?: "article" | "website";
};

/**
 * Keep metadata consistent across the large programmatic SEO surface.
 * The canonical stays relative because the root layout owns metadataBase.
 */
export function buildSeoMetadata({
  title,
  description,
  canonical,
  keywords = [],
  type = "article",
}: SeoMetadataInput): Metadata {
  const normalizedKeywords = Array.from(
    new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean)),
  );

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    ...(normalizedKeywords.length > 0 ? { keywords: normalizedKeywords } : {}),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: [{ url: "/logo.png", width: 800, height: 600, alt: `${SITE_NAME} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

