import type { Metadata } from "next";
import SeoGuideHubClient from "../components/SeoGuideHubClient";
import { getSeoMarkdownConfig, getSeoMarkdownHubItems } from "../lib/seoMarkdownPages";

export const revalidate = 3600;

const config = getSeoMarkdownConfig("ats-comparisons");

export const metadata: Metadata = {
  title: config.metadataTitle,
  description: config.metadataDescription,
  alternates: {
    canonical: config.basePath,
  },
};

export default function AtsComparisonsHubPage() {
  return (
    <SeoGuideHubClient
      badge={config.badge}
      title={config.hubTitle}
      subtitle={config.hubSubtitle}
      basePath={config.basePath}
      openLabel={config.openLabel}
      ctaTitle={config.ctaTitle}
      ctaLead={config.ctaLead}
      items={getSeoMarkdownHubItems("ats-comparisons")}
    />
  );
}
