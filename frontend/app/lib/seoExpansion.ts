import {
  getPublishedResumeKeywordClusters,
  getRelatedResumeKeywordClusters,
  getResumeKeywordClusterBySlug,
  type ResumeKeywordCluster,
  type RoleCategory,
} from "./resumeKeywordClusters";
import type { Language } from "./translations";

export type SeoExpansionFamily =
  | "ats"
  | "resume-for"
  | "resume-industry"
  | "interview-resume"
  | "job-description"
  | "best"
  | "resume-guides";

export type SeoGuideSection = {
  title: string;
  body: string;
};

export type SeoGuideRelatedLink = {
  href: string;
  title: string;
};

export type SeoGuidePage = {
  family: SeoExpansionFamily;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  updatedAt: string;
  estimatedWordCount: number;
  sections: SeoGuideSection[];
  relatedPages: SeoGuideRelatedLink[];
  context?: {
    roleSlug?: string;
    roleName?: string;
    company?: string;
    country?: string;
    industry?: string;
    atsVendor?: string;
    situation?: string;
    pageType?: string;
  };
};

type SeoSeed = {
  family: SeoExpansionFamily;
  slug: string;
  title: string;
  lead: string;
  roleSlug?: string;
  roleName?: string;
  category?: RoleCategory;
  company?: string;
  country?: string;
  industry?: string;
  atsVendor?: string;
  situation?: string;
  pageType?: string;
};

const TODAY = "2026-06-03";
const TARGET_TOTAL = 1000;

const ATS_VENDORS = [
  "Ashby",
  "SmartRecruiters",
  "JazzHR",
  "JobAdder",
  "Teamtailor",
  "Recruitee",
  "ADP ATS",
  "UKG Pro",
  "Oracle Recruiting",
  "SAP SuccessFactors",
  "Dayforce ATS",
  "Pinpoint ATS",
  "ClearCompany",
  "Avature ATS",
  "Bullhorn ATS",
  "Rippling ATS",
  "Personio ATS",
  "Zoho Recruit",
] as const;

const COMPANY_NAMES = [
  "Amazon",
  "Google",
  "Meta",
  "Microsoft",
  "Apple",
  "Netflix",
  "Spotify",
  "Uber",
  "Airbnb",
  "Stripe",
  "Shopify",
  "Salesforce",
  "Oracle",
  "Adobe",
  "NVIDIA",
  "Tesla",
  "OpenAI",
  "Atlassian",
  "Datadog",
  "Snowflake",
  "Palantir",
  "Robinhood",
  "Coinbase",
  "Notion",
  "Figma",
  "Canva",
  "Zoom",
  "Slack",
  "Asana",
  "Monday.com",
  "DoorDash",
  "Instacart",
  "Lyft",
  "Twilio",
  "Cloudflare",
  "Dropbox",
  "PayPal",
  "Block",
  "Wise",
  "Revolut",
  "HubSpot",
  "SAP",
  "IBM",
  "Intel",
  "Cisco",
  "Samsung",
  "TikTok",
  "Booking.com",
  "Expedia",
  "Visa",
  "Mastercard",
  "JPMorgan",
  "Goldman Sachs",
  "Morgan Stanley",
  "Deloitte",
  "Accenture",
  "KPMG",
  "EY",
  "PwC",
  "Siemens",
  "BMW",
  "Bosch",
  "Shell",
  "Unilever",
  "L'Oreal",
  "Pfizer",
  "Moderna",
  "Roche",
  "Novartis",
  "AbbVie",
  "IKEA",
  "Zalando",
  "Klarna",
  "Bolt",
  "Personio",
  "Rippling",
  "Databricks",
  "MongoDB",
  "GitHub",
] as const;

const TARGET_ROLE_SLUGS = [
  "software-engineer",
  "product-manager",
  "data-analyst",
  "data-scientist",
  "backend-developer",
] as const;

const COUNTRY_TARGETS = [
  "us",
  "uk",
  "canada",
  "germany",
  "france",
  "netherlands",
  "ireland",
  "australia",
  "singapore",
  "switzerland",
  "poland",
  "czech-republic",
  "slovakia",
  "spain",
  "india",
] as const;

const COUNTRY_ROLE_SLUGS = [
  "software-engineer",
  "product-manager",
  "data-analyst",
  "marketing-manager",
] as const;

const CAREER_SITUATIONS = [
  "career-change",
  "no-experience",
  "internship",
  "entry-level",
  "senior-level",
  "executive",
  "career-break",
  "maternity-leave",
  "military-transition",
  "layoff-recovery",
  "remote-jobs",
  "faang",
  "startup-jobs",
  "first-job",
  "returnship",
  "freelance-to-full-time",
  "internal-promotion",
  "contract-to-permanent",
  "relocation",
  "immigrant-jobs",
] as const;

const CAREER_ROLE_SLUGS = [
  "software-engineer",
  "product-manager",
  "data-analyst",
] as const;

const INDUSTRIES = [
  "tech",
  "healthcare",
  "finance",
  "cybersecurity",
  "saas-sales",
  "startups",
  "ecommerce",
  "logistics",
  "edtech",
  "fintech",
  "ai",
  "manufacturing",
  "consulting",
  "hr-tech",
  "biotech",
  "govtech",
  "travel",
  "media",
  "retail",
  "clean-energy",
] as const;

