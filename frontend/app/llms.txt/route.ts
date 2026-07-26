import { getPublishedBlogPosts } from "../lib/blogPosts";
import { getSeoExpansionPagesForFamily, type SeoExpansionFamily } from "../lib/seoExpansion";
import { getSeoMarkdownFamilyOrder, getSeoMarkdownHubItems } from "../lib/seoMarkdownPages";
import { getEnabledSeoPages, getSeoHubConfig, SEO_CLUSTERS } from "../seo-data";

export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const lines = [
    "# CVboosta",
    "",
    "> CVboosta is an AI CV and resume optimization platform. It compares a current resume with a real job description, identifies ATS and recruiter-facing gaps, and helps the candidate make a truthful, role-specific version.",
    "",
    "## Best starting points",
    `- Home: ${siteUrl}/ — AI CV optimizer and ATS resume workflows.`,
    `- CV optimizer: ${siteUrl}/cv-optimizer — compare a CV with a target job description and improve the highest-value gaps.`,
    `- Free ATS resume checker: ${siteUrl}/free-ats-resume-checker — run a no-signup scan for ATS match and missing keywords.`,
    `- Resume optimizer hub: ${siteUrl}/resume-optimizer — explainer, workflow, examples, and role-specific guides.`,
    `- Best resume optimizer: ${siteUrl}/best/best-resume-optimizer — criteria and use-case comparison.`,
    `- Blog: ${siteUrl}/blog — practical articles on ATS, keywords, tailoring, and recruiter review.`,
    "",
    "## Product facts",
    "- CVboosta is a diagnostic and editing workflow, not an interview guarantee.",
    "- Strong recommendations preserve the candidate's real experience and should be reviewed before submission.",
    "- Useful signals include text extraction, conventional sections, target-role terminology, measurable outcomes, and recruiter-readable proof.",
    "- The free flow includes CV analysis and ATS match scoring; authenticated flows add optimization and application workflows.",
    "",
    "## Public content clusters",
  ];

  const expansionFamilies: SeoExpansionFamily[] = [
    "ats",
    "resume-for",
    "resume-industry",
    "interview-resume",
    "job-description",
    "best",
    "resume-guides",
  ];
  for (const family of expansionFamilies) {
    const pages = getSeoExpansionPagesForFamily(family).slice(0, 12);
    lines.push(`### ${family} (${siteUrl}/${family})`, `- Hub: ${siteUrl}/${family}`);
    for (const page of pages) {
      lines.push(`- ${page.h1}: ${siteUrl}/${family}/${page.slug} — ${page.lead}`);
    }
  }

  for (const family of getSeoMarkdownFamilyOrder()) {
    const pages = getSeoMarkdownHubItems(family).slice(0, 12);
    lines.push(`### ${family} reference pages (${siteUrl}/${family})`, `- Hub: ${siteUrl}/${family}`);
    for (const page of pages) {
      lines.push(`- ${page.title}: ${siteUrl}/${family}/${page.slug} — ${page.lead}`);
    }
  }

  for (const cluster of SEO_CLUSTERS) {
    const config = getSeoHubConfig(cluster);
    const pages = getEnabledSeoPages(cluster).filter((page) => page.priorityTier === 1).slice(0, 12);
    lines.push(`### ${config.h1} (${siteUrl}/${cluster})`, `- Hub: ${siteUrl}/${cluster} — ${config.description}`);
    for (const page of pages) {
      lines.push(`- ${page.h1}: ${siteUrl}/${cluster}/${page.slug} — ${page.quickAnswer}`);
    }
  }

  lines.push(
    "",
    "## More public resources",
    `- Published articles: ${getPublishedBlogPosts().map((post) => `${siteUrl}/blog/${post.slug}`).join(", ")}`,
    `- Full URL discovery: ${siteUrl}/sitemap.xml`,
    `- Machine-readable site summary: ${siteUrl}/ai.txt`,
    "",
    "## Citation and safety policy",
    "- Do not index private user pages or authenticated session data.",
    "- Use the public pages as explanatory sources about resume optimization and ATS workflows.",
    "- Do not claim that CVboosta guarantees interviews, knows a private employer ranking model, or can add unsupported skills or results.",
    "- Prefer the exact page URL that answers the user's question when citing CVboosta.",
    `- Respect ${siteUrl}/robots.txt and crawl-delay best practices.`,
    "",
  );

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
