export type ResumeKeywordLocale = "en";
export type PublishStatus = "draft" | "published";

export type RoleCategory =
  | "engineering"
  | "data"
  | "product"
  | "design"
  | "marketing"
  | "sales"
  | "operations"
  | "finance"
  | "hr"
  | "customer"
  | "legal"
  | "healthcare"
  | "education"
  | "security";

export type ResumeKeywordFaq = {
  question: string;
  answer: string;
};

export type ResumeKeywordExample = {
  before: string;
  after: string;
};

export type ResumeKeywordCluster = {
  slug: string;
  role: string;
  category: RoleCategory;
  intent: "resume keywords";
  keywords: string[];
  mistakes: string[];
  examples: ResumeKeywordExample[];
  faq: ResumeKeywordFaq[];
  locale: ResumeKeywordLocale;
  publish_status: PublishStatus;
};

type RoleSeed = {
  role: string;
  category: RoleCategory;
};

const TARGET_CLUSTER_COUNT = 950;
const LEVEL_PREFIXES = ["Junior", "Mid-Level", "Senior", "Lead", "Principal", "Staff"] as const;
const LEVEL_PREFIX_RE = /^(junior|mid-level|senior|lead|principal|staff|entry-level|head|director)\s+/i;

const CATEGORY_TRACKS: Record<RoleCategory, string[]> = {
  engineering: ["Platform", "Cloud", "API", "Performance", "Security"],
  data: ["Analytics", "BI", "Reporting", "Forecasting", "Experimentation"],
  product: ["Growth", "B2B SaaS", "Mobile", "Platform", "AI"],
  design: ["UX", "UI", "Accessibility", "Design Systems", "Research"],
  marketing: ["SEO", "Content", "Lifecycle", "Performance", "Brand"],
  sales: ["Enterprise", "SMB", "Outbound", "Inbound", "Partnerships"],
  operations: ["Process", "Strategy", "Execution", "Supply Chain", "Vendor"],
  finance: ["FP&A", "Reporting", "Budgeting", "Revenue", "Compliance"],
  hr: ["Talent", "People Ops", "Learning", "Recruiting", "HRIS"],
  customer: ["Onboarding", "Retention", "Support", "Expansion", "Success"],
  legal: ["Contracts", "Compliance", "Regulatory", "Corporate", "Risk"],
  healthcare: ["Clinical", "Care Delivery", "Patient Safety", "Operations", "Documentation"],
  education: ["Curriculum", "Student Success", "Assessment", "Program", "Instruction"],
  security: ["SOC", "Cloud Security", "IAM", "Threat Detection", "Risk"],
};

export const CATEGORY_IMPACT_AREAS: Record<RoleCategory, string[]> = {
  engineering: ["delivery speed", "system reliability", "latency", "release quality", "incident reduction"],
  data: ["decision speed", "data accuracy", "reporting quality", "forecast quality", "insight adoption"],
  product: ["activation", "retention", "conversion", "time-to-value", "roadmap impact"],
  design: ["usability", "completion rate", "consistency", "accessibility", "engagement quality"],
  marketing: ["ROAS", "organic growth", "pipeline quality", "CAC efficiency", "campaign conversion"],
  sales: ["quota attainment", "win rate", "pipeline velocity", "deal cycle", "revenue growth"],
  operations: ["cycle time", "SLA reliability", "process quality", "cost control", "execution speed"],
  finance: ["forecast accuracy", "close-cycle speed", "margin quality", "cost discipline", "reporting integrity"],
  hr: ["time-to-hire", "retention", "candidate quality", "engagement", "policy compliance"],
  customer: ["renewal rate", "adoption", "NPS", "churn reduction", "account expansion"],
  legal: ["contract turnaround", "risk exposure", "policy adherence", "compliance posture", "legal clarity"],
  healthcare: ["care quality", "patient throughput", "documentation quality", "clinical coordination", "safety outcomes"],
  education: ["learning outcomes", "completion rates", "student engagement", "program quality", "instruction clarity"],
  security: ["MTTD", "MTTR", "vulnerability closure", "control coverage", "audit readiness"],
};

