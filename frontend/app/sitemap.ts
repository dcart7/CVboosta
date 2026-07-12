import { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "./lib/blogPosts";
import { getCvOptimizerGuideRoutes } from "./lib/cvOptimizerCluster";
import { getResumeKeywordStaticSlugs } from "./lib/resumeKeywordClusters";
import { getAllSeoExpansionRoutes } from "./lib/seoExpansion";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const publishedBlogRoutes = getPublishedBlogPosts().map((post) => `/blog/${post.slug}`);
  const resumeKeywordRoutes = getResumeKeywordStaticSlugs().map(
    (slug) => `/resume-keywords/${slug}`,
  );
  const resumeExampleRoutes = getResumeKeywordStaticSlugs().map(
    (slug) => `/resume-examples/${slug}`,
  );
  const cvOptimizerGuideRoutes = getCvOptimizerGuideRoutes();
  const seoExpansionRoutes = getAllSeoExpansionRoutes();
  const staticRoutes = [
    "",
    "/about",
    "/ats",
    "/best",
    "/blog",
    "/cases",
    "/cv-optimizer",
    "/free-ats-resume-checker",
    "/interview-resume",
    "/job-description",
    "/resume-bullets",
    "/resume-examples",
    "/resume-for",
    "/resume-guides",
    "/resume-industry",
    "/resume-keywords",
    "/resume-summary",
    "/ai.txt",
    "/llms.txt",
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
  ]));

  const routes = allRoutes.map((route) => {
    const priority =
      route === ""
        ? 1
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
              : route.startsWith("/best/")
                ? 0.82
                : route === "/best"
                  ? 0.87
            : route.startsWith("/blog/")
              ? 0.82
              : 0.8;

    const changeFrequency =
      route.startsWith("/resume-keywords/") ||
      route.startsWith("/cv-optimizer/") ||
      route.startsWith("/resume-examples/") ||
      route.startsWith("/resume-guides/") ||
      route.startsWith("/resume-for/") ||
      route.startsWith("/ats/") ||
      route.startsWith("/resume-industry/") ||
      route.startsWith("/interview-resume/") ||
      route.startsWith("/job-description/") ||
      route.startsWith("/best/") ||
      route.startsWith("/blog/")
        ? ("weekly" as const)
        : ("monthly" as const);

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });

  return routes;
}