const INTERVIEW_TOPICS = [
  "how-to-prepare-for-technical-interview",
  "how-to-prepare-for-hr-interview",
  "why-recruiters-ghost-candidates",
  "why-ats-rejects-resumes",
  "why-i-get-no-interviews",
  "resume-passes-ats-but-no-interviews",
  "how-recruiters-scan-resumes",
  "why-hiring-managers-skip-good-candidates",
  "how-to-explain-job-hopping",
  "how-to-explain-career-gap-in-interview",
  "how-to-prepare-for-behavioral-interview",
  "how-to-answer-tell-me-about-yourself",
  "how-to-turn-resume-bullets-into-interview-stories",
  "why-recruiters-ignore-generic-resumes",
  "what-happens-after-your-resume-passes-ats",
  "what-recruiters-look-for-in-first-30-seconds",
  "how-to-prepare-for-phone-screen",
  "how-to-prepare-for-recruiter-screen",
  "how-to-prepare-for-hiring-manager-interview",
  "why-applications-get-stuck-after-screening",
  "resume-red-flags-before-interview",
  "interview-red-flags-caused-by-resume",
  "how-to-practice-resume-walkthrough",
  "how-to-fix-weak-resume-before-interview",
  "why-good-candidates-get-auto-rejected",
  "how-to-handle-overqualified-resume",
  "why-resume-and-linkedin-dont-match",
  "how-to-show-impact-in-interviews",
  "how-to-prepare-for-panel-interview",
  "how-to-recover-after-no-response",
  "why-do-i-get-screens-but-no-onsites",
  "how-to-follow-up-after-application",
  "how-to-follow-up-after-interview",
  "what-to-do-if-recruiters-stop-responding",
  "how-to-rewrite-summary-for-more-interviews",
  "how-to-rewrite-bullets-for-phone-screens",
  "how-to-prepare-for-case-study-interview",
  "how-to-prepare-for-take-home-assignment",
  "why-technical-candidates-fail-hr-round",
  "how-to-prepare-for-culture-interview",
  "how-to-prove-seniority-in-interviews",
  "how-to-answer-salary-expectations",
  "how-to-answer-why-this-company",
  "what-to-say-when-you-lack-experience",
  "how-to-handle-career-change-in-interviews",
  "how-to-fix-inconsistent-job-titles",
  "how-to-discuss-layoffs-in-interviews",
  "how-to-prepare-for-final-round-interview",
  "how-to-prepare-for-founder-interview",
  "how-to-show-ownership-in-interviews",
  "how-to-show-strategy-in-product-interviews",
  "how-to-show-business-impact-in-data-interviews",
  "how-to-show-system-thinking-in-engineering-interviews",
  "why-recruiters-trust-metrics-over-buzzwords",
  "resume-vs-interview-story-alignment",
  "how-to-build-star-stories-from-resume",
  "why-first-impression-fails-after-resume",
  "how-to-reduce-interview-anxiety-with-better-resume",
  "what-to-fix-before-you-apply-again",
  "why-applying-to-100-jobs-fails",
  "why-your-resume-gets-clicked-but-not-selected",
  "why-recruiters-doubt-resume-claims",
  "how-to-turn-rejection-into-resume-fixes",
  "how-to-fix-low-confidence-resume-signals",
  "why-similar-candidates-get-more-interviews",
] as const;

const JOB_DESCRIPTION_BASES = [
  "how-to-read-job-descriptions",
  "how-to-extract-keywords-from-job-description",
  "hidden-resume-keywords",
  "resume-keyword-scanner",
  "keyword-density-for-ats",
  "must-have-vs-nice-to-have-requirements",
  "how-to-find-seniority-signals-in-job-description",
  "how-to-map-job-description-to-resume",
  "how-to-identify-core-skills-in-job-post",
  "how-to-turn-responsibilities-into-bullets",
  "how-to-spot-role-priorities-in-job-description",
  "how-to-tailor-resume-to-repeated-terms",
  "how-to-use-job-description-without-copying",
  "how-to-build-checklist-from-job-post",
  "how-to-detect-hidden-screening-criteria",
  "how-to-analyze-remote-job-description",
  "how-to-analyze-startup-job-description",
  "how-to-analyze-faang-job-description",
  "how-to-analyze-product-manager-job-description",
  "how-to-analyze-software-engineer-job-description",
] as const;

const JOB_DESCRIPTION_SUFFIXES = [
  "guide",
  "examples",
  "checklist",
] as const;

