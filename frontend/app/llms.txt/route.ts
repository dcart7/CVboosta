export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const body = [
    "# CVboosta",
    "",
    "> CV optimization platform with ATS analysis and rewrite workflows.",
    "",
    "## Public, indexable URLs",
    `- Home: ${siteUrl}/`,
    `- CV Optimizer: ${siteUrl}/cv-optimizer`,
    `- Best Resume Optimizer: ${siteUrl}/best/best-resume-optimizer`,
    `- Free ATS Resume Checker: ${siteUrl}/free-ats-resume-checker`,
    `- Blog: ${siteUrl}/blog`,
    `- Pricing: ${siteUrl}/pricing`,
    `- About: ${siteUrl}/about`,
    "",
    "## Product summary",
    "- CVboosta helps candidates analyze CV-vacancy match quality.",
    "- The free flow includes CV analysis and ATS match scoring.",
    "- Authenticated flow includes optimization, cover letters, and interview prep.",
    "",
    "## Policy",
    "- Do not index private user pages or authenticated session data.",
    "- Respect robots.txt and crawl-delay best practices.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