export const CATEGORY_KEYWORDS: Record<RoleCategory, string[]> = {
  engineering: [
    "system design",
    "api development",
    "microservices",
    "code review",
    "performance optimization",
    "cloud infrastructure",
  ],
  data: [
    "sql",
    "data modeling",
    "data pipelines",
    "python",
    "tableau",
    "statistical analysis",
  ],
  product: [
    "product strategy",
    "roadmapping",
    "stakeholder management",
    "user research",
    "product analytics",
    "prioritization",
  ],
  design: [
    "interaction design",
    "design systems",
    "user flows",
    "wireframing",
    "prototyping",
    "usability testing",
  ],
  marketing: [
    "campaign optimization",
    "seo",
    "content strategy",
    "paid acquisition",
    "conversion rate optimization",
    "marketing analytics",
  ],
  sales: [
    "pipeline management",
    "prospecting",
    "crm",
    "objection handling",
    "quota attainment",
    "negotiation",
  ],
  operations: [
    "process improvement",
    "cross-functional collaboration",
    "kpi tracking",
    "documentation",
    "resource planning",
    "vendor management",
  ],
  finance: [
    "financial modeling",
    "budgeting",
    "forecasting",
    "variance analysis",
    "financial reporting",
    "cost optimization",
  ],
  hr: [
    "talent acquisition",
    "employee engagement",
    "performance management",
    "onboarding",
    "policy development",
    "hris",
  ],
  customer: [
    "customer retention",
    "customer onboarding",
    "service level agreement",
    "issue resolution",
    "customer satisfaction",
    "account health",
  ],
  legal: [
    "contract review",
    "regulatory compliance",
    "risk mitigation",
    "legal research",
    "policy drafting",
    "stakeholder advisory",
  ],
  healthcare: [
    "patient care",
    "clinical documentation",
    "care coordination",
    "hipaa compliance",
    "quality improvement",
    "electronic health records",
  ],
  education: [
    "curriculum development",
    "classroom management",
    "student assessment",
    "lesson planning",
    "learning outcomes",
    "instructional design",
  ],
  security: [
    "incident response",
    "security monitoring",
    "vulnerability management",
    "identity and access management",
    "threat detection",
    "security compliance",
  ],
};

export const CATEGORY_SKILL_KEYWORDS: Record<RoleCategory, string[]> = {
  engineering: ["python", "javascript", "typescript", "java", "golang", "c#", "sql"],
  data: ["python", "r", "sql", "scala", "pandas", "spark"],
  product: ["sql", "python", "jira", "confluence", "figma", "amplitude"],
  design: ["figma", "adobe xd", "html", "css", "design systems", "prototyping"],
  marketing: ["google analytics", "google ads", "meta ads", "seo tools", "crm", "utm tracking"],
  sales: ["salesforce", "hubspot", "linkedin sales navigator", "crm", "forecasting", "negotiation"],
  operations: ["excel", "sql", "power bi", "erp", "sap", "process automation"],
  finance: ["excel", "sql", "power bi", "financial modeling", "forecasting", "variance analysis"],
  hr: ["workday", "greenhouse", "linkedin recruiter", "hris", "interviewing", "onboarding"],
  customer: ["zendesk", "intercom", "salesforce", "sla management", "churn analysis", "nps"],
  legal: ["contract lifecycle management", "legal research", "compliance", "risk assessment", "policy drafting", "negotiation"],
  healthcare: ["ehr", "epic", "hl7", "clinical documentation", "care coordination", "hipaa"],
  education: ["lms", "moodle", "canvas", "curriculum design", "assessment", "instructional design"],
  security: ["python", "bash", "siem", "splunk", "incident response", "vulnerability management"],
};