const BEST_PAGE_TITLES = [
  "best-ats-resume-checker",
  "best-resume-optimizer",
  "best-resume-scanner",
  "best-ats-tools",
  "best-ai-resume-tools",
  "best-resume-keyword-tools",
  "best-resume-tailoring-tools",
  "best-ats-friendly-resume-template-tools",
  "best-tools-to-improve-ats-score",
  "best-resume-review-tools",
  "jobscan-alternatives",
  "rezi-alternatives",
  "teal-alternatives",
  "kickresume-alternatives",
  "huntr-alternatives",
  "resumeworded-alternatives",
  "cvboosta-vs-jobscan",
  "cvboosta-vs-rezi",
  "cvboosta-vs-teal",
  "cvboosta-vs-resumeworded",
  "cvboosta-vs-kickresume",
  "cvboosta-vs-huntr",
  "best-resume-tools-for-software-engineers",
  "best-resume-tools-for-product-managers",
  "best-resume-tools-for-data-analysts",
  "best-resume-tools-for-career-changers",
  "best-resume-tools-for-entry-level-candidates",
  "best-ats-checkers-for-remote-jobs",
  "best-resume-optimizers-for-faang",
  "best-resume-tools-for-internships",
  "best-tools-to-rewrite-resume-bullets",
  "best-tools-to-extract-job-keywords",
  "best-tools-to-fix-resume-formatting",
  "best-resume-review-services-vs-software",
  "best-resume-tools-for-interview-prep",
  "best-resume-tools-for-ghosted-candidates",
  "best-resume-tools-for-senior-candidates",
  "best-resume-scanners-for-ats",
  "best-job-description-analysis-tools",
  "best-resume-tools-for-fast-tailoring",
] as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCaseFromSlug(input: string): string {
  return input
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part === "ats") return "ATS";
      if (part === "hr") return "HR";
      if (part === "ai") return "AI";
      if (part === "uk") return "UK";
      if (part === "us") return "US";
      if (part === "pdf") return "PDF";
      if (part === "docx") return "DOCX";
      if (part === "faang") return "FAANG";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function truncateText(value: string, max = 160): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : cut.length).trim()}…`;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

function pick<T>(items: T[], h: number, salt = 0): T {
  return items[(h + salt) % items.length];
}

function countWords(text: string): number {
  const matches = text.match(/[A-Za-z0-9']+/g);
  return matches ? matches.length : 0;
}

function getRoleContext(roleSlug?: string) {
  if (!roleSlug) return null;
  const cluster = getResumeKeywordClusterBySlug(roleSlug);
  if (!cluster) return null;
  return {
    slug: cluster.slug,
    role: cluster.role,
    category: cluster.category,
    keywords: cluster.keywords.slice(0, 18),
  };
}

function buildAtsSeeds(): SeoSeed[] {
  const vendorSeeds = ATS_VENDORS.flatMap((vendor) => {
    const vendorSlug = slugify(vendor);
    return [
      {
        family: "ats" as const,
        slug: `${vendorSlug}-ats-resume-tips`,
        title: `${vendor} ATS Resume Tips`,
        lead: `How to format and tailor your resume for ${vendor} without keyword stuffing or parsing risk.`,
        atsVendor: vendor,
        pageType: "tips",
      },
      {
        family: "ats" as const,
        slug: `how-${vendorSlug}-parses-resumes`,
        title: `How ${vendor} Parses Resumes`,
        lead: `A practical breakdown of how ${vendor} likely reads structure, sections, keywords, and formatting.`,
        atsVendor: vendor,
        pageType: "parsing",
      },
      {
        family: "ats" as const,
        slug: `${vendorSlug}-resume-keywords`,
        title: `${vendor} Resume Keywords`,
        lead: `Where keywords matter most when applicants are screened in ${vendor}.`,
        atsVendor: vendor,
        pageType: "keywords",
      },
      {
        family: "ats" as const,
        slug: `${vendorSlug}-ats-friendly-template`,
        title: `${vendor} ATS-Friendly Template`,
        lead: `A safe resume template structure for candidates applying through ${vendor}.`,
        atsVendor: vendor,
        pageType: "template",
      },
    ];
  });

  const directPages = [
    "what-is-ats",
    "how-ats-works",
    "can-ats-read-pdf-resumes",
    "best-font-for-ats-resume",
    "do-recruiters-use-ats",
    "how-many-keywords-should-resume-have",
    "can-ats-read-columns",
    "can-ats-read-tables",
    "why-ats-rejects-resume",
    "why-resumes-fail-ats",
    "ats-resume-checker-explained",
    "ats-keyword-density",
    "ats-vs-human-recruiter-screening",
    "how-to-pass-ats-for-remote-jobs",
    "pdf-vs-docx-for-ats",
    "one-page-resume-for-ats",
    "ats-friendly-resume-headings",
    "resume-format-that-passes-ats",
    "how-to-test-your-resume-in-ats",
    "ats-scoring-myths",
    "why-ats-misses-good-candidates",
    "keyword-stuffing-vs-ats-match",
    "resume-parsing-errors-examples",
    "recruiter-search-in-ats",
    "ats-market-share-explained",
    "can-ats-read-graphics",
    "ats-safe-resume-template-word",
    "ats-safe-resume-template-google-docs",
  ].map((slug) => ({
    family: "ats" as const,
    slug,
    title: titleCaseFromSlug(slug),
    lead: `${titleCaseFromSlug(slug)} explained with practical ATS-safe actions you can apply today.`,
    pageType: "direct",
  }));

  return [...vendorSeeds, ...directPages];
}

function buildResumeForSeeds(): SeoSeed[] {
  const companySeeds = COMPANY_NAMES.flatMap((company) =>
    TARGET_ROLE_SLUGS.map((roleSlug) => {
      const role = getRoleContext(roleSlug)?.role || titleCaseFromSlug(roleSlug);
      return {
        family: "resume-for" as const,
        slug: `${slugify(company)}-${roleSlug}`,
        title: `Resume for ${company} ${role}`,
        lead: `How to position a ${role} resume for ${company} without guessing what hiring teams want to see.`,
        company,
        roleSlug,
        roleName: role,
        pageType: "company",
      };
    }),
  );

  const countrySeeds = COUNTRY_TARGETS.flatMap((country) =>
    COUNTRY_ROLE_SLUGS.map((roleSlug) => {
      const role = getRoleContext(roleSlug)?.role || titleCaseFromSlug(roleSlug);
      return {
        family: "resume-for" as const,
        slug: `${country}-${roleSlug}`,
        title: `${titleCaseFromSlug(country)} ${role} Resume`,
        lead: `Formatting, language, and recruiter expectations for a ${role} resume targeting ${titleCaseFromSlug(country)} jobs.`,
        country: titleCaseFromSlug(country),
        roleSlug,
        roleName: role,
        pageType: "country",
      };
    }),
  );

  const scenarioSeeds = CAREER_SITUATIONS.flatMap((situation) =>
    CAREER_ROLE_SLUGS.map((roleSlug) => {
      const role = getRoleContext(roleSlug)?.role || titleCaseFromSlug(roleSlug);
      return {
        family: "resume-for" as const,
        slug: `${situation}-${roleSlug}`,
        title: `${titleCaseFromSlug(situation)} Resume for ${role}`,
        lead: `A practical resume angle for ${role} candidates dealing with ${titleCaseFromSlug(situation).toLowerCase()}.`,
        situation: titleCaseFromSlug(situation),
        roleSlug,
        roleName: role,
        pageType: "situation",
      };
    }),
  );

  return [...companySeeds, ...countrySeeds, ...scenarioSeeds];
}

function buildIndustrySeeds(): SeoSeed[] {
  return INDUSTRIES.flatMap((industry) => [
    {
      family: "resume-industry" as const,
      slug: industry,
      title: `${titleCaseFromSlug(industry)} Resumes`,
      lead: `What recruiters and ATS systems usually scan for in ${titleCaseFromSlug(industry).toLowerCase()} resumes.`,
      industry: titleCaseFromSlug(industry),
      pageType: "overview",
    },
    {
      family: "resume-industry" as const,
      slug: `${industry}-resume-keywords`,
      title: `${titleCaseFromSlug(industry)} Resume Keywords`,
      lead: `High-signal keywords, resume patterns, and proof ideas for ${titleCaseFromSlug(industry).toLowerCase()} roles.`,
      industry: titleCaseFromSlug(industry),
      pageType: "keywords",
    },
  ]);
}

function buildInterviewSeeds(): SeoSeed[] {
  return INTERVIEW_TOPICS.map((slug) => ({
    family: "interview-resume" as const,
    slug,
    title: titleCaseFromSlug(slug),
    lead: `${titleCaseFromSlug(slug)} with resume-first tactics that reduce hiring friction and increase interview confidence.`,
    pageType: "interview",
  }));
}

function buildJobDescriptionSeeds(): SeoSeed[] {
  return JOB_DESCRIPTION_BASES.flatMap((base) =>
    JOB_DESCRIPTION_SUFFIXES.map((suffix) => ({
      family: "job-description" as const,
      slug: `${base}-${suffix}`,
      title: `${titleCaseFromSlug(base)} ${titleCaseFromSlug(suffix)}`,
      lead: `${titleCaseFromSlug(base)} with a practical ${suffix} you can use to tailor faster.`,
      pageType: suffix,
    })),
  );
}

function buildBestSeeds(): SeoSeed[] {
  return BEST_PAGE_TITLES.map((slug) => ({
    family: "best" as const,
    slug,
    title: titleCaseFromSlug(slug),
    lead: `${titleCaseFromSlug(slug)} compared by real resume workflow needs, not marketing promises.`,
    pageType: "best",
  }));
}

function buildGuideSeeds(): SeoSeed[] {
  return getPublishedResumeKeywordClusters()
    .slice(0, 180)
    .map((cluster) => ({
      family: "resume-guides" as const,
      slug: cluster.slug,
      title: `${cluster.role} Resume Guide`,
      lead: `A central guide for ${cluster.role}: keywords, examples, ATS strategy, summaries, bullets, and template choices in one place.`,
      roleSlug: cluster.slug,
      roleName: cluster.role,
      category: cluster.category,
      pageType: "hub",
    }));
}

const SEO_SEEDS: SeoSeed[] = [
  ...buildAtsSeeds(),
  ...buildResumeForSeeds(),
  ...buildIndustrySeeds(),
  ...buildInterviewSeeds(),
  ...buildJobDescriptionSeeds(),
  ...buildBestSeeds(),
  ...buildGuideSeeds(),
];

if (SEO_SEEDS.length !== TARGET_TOTAL) {
  throw new Error(`SEO expansion generated ${SEO_SEEDS.length} pages; expected ${TARGET_TOTAL}.`);
}

const SEO_SEEDS_BY_FAMILY: Record<SeoExpansionFamily, SeoSeed[]> = {
  ats: SEO_SEEDS.filter((seed) => seed.family === "ats"),
  "resume-for": SEO_SEEDS.filter((seed) => seed.family === "resume-for"),
  "resume-industry": SEO_SEEDS.filter((seed) => seed.family === "resume-industry"),
  "interview-resume": SEO_SEEDS.filter((seed) => seed.family === "interview-resume"),
  "job-description": SEO_SEEDS.filter((seed) => seed.family === "job-description"),
  best: SEO_SEEDS.filter((seed) => seed.family === "best"),
  "resume-guides": SEO_SEEDS.filter((seed) => seed.family === "resume-guides"),
};

function familyLabel(family: SeoExpansionFamily): string {
  switch (family) {
    case "ats":
      return "ATS guides";
    case "resume-for":
      return "Resume-for guides";
    case "resume-industry":
      return "Industry resume guides";
    case "interview-resume":
      return "Interview + resume guides";
    case "job-description":
      return "Job description guides";
    case "best":
      return "Best-of and comparison pages";
    case "resume-guides":
      return "Role mega hubs";
  }
}

function buildMeta(seed: SeoSeed): string {
  const raw =
    seed.family === "ats"
      ? `${seed.title} with ATS parsing rules, keyword placement tips, template advice, common mistakes, and FAQ.`
      : seed.family === "resume-for"
        ? `${seed.title} with ATS-safe tailoring advice, role fit signals, examples, common mistakes, and a practical checklist.`
        : seed.family === "resume-industry"
          ? `${seed.title} with keyword strategy, recruiter signals, resume structure advice, examples, and FAQ.`
          : seed.family === "interview-resume"
            ? `${seed.title} with resume-first advice, recruiter logic, examples, and practical next steps for better interview outcomes.`
            : seed.family === "job-description"
              ? `${seed.title} with a repeatable workflow for extracting keywords, identifying priorities, and tailoring resumes faster.`
              : seed.family === "best"
                ? `${seed.title} compared through ATS accuracy, workflow speed, review quality, and candidate use cases.`
                : `${seed.title} with examples, keyword links, ATS strategy, bullet ideas, summaries, and internal links.`;
  return truncateText(raw, 160);
}

function buildIntro(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>, h: number): string {
  const opening = pick(
    [
      `This page is built for candidates searching **${seed.title.toLowerCase()}** because generic resume advice usually fails in the exact moment it needs to be specific.`,
      `If you searched **${seed.title.toLowerCase()}**, you’re probably not looking for theory. You’re trying to fix a real application bottleneck fast.`,
      `Most weak outcomes around **${seed.title.toLowerCase()}** are not talent problems. They’re clarity, positioning, and matching problems.`,
    ],
    h,
    5,
  );

  const roleLine =
    roleContext
      ? `The strongest angle for ${roleContext.role} candidates is proof density: recent bullets, visible scope, and keywords placed where ATS and recruiters both scan first.`
      : `The strongest angle is proof density: recent bullets, visible scope, and keywords placed where ATS and recruiters both scan first.`;

  const familyLine = {
    ats: "ATS pages perform best when they explain parsing behavior, recruiter search logic, and formatting tradeoffs without myths.",
    "resume-for": "Targeted resume pages work when they turn a vague ambition into a concrete application strategy for a company, market, or situation.",
    "resume-industry": "Industry-first pages matter because the same role title can be screened very differently across sectors.",
    "interview-resume": "Interview-resume pages matter because candidates often misdiagnose whether the problem is the resume, the interview story, or both.",
    "job-description": "Job-description pages matter because most applicants read vacancies passively instead of extracting the actual matching signals.",
    best: "Comparison pages matter because candidates don’t buy tools; they buy speed, confidence, and fewer avoidable mistakes.",
    "resume-guides": "Mega hubs matter because they connect the full workflow instead of isolating one narrow keyword or template question.",
  }[seed.family];

  return `${opening}\n\n${roleLine}\n\n${familyLine}`;
}

function buildContextSection(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>, h: number): SeoGuideSection {
  const recruiterScan = 8 + (h % 18);
  const keywordA = roleContext?.keywords?.[0] || "role alignment";
  const keywordB = roleContext?.keywords?.[1] || "clear outcomes";
  const specific = seed.company
    ? `When a candidate targets ${seed.company}, reviewers usually look for evidence that the resume matches the company’s hiring bar, product context, and level expectations.`
    : seed.country
      ? `When a candidate targets ${seed.country}, reviewers usually look for local formatting expectations, clear language choices, and market-appropriate structure.`
      : seed.industry
        ? `When a candidate targets ${seed.industry.toLowerCase()}, the screening bar often shifts toward sector-specific language, risk awareness, and domain credibility.`
        : seed.atsVendor
          ? `When a candidate uploads into ${seed.atsVendor}, parsing stability and searchable terms matter because misread structure weakens otherwise strong experience.`
          : `When candidates tackle this topic well, they make the matching signal obvious before the reviewer spends more than a few seconds.`;

  return {
    title: "What is really happening in screening",
    body:
      `${specific}\n\n` +
      `A practical screening flow usually looks like this:\n` +
      `1. **System layer:** file becomes text, sections, and searchable fields.\n` +
      `2. **Recruiter scan:** first ${recruiterScan}–25 seconds focus on fit, scope, and credibility.\n` +
      `3. **Deeper review:** strong candidates prove terms like **${keywordA}** and **${keywordB}** with measurable evidence.\n\n` +
      "That is why most high-performing pages in this cluster focus on structure first, proof second, and keyword placement third.",
  };
}

function buildPlaybookSection(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>, h: number): SeoGuideSection {
  const role = roleContext?.role || "your target role";
  const keywordA = roleContext?.keywords?.[0] || "the core requirement";
  const keywordB = roleContext?.keywords?.[2] || "one measurable outcome";

  const familyChecklist = {
    ats: [
      "Use a one-column layout and standard headings.",
      "Test upload preview before touching wording.",
      `Place terms like ${keywordA} in summary, skills, and one bullet with proof.`,
      "Avoid tables, icons, and sidebars for critical text.",
      "Re-export and re-check parsing before you submit.",
    ],
    "resume-for": [
      `Mirror the target context once (company, market, or situation) in the summary for ${role}.`,
      "Reorder the first 3–6 bullets so the most relevant evidence shows up early.",
      `Use keywords like ${keywordA} only where you can defend them in an interview.`,
      "Keep the file ATS-safe even if you tailor heavily.",
      "Run one scan against the real vacancy before sending.",
    ],
    "resume-industry": [
      "Name the sector context in the summary and recent experience.",
      "Use sector language only when it reflects work you actually did.",
      `Prove ${keywordA} with one believable metric or scope line.`,
      "Group tools and domain knowledge cleanly in Skills.",
      "Tailor examples to the exact hiring motion in that industry.",
    ],
    "interview-resume": [
      "Align resume claims with stories you can tell clearly in interviews.",
      "Identify where the funnel breaks: ATS, recruiter screen, or manager round.",
      `Rewrite weak bullets so ${keywordA} and ${keywordB} are easy to explain.`,
      "Fix inconsistencies between resume, LinkedIn, and answers.",
      "Prepare a short follow-up plan before reapplying.",
    ],
    "job-description": [
      "Highlight repeated nouns, tools, and outcome language.",
      "Separate must-haves from nice-to-haves.",
      `Map ${keywordA} to one bullet and ${keywordB} to another.`,
      "Tailor summary and skills before rewriting the whole resume.",
      "Check the final resume against the vacancy once more before submission.",
    ],
    best: [
      "Choose tools by workflow, not hype.",
      "Prioritize parsing checks, keyword gap analysis, and editable output.",
      "Treat generated rewrites as drafts, not final truth.",
      "Compare what each tool does well for your use case.",
      "Validate the final file with one real job description.",
    ],
    "resume-guides": [
      "Start with the role example and role keywords together.",
      "Keep a simple ATS-safe template as your base.",
      "Upgrade summary and recent bullets first.",
      "Use role-specific proof patterns instead of generic adjectives.",
      "Move into scan + optimizer before you apply.",
    ],
  }[seed.family];

  return {
    title: "Practical playbook",
    body: `### Repeatable checklist\n${familyChecklist.map((item) => `- ${item}`).join("\n")}`,
  };
}

