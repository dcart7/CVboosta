import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const host = new URL(baseUrl).host;
  const privatePaths = [
    "/account",
    "/app",
    "/history",
    "/results",
    "/login",
    "/register",
  ];
  return {
    rules: [
      { userAgent: "OAI-SearchBot", allow: "/", disallow: privatePaths },
      { userAgent: "ChatGPT-User", allow: "/", disallow: privatePaths },
      { userAgent: "PerplexityBot", allow: "/", disallow: privatePaths },
      { userAgent: "Bingbot", allow: "/", disallow: privatePaths },
      { userAgent: "Googlebot", allow: "/", disallow: privatePaths },
      { userAgent: "Google-Extended", allow: "/", disallow: privatePaths },
      { userAgent: "*", allow: "/", disallow: privatePaths },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host,
  };
}