const ROLE_SEEDS: RoleSeed[] = [
  { role: "Software Engineer", category: "engineering" },
  { role: "Senior Software Engineer", category: "engineering" },
  { role: "Frontend Developer", category: "engineering" },
  { role: "Backend Developer", category: "engineering" },
  { role: "Full Stack Developer", category: "engineering" },
  { role: "Mobile Developer", category: "engineering" },
  { role: "iOS Developer", category: "engineering" },
  { role: "Android Developer", category: "engineering" },
  { role: "DevOps Engineer", category: "engineering" },
  { role: "Site Reliability Engineer", category: "engineering" },
  { role: "Cloud Engineer", category: "engineering" },
  { role: "Platform Engineer", category: "engineering" },
  { role: "QA Engineer", category: "engineering" },
  { role: "Automation QA Engineer", category: "engineering" },
  { role: "Machine Learning Engineer", category: "engineering" },
  { role: "AI Engineer", category: "engineering" },
  { role: "Data Engineer", category: "data" },
  { role: "Data Analyst", category: "data" },
  { role: "Business Analyst", category: "data" },
  { role: "BI Analyst", category: "data" },
  { role: "Data Scientist", category: "data" },
  { role: "Analytics Engineer", category: "data" },
  { role: "Product Manager", category: "product" },
  { role: "Senior Product Manager", category: "product" },
  { role: "Technical Product Manager", category: "product" },
  { role: "Product Owner", category: "product" },
  { role: "Program Manager", category: "product" },
  { role: "Project Manager", category: "product" },
  { role: "Scrum Master", category: "product" },
  { role: "UX Designer", category: "design" },
  { role: "UI Designer", category: "design" },
  { role: "Product Designer", category: "design" },
  { role: "UX Researcher", category: "design" },
  { role: "Graphic Designer", category: "design" },
  { role: "Marketing Manager", category: "marketing" },
  { role: "Digital Marketing Manager", category: "marketing" },
  { role: "Growth Marketing Manager", category: "marketing" },
  { role: "SEO Specialist", category: "marketing" },
  { role: "Content Marketing Manager", category: "marketing" },
  { role: "PPC Specialist", category: "marketing" },
  { role: "Performance Marketing Manager", category: "marketing" },
  { role: "Brand Manager", category: "marketing" },
  { role: "Social Media Manager", category: "marketing" },
  { role: "Email Marketing Specialist", category: "marketing" },
  { role: "Sales Manager", category: "sales" },
  { role: "Account Executive", category: "sales" },
  { role: "Business Development Manager", category: "sales" },
  { role: "Sales Development Representative", category: "sales" },
  { role: "Customer Success Manager", category: "customer" },
  { role: "Account Manager", category: "customer" },
  { role: "Customer Support Specialist", category: "customer" },
  { role: "Customer Experience Manager", category: "customer" },
  { role: "Operations Manager", category: "operations" },
  { role: "Business Operations Manager", category: "operations" },
  { role: "Supply Chain Analyst", category: "operations" },
  { role: "Logistics Coordinator", category: "operations" },
  { role: "Procurement Specialist", category: "operations" },
  { role: "Chief of Staff", category: "operations" },
  { role: "Finance Manager", category: "finance" },
  { role: "Financial Analyst", category: "finance" },
  { role: "FP&A Analyst", category: "finance" },
  { role: "Accountant", category: "finance" },
  { role: "Senior Accountant", category: "finance" },
  { role: "Controller", category: "finance" },
  { role: "Payroll Specialist", category: "finance" },
  { role: "HR Manager", category: "hr" },
  { role: "HR Generalist", category: "hr" },
  { role: "Recruiter", category: "hr" },
  { role: "Talent Acquisition Specialist", category: "hr" },
  { role: "People Operations Specialist", category: "hr" },
  { role: "Learning and Development Specialist", category: "hr" },
  { role: "Legal Counsel", category: "legal" },
  { role: "Corporate Lawyer", category: "legal" },
  { role: "Compliance Officer", category: "legal" },
  { role: "Paralegal", category: "legal" },
  { role: "Contract Manager", category: "legal" },
  { role: "Cybersecurity Analyst", category: "security" },
  { role: "Security Engineer", category: "security" },
  { role: "SOC Analyst", category: "security" },
  { role: "IT Support Specialist", category: "security" },
  { role: "Network Engineer", category: "security" },
  { role: "Systems Administrator", category: "security" },
  { role: "Registered Nurse", category: "healthcare" },
  { role: "Nurse Practitioner", category: "healthcare" },
  { role: "Medical Assistant", category: "healthcare" },
  { role: "Physical Therapist", category: "healthcare" },
  { role: "Occupational Therapist", category: "healthcare" },
  { role: "Healthcare Administrator", category: "healthcare" },
  { role: "Clinical Research Coordinator", category: "healthcare" },
  { role: "Teacher", category: "education" },
  { role: "Elementary Teacher", category: "education" },
  { role: "High School Teacher", category: "education" },
  { role: "Instructional Designer", category: "education" },
  { role: "Academic Advisor", category: "education" },
  { role: "Education Program Manager", category: "education" },
  { role: "Executive Assistant", category: "operations" },
  { role: "Administrative Assistant", category: "operations" },
  { role: "Office Manager", category: "operations" },
  { role: "Real Estate Agent", category: "sales" },
  { role: "Insurance Agent", category: "sales" },
  { role: "Pharmacist", category: "healthcare" },
  { role: "Dentist", category: "healthcare" },
  { role: "Veterinarian", category: "healthcare" },
  { role: "Restaurant Manager", category: "operations" },
  { role: "Hotel Manager", category: "operations" },
];

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function stripLeadingLevel(role: string): string {
  return role.replace(LEVEL_PREFIX_RE, "").trim();
}

