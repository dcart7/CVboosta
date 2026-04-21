export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const body = [
    "site: CVboosta",
    `url: ${siteUrl}`,
    "topic: AI resume optimization and ATS matching",
    `free_tool: ${siteUrl}/free-ats-resume-checker`,
    `sitemap: ${siteUrl}/sitemap.xml`,
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