function buildExamplesSection(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>, h: number): SeoGuideSection {
  const role = roleContext?.role || "candidate";
  const keywordA = roleContext?.keywords?.[0] || "keyword match";
  const keywordB = roleContext?.keywords?.[3] || "measurable impact";
  const metricA = 12 + (h % 31);
  const metricB = 8 + ((h >> 2) % 24);

  const table = [
    "| Weak version | Better version | Why it works |",
    "| --- | --- | --- |",
    `| Worked on ${keywordA}. | Improved ${keywordA} outcomes by ${metricA}% by clarifying ownership and removing rework. | Names the skill and proves the result. |`,
    `| Helped stakeholders. | Built a weekly review cadence; reduced decision lag by ${metricB}% with clearer metrics. | Turns generic support into measurable scope. |`,
    `| Responsible for projects. | Led one high-signal initiative end-to-end with visible impact, risk control, and handoff quality. | Shows ownership instead of activity. |`,
  ].join("\n");

  const familyExample =
    seed.family === "resume-guides"
      ? `Use the pair together: [${role} resume example](/resume-examples/${seed.roleSlug}) and [${role} resume keywords](/resume-keywords/${seed.roleSlug}).`
      : seed.family === "best"
        ? "Use comparisons to reduce tool fatigue: pick the product that closes your biggest gap fastest."
        : seed.family === "job-description"
          ? "A good job-description workflow never starts with rewriting everything. It starts with extracting the repeated signals."
          : "The best examples keep one keyword, one scope line, and one believable outcome per bullet.";

  return {
    title: "Examples and mini transformations",
    body:
      "### Before / after patterns\n" +
      `${table}\n\n` +
      `### Context note\n${familyExample}`,
  };
}

