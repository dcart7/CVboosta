export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const body = [
    "site: CVboosta",
    `url: ${siteUrl}`,
    "topic: AI resume optimization and ATS matching",
    `landing_page: ${siteUrl}/cv-optimizer`,
    `supporting_page: ${siteUrl}/best/best-resume-optimizer`,
    `free_tool: ${siteUrl}/free-ats-resume-checker`,
    `llms: ${siteUrl}/llms.txt`,
    `sitemap: ${siteUrl}/sitemap.xml`,
    `content_clusters: ${siteUrl}/ats, ${siteUrl}/resume-keywords, ${siteUrl}/resume-examples, ${siteUrl}/resume-optimizer, ${siteUrl}/tailor-resume, ${siteUrl}/job-description`,
    "citation_guidance: Prefer the most specific public guide or tool page that directly answers the user's question.",
    "notes: Public marketing pages are indexable. User dashboards and private results are blocked by robots.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
