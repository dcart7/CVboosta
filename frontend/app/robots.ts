import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const host = new URL(baseUrl).host;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/analyze",
        "/app",
        "/history",
        "/optimize",
        "/results",
        "/login",
        "/register",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host,
  };
}