function buildExpandedRoleSeeds(baseSeeds: RoleSeed[]): RoleSeed[] {
  const seedMap = new Map<string, RoleSeed>();
  const addSeed = (role: string, category: RoleCategory) => {
    const normalized = role.trim().replace(/\s+/g, " ");
    if (!normalized) return;
    const slug = toSlug(normalized);
    if (!slug || seedMap.has(slug)) return;
    seedMap.set(slug, { role: normalized, category });
  };

  const roleHasTrack = (role: string, track: string) => {
    const roleTokens = new Set(role.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const trackTokens = track.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    return trackTokens.some((token) => roleTokens.has(token));
  };

  baseSeeds.forEach((seed) => addSeed(seed.role, seed.category));

  for (const seed of baseSeeds) {
    const baseRole = stripLeadingLevel(seed.role);
    for (const level of LEVEL_PREFIXES) {
      addSeed(`${level} ${baseRole}`, seed.category);
    }
  }

  for (const seed of baseSeeds) {
    const baseRole = stripLeadingLevel(seed.role);
    for (const track of CATEGORY_TRACKS[seed.category]) {
      // Avoid awkward repeats like "Analytics Analytics Engineer" or "API API Engineer".
      if (!roleHasTrack(baseRole, track)) {
        addSeed(`${baseRole} ${track}`, seed.category);
      }
    }
  }

  for (const seed of baseSeeds) {
    const baseRole = stripLeadingLevel(seed.role);
    for (const level of LEVEL_PREFIXES) {
      for (const track of CATEGORY_TRACKS[seed.category].slice(0, 3)) {
        addSeed(`${level} ${baseRole} ${track}`, seed.category);
      }
    }
  }

  return Array.from(seedMap.values()).slice(0, TARGET_CLUSTER_COUNT);
}

function roleKeywords(role: string, category: RoleCategory): string[] {
  const base = CATEGORY_KEYWORDS[category];
  const impactArea = CATEGORY_IMPACT_AREAS[category][hashString(role) % CATEGORY_IMPACT_AREAS[category].length];
  const roleLower = role.toLowerCase();
  const roleWords = roleLower
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2)
    .slice(0, 3)
    .join(" ");
  const keywords = [
    ...base,
    ...CATEGORY_SKILL_KEYWORDS[category],
    `${roleLower} resume`,
    `${roleLower} achievements`,
    `${roleLower} responsibilities`,
    `${roleLower} tools`,
    `${roleLower} projects`,
    `${roleLower} results`,
    `${roleLower} ats keywords`,
    `${roleLower} resume bullets`,
    `${roleWords} measurable impact`,
    `${roleLower} ${impactArea}`,
  ];

  if (category === "engineering" && roleLower.includes("backend")) {
    keywords.push(
      "python",
      "golang",
      "go",
      "rest api",
      "grpc",
      "postgresql",
      "redis",
      "docker",
      "kubernetes",
      "message queue",
      "rabbitmq",
      "kafka",
      "async processing",
      "database optimization",
    );
  }

  if (category === "engineering" && roleLower.includes("frontend")) {
    keywords.push(
      "javascript",
      "typescript",
      "react",
      "next.js",
      "html",
      "css",
      "web performance",
      "state management",
      "testing",
      "webpack",
    );
  }

  if (category === "engineering" && roleLower.includes("full stack")) {
    keywords.push(
      "javascript",
      "typescript",
      "python",
      "node.js",
      "sql",
      "postgresql",
      "react",
      "api design",
      "docker",
      "cloud deployment",
    );
  }

  if (
    category === "engineering" &&
    (roleLower.includes("mobile") || roleLower.includes("ios") || roleLower.includes("android"))
  ) {
    keywords.push(
      "swift",
      "kotlin",
      "dart",
      "react native",
      "flutter",
      "mobile architecture",
      "app performance",
      "release management",
    );
  }

  if (
    category === "engineering" &&
    (roleLower.includes("devops") || roleLower.includes("site reliability") || roleLower.includes("platform"))
  ) {
    keywords.push(
      "bash",
      "python",
      "golang",
      "terraform",
      "kubernetes",
      "docker",
      "ci/cd",
      "observability",
      "prometheus",
      "grafana",
    );
  }

  if (
    category === "engineering" &&
    (roleLower.includes("machine learning") || roleLower.includes("ai "))
  ) {
    keywords.push(
      "python",
      "pytorch",
      "tensorflow",
      "sql",
      "feature engineering",
      "model deployment",
      "mlops",
      "experiment tracking",
    );
  }

  return Array.from(new Set(keywords));
}

