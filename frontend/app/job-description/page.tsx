import type { Metadata } from "next";
import SeoGuideHubClient from "../components/SeoGuideHubClient";
import { getSeoExpansionConfig } from "../lib/seoExpansionConfigs";
import { getSeoExpansionHubItems } from "../lib/seoExpansion";

export const revalidate = 3600;

const config = getSeoExpansionConfig("job-description");

export const metadata: Metadata = {
  title: config.metadataTitle,
  description: config.metadataDescription,
  alternates: {
    canonical: config.basePath,
  },
};

export default function JobDescriptionHubPage() {
  return (
    <SeoGuideHubClient
      badge={config.badge}
      title={config.hubTitle}
      subtitle={config.hubSubtitle}
      basePath={config.basePath}
      openLabel={config.openLabel}
      ctaTitle={config.ctaTitle}
      ctaLead={config.ctaLead}
      items={getSeoExpansionHubItems("job-description", 60)}
    />
  );
}
