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

const CATEGORY_KEYWORDS: Record<RoleCategory, string[]> = {
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

function roleKeywords(role: string, category: RoleCategory): string[] {
  const base = CATEGORY_KEYWORDS[category];
  return [
    ...base,
    `${role.toLowerCase()} resume`,
    `${role.toLowerCase()} achievements`,
    `${role.toLowerCase()} responsibilities`,
    `${role.toLowerCase()} tools`,
    `${role.toLowerCase()} projects`,
    `${role.toLowerCase()} results`,
  ];
}

function roleMistakes(role: string): string[] {
  return [
    `Using a generic summary that never mentions ${role} priorities.`,
    "Listing tools without impact metrics or scope.",
    "Missing the exact terms repeated in the target job description.",
    "Overusing buzzwords and underusing measurable outcomes.",
  ];
}

function roleExamples(role: string): ResumeKeywordExample[] {
  return [
    {
      before: "Responsible for multiple cross-team initiatives.",
      after: `Led 4 cross-functional ${role.toLowerCase()} initiatives, reducing delivery time by 23% in two quarters.`,
    },
    {
      before: "Worked on process improvements.",
      after: `Redesigned core ${role.toLowerCase()} workflow and improved quality KPI from 81% to 93% within 6 months.`,
    },
    {
      before: "Helped with reporting and communication.",
      after: `Built weekly ${role.toLowerCase()} reporting cadence for leadership, cutting decision lag by 30%.`,
    },
  ];
}

function roleFaq(role: string): ResumeKeywordFaq[] {
  return [
    {
      question: `How many keywords should a ${role} resume include?`,
      answer:
        "Aim for relevance first: usually 20-35 role-specific terms naturally distributed across summary, skills, and recent experience. Prioritize repeated terms from the vacancy.",
    },
    {
      question: `Where should I place ${role} keywords in my resume?`,
      answer:
        "Start with headline/summary, then skills, then top 2 most recent roles. This gives ATS and recruiters fast confirmation of role fit in the first scan.",
    },
    {
      question: `Can I use exact wording from the job description for ${role} applications?`,
      answer:
        "Yes, if truthful. Mirror terminology only when it reflects your real experience. Do not paste full lines without evidence in bullet points.",
    },
    {
      question: `What is the fastest way to tailor a ${role} resume per vacancy?`,
      answer:
        "Extract top requirements, map each one to evidence from your experience, rewrite top bullets, then run one final ATS check before submit.",
    },
    {
      question: `Should I keep one master resume for every ${role} application?`,
      answer:
        "Keep one strong base version, then tailor summary, skills ordering, and first bullet points for each target role. This balances speed with relevance.",
    },
  ];
}

const CLUSTERS: ResumeKeywordCluster[] = ROLE_SEEDS.map((seed) => ({
  slug: toSlug(seed.role),
  role: seed.role,
  category: seed.category,
  intent: "resume keywords",
  keywords: roleKeywords(seed.role, seed.category),
  mistakes: roleMistakes(seed.role),
  examples: roleExamples(seed.role),
  faq: roleFaq(seed.role),
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