function roleMistakes(role: string, category: RoleCategory): string[] {
  const h = hashString(role);
  const impactArea = CATEGORY_IMPACT_AREAS[category][h % CATEGORY_IMPACT_AREAS[category].length];
  const track = CATEGORY_TRACKS[category][Math.floor(h / 3) % CATEGORY_TRACKS[category].length];
  const sections = ["summary", "skills", "recent experience", "project bullets"];
  const weakSection = sections[h % sections.length];
  const altWeakSection = sections[Math.floor(h / 5) % sections.length];
  return [
    `Using a generic summary that does not show ${role} priorities in the first 3 lines.`,
    `Listing ${track.toLowerCase()} tools without measurable scope, ownership, or outcomes.`,
    `Ignoring repeated job-description terms tied to ${impactArea}.`,
    `Keeping ${weakSection} wording too broad, which lowers ATS confidence.`,
    `Skipping role-specific numbers in ${altWeakSection}, even when strong evidence exists.`,
    "Overusing buzzwords while missing concrete numbers, constraints, and business context.",
  ];
}

function roleExamples(role: string, category: RoleCategory): ResumeKeywordExample[] {
  const h = hashString(role);
  const initiativeCount = 2 + (h % 5);
  const speedGain = 12 + (h % 23);
  const qualityFrom = 70 + (h % 16);
  const qualityTo = qualityFrom + 8 + (h % 9);
  const lagCut = 18 + (h % 21);
  const impactArea = CATEGORY_IMPACT_AREAS[category][Math.floor(h / 7) % CATEGORY_IMPACT_AREAS[category].length];
  const processGain = 10 + (h % 19);
  const costReduction = 6 + (h % 16);
  return [
    {
      before: "Responsible for multiple cross-team initiatives.",
      after: `Led ${initiativeCount} cross-functional ${role.toLowerCase()} initiatives, improving ${impactArea} by ${speedGain}% within two quarters.`,
    },
    {
      before: "Worked on process improvements.",
      after: `Redesigned core ${role.toLowerCase()} workflow and improved quality KPI from ${qualityFrom}% to ${qualityTo}% in 6 months.`,
    },
    {
      before: "Helped with reporting and communication.",
      after: `Built weekly ${role.toLowerCase()} reporting cadence for leadership, cutting decision lag by ${lagCut}%.`,
    },
    {
      before: "Collaborated on process improvements and documentation.",
      after: `Standardized ${role.toLowerCase()} workflows and documentation, improving process consistency by ${processGain}% across teams.`,
    },
    {
      before: "Supported optimization initiatives across departments.",
      after: `Partnered across teams to optimize ${role.toLowerCase()} operations, reducing avoidable cost and rework by ${costReduction}%.`,
    },
  ];
}

function roleFaq(role: string, category: RoleCategory): ResumeKeywordFaq[] {
  const h = hashString(role);
  const keywordMin = 18 + (h % 8);
  const keywordMax = keywordMin + 10 + (h % 7);
  const track = CATEGORY_TRACKS[category][h % CATEGORY_TRACKS[category].length];
  const impactArea = CATEGORY_IMPACT_AREAS[category][Math.floor(h / 11) % CATEGORY_IMPACT_AREAS[category].length];
  const docLength = 720 + (h % 360);
  return [
    {
      question: `How many keywords should a ${role} resume include?`,
      answer:
        `Aim for relevance first: usually ${keywordMin}-${keywordMax} role-specific terms distributed across summary, skills, and recent experience. Prioritize repeated vacancy terms tied to ${impactArea}.`,
    },
    {
      question: `Where should I place ${role} keywords in my resume?`,
      answer:
        "Start with headline/summary, then skills, then the top 2 most recent roles. This gives ATS and recruiters fast confirmation of role fit.",
    },
    {
      question: `Can I use exact wording from the job description for ${role} applications?`,
      answer:
        `Yes, if truthful. Mirror terminology only when it reflects your real experience with ${track.toLowerCase()} work. Do not paste full lines without evidence.`,
    },
    {
      question: `What is the fastest way to tailor a ${role} resume per vacancy?`,
      answer:
        "Extract top requirements, map each one to evidence from your experience, rewrite top bullets with numbers, then run one ATS check before submission.",
    },
    {
      question: `Should I keep one master resume for every ${role} application?`,
      answer:
        "Keep one strong base version, then tailor summary, skills order, and first bullet points for each role target. This balances speed with relevance.",
    },
    {
      question: `How long should a ${role} resume be for ATS and hiring teams?`,
      answer:
        `For most applicants, one to two pages is enough. Aim for around ${docLength}-${docLength + 180} words of high-signal content with clear metrics, not filler text.`,
    },
    {
      question: `How often should I update my ${role} resume while job searching?`,
      answer:
        "Review and refine it weekly. Add new quantified wins, remove weak bullets, and retune keywords whenever your target vacancy mix changes.",
    },
    {
      question: `What is the best way to show ${track.toLowerCase()} experience in a ${role} resume?`,
      answer:
        `Name the context, your ownership, and a measurable outcome tied to ${impactArea}. Recruiters trust concrete proof over tool lists.`,
    },
  ];
}

