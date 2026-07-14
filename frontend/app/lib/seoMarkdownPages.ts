import fs from "node:fs";
import path from "node:path";

export type SeoMarkdownFamily =
  | "ats"
  | "ats-comparisons"
  | "resume-keywords"
  | "skills"
  | "tools"
  | "datasets";

type SeoMarkdownManifestItem = {
  url_path: string;
  page_type: string;
  primary_keyword: string;
  seo_title: string;
  meta_description: string;
  word_count: number;
  file_path: string;
};

export type SeoMarkdownSection = {
  id: string;
  title: string;
  markdown: string;
};

export type SeoMarkdownPage = {
  family: SeoMarkdownFamily;
  slug: string;
  urlPath: string;
  pageType: string;
  primaryKeyword: string;
  seoTitle: string;
  metaDescription: string;
  estimatedWordCount: number;
  updatedAt: string;
  h1: string;
  lead: string;
  introMarkdown: string;
  sections: SeoMarkdownSection[];
};

export type SeoMarkdownHubItem = {
  slug: string;
  title: string;
  lead: string;
};

export type SeoMarkdownFamilyConfig = {
  family: SeoMarkdownFamily;
  basePath: string;
  badge: string;
  hubTitle: string;
  hubSubtitle: string;
  pageHubLabel: string;
  openLabel: string;
  ctaTitle: string;
  ctaLead: string;
  metadataTitle: string;
  metadataDescription: string;
};

const SEO_PACK_ROOT = path.join(process.cwd(), "content", "seo-pages");
const MANIFEST_PATH = path.join(SEO_PACK_ROOT, "manifest.json");

const SEO_MARKDOWN_FAMILY_ORDER: SeoMarkdownFamily[] = [
  "ats",
  "ats-comparisons",
  "resume-keywords",
  "skills",
  "tools",
  "datasets",
];

const SEO_MARKDOWN_CONFIGS: Record<SeoMarkdownFamily, SeoMarkdownFamilyConfig> = {
  ats: {
    family: "ats",
    basePath: "/ats",
    badge: "ATS",
    hubTitle: "ATS Resume Guides",
    hubSubtitle:
      "Parser-specific ATS pages covering resume format, keyword placement, section headings, and date parsing.",
    pageHubLabel: "Back to ATS hub",
    openLabel: "Open ATS guide",
    ctaTitle: "Use the ATS guidance inside the product",
    ctaLead:
      "Once you spot the parsing and keyword risks, run a scan and fix them inside the optimizer before you submit the real resume.",
    metadataTitle: "ATS Resume Guides | CVboosta",
    metadataDescription:
      "Browse ATS-specific resume pages for parsing, keyword matching, file-format choices, and section-heading guidance.",
  },
  "ats-comparisons": {
    family: "ats-comparisons",
    basePath: "/ats-comparisons",
    badge: "ATS COMPARISONS",
    hubTitle: "ATS Comparison Pages",
    hubSubtitle:
      "Side-by-side ATS comparison pages that explain how common applicant tracking systems differ in resume parsing behavior.",
    pageHubLabel: "Back to ATS comparisons",
    openLabel: "Open comparison",
    ctaTitle: "Compare the ATS logic, then test your own file",
    ctaLead:
      "Comparison pages show where one resume can break across systems. The product helps you validate the actual file before you apply.",
    metadataTitle: "ATS Comparison Pages | CVboosta",
    metadataDescription:
      "Compare common ATS platforms and see how parsing, keyword matching, and file-format risks change across systems.",
  },
  "resume-keywords": {
    family: "resume-keywords",
    basePath: "/resume-keywords",
    badge: "RESUME KEYWORDS",
    hubTitle: "Resume Keywords by Role",
    hubSubtitle:
      "Role-based keyword pages focused on ATS matching, recruiter scan behavior, and practical keyword placement.",
    pageHubLabel: "Back to resume keywords hub",
    openLabel: "Open keyword guide",
    ctaTitle: "Turn keyword research into a stronger CV",
    ctaLead:
      "Once you know the target terms, run a scan and map them to the actual vacancy instead of stuffing them blindly into the file.",
    metadataTitle: "Resume Keywords by Role | CVboosta",
    metadataDescription:
      "Browse role-specific resume keyword pages with ATS-oriented guidance, phrasing examples, and recruiter-focused placement advice.",
  },
  skills: {
    family: "skills",
    basePath: "/skills",
    badge: "SKILL SIGNALS",
    hubTitle: "Skill Frequency Pages",
    hubSubtitle:
      "Search-intent pages explaining how individual skills should appear across different resume targets without turning the CV into keyword soup.",
    pageHubLabel: "Back to skills hub",
    openLabel: "Open skill page",
    ctaTitle: "Use the skill signal where it matters",
    ctaLead:
      "A skill only helps when it is attached to proof. Use the product to tighten those bullets before the next application goes out.",
    metadataTitle: "Skill Frequency Pages | CVboosta",
    metadataDescription:
      "Browse skill frequency pages for role-specific keyword placement, recruiter expectations, and ATS-friendly proof patterns.",
  },
  tools: {
    family: "tools",
    basePath: "/tools",
    badge: "TOOLS",
    hubTitle: "Resume Tool Guides",
    hubSubtitle:
      "Pages that explain resume scoring, readability, keyword placement, ATS validation, and recruiter-scan workflows in plain language.",
    pageHubLabel: "Back to tools hub",
    openLabel: "Open tool guide",
    ctaTitle: "Read the tool logic, then run the workflow",
    ctaLead:
      "These pages explain the signal. The product lets you apply it to your own CV and job description instead of guessing the result.",
    metadataTitle: "Resume Tool Guides | CVboosta",
    metadataDescription:
      "Browse resume tool guides for ATS format checks, keyword scans, bullet rewrites, readability, and recruiter scan previews.",
  },
  datasets: {
    family: "datasets",
    basePath: "/datasets",
    badge: "DATASETS",
    hubTitle: "Resume Skills Datasets",
    hubSubtitle:
      "Dataset-style pages focused on high-signal skills, missing terms, and recruiter-focused formatting patterns by industry and role family.",
    pageHubLabel: "Back to datasets hub",
    openLabel: "Open dataset page",
    ctaTitle: "Use the dataset as a baseline, not a script",
    ctaLead:
      "Start from the recurring terms, then tailor the file to one real vacancy so the final CV stays believable and specific.",
    metadataTitle: "Resume Skills Datasets | CVboosta",
    metadataDescription:
      "Browse dataset-style pages for industry resume skills, ATS-friendly wording, common gaps, and recruiter-signaling patterns.",
  },
};

