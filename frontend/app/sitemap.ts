import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";

  const routes = [
    "",
    "/about",
    "/blog",
    "/blog/tailor-resume-to-job-description",
    "/blog/ats-resume-mistakes",
    "/blog/improve-ats-resume-score",
    "/pricing",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