function buildMistakesSection(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>, h: number): SeoGuideSection {
  const role = roleContext?.role || "your target role";
  const lane = roleContext?.keywords?.[1] || "role fit";
  const extra =
    seed.family === "ats"
      ? "Believing the ATS is a black box and then skipping upload-preview checks."
      : seed.family === "resume-for"
        ? "Tailoring company names and buzzwords without changing the evidence underneath."
        : seed.family === "interview-resume"
          ? "Fixing answers without fixing the weak resume signals that created the interview problem."
          : seed.family === "best"
            ? "Choosing by feature list instead of the specific bottleneck you need to solve."
            : "Using generic language where role-specific proof is required.";

  const mistakes = [
    `Using a vague summary that never proves ${lane} for ${role}.`,
    "Listing tools or claims without context, numbers, or ownership.",
    "Making the layout harder to parse than it needs to be.",
    "Keyword stuffing instead of selective, truthful matching.",
    extra,
  ];

  return {
    title: "Common mistakes",
    body: mistakes.map((item) => `- ${item}`).join("\n"),
  };
}

function buildFaqSection(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>): SeoGuideSection {
  const role = roleContext?.role || "this type of candidate";
  const faq = [
    `- **How much should I tailor for ${seed.title.toLowerCase()}?** Focus on summary, skills order, and the first few bullets before you touch lower-impact sections.`,
    `- **What matters most to recruiters here?** Fast confirmation of fit, believable scope, and measurable outcomes they can trust.`,
    `- **Should I mirror job description language exactly?** Only when it is true and you can back it up with evidence.`,
    `- **How do I know whether the resume is the real problem?** If ${role} interviews are not happening at all, start with parsing, keywords, and clarity before you blame experience.`,
    "- **PDF or DOCX?** Follow employer instructions; if none exist, choose the format that parses cleanly in preview.",
    "- **What is the fastest next step?** Run a scan against the real vacancy and fix only the biggest gaps first.",
  ];

  return {
    title: "FAQ",
    body: faq.join("\n"),
  };
}

function buildInternalLinksSection(seed: SeoSeed, roleContext: ReturnType<typeof getRoleContext>): SeoGuideSection {
  const links: SeoGuideRelatedLink[] = [
    { href: "/free-ats-resume-checker", title: "Free ATS resume checker" },
    { href: "/app", title: "Optimize my resume" },
    { href: "/resume-summary", title: "Resume summary examples" },
    { href: "/resume-bullets", title: "Resume bullet examples" },
    { href: "/ats", title: "ATS guides" },
  ];

  if (roleContext) {
    links.unshift(
      { href: `/resume-examples/${roleContext.slug}`, title: `${roleContext.role} resume example` },
      { href: `/resume-keywords/${roleContext.slug}`, title: `${roleContext.role} resume keywords` },
    );
  }

  if (seed.family !== "resume-for") {
    links.push({ href: "/resume-for", title: "Resume-for guides" });
  }
  if (seed.family !== "resume-guides") {
    links.push({ href: "/resume-guides", title: "Role resume guides" });
  }

  return {
    title: "Next reads",
    body: links.map((link) => `- [${link.title}](${link.href})`).join("\n"),
  };
}

