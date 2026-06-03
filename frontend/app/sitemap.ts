import { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "./lib/blogPosts";
import { getResumeKeywordStaticSlugs } from "./lib/resumeKeywordClusters";

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
  const staticRoutes = [
    "",
    "/about",
    "/ats",
    "/blog",
    "/cases",
    "/free-ats-resume-checker",
    "/resume-bullets",
    "/resume-examples",
    "/resume-for",
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
    ...resumeKeywordRoutes,
    ...resumeExampleRoutes,
  ]));

  const routes = allRoutes.map((route) => {
    const priority =
      route === ""
        ? 1
        : route.startsWith("/resume-examples/")
          ? 0.85
          : route === "/resume-examples"
            ? 0.92
        : route.startsWith("/resume-keywords/")
          ? 0.86
          : route === "/resume-keywords"
            ? 0.92
            : route.startsWith("/blog/")
              ? 0.82
              : 0.8;

    const changeFrequency =
      route.startsWith("/resume-keywords/") ||
      route.startsWith("/resume-examples/") ||
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