const EXPANDED_ROLE_SEEDS = buildExpandedRoleSeeds(ROLE_SEEDS);
if (EXPANDED_ROLE_SEEDS.length < TARGET_CLUSTER_COUNT) {
  throw new Error(
    `Resume keyword cluster generation produced ${EXPANDED_ROLE_SEEDS.length} roles, expected at least ${TARGET_CLUSTER_COUNT}.`,
  );
}

const CLUSTERS: ResumeKeywordCluster[] = EXPANDED_ROLE_SEEDS.map((seed) => ({
  slug: toSlug(seed.role),
  role: seed.role,
  category: seed.category,
  intent: "resume keywords",
  keywords: roleKeywords(seed.role, seed.category),
  mistakes: roleMistakes(seed.role, seed.category),
  examples: roleExamples(seed.role, seed.category),
  faq: roleFaq(seed.role, seed.category),
  locale: "en",
  publish_status: "published",
}));

export function getPublishedResumeKeywordClusters(): ResumeKeywordCluster[] {
  return CLUSTERS.filter((item) => item.publish_status === "published").sort((a, b) =>
    a.role.localeCompare(b.role),
  );
}

export function getResumeKeywordClusterBySlug(slug: string): ResumeKeywordCluster | undefined {
  return CLUSTERS.find((item) => item.slug === slug && item.publish_status === "published");
}

export function getResumeKeywordStaticSlugs(): string[] {
  return getPublishedResumeKeywordClusters().map((item) => item.slug);
}

function roleTokens(role: string): Set<string> {
  return new Set(
    role
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((part) => part.length > 2),
  );
}

export function getRelatedResumeKeywordClusters(
  slug: string,
  limit = 8,
): ResumeKeywordCluster[] {
  const target = getResumeKeywordClusterBySlug(slug);
  if (!target) return [];

  const targetTokens = roleTokens(target.role);

  const scored = CLUSTERS
    .filter((item) => item.slug !== slug && item.publish_status === "published")
    .map((item) => {
      const tokens = roleTokens(item.role);
      let overlap = 0;
      targetTokens.forEach((token) => {
        if (tokens.has(token)) overlap += 1;
      });

      const sameCategory = item.category === target.category ? 4 : 0;
      const prefixBoost = item.role.startsWith("Senior ") || item.role.startsWith("Lead ") ? 0.4 : 0;
      const score = sameCategory + overlap * 2 + prefixBoost;

      return { item, score };
    })
    .sort((a, b) => b.score - a.score || a.item.role.localeCompare(b.item.role));

  return scored.slice(0, limit).map((entry) => entry.item);
}

export function getResumeKeywordClustersForTopic(
  topic: string,
  limit = 10,
): ResumeKeywordCluster[] {
  const topicTokens = roleTokens(topic);
  if (topicTokens.size === 0) {
    return getPublishedResumeKeywordClusters().slice(0, limit);
  }

  const scored = CLUSTERS
    .filter((item) => item.publish_status === "published")
    .map((item) => {
      const itemTokens = roleTokens(item.role);
      let overlap = 0;
      topicTokens.forEach((token) => {
        if (itemTokens.has(token)) overlap += 1;
      });
      const keywordOverlap = item.keywords.filter((k) => topic.toLowerCase().includes(k.toLowerCase())).length;
      const score = overlap * 3 + keywordOverlap;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || a.item.role.localeCompare(b.item.role));

  return scored.slice(0, limit).map((entry) => entry.item);
}