function buildRoleHubSection(roleContext: ReturnType<typeof getRoleContext>): SeoGuideSection | null {
  if (!roleContext) return null;

  const relatedRoles = getRelatedResumeKeywordClusters(roleContext.slug, 8);
  return {
    title: "Role hub structure",
    body:
      `For **${roleContext.role}**, the cleanest internal-linking flow is:\n\n` +
      `1. [${roleContext.role} resume example](/resume-examples/${roleContext.slug})\n` +
      `2. [${roleContext.role} resume keywords](/resume-keywords/${roleContext.slug})\n` +
      "3. ATS guide + summary page + bullets page\n" +
      "4. Scan + optimizer before submission\n\n" +
      "### Similar roles to compare\n" +
      relatedRoles
        .map((item) => `- [${item.role} resume keywords](/resume-keywords/${item.slug})`)
        .join("\n"),
  };
}

function buildSections(seed: SeoSeed): SeoGuideSection[] {
  const roleContext = getRoleContext(seed.roleSlug);
  const h = hashString(`${seed.family}:${seed.slug}`);
  const sections = [
    { title: "Introduction", body: buildIntro(seed, roleContext, h) },
    buildContextSection(seed, roleContext, h),
    buildPlaybookSection(seed, roleContext, h),
    buildExamplesSection(seed, roleContext, h),
    buildMistakesSection(seed, roleContext, h),
    buildFaqSection(seed, roleContext),
    buildInternalLinksSection(seed, roleContext),
  ];

  const hubSection = buildRoleHubSection(roleContext);
  if (hubSection) sections.splice(4, 0, hubSection);

  let words = countWords(sections.map((section) => `${section.title}\n${section.body}`).join("\n\n"));
  if (words < 1400) {
    const appendixKeywords = roleContext?.keywords || ["scope", "ownership", "metrics", "ATS", "keywords", "proof"];
    sections.splice(sections.length - 1, 0, {
      title: "Appendix: high-signal proof ideas",
      body:
        "### Signals recruiters trust\n" +
        "- measurable outcomes tied to scope\n" +
        "- role-specific language used once, then proved\n" +
        "- recent evidence, not ancient filler\n" +
        "- clean formatting and predictable headings\n\n" +
        "### Useful terms to pressure-test in your resume\n" +
        appendixKeywords.slice(0, 14).map((keyword) => `- ${keyword}`).join("\n"),
    });
    words = countWords(sections.map((section) => `${section.title}\n${section.body}`).join("\n\n"));
  }

  return sections;
}

function scoreSeeds(a: SeoSeed, b: SeoSeed): number {
  if (a.family !== b.family || a.slug === b.slug) return -1;
  let score = 0;
  if (a.pageType && b.pageType && a.pageType === b.pageType) score += 3;
  if (a.roleSlug && b.roleSlug && a.roleSlug === b.roleSlug) score += 5;
  if (a.company && b.company && a.company === b.company) score += 5;
  if (a.industry && b.industry && a.industry === b.industry) score += 5;
  if (a.atsVendor && b.atsVendor && a.atsVendor === b.atsVendor) score += 5;

  const aTokens = new Set(a.slug.split("-"));
  for (const token of b.slug.split("-")) {
    if (aTokens.has(token)) score += 1;
  }
  return score;
}

function buildRelatedPages(seed: SeoSeed): SeoGuideRelatedLink[] {
  const familySeeds = SEO_SEEDS_BY_FAMILY[seed.family];
  return familySeeds
    .filter((candidate) => candidate.slug !== seed.slug)
    .map((candidate) => ({
      candidate,
      score: scoreSeeds(seed, candidate),
    }))
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, 10)
    .map(({ candidate }) => ({
      href: `/${candidate.family}/${candidate.slug}`,
      title: candidate.title,
    }));
}

function buildGuidePage(seed: SeoSeed): SeoGuidePage {
  const sections = buildSections(seed);
  const roleContext = getRoleContext(seed.roleSlug);
  const seoTitle = seed.title;
  const metaDescription = buildMeta(seed);
  const h1 = seed.title;
  const lead =
    seed.lead +
    (roleContext
      ? ` This page also links out to the dedicated ${roleContext.role} example and keyword hubs.`
      : "");
  const estimatedWordCount = countWords(
    [seoTitle, metaDescription, h1, lead, ...sections.map((section) => `${section.title}\n${section.body}`)].join("\n\n"),
  );

  return {
    family: seed.family,
    slug: seed.slug,
    seoTitle,
    metaDescription,
    h1,
    lead,
    updatedAt: TODAY,
    estimatedWordCount,
    sections,
    relatedPages: buildRelatedPages(seed),
    context: {
      roleSlug: seed.roleSlug,
      roleName: seed.roleName,
      company: seed.company,
      country: seed.country,
      industry: seed.industry,
      atsVendor: seed.atsVendor,
      situation: seed.situation,
      pageType: seed.pageType,
    },
  };
}

function countPageWords(page: SeoGuidePage): number {
  return countWords(
    [page.seoTitle, page.metaDescription, page.h1, page.lead, ...page.sections.map((section) => `${section.title}\n${section.body}`)].join("\n\n"),
  );
}

