import { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "./lib/blogPosts";
import { getCvOptimizerGuideRoutes } from "./lib/cvOptimizerCluster";
import { getResumeKeywordStaticSlugs } from "./lib/resumeKeywordClusters";
import { getSeoMarkdownRoutes } from "./lib/seoMarkdownPages";
import { getAllSeoExpansionRoutes } from "./lib/seoExpansion";
import { RESUME_OPTIMIZER_PAGES } from "./resume-optimizer/data";
import { getEnabledSeoPages, getSeoSitemapRoutes, SEO_CLUSTERS } from "./seo-data";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com").replace(/\/$/, "");
  const publishedBlogRoutes = getPublishedBlogPosts().map((post) => `/blog/${post.slug}`);
  const resumeKeywordRoutes = getResumeKeywordStaticSlugs().map(
    (slug) => `/resume-keywords/${slug}`,
  );
  const resumeExampleRoutes = getResumeKeywordStaticSlugs().map(
    (slug) => `/resume-examples/${slug}`,
  );
  const cvOptimizerGuideRoutes = getCvOptimizerGuideRoutes();
  const seoExpansionRoutes = getAllSeoExpansionRoutes();
  const seoMarkdownRoutes = getSeoMarkdownRoutes();
  const resumeOptimizerRoutes = RESUME_OPTIMIZER_PAGES.map(
    (page) => `/resume-optimizer/${page.slug}`,
  );
  const programmaticSeoRoutes = getSeoSitemapRoutes();
  const programmaticSeoPriorities = new Map<string, number>();
  for (const cluster of SEO_CLUSTERS) {
    programmaticSeoPriorities.set(`/${cluster}`, 0.9);
    for (const page of getEnabledSeoPages(cluster)) {
      programmaticSeoPriorities.set(`/${cluster}/${page.slug}`, page.priorityTier === 1 ? 0.8 : page.priorityTier === 2 ? 0.7 : 0.6);
    }
  }
  const staticRoutes = [
    "",
    "/about",
    "/ats",
    "/ats-comparisons",
    "/best",
    "/blog",
    "/cases",
    "/cv-optimizer",
    "/datasets",
    "/free-ats-resume-checker",
    "/interview-resume",
    "/job-description",
    "/resume-bullets",
    "/resume-examples",
    "/resume-for",
    "/resume-guides",
    "/resume-industry",
    "/resume-keywords",
    "/resume-optimizer",
    "/resume-summary",
    "/skills",
    "/tools",
    "/pricing",
    "/privacy",
    "/terms",
  ];

  const allRoutes = Array.from(new Set([
    ...staticRoutes,
    ...publishedBlogRoutes,
    ...cvOptimizerGuideRoutes,
    ...resumeKeywordRoutes,
    ...resumeExampleRoutes,
    ...seoExpansionRoutes,
    ...seoMarkdownRoutes,
    ...resumeOptimizerRoutes,
    ...programmaticSeoRoutes,
  ]));

  const routes = allRoutes.map((route) => {
    const priority = programmaticSeoPriorities.get(route) ?? (
      route === ""
        ? 1
        : route === "/resume-optimizer"
          ? 0.9
          : route.startsWith("/resume-optimizer/")
            ? 0.72
        : route.startsWith("/cv-optimizer/")
          ? 0.88
          : route.startsWith("/resume-examples/")
          ? 0.85
          : route === "/resume-examples"
            ? 0.92
        : route.startsWith("/resume-guides/")
          ? 0.86
          : route === "/resume-guides"
            ? 0.9
        : route.startsWith("/resume-keywords/")
          ? 0.86
          : route === "/resume-keywords"
            ? 0.92
            : route.startsWith("/resume-for/")
              ? 0.84
              : route === "/resume-for"
                ? 0.89
              : route.startsWith("/ats/")
                ? 0.84
                : route === "/ats"
                  ? 0.9
              : route.startsWith("/ats-comparisons/")
                ? 0.83
                : route === "/ats-comparisons"
                  ? 0.88
              : route.startsWith("/resume-industry/")
                ? 0.83
                : route === "/resume-industry"
                  ? 0.88
              : route.startsWith("/interview-resume/")
                ? 0.83
                : route === "/interview-resume"
                  ? 0.88
              : route.startsWith("/job-description/")
                ? 0.83
                : route === "/job-description"
                  ? 0.88
              : route.startsWith("/skills/")
                ? 0.82
                : route === "/skills"
                  ? 0.87
              : route.startsWith("/tools/")
                ? 0.82
                : route === "/tools"
                  ? 0.87
              : route.startsWith("/datasets/")
                ? 0.81
                : route === "/datasets"
                  ? 0.86
              : route.startsWith("/best/")
                ? 0.82
                : route === "/best"
                  ? 0.87
            : route.startsWith("/blog/")
              ? 0.82
              : 0.8);

    const changeFrequency =
      route.startsWith("/resume-keywords/") ||
      route.startsWith("/cv-optimizer/") ||
      route.startsWith("/resume-examples/") ||
      route.startsWith("/resume-guides/") ||
      route.startsWith("/resume-for/") ||
      route.startsWith("/ats/") ||
      route.startsWith("/ats-comparisons/") ||
      route.startsWith("/resume-industry/") ||
      route.startsWith("/interview-resume/") ||
      route.startsWith("/job-description/") ||
      route.startsWith("/skills/") ||
      route.startsWith("/tools/") ||
      route.startsWith("/datasets/") ||
      route.startsWith("/best/") ||
      route.startsWith("/blog/")
        ? ("weekly" as const)
        : ("monthly" as const);

    return {
      url: `${baseUrl}${route}`,
      changeFrequency,
      priority,
    };
  });

  return routes;
}
