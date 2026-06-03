import type { SeoExpansionFamily } from "./seoExpansion";

export type SeoExpansionFamilyConfig = {
  family: SeoExpansionFamily;
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

export const SEO_EXPANSION_CONFIGS: Record<SeoExpansionFamily, SeoExpansionFamilyConfig> = {
  ats: {
    family: "ats",
    basePath: "/ats",
    badge: "ATS",
    hubTitle: "ATS Resume Guides",
    hubSubtitle:
      "System-specific ATS pages, parsing explainers, keyword guides, and template-safe pages for candidates who want cleaner screening outcomes.",
    pageHubLabel: "Back to ATS hub",
    openLabel: "Open ATS guide",
    ctaTitle: "Use the ATS guidance inside the product",
    ctaLead:
      "Once you spot the parsing and keyword risks, run a scan and fix them inside the optimizer before you submit the real resume.",
    metadataTitle: "ATS Resume Guides (100 Pages) | CVboosta",
    metadataDescription:
      "Browse ATS-specific resume pages for Ashby, SmartRecruiters, Workday-style parsing questions, keyword advice, templates, and ATS explainers.",
  },
  "resume-for": {
    family: "resume-for",
    basePath: "/resume-for",
    badge: "RESUME FOR",
    hubTitle: "Resume Guides for Companies, Countries, and Situations",
    hubSubtitle:
      "Target high-intent searches like company resumes, country-specific formats, career-change resumes, and edge-case application flows.",
    pageHubLabel: "Back to resume-for hub",
    openLabel: "Open guide",
    ctaTitle: "Turn intent into a tailored resume",
    ctaLead:
      "These pages help you frame the target. The product helps you tailor the actual file to the vacancy, ATS, and recruiter scan.",
    metadataTitle: "Resume-for Guides (520 Pages) | CVboosta",
    metadataDescription:
      "Browse 520 targeted resume pages for specific companies, countries, and career situations with ATS-safe advice and internal links into the optimizer.",
  },
  "resume-industry": {
    family: "resume-industry",
    basePath: "/resume-industry",
    badge: "INDUSTRY",
    hubTitle: "Industry Resume Hubs",
    hubSubtitle:
      "Industry-first resume pages for tech, healthcare, finance, cybersecurity, SaaS sales, startups, and other sectors with distinct screening logic.",
    pageHubLabel: "Back to industry hub",
    openLabel: "Open industry page",
    ctaTitle: "Move from industry advice to vacancy-specific edits",
    ctaLead:
      "Industry context is useful, but the final win comes from matching one real job description and fixing the strongest gaps in the product.",
    metadataTitle: "Industry Resume Guides (40 Pages) | CVboosta",
    metadataDescription:
      "Browse industry-first resume hubs covering keywords, recruiter signals, ATS patterns, and practical examples across 40 sector pages.",
  },
  "interview-resume": {
    family: "interview-resume",
    basePath: "/interview-resume",
    badge: "INTERVIEW + RESUME",
    hubTitle: "Interview + Resume Guides",
    hubSubtitle:
      "Catch panic intent, ghosting pain, and no-interview problems with pages that connect resume quality to interview outcomes.",
    pageHubLabel: "Back to interview hub",
    openLabel: "Open guide",
    ctaTitle: "Fix the resume before the next interview cycle",
    ctaLead:
      "If the funnel is breaking, scan the resume, tighten the proof, and align your bullets with the stories you need to tell live.",
    metadataTitle: "Interview + Resume Guides (60 Pages) | CVboosta",
    metadataDescription:
      "Browse 60 pages on interview prep, recruiter ghosting, ATS rejection, no-interview problems, and resume-to-interview alignment.",
  },
  "job-description": {
    family: "job-description",
    basePath: "/job-description",
    badge: "JOB DESCRIPTION",
    hubTitle: "Job Description Analysis Guides",
    hubSubtitle:
      "Learn how to read job descriptions, extract hidden resume keywords, prioritize must-haves, and tailor faster without copying blindly.",
    pageHubLabel: "Back to job description hub",
    openLabel: "Open guide",
    ctaTitle: "Apply the job-description analysis to your real resume",
    ctaLead:
      "Once you know the signals in the job post, use the optimizer to map them to your actual bullets, summary, and skills section.",
    metadataTitle: "Job Description Analysis Guides (60 Pages) | CVboosta",
    metadataDescription:
      "Browse 60 job-description analysis pages for extracting keywords, spotting priorities, and tailoring ATS-safe resumes faster.",
  },
  best: {
    family: "best",
    basePath: "/best",
    badge: "BEST OF",
    hubTitle: "Best Resume Tools and Comparison Pages",
    hubSubtitle:
      "Commercial-intent pages for ATS checkers, resume optimizers, scanners, alternatives, and head-to-head comparisons.",
    pageHubLabel: "Back to tools hub",
    openLabel: "Open comparison",
    ctaTitle: "Use the comparison, then test the workflow yourself",
    ctaLead:
      "Best-of content narrows the options. The real proof is uploading your resume and seeing what gets fixed fastest inside CVboosta.",
    metadataTitle: "Best Resume Tools & Alternatives (40 Pages) | CVboosta",
    metadataDescription:
      "Browse 40 commercial-intent pages for the best ATS resume checkers, optimizers, scanners, alternatives, and CVboosta comparisons.",
  },
  "resume-guides": {
    family: "resume-guides",
    basePath: "/resume-guides",
    badge: "MEGA HUB",
    hubTitle: "Role Resume Mega Hubs",
    hubSubtitle:
      "Deep internal-linking hubs that connect role keywords, examples, ATS advice, summaries, bullets, and next-step actions.",
    pageHubLabel: "Back to role hubs",
    openLabel: "Open mega hub",
    ctaTitle: "Use the full role workflow",
    ctaLead:
      "These hubs are built to move you from research into action: example, keywords, scan, optimizer, and final application checks.",
    metadataTitle: "Role Resume Mega Hubs (180 Pages) | CVboosta",
    metadataDescription:
      "Browse 180 role mega hubs linking resume examples, keywords, ATS strategy, bullet ideas, summary guidance, and product CTAs.",
  },
};

export function getSeoExpansionConfig(family: SeoExpansionFamily): SeoExpansionFamilyConfig {
  return SEO_EXPANSION_CONFIGS[family];
}