export function localizeSeoExpansionPage(page: SeoGuidePage, language: Language): SeoGuidePage {
  if (language === "en") return page;

  const role = page.context?.roleName || "this role";
  const roleSlug = page.context?.roleSlug;
  const label = page.context?.company || page.context?.country || page.context?.industry || page.context?.atsVendor || page.context?.situation || role;

  const localizedBodies: Record<Exclude<Language, "en">, { lead: string; sections: SeoGuideSection[]; seoTitle: string; meta: string; h1: string }> = {
    uk: {
      seoTitle: `${page.seoTitle} — гайд`,
      meta: `${page.seoTitle}: практичний гайд з ATS, ключових слів, структури, помилок і наступних кроків.`,
      h1: `${page.h1} — гайд`,
      lead: `Ця сторінка пояснює тему **${page.h1.toLowerCase()}** коротко і практично: що бачить ATS, що сканує рекрутер і які зміни справді впливають на результат.`,
      sections: [
        { title: "Вступ", body: `Цей матеріал для випадку **${label}**. Його завдання — не дати абстрактну теорію, а показати, як прибрати дві головні проблеми: нечіткий сигнал і слабкий доказ.\n\nЯкщо тема пов’язана з роллю **${role}**, ключові слова мають працювати разом із реальними bullet-пунктами, а не жити окремим списком.` },
        { title: "Що насправді відбувається під час скринінгу", body: `Типовий скринінг виглядає так:\n1. **ATS** перетворює файл у текст і шукає сигнали.\n2. **Рекрутер** швидко перевіряє role fit, scope і credibility.\n3. **Hiring manager** дивиться, чи доводять ваші формулювання реальний рівень роботи.\n\nСаме тому найсильніші сторінки в цьому кластері спираються на структуру, доказ і лише потім на формулювання.` },
        { title: "Практичний playbook", body: `### Що зробити\n- залишити просту читабельну структуру\n- винести ключові сигнали у верхню частину сторінки або резюме\n- підтвердити keywords конкретним результатом\n- не перевантажувати текст повтореннями\n- перевірити фінальний варіант на реальній вакансії або у parsed preview` },
        { title: "Приклади і міні-трансформації", body: `Слабка версія зазвичай описує активність. Сильніша версія показує зміну, масштаб і вплив.\n\nДля role-based тем рухайте користувача між [resume example](${roleSlug ? `/resume-examples/${roleSlug}` : "/resume-examples"}) і [resume keywords](${roleSlug ? `/resume-keywords/${roleSlug}` : "/resume-keywords"}), щоб signal layer і proof layer працювали разом.` },
        { title: "Типові помилки", body: `- занадто загальні формулювання\n- ключові слова без доказу\n- layout, який ускладнює parsing\n- keyword stuffing без нової інформації\n- відсутність чіткого next step після діагностики проблеми` },
        { title: "FAQ", body: `- **Наскільки сильно треба адаптувати контент?** Почніть із summary, skills order і перших bullet-пунктів.\n- **Що найважливіше для скринінгу?** Швидке підтвердження fit, scope і measurable outcomes.\n- **Що робити далі?** Перевірити резюме на конкретній вакансії й виправити найбільші розриви спочатку.` },
        { title: "Що читати далі", body: `- [Free ATS resume checker](/free-ats-resume-checker)\n- [Optimize my resume](/app)\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)\n- [ATS guides](/ats)` },
      ],
    },
    pl: {
      seoTitle: `${page.seoTitle} — poradnik`,
      meta: `${page.seoTitle}: praktyczny przewodnik po ATS, keywords, strukturze, błędach i kolejnych krokach.`,
      h1: `${page.h1} — poradnik`,
      lead: `Ta strona wyjaśnia temat **${page.h1.toLowerCase()}** w prosty i praktyczny sposób: co widzi ATS, co skanuje rekruter i jakie poprawki naprawdę pomagają.`,
      sections: [
        { title: "Wprowadzenie", body: `Ten materiał dotyczy tematu **${label}**. Celem jest usunięcie dwóch najczęstszych problemów: słabego sygnału i słabego dowodu.\n\nJeśli temat dotyczy roli **${role}**, keywords muszą działać razem z realnym doświadczeniem.` },
        { title: "Co naprawdę dzieje się podczas screeningu", body: `Screening zwykle wygląda tak: ATS parsuje plik, rekruter robi szybki skan, a hiring manager ocenia poziom i wiarygodność.\n\nDlatego najlepsze strony w tym klastrze stawiają na strukturę, dowód i czytelność.` },
        { title: "Praktyczny playbook", body: `- zachowaj prostą strukturę\n- pokaż ważne sygnały wysoko\n- potwierdzaj keywords konkretnym wynikiem\n- nie przesadzaj z powtórzeniami\n- sprawdź finalną wersję na realnej ofercie` },
        { title: "Przykłady i mini-transformacje", body: `Słaba wersja opisuje czynność. Mocniejsza pokazuje zmianę, skalę i wpływ.\n\nW tematach role-based łącz [resume example](${roleSlug ? `/resume-examples/${roleSlug}` : "/resume-examples"}) z [resume keywords](${roleSlug ? `/resume-keywords/${roleSlug}` : "/resume-keywords"}).` },
        { title: "Typowe błędy", body: `- zbyt ogólne sformułowania\n- keywords bez dowodu\n- layout utrudniający parsing\n- keyword stuffing\n- brak jasnego next step` },
        { title: "FAQ", body: `- **Jak mocno dopasowywać treść?** Zacznij od summary, skills i pierwszych bulletów.\n- **Co ma największe znaczenie?** Szybkie potwierdzenie fit, zakresu i wyników.\n- **Co dalej?** Sprawdź CV na realnym job description i napraw najważniejsze luki.` },
        { title: "Co czytać dalej", body: `- [Free ATS resume checker](/free-ats-resume-checker)\n- [Optimize my resume](/app)\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)` },
      ],
    },
    sk: {
      seoTitle: `${page.seoTitle} — sprievodca`,
      meta: `${page.seoTitle}: praktický sprievodca k ATS, kľúčovým slovám, štruktúre, chybám a ďalším krokom.`,
      h1: `${page.h1} — sprievodca`,
      lead: `Táto stránka vysvetľuje tému **${page.h1.toLowerCase()}** stručne a prakticky: čo vidí ATS, čo skenuje recruiter a ktoré zmeny majú reálny efekt.`,
      sections: [
        { title: "Úvod", body: `Tento materiál rieši tému **${label}**. Cieľom je odstrániť slabý signal a slabý proof.\n\nAk sa téma týka roly **${role}**, kľúčové slová musia byť podložené reálnymi bullet bodmi.` },
        { title: "Čo sa deje pri screeningu", body: `ATS najprv parsuje súbor, recruiter robí rýchly scan a hiring manager kontroluje úroveň práce.\n\nNajlepšie stránky v tomto klastri preto stavajú na štruktúre, dôkaze a čitateľnosti.` },
        { title: "Praktický playbook", body: `- nechajte jednoduchú štruktúru\n- zvýraznite dôležité signály hore\n- podporte keywords konkrétnym výsledkom\n- nepreťažujte text opakovaniami\n- otestujte výsledok na reálnej pozícii` },
        { title: "Príklady a mini transformácie", body: `Slabá verzia popisuje aktivitu. Silnejšia verzia ukazuje zmenu, rozsah a dopad.\n\nPri role-based témach prepájajte [resume example](${roleSlug ? `/resume-examples/${roleSlug}` : "/resume-examples"}) a [resume keywords](${roleSlug ? `/resume-keywords/${roleSlug}` : "/resume-keywords"}).` },
        { title: "Typické chyby", body: `- príliš všeobecný text\n- keywords bez dôkazu\n- layout, ktorý komplikuje parsing\n- keyword stuffing\n- chýbajúci next step` },
        { title: "FAQ", body: `- **Ako veľmi treba obsah prispôsobiť?** Začnite so summary, skills a prvými bulletmi.\n- **Čo je najdôležitejšie?** Rýchle potvrdenie fitu, scope a výsledkov.\n- **Čo ďalej?** Otestujte životopis na reálnej ponuke a opravte najväčšie gapy.` },
        { title: "Čo čítať ďalej", body: `- [Free ATS resume checker](/free-ats-resume-checker)\n- [Optimize my resume](/app)\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)` },
      ],
    },
    cs: {
      seoTitle: `${page.seoTitle} — průvodce`,
      meta: `${page.seoTitle}: praktický průvodce k ATS, klíčovým slovům, struktuře, chybám a dalším krokům.`,
      h1: `${page.h1} — průvodce`,
      lead: `Tato stránka vysvětluje téma **${page.h1.toLowerCase()}** stručně a prakticky: co vidí ATS, co skenuje recruiter a které změny mají největší dopad.`,
      sections: [
        { title: "Úvod", body: `Tento materiál řeší téma **${label}**. Cílem je odstranit slabý signal a slabý proof.\n\nPokud je téma navázané na roli **${role}**, keywords musí být podložené reálnými bullet body.` },
        { title: "Co se děje při screeningu", body: `ATS nejdřív parsuje soubor, recruiter dělá rychlý scan a hiring manager kontroluje úroveň a věrohodnost.\n\nNejlepší stránky v tomto klastru proto stojí na struktuře, důkazu a čitelnosti.` },
        { title: "Praktický playbook", body: `- ponechte jednoduchou strukturu\n- ukažte důležité signály nahoře\n- potvrzujte keywords konkrétním výsledkem\n- nepřetěžujte text opakováním\n- otestujte finální verzi na reálné pozici` },
        { title: "Příklady a mini transformace", body: `Slabá verze popisuje aktivitu. Silnější verze ukazuje změnu, rozsah a dopad.\n\nU role-based témat propojujte [resume example](${roleSlug ? `/resume-examples/${roleSlug}` : "/resume-examples"}) a [resume keywords](${roleSlug ? `/resume-keywords/${roleSlug}` : "/resume-keywords"}).` },
        { title: "Typické chyby", body: `- příliš obecný text\n- keywords bez důkazu\n- layout komplikující parsing\n- keyword stuffing\n- chybějící next step` },
        { title: "FAQ", body: `- **Jak moc obsah upravit?** Začněte summary, skills a prvními bullety.\n- **Co je nejdůležitější?** Rychlé potvrzení fitu, rozsahu a výsledků.\n- **Co dál?** Otestujte životopis na reálném job description a opravte největší gapy.` },
        { title: "Co číst dál", body: `- [Free ATS resume checker](/free-ats-resume-checker)\n- [Optimize my resume](/app)\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)` },
      ],
    },
    es: {
      seoTitle: `${page.seoTitle} — guía`,
      meta: `${page.seoTitle}: guía práctica sobre ATS, palabras clave, estructura, errores y próximos pasos.`,
      h1: `${page.h1} — guía`,
      lead: `Esta página explica **${page.h1.toLowerCase()}** de forma directa y práctica: qué ve el ATS, qué escanea el recruiter y qué cambios realmente mueven el resultado.`,
      sections: [
        { title: "Introducción", body: `Este material trata el tema **${label}**. El objetivo es corregir dos problemas frecuentes: señal débil y prueba débil.\n\nSi el tema está ligado al rol **${role}**, las keywords tienen que estar respaldadas por bullets reales.` },
        { title: "Qué ocurre durante el screening", body: `El ATS parsea el archivo, el recruiter hace un escaneo rápido y el hiring manager valida nivel y credibilidad.\n\nPor eso las mejores páginas de este cluster priorizan estructura, prueba y claridad.` },
        { title: "Playbook práctico", body: `- mantén una estructura simple\n- muestra las señales importantes arriba\n- respalda las keywords con resultados concretos\n- evita repetir texto sin añadir valor\n- prueba la versión final con una vacante real` },
        { title: "Ejemplos y mini transformaciones", body: `La versión débil describe actividad. La versión fuerte muestra cambio, alcance e impacto.\n\nEn temas role-based conviene unir [resume example](${roleSlug ? `/resume-examples/${roleSlug}` : "/resume-examples"}) y [resume keywords](${roleSlug ? `/resume-keywords/${roleSlug}` : "/resume-keywords"}).` },
        { title: "Errores comunes", body: `- texto demasiado genérico\n- keywords sin prueba\n- layout que complica el parsing\n- keyword stuffing\n- falta de next step claro` },
        { title: "FAQ", body: `- **¿Cuánto hay que adaptar el contenido?** Empieza por summary, skills y los primeros bullets.\n- **¿Qué importa más?** Confirmar rápido fit, alcance y resultados.\n- **¿Qué hago después?** Prueba el CV con una vacante real y corrige primero las mayores brechas.` },
        { title: "Seguir leyendo", body: `- [Free ATS resume checker](/free-ats-resume-checker)\n- [Optimize my resume](/app)\n- [Resume summary examples](/resume-summary)\n- [Resume bullet examples](/resume-bullets)` },
      ],
    },
  };

  const localized = localizedBodies[language as Exclude<Language, "en">];
  const nextPage = {
    ...page,
    seoTitle: localized.seoTitle,
    metaDescription: truncateText(localized.meta, 160),
    h1: localized.h1,
    lead: localized.lead,
    sections: localized.sections,
  };
  return {
    ...nextPage,
    estimatedWordCount: countPageWords(nextPage),
  };
}