let cachedPages: SeoMarkdownPage[] | null = null;
let cachedPagesByPath: Map<string, SeoMarkdownPage> | null = null;

function readManifest(): SeoMarkdownManifestItem[] {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as SeoMarkdownManifestItem[];
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) {
    return markdown.trim();
  }

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      return lines.slice(index + 1).join("\n").trim();
    }
  }

  return markdown.trim();
}

function slugifyHeading(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "section"}-${index + 1}`;
}

function collapseParagraph(block: string): string {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSections(markdown: string): { lead: string; introMarkdown: string; sections: SeoMarkdownSection[] } {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const introLines: string[] = [];
  const rawSections: Array<{ title: string; lines: string[] }> = [];
  let currentSection: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection) {
        rawSections.push(currentSection);
      }
      currentSection = {
        title: line.slice(3).trim(),
        lines: [],
      };
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
    } else {
      introLines.push(line);
    }
  }

  if (currentSection) {
    rawSections.push(currentSection);
  }

  const introParagraphs = introLines
    .join("\n")
    .trim()
    .split(/\n\s*\n/)
    .map(collapseParagraph)
    .filter(Boolean);

  return {
    lead: introParagraphs[0] || "",
    introMarkdown: introParagraphs.slice(1).join("\n\n"),
    sections: rawSections.map((section, index) => ({
      id: slugifyHeading(section.title, index),
      title: section.title,
      markdown: section.lines.join("\n").trim(),
    })),
  };
}

function parsePage(item: SeoMarkdownManifestItem): SeoMarkdownPage {
  const contentPath = path.join(SEO_PACK_ROOT, item.file_path);
  const rawMarkdown = fs.readFileSync(contentPath, "utf8");
  const body = stripFrontmatter(rawMarkdown);
  const lines = body.split("\n");
  const h1Index = lines.findIndex((line) => line.startsWith("# "));
  const h1 = h1Index >= 0 ? lines[h1Index].slice(2).trim() : item.seo_title;
  const withoutH1 =
    h1Index >= 0
      ? lines.slice(0, h1Index).concat(lines.slice(h1Index + 1)).join("\n").trim()
      : body;
  const parsed = parseSections(withoutH1);
  const urlParts = item.url_path.replace(/^\/+/, "").split("/");
  const family = urlParts[0] as SeoMarkdownFamily;
  const slug = urlParts.slice(1).join("/");
  const updatedAt = fs.statSync(contentPath).mtime.toISOString().slice(0, 10);

  return {
    family,
    slug,
    urlPath: item.url_path,
    pageType: item.page_type,
    primaryKeyword: item.primary_keyword,
    seoTitle: item.seo_title,
    metaDescription: item.meta_description,
    estimatedWordCount: item.word_count,
    updatedAt,
    h1,
    lead: parsed.lead,
    introMarkdown: parsed.introMarkdown,
    sections: parsed.sections,
  };
}

function loadPages(): SeoMarkdownPage[] {
  if (cachedPages) {
    return cachedPages;
  }

  cachedPages = readManifest()
    .map(parsePage)
    .filter((page) => SEO_MARKDOWN_FAMILY_ORDER.includes(page.family));
  cachedPagesByPath = new Map(cachedPages.map((page) => [page.urlPath, page]));

  return cachedPages;
}

function getPagesByPath(): Map<string, SeoMarkdownPage> {
  if (!cachedPagesByPath) {
    loadPages();
  }
  return cachedPagesByPath || new Map();
}

export function getSeoMarkdownConfig(family: SeoMarkdownFamily): SeoMarkdownFamilyConfig {
  return SEO_MARKDOWN_CONFIGS[family];
}

export function getSeoMarkdownPage(family: SeoMarkdownFamily, slug: string): SeoMarkdownPage | undefined {
  return getPagesByPath().get(`/${family}/${slug}`);
}

export function getSeoMarkdownPageByPath(urlPath: string): SeoMarkdownPage | undefined {
  return getPagesByPath().get(urlPath);
}

export function getSeoMarkdownSlugs(family: SeoMarkdownFamily): string[] {
  return loadPages()
    .filter((page) => page.family === family)
    .map((page) => page.slug);
}

export function getSeoMarkdownHubItems(family: SeoMarkdownFamily): SeoMarkdownHubItem[] {
  return loadPages()
    .filter((page) => page.family === family)
    .map((page) => ({
      slug: page.slug,
      title: page.h1,
      lead: page.lead || page.metaDescription,
    }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function getSeoMarkdownRoutes(): string[] {
  return loadPages().map((page) => page.urlPath);
}

export function getSeoMarkdownFamilyOrder(): SeoMarkdownFamily[] {
  return [...SEO_MARKDOWN_FAMILY_ORDER];
}