export function getSeoExpansionSlugs(family: SeoExpansionFamily): string[] {
  return SEO_SEEDS_BY_FAMILY[family].map((seed) => seed.slug);
}

export function getSeoExpansionSeedCount(family: SeoExpansionFamily): number {
  return SEO_SEEDS_BY_FAMILY[family].length;
}

export function getSeoExpansionPage(
  family: SeoExpansionFamily,
  slug: string,
): SeoGuidePage | undefined {
  const seed = SEO_SEEDS_BY_FAMILY[family].find((item) => item.slug === slug);
  return seed ? buildGuidePage(seed) : undefined;
}

export function getSeoExpansionPagesForFamily(family: SeoExpansionFamily): SeoGuidePage[] {
  return SEO_SEEDS_BY_FAMILY[family].map((seed) => buildGuidePage(seed));
}

export function getSeoExpansionHubItems(
  family: SeoExpansionFamily,
  limit = 48,
): Array<{ slug: string; title: string; lead: string }> {
  return SEO_SEEDS_BY_FAMILY[family].slice(0, limit).map((seed) => ({
    slug: seed.slug,
    title: seed.title,
    lead: seed.lead,
  }));
}

export function getAllSeoExpansionRoutes(): string[] {
  return SEO_SEEDS.map((seed) => `/${seed.family}/${seed.slug}`);
}

export function getAllSeoExpansionCounts(): Record<SeoExpansionFamily, number> {
  return {
    ats: SEO_SEEDS_BY_FAMILY.ats.length,
    "resume-for": SEO_SEEDS_BY_FAMILY["resume-for"].length,
    "resume-industry": SEO_SEEDS_BY_FAMILY["resume-industry"].length,
    "interview-resume": SEO_SEEDS_BY_FAMILY["interview-resume"].length,
    "job-description": SEO_SEEDS_BY_FAMILY["job-description"].length,
    best: SEO_SEEDS_BY_FAMILY.best.length,
    "resume-guides": SEO_SEEDS_BY_FAMILY["resume-guides"].length,
  };
}

export function getSeoExpansionHubMeta(family: SeoExpansionFamily) {
  return {
    title: familyLabel(family),
    count: SEO_SEEDS_BY_FAMILY[family].length,
  };
}
